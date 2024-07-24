import { getStorage } from "firebase-admin/storage";
import { initializeApp, cert } from "firebase-admin/app";
import nexusServiceAcct from "../config/serviceAccountKey.js";

export const firebase = initializeApp({
  credential: cert(nexusServiceAcct as unknown),
  storageBucket: "nexusai-9f410.appspot.com",
});

export const storage = getStorage(firebase);
