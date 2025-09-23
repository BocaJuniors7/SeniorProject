import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/** Creates a like from the current user to the target dog/owner */
export async function createLike({ toDogId, toDogOwnerId, fromDogId = null }) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not signed in");

  // Your rules expect: ownerId (liker auth uid), fromDogOwnerId, toDogOwnerId
  // and will reject self-like when from==to
  const payload = {
    ownerId: user.uid,
    fromDogOwnerId: user.uid,
    toDogOwnerId,
    toDogId,
    fromDogId,
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "likes"), payload);
  return true;
}
