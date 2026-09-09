/* Family Heart — app logic (vanilla JS, in-memory state, no router lib) */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const userById = (id) => DB.users.find((u) => u.id === id) || DB.advisors.find((a) => a.id === id);
const state = { quiz: { target: "uDad", idx: 0, answers: [] }, chatTab: "family", thread: null, resultId: "r4" };

function showView(id, nav) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $("#view-" + id).classList.add("active");
  $$("nav.bottom button").forEach((b) => b.classList.toggle("on", b.dataset.nav === (nav || id)));
  const bar = $("#bottomnav");
  bar.style.display = ["home", "missions", "chat", "profile"].includes(nav || id) ? "flex" : "none";
  window.scrollTo(0, 0);
}
function go(id) { showView(id); }

/* ---------- home ---------- */
function renderHome() {
  $("#famName").textContent = DB.family.name;
  $("#famRow").innerHTML = DB.family.memberIds.map((id) => {
    const u = userById(id);
    return `<div style="text-align:center;cursor:pointer" onclick="openMember('${id}')" role="button" tabindex="0" aria-label="${u.role} ${u.name}">
      <div class="avatar" style="background:${u.color};margin:0 auto">${u.initial}</div>
      <div style="font-size:.72rem;margin-top:4px">${u.role}<br><b>${u.name}</b></div></div>`;
  }).join("");
}
function openMember(id) {
  const u = userById(id);
  const last = DB.results.filter((r) => r.pair.includes(id)).pop();
  const avg = last ? Math.round(last.scores.reduce((a, b) => a + b, 0) / last.scores.length) : 80;
  $("#memberCard").innerHTML = `<div class="row"><div class="avatar lg" style="background:${u.color}">${u.initial}</div>
    <div><b>${u.name}</b> <span class="badge">${u.role}</span><div class="muted">ภาษารัก: ${u.love} · คะแนนล่าสุด ${avg}%</div></div></div>`;
  $("#memberCard").style.display = "block";
}

/* ---------- quiz ---------- */
function startQuiz(memberId) {
  state.quiz = { target: memberId || state.quiz.target, idx: 0, answers: [] };
  renderQuiz(); showView("quiz");
}
function renderQuiz() {
  const q = state.quiz, u = userById(q.target), total = DB.questions.length;
  $("#quizCount").textContent = (q.idx + 1) + "/" + total;
  $("#quizBar").style.width = ((q.idx + 1) / total * 100) + "%";
  $("#quizWho").innerHTML = `<div class="avatar" style="background:${u.color}">${u.initial}</div><div><b>${u.name}</b><div class="muted">${u.role}</div></div>`;
  $("#quizQ").textContent = "ข้อ " + (q.idx + 1) + ": " + DB.questions[q.idx];
  $("#qNext").textContent = q.idx === total - 1 ? "ส่งคำตอบ ✓" : "ถัดไป →";
}
function quizNext() {
  const q = state.quiz;
  q.answers.push({ like: $("#aLike").value, fix: $("#aFix").value, love: $("#aLove").value });
  $("#aLike").value = ""; $("#aFix").value = "";
  if (q.idx >= DB.questions.length - 1) { finishQuiz(); return; }
  q.idx++; renderQuiz();
}
function finishQuiz() {
  const q = state.quiz, u = userById(q.target);
  const base = 78 + Math.floor(Math.random() * 8);
  const scores = DB.axes.map(() => Math.min(97, base + Math.floor(Math.random() * 12) - 4));
  state.resultId = "live";
  state.liveResult = { id: "live", pair: ["uMe", q.target], date: "วันนี้", scores,
    strengths: ["ตั้งใจตอบครบ 10 ข้อ ใส่ใจกันมาก", "มีเรื่องชื่นชมชัดเจน " + (q.answers[0]?.like || "ความเสียสละ")],
    growth: ["สานต่อเรื่องที่อยากให้ปรับ: " + (q.answers[0]?.fix || "คุยกันให้มากขึ้น"), "แสดงรักด้วย" + ($("#aLove").value || "ใช้เวลาร่วมกัน") + "บ่อยๆ"] };
  renderResult(); showView("result");
}

/* ---------- radar ---------- */
function radarSVG(scores, axes) {
  const n = scores.length, C = 110, R = 84, cx = 110, cy = 110;
  const pt = (i, v) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2, r = (R * v) / 100;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const ring = (v) => axes.map((_, i) => pt(i, v).join(",")).join(" ");
  const data = axes.map((_, i) => pt(i, scores[i]).join(",")).join(" ");
  const labels = axes.map((t, i) => { const [x, y] = pt(i, 118);
    return `<text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" fill="#3A2E45">${t}</text>`; }).join("");
  return `<svg class="chart" viewBox="0 0 220 235">
    <polygon points="${ring(100)}" fill="#FCE3EC"/><polygon points="${ring(75)}" fill="#fff" stroke="#F5C9D9"/>
    <polygon points="${ring(50)}" fill="none" stroke="#F5C9D9"/><polygon points="${ring(25)}" fill="none" stroke="#F5C9D9"/>
    ${axes.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, 100)[0]}" y2="${pt(i, 100)[1]}" stroke="#F5C9D9"/>`).join("")}
    <polygon points="${data}" fill="rgba(239,127,168,.45)" stroke="#EF7FA8" stroke-width="2.5"/>
    ${axes.map((_, i) => `<circle cx="${pt(i, scores[i])[0]}" cy="${pt(i, scores[i])[1]}" r="3.5" fill="#EF7FA8"/>`).join("")}
    ${labels}</svg>`;
}
function getResult() { return state.resultId === "live" ? state.liveResult : DB.results.find((r) => r.id === state.resultId); }
function renderResult() {
  const r = getResult(), other = userById(r.pair.find((x) => x !== "uMe"));
  const avg = Math.round(r.scores.reduce((a, b) => a + b, 0) / r.scores.length);
  $("#resWho").innerHTML = `<div class="avatar lg" style="background:${other.color};margin:0 auto">${other.initial}</div>
    <div style="text-align:center;margin-top:6px"><b>เรา ↔ ${other.name} (${other.role})</b>
    <div><span class="badge good">คะแนนรวม ${avg}%</span> <span class="muted">${r.date}</span></div></div>`;
  $("#radar").innerHTML = radarSVG(r.scores, DB.axes);
  $("#resStrong").innerHTML = r.strengths.map((s) => `<li>${s}</li>`).join("");
  $("#resGrowth").innerHTML = r.growth.map((s) => `<li>${s}</li>`).join("");
}
function openResult(id) { state.resultId = id; renderResult(); showView("result"); }

/* ---------- history ---------- */
function trendSVG() {
  const W = 330, H = 150, P = 28, t = DB.trend;
  const X = (i) => P + (i * (W - 2 * P)) / (t.length - 1);
  const Y = (v) => H - P - ((v - 55) / (95 - 55)) * (H - 2 * P);
  const pts = t.map((d, i) => X(i).toFixed(0) + "," + Y(d.score).toFixed(0)).join(" ");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <polyline points="${pts}" fill="none" stroke="#EF7FA8" stroke-width="3" stroke-linecap="round"/>
    ${t.map((d, i) => `<circle cx="${X(i)}" cy="${Y(d.score)}" r="5" fill="#EF7FA8" stroke="#fff" stroke-width="2"/>
      <text x="${X(i)}" y="${Y(d.score) - 10}" text-anchor="middle" font-size="11" font-weight="700" fill="#C6607A">${d.score}</text>
      <text x="${X(i)}" y="${H - 6}" text-anchor="middle" font-size="11" fill="#9A8AA5">${d.date}</text>`).join("")}</svg>`;
}
function renderHistory() {
  $("#trend").innerHTML = trendSVG();
  $("#histList").innerHTML = DB.results.slice().reverse().map((r) => {
    const o = userById(r.pair.find((x) => x !== "uMe"));
    const avg = Math.round(r.scores.reduce((a, b) => a + b, 0) / r.scores.length);
    return `<div class="list-row" onclick="openResult('${r.id}')" role="button" tabindex="0">
      <div class="avatar sm" style="background:${o.color}">${o.initial}</div>
      <div style="flex:1"><b>เรา ↔ ${o.name}</b><div class="muted">${r.date}</div></div>
      <span class="badge ${avg >= 80 ? "good" : ""}">${avg}%</span></div>`;
  }).join("");
  const a = DB.advisors[0];
  $("#advCard").innerHTML = `<div class="row"><div class="avatar" style="background:${a.color}">${a.initial}</div>
    <div><b>${a.name}</b><div class="muted">${a.cred} · ถนัด${a.specialty}</div></div></div>
    <p style="font-size:.88rem;margin-top:8px">ครอบครัวคุณพัฒนาขึ้นต่อเนื่อง การกินข้าวพร้อมหน้า + คุยวันละ 10 นาทีได้ผลชัด ลองเพิ่ม “วงเล่าเรื่องก่อนนอน” สัปดาห์ละ 2 ครั้ง จะช่วยให้เด็กๆ กล้าเปิดใจมากขึ้นค่ะ</p>`;
}

/* ---------- missions ---------- */
function renderMissions() {
  const today = DB.missions.filter((m) => m.date === "วันนี้");
  const pct = Math.round((today.filter((m) => m.done).length / today.length) * 100);
  const C = 2 * Math.PI * 26;
  $("#ringBox").innerHTML = `<svg class="ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#F6D3E0" stroke-width="8"/>
    <circle cx="32" cy="32" r="26" fill="none" stroke="#EF7FA8" stroke-width="8" stroke-linecap="round"
    stroke-dasharray="${(C * pct / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/>
    <text x="32" y="37" text-anchor="middle" font-size="14" font-weight="700" fill="#3A2E45">${pct}%</text></svg>`;
  $("#dailyList").innerHTML = today.map((m) => `<label class="mission ${m.done ? "done" : ""}">
    <input type="checkbox" ${m.done ? "checked" : ""} onchange="toggleMission('${m.id}')" aria-label="${m.title}">
    <span class="t" style="font-size:.88rem">${m.title}</span></label>`).join("");
  $("#bonusList").innerHTML = DB.missions.filter((m) => m.type === "bonus" && !m.done).map((m) =>
    `<div class="mission"><span class="t" style="flex:1;font-size:.88rem">🏆 ${m.title}</span>
     <button class="badge" style="border:none;cursor:pointer" onclick="addBonus('${m.id}')">+ เพิ่ม</button></div>`).join("");
}
function toggleMission(id) { const m = DB.missions.find((x) => x.id === id); m.done = !m.done; renderMissions(); }
function addBonus(id) { const m = DB.missions.find((x) => x.id === id); m.type = "daily"; m.date = "วันนี้"; m.done = false; renderMissions(); }

/* ---------- chat ---------- */
function renderThreads() {
  const list = DB.threads.filter((t) => t.kind === (state.chatTab === "family" ? "family" : "advisor"));
  $("#threadList").innerHTML = list.map((t) => {
    const u = userById(t.who), last = t.messages[t.messages.length - 1];
    return `<div class="thread" onclick="openThread('${t.id}')" role="button" tabindex="0">
      <div class="avatar" style="background:${u.color}">${u.initial}</div>
      <div style="flex:1"><b style="font-size:.9rem">${u.name || u.role}</b>
      <div class="muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px">${last.text}</div></div>
      <div style="text-align:right"><div class="muted" style="font-size:.7rem">${last.time}</div>
      ${t.unread ? `<span class="unread">${t.unread}</span>` : ""}</div></div>`;
  }).join("");
  $$("#chatTabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === state.chatTab));
}
function setChatTab(t) { state.chatTab = t; renderThreads(); }
function openThread(id) {
  state.thread = id;
  const t = DB.threads.find((x) => x.id === id), u = userById(t.who);
  t.unread = 0;
  $("#convHead").innerHTML = `<button class="back" onclick="closeThread()" aria-label="ย้อนกลับ">←</button>
    <div class="avatar sm" style="background:${u.color}">${u.initial}</div><div><b>${u.name || u.role}</b><div class="muted" style="font-size:.72rem">ออนไลน์</div></div>`;
  renderConv(); $("#threadPane").style.display = "none"; $("#convPane").style.display = "block"; renderThreads();
}
function renderConv() {
  const t = DB.threads.find((x) => x.id === state.thread);
  $("#convMsgs").innerHTML = t.messages.map((m) =>
    `<div class="bubble ${m.from === "uMe" ? "me" : "them"}">${m.text}<div style="font-size:.65rem;opacity:.7;text-align:right">${m.time}</div></div>`).join("");
  $("#convMsgs").scrollTop = 99999;
}
function closeThread() { state.thread = null; $("#convPane").style.display = "none"; $("#threadPane").style.display = "block"; }
function sendMsg() {
  const inp = $("#chatInput"), v = inp.value.trim(); if (!v) return;
  const t = DB.threads.find((x) => x.id === state.thread);
  t.messages.push({ from: "uMe", text: v, time: "ตอนนี้" }); inp.value = ""; renderConv();
  setTimeout(() => { t.messages.push({ from: t.who, text: autoReply(t.kind), time: "ตอนนี้" }); renderConv(); }, 900);
}
function autoReply(kind) {
  return kind === "advisor" ? "รับทราบค่ะ ลองทำดู 2-3 วันแล้วมาเล่าให้ฟังนะคะ ❤"
    : ["โอเคเลย ❤", "รับทราบจ้า แล้วคุยกันที่บ้านนะ", "ดีมาก! ภูมิใจในตัวหนูนะ"][Math.floor(Math.random() * 3)];
}

/* ---------- profile ---------- */
function renderProfile() {
  const me = userById("uMe");
  $("#profHead").innerHTML = `<div class="avatar lg" style="background:${me.color}">${me.initial}</div>
    <div><b style="font-size:1.1rem">${me.name}</b> <span class="badge">${me.role}</span>
    <div class="muted">สมาชิกตั้งแต่ ${me.joined}</div></div>`;
  $("#famList").innerHTML = DB.users.map((u) =>
    `<div class="list-row" style="cursor:default"><div class="avatar sm" style="background:${u.color}">${u.initial}</div>
     <div style="flex:1"><b>${u.name}</b><div class="muted">${u.role} · ${u.love}</div></div></div>`).join("");
  const done = DB.missions.filter((m) => m.done).length;
  $("#stats").innerHTML = `<div class="grid2" style="text-align:center">
    <div class="card" style="margin:0"><b style="font-size:1.3rem;color:#C6607A">${DB.results.length}</b><div class="muted">แบบสอบถาม</div></div>
    <div class="card" style="margin:0"><b style="font-size:1.3rem;color:#C6607A">${done}</b><div class="muted">ภารกิจสำเร็จ</div></div></div>
    <div class="card" style="margin-top:10px;text-align:center"><b>คะแนนความสัมพันธ์เฉลี่ย 83%</b><div class="muted">ดีขึ้น +20% จากเดือนพฤษภาคม 🎉</div></div>`;
}
function logout() { location.href = "index.html"; }

document.addEventListener("DOMContentLoaded", () => {
  renderHome(); renderQuiz(); renderResult(); renderHistory(); renderMissions(); renderThreads(); renderProfile();
  showView("home");
  $("#chatInput")?.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMsg(); });
});
