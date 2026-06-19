import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PORT = Number(process.env.PORT || 3000);
const HOST = "127.0.0.1";
const DATA_FILE = join(process.cwd(), "data", "mission-control.json");
const STATUSES = ["Not Started", "In Progress", "Blocked", "Complete"];
const PRIORITIES = ["Urgent", "High", "Normal", "Low"];
const ENTITIES = ["QuickMed Diagnostics", "Praesidium Diagnostics", "Sameday Health", "Sameday Testing", "Sameday Technologies", "Signal Diagnostics", "Flow Health", "Other"];
const MATTER_TYPES = ["AOB recovery", "insurer reimbursement", "litigation", "software build", "counsel request", "operations", "business development"];
const EVIDENCE_STATUSES = ["Missing", "Requested", "Received", "Reviewed", "Not Available"];
const DRAFT_TYPES = ["counsel email", "patient outreach", "insurer follow-up", "settlement summary", "timeline", "issue list", "evidence packet summary", "Codex build brief", "product idea", "prompt/playbook"];

async function loadData() {
  if (!existsSync(DATA_FILE)) throw new Error("Missing data/mission-control.json");
  return JSON.parse(await readFile(DATA_FILE, "utf8"));
}

async function saveData(data) {
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function collectBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body ? JSON.parse(body) : {}));
  });
}

function send(res, status, body, type = "text/html") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function json(res, body) {
  send(res, 200, JSON.stringify(body), "application/json");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

async function api(req, res) {
  const data = await loadData();
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  if (req.method === "GET" && url.pathname === "/api/data") return json(res, data);
  if (req.method === "POST" && url.pathname === "/api/tasks") {
    const body = await collectBody(req);
    const status = body.status || "Not Started";
    data.tasks.push({ id: id("task"), sortOrder: data.tasks.filter((t) => t.status === status).length + 1, archived: false, blocked: status === "Blocked" || !!body.blocked, blockedReason: "", tags: "", description: "", dueDate: "", matterId: "", ...body });
  }
  if (req.method === "PATCH" && url.pathname.startsWith("/api/tasks/")) {
    const taskId = url.pathname.split("/").pop();
    const body = await collectBody(req);
    data.tasks = data.tasks.map((task) => (task.id === taskId ? { ...task, ...body, blocked: body.status === "Blocked" ? true : body.blocked ?? task.blocked } : task));
  }
  if (req.method === "POST" && url.pathname === "/api/matters") {
    const body = await collectBody(req);
    data.matters.push({ id: id("mat"), status: "Active", priority: "Normal", owner: "Patrick", summary: "", nextAction: "", blockedReason: "", updatedAt: new Date().toISOString(), ...body });
  }
  if (req.method === "POST" && url.pathname === "/api/notes") {
    const body = await collectBody(req);
    data.notes.unshift({ id: id("note"), tags: "", matterId: "", taskId: "", updatedAt: new Date().toISOString(), ...body });
  }
  if (req.method === "POST" && url.pathname === "/api/evidence") {
    const body = await collectBody(req);
    data.evidenceGaps.push({ id: id("gap"), description: "", status: "Missing", source: "", nextAction: "", ...body });
  }
  if (req.method === "POST" && url.pathname === "/api/drafts") {
    const body = await collectBody(req);
    data.drafts.unshift({ id: id("draft"), tags: "", matterId: "", workstreamId: "", updatedAt: new Date().toISOString(), ...body });
  }
  if (req.method === "PATCH" && url.pathname.startsWith("/api/evidence/")) {
    const gapId = url.pathname.split("/").pop();
    const body = await collectBody(req);
    data.evidenceGaps = data.evidenceGaps.map((gap) => (gap.id === gapId ? { ...gap, ...body } : gap));
  }
  await saveData(data);
  return json(res, { ok: true });
}

function page() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>QuickMed Mission Control</title>
  <style>
    :root{--bg:#f4f6f1;--ink:#18201d;--line:#d9ded7;--field:#f7f8f5;--brand:#176b5b;--warn:#b65327;--urgent:#b3261e}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
    .app{min-height:100vh;display:grid;grid-template-columns:248px 1fr}.side{background:white;border-right:1px solid var(--line);padding:22px 14px;position:sticky;top:0;height:100vh}.brand{display:flex;gap:12px;align-items:center;margin:0 6px 22px}.mark{width:40px;height:40px;border-radius:6px;background:var(--brand);color:white;display:grid;place-items:center;font-weight:800}.nav button{width:100%;border:0;background:transparent;text-align:left;padding:10px 12px;border-radius:6px;font-weight:700;color:#56605b;cursor:pointer}.nav button:hover,.nav button.active{background:var(--field);color:var(--ink)}
    main{padding:26px;min-width:0}.top{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:18px}.eyebrow{text-transform:uppercase;font-size:12px;font-weight:800;color:#778078}.title{font-size:30px;font-weight:800}.grid{display:grid;gap:14px}.cols2{grid-template-columns:1.5fr .9fr}.cols4{grid-template-columns:repeat(4,1fr)}.panel{background:white;border:1px solid var(--line);border-radius:6px;padding:16px;box-shadow:0 10px 30px #18201d12}.card{background:var(--field);border:1px solid var(--line);border-radius:6px;padding:12px;margin-bottom:10px}.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.between{display:flex;justify-content:space-between;gap:12px}.badge{display:inline-flex;border:1px solid var(--line);background:var(--field);border-radius:5px;padding:4px 7px;font-size:12px;font-weight:800}.urgent{border-color:#b3261e44;background:#b3261e14;color:var(--urgent)}.high{border-color:#b6532744;background:#b6532714;color:var(--warn)}.brandb{border-color:#176b5b44;background:#176b5b14;color:var(--brand)}
    input,select,textarea{width:100%;border:1px solid var(--line);background:var(--field);border-radius:6px;padding:9px;font:inherit}textarea{min-height:90px}.form{display:grid;gap:10px}.twocol{display:grid;grid-template-columns:1fr 1fr;gap:10px}button.primary{border:0;border-radius:6px;background:var(--brand);color:white;padding:10px 12px;font-weight:800;cursor:pointer}button.secondary{border:1px solid var(--line);border-radius:6px;background:white;padding:9px 12px;font-weight:800;cursor:pointer}
    .board{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.column{min-height:360px;background:white;border:1px solid var(--line);border-radius:6px;padding:12px}.task{cursor:grab}.task.dragging{opacity:.45}.muted{color:#68736d}.small{font-size:12px}.hidden{display:none}.pre{white-space:pre-wrap;background:var(--field);border-radius:6px;padding:12px}.link{color:var(--brand);font-weight:800;cursor:pointer}
    @media(max-width:1000px){.app{display:block}.side{height:auto;position:static;border-right:0;border-bottom:1px solid var(--line)}.nav{display:flex;overflow:auto}.nav button{white-space:nowrap}.cols2,.cols4,.board{grid-template-columns:1fr}.top{display:block}}
  </style>
</head>
<body>
<div class="app">
  <aside class="side"><div class="brand"><div class="mark">QM</div><div><strong>QuickMed</strong><div class="small muted">Mission Control</div></div></div><div class="nav" id="nav"></div></aside>
  <main><div id="app"></div></main>
</div>
<script>
const STATUSES=${JSON.stringify(STATUSES)}, PRIORITIES=${JSON.stringify(PRIORITIES)}, ENTITIES=${JSON.stringify(ENTITIES)}, MATTER_TYPES=${JSON.stringify(MATTER_TYPES)}, EVIDENCE_STATUSES=${JSON.stringify(EVIDENCE_STATUSES)}, DRAFT_TYPES=${JSON.stringify(DRAFT_TYPES)};
let state={}, view='dashboard';
const $=s=>document.querySelector(s), html=s=>s;
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function ws(id){return state.workstreams.find(x=>x.id===id)||{name:'No workstream',color:'#999'}} function mat(id){return state.matters.find(x=>x.id===id)}
function badge(v){let c=v==='Urgent'?'urgent':v==='High'||v==='Blocked'||v==='Missing'?'high':'brandb';return '<span class="badge '+c+'">'+esc(v)+'</span>'}
async function load(){state=await fetch('/api/data').then(r=>r.json());renderNav();render()}
async function send(url,method,body){await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});await load()}
function renderNav(){let items=[['dashboard','Dashboard'],['tasks','Tasks'],['matters','Matters'],['notes','Notes'],['drafts','Drafts'],['settings','Settings']];$('#nav').innerHTML=items.map(i=>'<button class="'+(view===i[0]?'active':'')+'" onclick="view=\\''+i[0]+'\\';renderNav();render()">'+i[1]+'</button>').join('')}
function header(t,e=''){return '<div class="top"><div><div class="eyebrow">'+e+'</div><div class="title">'+t+'</div></div></div>'}
function taskCard(t){let m=mat(t.matterId);return '<div class="card task" draggable="true" data-id="'+t.id+'"><div class="row">'+badge(t.priority)+badge(t.status)+(t.blocked?badge('Blocked'):'')+'</div><h3>'+esc(t.title)+'</h3><p class="muted">'+esc(t.description||'')+'</p><div class="row small"><span class="badge">'+esc(ws(t.workstreamId).name)+'</span>'+(m?'<span class="badge">'+esc(m.name)+'</span>':'')+'<span class="badge">'+esc(t.dueDate||'No date')+'</span></div>'+(t.blockedReason?'<p class="high card">'+esc(t.blockedReason)+'</p>':'')+'<details><summary class="link">Edit</summary>'+taskForm(t)+'</details></div>'}
function taskForm(t={}){return '<form class="form" onsubmit="saveTask(event,\\''+(t.id||'')+'\\')"><input name="title" placeholder="Task title" value="'+esc(t.title||'')+'" required><textarea name="description" placeholder="Description">'+esc(t.description||'')+'</textarea><div class="twocol"><select name="status">'+STATUSES.map(x=>'<option '+(x===(t.status||'Not Started')?'selected':'')+'>'+x+'</option>').join('')+'</select><select name="priority">'+PRIORITIES.map(x=>'<option '+(x===(t.priority||'Normal')?'selected':'')+'>'+x+'</option>').join('')+'</select></div><div class="twocol"><select name="workstreamId">'+state.workstreams.map(x=>'<option value="'+x.id+'" '+(x.id===(t.workstreamId||state.workstreams[0]?.id)?'selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select><select name="matterId"><option value="">No matter</option>'+state.matters.map(x=>'<option value="'+x.id+'" '+(x.id===t.matterId?'selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></div><div class="twocol"><input type="date" name="dueDate" value="'+esc(t.dueDate||'')+'"><input name="tags" placeholder="tags" value="'+esc(t.tags||'')+'"></div><input name="blockedReason" placeholder="Blocked reason" value="'+esc(t.blockedReason||'')+'"><button class="primary">Save Task</button></form>'}
function formObj(form){return Object.fromEntries(new FormData(form).entries())}
async function saveTask(e,id){e.preventDefault();let body=formObj(e.target);body.blocked=body.status==='Blocked'||!!body.blockedReason;await send(id?'/api/tasks/'+id:'/api/tasks',id?'PATCH':'POST',body)}
function dashboard(){let active=state.tasks.filter(t=>!t.archived&&t.status!=='Complete').slice(0,8), blocked=state.matters.filter(m=>m.status==='Blocked'||m.blockedReason), gaps=state.evidenceGaps.filter(g=>['Missing','Requested'].includes(g.status));return header('Mission Control','Today')+'<div class="grid cols2"><section class="panel"><h2>Priority Tasks</h2>'+active.map(taskCard).join('')+'</section><section class="panel"><h2>Quick Create Task</h2>'+taskForm()+'</section></div><div class="grid cols4" style="margin-top:14px"><section class="panel"><h2>Status Counts</h2>'+STATUSES.map(s=>'<div class="between card"><span>'+s+'</span><b>'+state.tasks.filter(t=>!t.archived&&t.status===s).length+'</b></div>').join('')+'</section><section class="panel"><h2>Blocked Matters</h2>'+blocked.map(m=>'<div class="card"><b>'+esc(m.name)+'</b><p class="muted">'+esc(m.blockedReason||m.status)+'</p></div>').join('')+'</section><section class="panel"><h2>Evidence Gaps</h2>'+gaps.map(g=>'<div class="card"><div class="between"><b>'+esc(g.label)+'</b>'+badge(g.status)+'</div><p class="muted">'+esc(mat(g.matterId)?.name||'')+'</p></div>').join('')+'</section><section class="panel"><h2>Codex Queue</h2>'+state.drafts.slice(0,5).map(d=>'<div class="card"><b>'+esc(d.title)+'</b><p class="muted">'+esc(d.type)+'</p></div>').join('')+'</section></div>'}
function tasks(){setTimeout(bindDrag);return header('Task Board','Execution')+'<details class="panel"><summary class="link">Create task</summary>'+taskForm()+'</details><div class="board" style="margin-top:14px">'+STATUSES.map(s=>'<section class="column" data-status="'+s+'"><div class="between"><b>'+s+'</b><span class="badge">'+state.tasks.filter(t=>!t.archived&&t.status===s).length+'</span></div>'+state.tasks.filter(t=>!t.archived&&t.status===s).sort((a,b)=>a.sortOrder-b.sortOrder).map(taskCard).join('')+'</section>').join('')+'</div>'}
function bindDrag(){document.querySelectorAll('.task').forEach(el=>{el.ondragstart=e=>{e.dataTransfer.setData('text/plain',el.dataset.id);el.classList.add('dragging')};el.ondragend=()=>el.classList.remove('dragging')});document.querySelectorAll('.column').forEach(col=>{col.ondragover=e=>e.preventDefault();col.ondrop=e=>{e.preventDefault();let id=e.dataTransfer.getData('text/plain');send('/api/tasks/'+id,'PATCH',{status:col.dataset.status,blocked:col.dataset.status==='Blocked'})}})}
function matters(){return header('Matters','Workstreams and files')+'<div class="grid cols2"><section class="panel">'+state.matters.map(m=>'<div class="card"><div class="row">'+badge(m.priority)+badge(m.status)+'<span class="badge">'+esc(m.entity)+'</span></div><h3>'+esc(m.name)+'</h3><p>'+esc(m.summary)+'</p><p class="muted"><b>Next:</b> '+esc(m.nextAction)+'</p>'+evidenceFor(m.id)+'</div>').join('')+'</section><section class="panel"><h2>Create Matter</h2>'+matterForm()+'</section></div>'}
function matterForm(){return '<form class="form" onsubmit="event.preventDefault();send(\\'/api/matters\\',\\'POST\\',formObj(this))"><input name="name" placeholder="Matter name" required><div class="twocol"><select name="type">'+MATTER_TYPES.map(x=>'<option>'+x+'</option>').join('')+'</select><select name="entity">'+ENTITIES.map(x=>'<option>'+x+'</option>').join('')+'</select></div><select name="workstreamId">'+state.workstreams.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join('')+'</select><textarea name="summary" placeholder="Summary"></textarea><input name="nextAction" placeholder="Next action"><input name="blockedReason" placeholder="Blocked reason"><button class="primary">Create Matter</button></form>'}
function evidenceFor(matterId){let gaps=state.evidenceGaps.filter(g=>g.matterId===matterId);return '<h4>Evidence Gaps</h4>'+gaps.map(g=>'<div class="card"><div class="between"><b>'+esc(g.label)+'</b>'+badge(g.status)+'</div><p>'+esc(g.description)+'</p><select onchange="send(\\'/api/evidence/'+g.id+'\\',\\'PATCH\\',{status:this.value})">'+EVIDENCE_STATUSES.map(s=>'<option '+(s===g.status?'selected':'')+'>'+s+'</option>').join('')+'</select></div>').join('')+'<form class="form" onsubmit="event.preventDefault();let b=formObj(this);b.matterId=\\''+matterId+'\\';send(\\'/api/evidence\\',\\'POST\\',b)"><input name="label" placeholder="Evidence item"><input name="source" placeholder="Source"><input name="nextAction" placeholder="Next action"><button class="secondary">Add Gap</button></form>'}
function notes(){return header('Notes','Calls, summaries, strategy')+'<div class="grid cols2"><section>'+state.notes.map(n=>'<article class="panel" style="margin-bottom:12px"><h3>'+esc(n.title)+'</h3><p>'+esc(n.body)+'</p><p class="muted">'+esc(n.tags)+'</p></article>').join('')+'</section><section class="panel"><h2>Add Note</h2><form class="form" onsubmit="event.preventDefault();send(\\'/api/notes\\',\\'POST\\',formObj(this))"><input name="title" placeholder="Note title"><textarea name="body" placeholder="Note body"></textarea><select name="matterId"><option value="">No matter</option>'+state.matters.map(m=>'<option value="'+m.id+'">'+esc(m.name)+'</option>').join('')+'</select><input name="tags" placeholder="tags"><button class="primary">Add Note</button></form></section></div>'}
function drafts(){return header('Drafts and Build Specs','Plain text library')+'<div class="grid cols2"><section>'+state.drafts.map(d=>'<article class="panel" style="margin-bottom:12px"><div class="row">'+badge(d.type)+'</div><h3>'+esc(d.title)+'</h3><div class="pre">'+esc(d.body)+'</div><p class="muted">'+esc(d.tags)+'</p></article>').join('')+'</section><section class="panel"><h2>Save Draft or Spec</h2><form class="form" onsubmit="event.preventDefault();send(\\'/api/drafts\\',\\'POST\\',formObj(this))"><input name="title" placeholder="Title"><select name="type">'+DRAFT_TYPES.map(t=>'<option>'+t+'</option>').join('')+'</select><textarea name="body" placeholder="Plain text or Markdown"></textarea><input name="tags" placeholder="tags"><button class="primary">Save Draft</button></form></section></div>'}
function settings(){return header('Settings','Local defaults')+'<section class="panel"><h2>Workstreams</h2>'+state.workstreams.map(w=>'<div class="card"><div class="row"><span style="background:'+w.color+';width:12px;height:12px;border-radius:3px"></span><b>'+esc(w.name)+'</b>'+badge(w.priority)+'</div><p>'+esc(w.description)+'</p></div>').join('')+'</section><section class="panel" style="margin-top:14px"><h2>AOB Matter Guardrail</h2><p>QuickMed AOB matters should not be framed as ordinary patient medical debt. The patient balance remains $0; the dispute concerns insurer-paid funds allegedly issued to and retained by the patient despite assignment-of-benefits language.</p></section>'}
function render(){let map={dashboard,tasks,matters,notes,drafts,settings};$('#app').innerHTML=map[view]()}
load();
</script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) return await api(req, res);
    return send(res, 200, page());
  } catch (error) {
    console.error(error);
    return send(res, 500, "Mission Control error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`QuickMed Mission Control running at http://${HOST}:${PORT}`);
});
