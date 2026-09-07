# Family Heart — หน้า Login

โปรเจกต์นี้มี 3 ไฟล์หลัก:
- `index.html` — หน้า login (โครงสร้าง + ดีไซน์)
- `app.js` — โค้ด JavaScript เชื่อม Firebase Auth (login / สมัครสมาชิก / ลืมรหัสผ่าน)
- `firebase-config.js` — ใส่ค่า config ของโปรเจกต์ Firebase ตัวเอง
- `home.html` — หน้าหลักชั่วคราว (จะสร้างเต็มในขั้นต่อไป)

## ขั้นตอนที่ 1: สร้างโปรเจกต์ Firebase

1. ไปที่ https://console.firebase.google.com แล้วกด "Add project" ตั้งชื่อ เช่น `family-heart`
2. ในเมนูซ้าย ไปที่ **Build > Authentication** > กด "Get started"
3. แท็บ **Sign-in method** > เปิดใช้งาน **Email/Password**
4. ไปที่ **Project settings** (รูปเฟือง) > เลื่อนลงไปหา "Your apps" > กดไอคอน **</>** (Web app) เพื่อสร้างแอปเว็บ
5. ตั้งชื่อแอป (เช่น family-heart-web) > กด Register app
6. คัดลอกค่า `firebaseConfig` ที่ขึ้นมา แล้ววางแทนที่ใน `firebase-config.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

> หมายเหตุ: ช่อง "อีเมล/เบอร์โทร" ในหน้า login ใช้ Firebase Email/Password Auth เป็นหลัก
> ถ้ากรอกเบอร์โทร ระบบจะแปลงเป็นอีเมลปลอมรูปแบบ `เบอร์โทร@familyheart.local` ให้อัตโนมัติ
> เพื่อให้ใช้งานง่ายในระดับโปรเจกต์วิชาเรียน (การยืนยันเบอร์จริงด้วย SMS OTP ต้องตั้งค่าเพิ่มและมักมีค่าใช้จ่าย)

## ขั้นตอนที่ 2: ทดสอบในเครื่องตัวเอง

เปิดไฟล์ `index.html` ตรง ๆ ในเบราว์เซอร์อาจมีปัญหาเรื่อง module/CORS
แนะนำรันเซิร์ฟเวอร์เล็ก ๆ ในโฟลเดอร์นี้ เช่น (ถ้ามี Python):

```bash
python3 -m http.server 5500
```

แล้วเปิด http://localhost:5500

## ขั้นตอนที่ 3: Deploy ขึ้น Netlify (ง่ายสุด — ลากวาง)

1. ไปที่ https://app.netlify.com แล้วสมัคร/ล็อกอิน (ใช้ GitHub ก็ได้)
2. หน้า Dashboard จะมีกล่อง "Drag and drop your site output folder here"
3. ลากทั้งโฟลเดอร์โปรเจกต์นี้ (ที่มี `index.html`, `app.js`, `firebase-config.js`, `home.html`) ไปวางในกล่องนั้น
4. รอสักครู่ Netlify จะให้ลิงก์เว็บไซต์มา เช่น `https://family-heart-xxxx.netlify.app`
5. เข้าลิงก์นั้นแล้วทดสอบสมัครสมาชิก/ล็อกอินได้เลย

## ขั้นตอนที่ 4 (ถ้าอยากให้ Firebase Auth ทำงานถูกโดเมน)

Firebase Auth จะเช็ก "Authorized domains" — ต้องเพิ่มโดเมน Netlify ของเราเข้าไปด้วย:
1. กลับไปที่ Firebase Console > Authentication > Settings > Authorized domains
2. กด "Add domain" แล้วใส่โดเมน Netlify เช่น `family-heart-xxxx.netlify.app`

เท่านี้หน้า login ก็ใช้งานได้จริงบนเว็บแล้ว 🎉

## สิ่งที่ยังไม่ได้ทำ (ไว้ทำต่อ)

หน้าหลัก, แบบสอบถาม, ผลลัพท์, รวมผลลัพท์, ภารกิจครอบครัว, แชท, โปรไฟล์ — ยังเป็นแค่โครง `home.html` ชั่วคราวอยู่ ให้บอกได้เลยเมื่อพร้อมทำหน้าถัดไป
