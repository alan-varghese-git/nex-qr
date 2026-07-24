import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyCKANkFYu6EySZ5P_QdMgRu5qkuITJMouk",
  authDomain: "nexqr-981e5.firebaseapp.com",
  projectId: "nexqr-981e5",
  storageBucket: "nexqr-981e5.appspot.com",
  messagingSenderId: "281795070446",
  appId: "1:281795070446:web:ebde75197793822b1d26ff"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testUpload() {
  console.log("Starting upload test...");
  const dummyContent = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
  const storageRef = ref(storage, `uploads/test_${Date.now()}.txt`);
  
  try {
    console.log("Uploading bytes...");
    const snapshot = await uploadBytes(storageRef, dummyContent);
    console.log("Upload successful:", snapshot.metadata.fullPath);
  } catch (error) {
    console.error("Upload failed with error:", error);
  }
}

testUpload();
