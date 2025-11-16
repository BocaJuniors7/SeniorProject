// src/services/dogs.js
import { db, storage } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

/**
 * Create a dog document for the signed-in user.
 * Enforces your Firestore rules: ownerId == auth.uid, name, sex are required.
 */
export async function createDog({
  name,
  sex,
  breed,
  birthdate = null,
  notes = "",
  ownerLocation = "",
}) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not signed in");

  const now = serverTimestamp();
  const base = {
    ownerId: user.uid, // required by rules
    name, // required by rules
    sex, // "M" | "F" per rules
    breed: breed ?? "",
    birthdate, // ISO string or null
    notes,
    photos: [], // { url, path }[]
    createdAt: now,
    updatedAt: now,
    // denormalized fields for fast queries
    searchable: {
      breedPrimary: (breed || "").trim().toLowerCase() || null,
      sex, // mirror for filters
      ownerLocation: ownerLocation || null,
      hasPhotos: false,
    },
  };

  const ref = await addDoc(collection(db, "dogs"), base);
  return { id: ref.id, ...(await getDoc(ref)).data() };
}

/**
 * Upload a photo to Storage and attach to a dog doc.
 */
export async function addDogPhoto(dogId, file) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not signed in");

  const path = `dogs/${user.uid}/${dogId}/${Date.now()}_${file.name}`;
  const sref = storageRef(storage, path);
  await uploadBytes(sref, file);
  const url = await getDownloadURL(sref);

  const dref = doc(db, "dogs", dogId);
  const snap = await getDoc(dref);
  if (!snap.exists()) throw new Error("Dog not found");
  const data = snap.data();

  const next = {
    ...data,
    photos: [...(data.photos || []), { url, path }],
    updatedAt: serverTimestamp(),
    searchable: { ...(data.searchable || {}), hasPhotos: true },
  };

  await setDoc(dref, next, { merge: false });
  return { url, path };
}

/**
 * Update a dog (owner only via rules). Also refreshes searchable fields.
 */
export async function updateDog(dogId, partial) {
  const dref = doc(db, "dogs", dogId);
  const snap = await getDoc(dref);
  if (!snap.exists()) throw new Error("Dog not found");

  const prev = snap.data();
  const next = {
    ...prev,
    ...partial,
    updatedAt: serverTimestamp(),
    searchable: {
      ...(prev.searchable || {}),
      breedPrimary: partial?.breed
        ? partial.breed.trim().toLowerCase()
        : prev.searchable?.breedPrimary ?? null,
      sex: partial?.sex ?? prev.searchable?.sex ?? prev.sex,
      ownerLocation:
        partial?.ownerLocation ?? prev.searchable?.ownerLocation ?? null,
      hasPhotos:
        (partial?.photos?.length ?? prev.photos?.length ?? 0) > 0 ||
        prev.searchable?.hasPhotos ||
        false,
    },
  };

  await setDoc(dref, next, { merge: false });
  const updated = await getDoc(dref);
  return { id: dogId, ...updated.data() };
}

/**
 * Delete a dog (and optionally its Storage files).
 */
export async function deleteDog(dogId, { deleteFiles = false } = {}) {
  const dref = doc(db, "dogs", dogId);
  const snap = await getDoc(dref);
  if (snap.exists() && deleteFiles) {
    const data = snap.data();
    for (const p of data.photos || []) {
      try {
        await deleteObject(storageRef(storage, p.path));
      } catch {
        // ignore individual delete errors
      }
    }
  }
  await deleteDoc(dref);
}

/**
 * Get a single dog by id.
 */
export async function getDog(dogId) {
  const snap = await getDoc(doc(db, "dogs", dogId));
  return snap.exists() ? { id: dogId, ...snap.data() } : null;
}

/**
 * List/search dogs with optional filters. Public reads allowed by your rules.
 * Note: Compound filters may require a Firestore index (console will prompt).
 */
// src/services/dogs.js
export async function listDogs({ breed, sex, onlyWithPhotos = false, max = 50 } = {}) {
  const col = collection(db, "dogs");

  // Try the indexed, fast path first
  try {
    const clauses = [];
    if (breed) clauses.push(where("searchable.breedPrimary", "==", breed.trim().toLowerCase()));
    if (sex) clauses.push(where("searchable.sex", "==", sex));
    if (onlyWithPhotos) clauses.push(where("searchable.hasPhotos", "==", true));

    // Many of your existing docs don't have updatedAt; orderBy might exclude them.
    // We'll still try ordering, but we'll gracefully fall back if it errors.
    clauses.push(orderBy("updatedAt", "desc"), limit(max));

    const qs = await getDocs(query(col, ...clauses));
    const rows = qs.docs.map(d => ({ id: d.id, ...d.data() }));
    if (rows.length) return rows;
  } catch (e) {
    // swallow and fall back
    console.warn("listDogs fast-path failed; falling back to plain read:", e?.message || e);
  }

  // Fallback: read all docs, then do filtering/sorting in memory
  const all = await getDocs(col);
  let rows = all.docs.map(d => ({ id: d.id, ...d.data() }));

  // In-memory filters compatible with your current schema
  if (breed) rows = rows.filter(r => (r.breed || "").trim().toLowerCase() === breed.trim().toLowerCase());
  if (sex) rows = rows.filter(r => (r.sex || "").toUpperCase() === sex.toUpperCase());

  // Sort newest first if timestamps exist; otherwise by id
  rows.sort((a, b) => {
    const ta = a.updatedAt?.toMillis?.() ?? 0;
    const tb = b.updatedAt?.toMillis?.() ?? 0;
    if (tb !== ta) return tb - ta;
    return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
  });

  return rows.slice(0, max);
}
    
