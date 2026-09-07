// ==========================================================
// Family Heart — Mock DB (local only, no secrets in repo)
// เก็บผู้ใช้ทดลองใน browser localStorage เท่านั้น
// ไม่มีรหัสผ่าน hardcode — ผู้ใช้สมัครเอง / เข้าแบบ Guest
// ตอนเปลี่ยนเป็น Firebase จริง แค่ต่อ config จริง ไฟล์นี้จะถูก bypass
// ==========================================================

const STORAGE_KEY = "familyheart.mock.users.v1";
const SESSION_KEY = "familyheart.mock.session.v1";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// แปลง identifier (อีเมล/เบอร์) ให้เป็น key เดียวกันกับ app.js
export function normalizeIdentifier(raw) {
  const value = String(raw || "").trim();
  if (value.includes("@")) return value.toLowerCase();
  const digits = value.replace(/[^0-9]/g, "");
  return `${digits}@familyheart.local`;
}

export function mockSignup(identifier, password) {
  const email = normalizeIdentifier(identifier);
  const users = loadUsers();
  if (users.some((u) => u.email === email)) {
    const err = new Error("exists");
    err.code = "auth/email-already-in-use";
    throw err;
  }
  const user = {
    email,
    // เก็บเฉพาะ hash อย่างง่ายเพื่อการทดลอง (ไม่ใช่ความปลอดภัยจริง)
    // หมายเหตุ: โหมด mock ใช้เรียนเท่านั้น ห้ามใช้กับข้อมูลจริง
    passHash: btoa(unescape(encodeURIComponent(`fh:${email}:${password}`))),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, at: Date.now() }));
  return { email };
}

export function mockLogin(identifier, password) {
  const email = normalizeIdentifier(identifier);
  const users = loadUsers();
  const found = users.find((u) => u.email === email);
  const wantHash = btoa(unescape(encodeURIComponent(`fh:${email}:${password}`)));
  if (!found || found.passHash !== wantHash) {
    const err = new Error("invalid");
    err.code = "auth/invalid-credential";
    throw err;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, at: Date.now() }));
  return { email };
}

export function mockGuestLogin() {
  const email = `guest-${Date.now()}@familyheart.local`;
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email, guest: true, at: Date.now() })
  );
  return { email };
}

export function mockCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function mockLogout() {
  localStorage.removeItem(SESSION_KEY);
}
