import { auth, isPlaceholderConfig } from "./firebase-config.js";
import {
  mockSignup,
  mockLogin,
  mockGuestLogin,
} from "./mock-db.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const form = document.getElementById("login-form");
const identifierInput = document.getElementById("identifier");
const passwordInput = document.getElementById("password");
const identifierError = document.getElementById("identifier-error");
const passwordError = document.getElementById("password-error");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const forgotBtn = document.getElementById("forgot-btn");
const guestBtn = document.getElementById("guest-btn");
const statusMsg = document.getElementById("status-msg");
const togglePwBtn = document.getElementById("toggle-pw");
const mockBadge = document.getElementById("mock-badge");

// ใช้ mock อัตโนมัติเมื่อยังเป็น placeholder (ยังไม่ใส่ key จริง)
// ไฟล์นี้ไม่มี secret ใด ๆ — mock เก็บใน localStorage ของเครื่องผู้ใช้เท่านั้น
const USE_MOCK = isPlaceholderConfig;
if (USE_MOCK && mockBadge) mockBadge.hidden = false;

// อีเมล/เบอร์โทร -> ถ้าไม่มี @ ให้ถือว่าเป็นเบอร์โทร แล้วแปลงเป็นอีเมลปลอม
// เพราะ Firebase Auth แบบพื้นฐานผูกบัญชีด้วยอีเมล (เบอร์โทรจริงต้องใช้ SMS OTP เพิ่มเติม)
function resolveEmail(raw) {
  const value = raw.trim();
  if (value.includes("@")) return value.toLowerCase();
  const digits = value.replace(/[^0-9]/g, "");
  return `${digits}@familyheart.local`;
}

function isValidPhone(value) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits.length >= 9 && digits.length <= 10;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clearErrors() {
  identifierError.textContent = "";
  passwordError.textContent = "";
  statusMsg.textContent = "";
  statusMsg.classList.remove("success");
}

function validate() {
  clearErrors();
  let ok = true;
  const idVal = identifierInput.value.trim();
  const pwVal = passwordInput.value;

  if (!idVal) {
    identifierError.textContent = "กรอกอีเมลหรือเบอร์โทรก่อนนะ";
    ok = false;
  } else if (!idVal.includes("@") && !isValidPhone(idVal)) {
    identifierError.textContent = "รูปแบบอีเมล/เบอร์โทรยังไม่ถูกต้อง";
    ok = false;
  } else if (idVal.includes("@") && !isValidEmail(idVal)) {
    identifierError.textContent = "รูปแบบอีเมลยังไม่ถูกต้อง";
    ok = false;
  }

  if (!pwVal) {
    passwordError.textContent = "กรอกรหัสผ่านก่อนนะ";
    ok = false;
  } else if (pwVal.length < 6) {
    passwordError.textContent = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    ok = false;
  }

  return ok;
}

function setLoading(isLoading, label) {
  loginBtn.classList.toggle("loading", isLoading);
  loginBtn.disabled = isLoading;
  if (signupBtn) signupBtn.disabled = isLoading;
  loginBtn.querySelector(".btn-label").textContent = isLoading
    ? label || "กำลังเข้าสู่ระบบ..."
    : "เข้าสู่ระบบ";
}

function friendlyError(code) {
  const map = {
    "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
    "auth/user-not-found": "ไม่พบบัญชีนี้ ลองสมัครสมาชิกก่อนนะ",
    "auth/wrong-password": "รหัสผ่านไม่ถูกต้อง",
    "auth/invalid-credential": "อีเมล/เบอร์โทร หรือรหัสผ่านไม่ถูกต้อง",
    "auth/email-already-in-use": "อีเมลหรือเบอร์นี้ถูกใช้สมัครแล้ว ลองเข้าสู่ระบบแทนนะ",
    "auth/weak-password": "รหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัว)",
    "auth/too-many-requests": "ลองผิดหลายครั้งไปหน่อย รอสักครู่แล้วลองใหม่นะ",
    "auth/network-request-failed": "เชื่อมต่ออินเทอร์เน็ตไม่ได้ ลองเช็กสัญญาณดูนะ",
  };
  return map[code] || "เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะ";
}

function goHome(msg) {
  statusMsg.textContent = msg;
  statusMsg.classList.add("success");
  setTimeout(() => {
    window.location.href = "home.html";
  }, 800);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const rawId = identifierInput.value;
  const email = resolveEmail(rawId);
  const password = passwordInput.value;

  setLoading(true);
  try {
    if (USE_MOCK) {
      mockLogin(rawId, password);
      goHome("เข้าสู่ระบบสำเร็จ (โหมดทดลอง) กำลังพาไปหน้าหลัก...");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      goHome("เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าหลัก...");
    }
  } catch (err) {
    statusMsg.textContent = friendlyError(err.code);
  } finally {
    setLoading(false);
  }
});

signupBtn.addEventListener("click", async () => {
  if (!validate()) return;

  const rawId = identifierInput.value;
  const email = resolveEmail(rawId);
  const password = passwordInput.value;

  setLoading(true, "กำลังสมัครสมาชิก...");
  try {
    if (USE_MOCK) {
      mockSignup(rawId, password);
      goHome("สมัครสมาชิกสำเร็จ (โหมดทดลอง) กำลังพาไปหน้าหลัก...");
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      goHome("สมัครสมาชิกสำเร็จ กำลังพาไปหน้าหลัก...");
    }
  } catch (err) {
    statusMsg.textContent = friendlyError(err.code);
  } finally {
    setLoading(false);
  }
});

// เข้าแบบ Guest — ไม่ต้องจำรหัส เหมาะกับเดโมหน้าห้องเรียน
if (guestBtn) {
  guestBtn.addEventListener("click", () => {
    mockGuestLogin();
    goHome("เข้าแบบผู้เยี่ยมชม (โหมดทดลอง) กำลังพาไปหน้าหลัก...");
  });
}

forgotBtn.addEventListener("click", async () => {
  const idVal = identifierInput.value.trim();
  if (USE_MOCK) {
    statusMsg.classList.remove("success");
    statusMsg.textContent =
      "โหมดทดลองยังรีเซ็ตรหัสผ่านทางอีเมลไม่ได้ — สมัครใหม่หรือเข้าแบบ Guest ได้เลยนะ";
    return;
  }
  if (!idVal.includes("@") || !isValidEmail(idVal)) {
    statusMsg.classList.remove("success");
    statusMsg.textContent = "พิมพ์อีเมลของคุณในช่องด้านบนก่อน แล้วกดลืมรหัสผ่านอีกครั้งนะ";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, idVal);
    statusMsg.classList.add("success");
    statusMsg.textContent = "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว เช็กกล่องจดหมายได้เลย";
  } catch (err) {
    statusMsg.classList.remove("success");
    statusMsg.textContent = friendlyError(err.code);
  }
});

togglePwBtn.addEventListener("click", () => {
  const isPw = passwordInput.type === "password";
  passwordInput.type = isPw ? "text" : "password";
  togglePwBtn.setAttribute("aria-pressed", String(isPw));
  togglePwBtn.setAttribute("aria-label", isPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน");
});
