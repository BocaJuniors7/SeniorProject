// src/services/likes.js
import { db } from "../lib/firebase"; // make sure this matches your project path
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

/**
 * Create a like from the current user to a target dog/owner.
 * - If `fromDogId` is not provided, we automatically use the user's first dog.
 */
export async function createLike({ toDogId, toDogOwnerId, fromDogId = null }) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  // (Optional) Prevent liking your own dog
  if (toDogOwnerId === user.uid) {
    throw new Error("You cannot like your own dog.");
  }

  // If caller didn't pass a fromDogId, look up the first dog owned by this user.
  if (!fromDogId) {
    const q = query(
      collection(db, "dogs"),
      where("ownerId", "==", user.uid),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error("No dog profile found for current user.");
    }
    fromDogId = snap.docs[0].id;
  }

  const payload = {
    ownerId: user.uid,         // liker’s auth uid
    fromDogOwnerId: user.uid,  // also the liker’s uid
    fromDogId,                 // now guaranteed to be set
    toDogOwnerId,
    toDogId,
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "likes"), payload);
  return true;
}

export async function createPass({ toDogId, toDogOwnerId, fromDogId = null }) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  // (Optional) Prevent liking your own dog
  if (toDogOwnerId === user.uid) {
    throw new Error("You cannot like your own dog.");
  }

  // If caller didn't pass a fromDogId, look up the first dog owned by this user.
  if (!fromDogId) {
    const q = query(
      collection(db, "dogs"),
      where("ownerId", "==", user.uid),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error("No dog profile found for current user.");
    }
    fromDogId = snap.docs[0].id;
  }

  const payload = {
    ownerId: user.uid,         // skipper’s auth uid
    fromDogOwnerId: user.uid,  // also the skipper’s uid
    fromDogId,                 // now guaranteed to be set
    toDogOwnerId,
    toDogId,
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "passes"), payload);
  return true;
}
