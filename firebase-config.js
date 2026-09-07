// ==========================================================
// FIREBASE CONFIG — ใส่ค่าของโปรเจกต์ตัวเองตรงนี้
// วิธีหา: Firebase Console > Project settings > General
//         > Your apps > SDK setup and configuration > Config
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// โหมดทดลอง: ถ้ายังเป็นค่า YOUR_* แปลว่ายังไม่ต่อ Firebase จริง
// app.js จะสลับไปใช้ mock-db.js (localStorage) อัตโนมัติ
// วิธีใช้ของจริง: คัดลอก firebase-config.example.js ไปเป็น
// firebase-config.local.js (ไฟล์นี้ถูก .gitignore แล้ว) แล้ววางค่าจริง
export const isPlaceholderConfig = Object.values(firebaseConfig).some((v) =>
  String(v).includes("YOUR_")
);

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
