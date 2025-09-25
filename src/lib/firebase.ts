// npm i firebase
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCSSdg8BPd7qH1skZ1jmJmmdNTMsmuFdzc",
  authDomain: "senior-project-pawmatch.firebaseapp.com",
  projectId: "senior-project-pawmatch",
  storageBucket: "senior-project-pawmatch.appspot.com",
  messagingSenderId: "258128305500",
  appId: "1:258128305500:web:9b8277391cd1c2988b3599",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
