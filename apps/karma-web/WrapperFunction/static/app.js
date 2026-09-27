const $ = (id) => document.getElementById(id);
const notice = (message) => { $("notice").textContent = message; };
const token = () => sessionStorage.getItem("karma-access-key") || "";
async function api(path, options = {}) {
  const headers = { ...options.headers };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  if (options.body) headers["Content-Type"] = "application/json";
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    if (response.status === 401 || response.status === 500) $("access-dialog").showModal();
    const detail = await response.json().catch(() => ({}));
    throw new Error(typeof detail.detail === "string" ? detail.detail : `Request failed (${response.status})`);
  }
  return response.json();
}
const send = (path, method, data) => api(path, { method, body: JSON.stringify(data) });
function item(parent, title, description = "", meta = "") {
  const row = document.createElement("div");
  row.className = "item";
  const strong = document.createElement("strong"); strong.textContent = title; row.append(strong);
  if (meta) { const small = document.createElement("small"); small.textContent = meta; row.append(small); }
  if (description) { const p = document.createElement("p"); p.textContent = description; row.append(p); }
  parent.append(row);
  return row;
}
function show(view) {
  document.querySelectorAll(".view").forEach(el => el.classList.toggle("active", el.id === view));
  document.querySelectorAll(".nav").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  $("heading").textContent = ({home:"Command", chat:"Talk to Karma", ideas:"Organise an idea", universe:"Comic universe", knowledge:"Knowledge", approvals:"Approvals"})[view];
  notice("");
  if (view === "universe") loadUniverse();
  if (view === "knowledge") loadKnowledge();
  if (view === "approvals") loadApprovals();
  if (view === "chat") checkChat();
}
document.querySelectorAll("[data-view]").forEach(el => el.addEventListener("click", () => show(el.dataset.view)));
document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => show(el.dataset.go)));
$("token-button").addEventListener("click", () => $("access-dialog").showModal());
$("save-key").addEventListener("click", () => {
  sessionStorage.setItem("karma-access-key", $("access-key").value.trim());
  checkConnection();
});
async function checkConnection() {
  try {
    const identity = await api("/identity");
    $("status").textContent = `${identity.name} API connected`;
    $("status-dot").style.color = "#81ddb2";
  } catch (error) {
    $("status").textContent = "Connection needs attention";
    $("status-dot").style.color = "#f1c984";
    notice(error.message);
  }
}
$("idea-form").addEventListener("submit", async event => {
  event.preventDefault(); notice("");
  try {
    const data = await send("/structure-thought", "POST", { raw_input: $("thought").value, goal: $("goal").value });
    const result = $("idea-result"); result.replaceChildren(); result.hidden = false;
    item(result, data.summary, data.straight_feedback, data.feasibility === "works" ? "FEASIBLE WITH PHASED WORK" : "NEEDS CHANGES");
    const heading = document.createElement("h3"); heading.textContent = "Next steps"; result.append(heading);
    const list = document.createElement("ol");
    data.phases.forEach(phase => { const li = document.createElement("li"); li.textContent = phase; list.append(li); });
    result.append(list);
  } catch (error) { notice(error.message); }
});
let universes = [];
async function loadUniverse() {
  try {
    const [worlds, characters] = await Promise.all([api("/universes"), api("/characters")]);
    universes = worlds;
    $("universe-list").replaceChildren(); $("character-list").replaceChildren(); $("character-universe").replaceChildren();
    if (!worlds.length) item($("universe-list"), "No universe saved yet");
    worlds.forEach(world => {
      item($("universe-list"), world.name, world.timeline, world.canon);
      const option = document.createElement("option"); option.value = world.id; option.textContent = world.name; $("character-universe").append(option);
    });
    if (!characters.length) item($("character-list"), "No characters saved yet");
    characters.forEach(character => item($("character-list"), character.name, character.backstory, worlds.find(w => w.id === character.universe_id)?.name || ""));
  } catch (error) { notice(error.message); }
}
$("refresh-universe").addEventListener("click", loadUniverse);
$("universe-form").addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await send("/universes", "POST", {name:$("universe-name").value, canon:$("universe-canon").value, timeline:$("universe-timeline").value});
    event.target.reset(); await loadUniverse(); notice("Universe saved on this iMac.");
  } catch (error) { notice(error.message); }
});
$("character-form").addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await send("/characters", "POST", {universe_id:$("character-universe").value, name:$("character-name").value, backstory:$("character-backstory").value});
    event.target.reset(); await loadUniverse(); notice("Character saved on this iMac.");
  } catch (error) { notice(error.message); }
});
async function loadKnowledge() {
  try {
    const entries = await api("/knowledge-bases"); const list = $("knowledge-list"); list.replaceChildren();
    for (const entry of entries) {
      const button = document.createElement("button"); button.className = "card";
      const title = document.createElement("strong"); title.textContent = entry.title;
      const summary = document.createElement("small"); summary.textContent = entry.summary;
      button.append(title, summary); list.append(button);
      button.addEventListener("click", async () => {
        try {
          const detail = await api(`/knowledge-bases/${encodeURIComponent(entry.id)}`);
          const panel = $("knowledge-detail"); panel.replaceChildren(); panel.hidden = false;
          const heading = document.createElement("h2"); heading.textContent = detail.title; panel.append(heading);
          detail.sections.forEach(section => {
            const h = document.createElement("h3"); h.textContent = section.heading; panel.append(h);
            const ul = document.createElement("ul");
            section.points.forEach(point => { const li = document.createElement("li"); li.textContent = point; ul.append(li); });
            panel.append(ul);
          });
          panel.scrollIntoView({behavior:"smooth"});
        } catch (error) { notice(error.message); }
      });
    }
  } catch (error) { notice(error.message); }
}
async function loadApprovals() {
  try {
    const entries = await api("/approvals"); const list = $("approval-list"); list.replaceChildren();
    if (!entries.length) item(list, "No approval requests");
    entries.forEach(entry => {
      const row = item(list, entry.action_type.replaceAll("_", " "), entry.reason, `${entry.status} · ${entry.target_type} · ${entry.target_id}`);
      if (entry.status !== "pending") return;
      for (const [label, approve] of [["Approve", true], ["Reject", false]]) {
        const button = document.createElement("button"); button.className = "subtle"; button.textContent = label;
        button.style.margin = "12px 8px 0 0"; row.append(button);
        button.addEventListener("click", async () => {
          if (!confirm(`${label} this ${entry.action_type} request?`)) return;
          try { await send(`/approvals/${encodeURIComponent(entry.id)}/decision`, "POST", {approve}); await loadApprovals(); }
          catch (error) { notice(error.message); }
        });
      }
    });
  } catch (error) { notice(error.message); }
}
checkConnection();
const conversation = [];
function bubble(role, message) {
  const node = document.createElement("div");
  node.className = `bubble ${role}`; node.textContent = message;
  $("chat-log").append(node); node.scrollIntoView({block:"nearest"});
}
async function checkChat() {
  try {
    const state = await api("/chat/status");
    $("chat-state").textContent = state.connected
      ? "AI connection ready. This chat can advise; it cannot execute account actions."
      : "AI chat needs a model connection on the iMac. The other workspace tools are available.";
  } catch (error) { $("chat-state").textContent = error.message; }
}
$("chat-form").addEventListener("submit", async event => {
  event.preventDefault();
  const message = $("chat-message").value.trim(); if (!message) return;
  $("chat-message").value = ""; bubble("user", message);
  const button = event.target.querySelector("button"); button.disabled = true; button.textContent = "Thinking…";
  try {
    const result = await send("/chat", "POST", {message, history:conversation});
    bubble("assistant", result.reply);
    conversation.push({role:"user", content:message}, {role:"assistant", content:result.reply});
    if (conversation.length > 20) conversation.splice(0, conversation.length - 20);
  } catch (error) { bubble("assistant", error.message); }
  finally { button.disabled = false; button.textContent = "Send"; }
});
