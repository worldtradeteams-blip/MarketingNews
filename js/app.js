/* Global Marketing Intelligence — core app logic
   Static, offline-capable. Attempts live RSS fetch via a public CORS proxy;
   falls back gracefully to bundled seed cases if a source is unreachable. */

const STATE = {
  sources: [],
  sourceHealth: {},   // name -> {status, lastFetch, count, error}
  cases: [...SEED_CASES],
  filters: { date: "all", score: "65", area: "all", industry: "all", geo: "all", q: "" },
  saved: JSON.parse(localStorage.getItem("gmi_saved") || "[]"),
  section: "today",
  classroom: false,
};

const CORS_PROXY = "https://api.allorigins.win/raw?url=";

// ---------- Boot ----------
async function init() {
  applyTheme(localStorage.getItem("gmi_theme") || "system");
  STATE.section = localStorage.getItem("gmi_section") || "today";
  bindUI();
  await loadSources();
  render();
  attemptLiveFetch(); // non-blocking; updates source health + may add cases
}

async function loadSources() {
  try {
    const res = await fetch("config/sources.json");
    STATE.sources = await res.json();
  } catch (e) {
    STATE.sources = [];
  }
  STATE.sources.forEach(s => STATE.sourceHealth[s.name] = { status: "unknown", lastFetch: null, count: 0, error: null });
}

// ---------- Live fetch (best-effort, never blocks UI) ----------
async function attemptLiveFetch() {
  setStatus("Refreshing…");
  const results = await Promise.all(STATE.sources.filter(s => s.enabled).map(fetchSource));
  results.forEach(r => { if (r && r.items) STATE.cases = dedupe([...STATE.cases, ...r.items]); });
  renderSourceHealth();
  renderSection();
  setStatus("Last updated: " + new Date().toLocaleTimeString());
}

async function fetchSource(src) {
  try {
    const res = await fetch(CORS_PROXY + encodeURIComponent(src.url), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const items = parseRSS(text, src);
    STATE.sourceHealth[src.name] = { status: "active", lastFetch: new Date().toISOString(), count: items.length, error: null };
    return { items };
  } catch (e) {
    STATE.sourceHealth[src.name] = { status: "unavailable", lastFetch: null, count: 0, error: (e.message || "fetch failed") };
    return { items: [] };
  }
}

function parseRSS(xmlText, src) {
  try {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    if (doc.querySelector("parsererror")) return [];
    const items = [...doc.querySelectorAll("item, entry")].slice(0, 15);
    return items.map((it, i) => rawToCase(it, src, i)).filter(passesMarketingFilter);
  } catch (e) { return []; }
}

function rawToCase(it, src, i) {
  const title = it.querySelector("title")?.textContent?.trim() || "Untitled";
  const link = it.querySelector("link")?.textContent?.trim() || it.querySelector("link")?.getAttribute("href") || src.url;
  const desc = (it.querySelector("description, summary")?.textContent || "").replace(/<[^>]+>/g, "").slice(0, 280);
  const pub = it.querySelector("pubDate, published, updated")?.textContent || new Date().toISOString();
  const scored = scoreCandidate(title, desc);
  return {
    id: "live_" + src.name.replace(/\s/g, "") + "_" + i + "_" + Date.now(),
    brand: guessBrand(title) || "Unspecified",
    title, source: src.name, coverage: [src.name], date: new Date(pub).toISOString().slice(0, 10),
    country: "Unspecified", region: "Unspecified", industry: "Other", url: link,
    reliability: src.reliability || "SPECIALIST_MARKETING",
    summary: desc || "See original article for details.",
    idea: "Not yet analyzed — open original article.", insight: "Not yet analyzed.", creative: "Not yet analyzed.",
    innovative: "Not yet analyzed.", strategy: "Not yet analyzed.", impact: "Not publicly reported.",
    why: "Flagged by keyword filter as a plausible marketing case; needs editorial review.",
    concepts: scored.concepts, questions: [
      "What consumer insight might this be based on?",
      "What marketing strategy does this represent?",
      "What would make this case succeed or fail?"
    ],
    score: scored.score, tier: tierFor(scored.score), aiRole: null, needsReview: true
  };
}

// Lightweight heuristic filter/scorer for live (unreviewed) items — deliberately conservative.
const POSITIVE_KEYWORDS = ["campaign","brand","rebrand","reposition","launch","partnership","activation","experiential","loyalty","personalization","creative","storytelling","sponsorship","influencer","creator","Gen Z","cultural","international","expansion","customer experience","AI-powered","immersive"];
const NEGATIVE_KEYWORDS = ["quarterly earnings","stock price","shares fell","shares rose","appoints","names new CEO","named as","board of directors","lawsuit","merger completed","acquisition closes","layoffs"];
const BIG_BRANDS = ["Nike","Coca-Cola","Pepsi","Apple","Google","Microsoft","Amazon","McDonald's","Starbucks","LEGO","IKEA","Adidas","Unilever","P&G","Procter & Gamble","L'Oréal","Samsung","Toyota","BMW","Mercedes","Netflix","Disney","Spotify","Airbnb","Marriott","Visa","Mastercard","Sephora","Duolingo"];

function scoreCandidate(title, desc) {
  const text = (title + " " + desc).toLowerCase();
  let score = 40;
  const concepts = [];
  POSITIVE_KEYWORDS.forEach(k => { if (text.includes(k.toLowerCase())) { score += 3; } });
  NEGATIVE_KEYWORDS.forEach(k => { if (text.includes(k.toLowerCase())) { score -= 15; } });
  if (BIG_BRANDS.some(b => text.includes(b.toLowerCase()))) score += 10;
  if (text.includes("creative") || text.includes("campaign")) concepts.push("Brand Strategy");
  if (text.includes("ai")) concepts.push("AI Marketing");
  if (text.includes("influencer") || text.includes("creator")) concepts.push("Influencer Marketing");
  if (text.includes("experiential")) concepts.push("Experiential Marketing");
  if (concepts.length === 0) concepts.push("Brand Strategy");
  return { score: Math.max(0, Math.min(100, score)), concepts };
}

function passesMarketingFilter(item) { return true; } // filtering happens via score threshold in UI

function guessBrand(title) {
  const found = BIG_BRANDS.find(b => title.toLowerCase().includes(b.toLowerCase()));
  return found || null;
}

function tierFor(score) {
  if (score >= 85) return "FEATURED CASE";
  if (score >= 75) return "STRONG CASE";
  if (score >= 65) return "WATCHLIST";
  return "REJECT";
}

// ---------- Dedupe ----------
function dedupe(cases) {
  const seen = new Map();
  for (const c of cases) {
    const key = (c.brand + "|" + c.title).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
    if (seen.has(key)) {
      const existing = seen.get(key);
      existing.coverage = [...new Set([...(existing.coverage||[]), ...(c.coverage||[c.source])])];
    } else {
      seen.set(key, c);
    }
  }
  return [...seen.values()];
}

// ---------- Filtering ----------
function visibleCases() {
  const f = STATE.filters;
  const minScore = parseInt(f.score, 10);
  let list = STATE.cases.filter(c => c.score >= minScore);
  if (f.area !== "all") list = list.filter(c => c.concepts.some(x => x.toLowerCase().includes(f.area.toLowerCase())));
  if (f.industry !== "all") list = list.filter(c => c.industry === f.industry);
  if (f.geo !== "all") list = list.filter(c => (c.region || "").toLowerCase().includes(f.geo.toLowerCase()));
  if (f.q.trim()) {
    const q = f.q.toLowerCase();
    list = list.filter(c => [c.brand, c.title, c.industry, c.source, ...(c.concepts||[])].join(" ").toLowerCase().includes(q));
  }
  return list.sort((a, b) => (b.score - a.score) || (new Date(b.date) - new Date(a.date)));
}

// ---------- Render ----------
function render() {
  renderNav();
  renderSection();
  renderSourceHealth();
}

function renderNav() {
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.dataset.section === STATE.section);
  });
}

function renderSection() {
  const root = document.getElementById("content");
  const list = visibleCases();
  if (STATE.section === "sources") { root.innerHTML = sourcesHTML(); return; }
  if (STATE.section === "saved") {
    const saved = STATE.cases.filter(c => STATE.saved.includes(c.id));
    root.innerHTML = `<h2>Saved Cases</h2>` + (saved.length ? cardsHTML(saved) : emptyState("No saved cases yet. Click the bookmark icon on any case."));
    bindCardEvents(); return;
  }
  if (STATE.section === "brands") { root.innerHTML = brandsHTML(list); return; }
  if (STATE.section === "concepts") { root.innerHTML = conceptsHTML(list); return; }
  if (STATE.section === "trending") { root.innerHTML = trendingHTML(list); return; }
  if (STATE.section === "library") { root.innerHTML = `<h2>Case Library</h2>` + cardsHTML(list); bindCardEvents(); return; }

  // TODAY / WEEK default
  const featured = list[0];
  const rest = list.slice(1, STATE.section === "week" ? 20 : 6);
  root.innerHTML = `
    <div class="hero">
      <h1>Global Marketing Intelligence</h1>
      <p class="subtitle">The world's most interesting marketing cases, selected for strategic insight, creativity and classroom value.</p>
    </div>
    ${featured ? `<h2>Case of the Day</h2>${cardHTML(featured, true)}` : emptyState("No cases match current filters.")}
    <h2>${STATE.section === "week" ? "This Week's Cases" : "Today's Best Marketing Cases"}</h2>
    ${cardsHTML(rest)}
  `;
  bindCardEvents();
}

function scoreBadgeClass(score) {
  if (score >= 85) return "badge featured";
  if (score >= 75) return "badge strong";
  if (score >= 65) return "badge watch";
  return "badge reject";
}

function cardsHTML(list) {
  if (!list.length) return emptyState("No cases match current filters.");
  return `<div class="grid">${list.map(c => cardHTML(c, false)).join("")}</div>`;
}

function cardHTML(c, big) {
  const saved = STATE.saved.includes(c.id);
  return `
  <article class="card ${big ? "card-big" : ""}" data-id="${c.id}">
    <div class="card-top">
      <span class="${scoreBadgeClass(c.score)}">${c.tier} · ${c.score}</span>
      <button class="save-btn ${saved ? "saved" : ""}" data-save="${c.id}" title="Save">${saved ? "★" : "☆"}</button>
    </div>
    <h3>${c.brand} — ${c.title}</h3>
    <div class="meta">${c.source}${c.coverage && c.coverage.length > 1 ? " +" + (c.coverage.length - 1) + " more" : ""} · ${c.date} · ${c.region || c.country}</div>
    <p class="summary">${c.summary}</p>
    <div class="tags">${(c.concepts || []).map(t => `<span class="tag">${t}</span>`).join("")}</div>
    <div class="card-actions">
      <a href="${c.url}" target="_blank" rel="noopener">Original article ↗</a>
      <button data-expand="${c.id}">Full case study</button>
      <button data-classroom="${c.id}">Classroom mode</button>
    </div>
    <div class="expand" id="expand-${c.id}" hidden></div>
  </article>`;
}

function fullCaseHTML(c) {
  return `
    <div class="full-case">
      <h4>What happened?</h4><p>${c.summary}</p>
      <h4>The marketing idea</h4><p>${c.idea}</p>
      <h4>Consumer insight</h4><p>${c.insight}</p>
      <h4>Why it's creative</h4><p>${c.creative}</p>
      <h4>Why it's innovative</h4><p>${c.innovative}</p>
      ${c.aiRole ? `<h4>What did AI actually do?</h4><p>${c.aiRole}</p>` : ""}
      <h4>Strategic lesson</h4><p>${c.strategy}</p>
      <h4>Business impact <span class="fact-label">FACT</span></h4><p>${c.impact}</p>
      <h4>Why it matters <span class="fact-label interp">INTERPRETATION</span></h4><p>${c.why}</p>
      <h4>Teaching questions</h4>
      <ol>${(c.questions||[]).map(q => `<li>${q}</li>`).join("")}</ol>
      ${c.needsReview ? `<p class="review-note">⚠ Live item — pending editorial review, not yet fully analyzed.</p>` : ""}
    </div>`;
}

function classroomHTML(c) {
  return `
    <div class="full-case classroom">
      <h4>Case</h4><p><strong>${c.brand}</strong> — ${c.title}</p>
      <h4>Marketing concepts</h4><div class="tags">${(c.concepts||[]).map(t=>`<span class="tag">${t}</span>`).join("")}</div>
      <h4>Consumer insight</h4><p>${c.insight}</p>
      <h4>Strategic problem</h4><p>${c.strategy}</p>
      <h4>Discussion questions</h4><ol>${(c.questions||[]).map(q=>`<li>${q}</li>`).join("")}</ol>
      <h4>Suggested frameworks</h4>
      <p>STP · 4Ps/7Ps · Consumer Decision Journey · AIDA · Brand Equity · Positioning · International Standardization vs. Adaptation</p>
      <p class="review-note">No "correct answer" is provided — use this for open classroom debate.</p>
    </div>`;
}

function emptyState(msg) { return `<div class="empty">${msg}</div>`; }

function sourcesHTML() {
  const rows = STATE.sources.map(s => {
    const h = STATE.sourceHealth[s.name] || {};
    const dotClass = h.status === "active" ? "dot active" : h.status === "unavailable" ? "dot down" : "dot unknown";
    return `<tr>
      <td>${s.name}</td>
      <td><span class="${dotClass}"></span> ${h.status || "unknown"}</td>
      <td>${h.lastFetch ? new Date(h.lastFetch).toLocaleTimeString() : "—"}</td>
      <td>${h.count || 0}</td>
      <td>${h.error ? h.error : "—"}</td>
    </tr>`;
  }).join("");
  return `<h2>Source Health</h2>
    <p class="note">Live fetching uses a public CORS relay and may be unavailable in some hosting/network environments. When a source is unreachable it is marked below and excluded — the rest of the dashboard keeps working from reviewed cases.</p>
    <table class="src-table"><thead><tr><th>Source</th><th>Status</th><th>Last fetch</th><th>Items</th><th>Error</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function brandsHTML(list) {
  const counts = {};
  list.forEach(c => counts[c.brand] = (counts[c.brand]||0)+1);
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  return `<h2>Top Brands</h2><div class="chip-list">${sorted.map(([b,n])=>`<span class="chip">${b} (${n})</span>`).join("")}</div>`;
}

function conceptsHTML(list) {
  const counts = {};
  list.forEach(c => (c.concepts||[]).forEach(k => counts[k] = (counts[k]||0)+1));
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  return `<h2>Marketing Concepts</h2><div class="chip-list">${sorted.map(([k,n])=>`<span class="chip">${k} (${n})</span>`).join("")}</div>`;
}

function trendingHTML(list) {
  const counts = {};
  list.forEach(c => (c.concepts||[]).forEach(k => counts[k] = (counts[k]||0)+1));
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  return `<h2>Trending Themes</h2><div class="chip-list">${sorted.map(([k,n])=>`<span class="chip trending">${k} — ${n} cases</span>`).join("")}</div>
    <h2>Related Cases</h2>${cardsHTML(list.slice(0,8))}`;
}

function renderSourceHealth() {
  const el = document.getElementById("source-mini");
  if (!el) return;
  const total = STATE.sources.length;
  const active = Object.values(STATE.sourceHealth).filter(h => h.status === "active").length;
  el.textContent = `Sources: ${active}/${total} active`;
}

function setStatus(text) {
  const el = document.getElementById("status-text");
  if (el) el.textContent = text;
}

// ---------- Events ----------
function bindCardEvents() {
  document.querySelectorAll("[data-save]").forEach(btn => btn.addEventListener("click", () => toggleSave(btn.dataset.save)));
  document.querySelectorAll("[data-expand]").forEach(btn => btn.addEventListener("click", () => toggleExpand(btn.dataset.expand, "full")));
  document.querySelectorAll("[data-classroom]").forEach(btn => btn.addEventListener("click", () => toggleExpand(btn.dataset.classroom, "classroom")));
}

function toggleExpand(id, mode) {
  const c = STATE.cases.find(x => x.id === id);
  const box = document.getElementById("expand-" + id);
  if (!box) return;
  if (!box.hidden && box.dataset.mode === mode) { box.hidden = true; return; }
  box.innerHTML = mode === "classroom" ? classroomHTML(c) : fullCaseHTML(c);
  box.dataset.mode = mode;
  box.hidden = false;
}

function toggleSave(id) {
  if (STATE.saved.includes(id)) STATE.saved = STATE.saved.filter(x => x !== id);
  else STATE.saved.push(id);
  localStorage.setItem("gmi_saved", JSON.stringify(STATE.saved));
  renderSection();
}

function applyTheme(mode) {
  localStorage.setItem("gmi_theme", mode);
  const resolved = mode === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : mode;
  document.documentElement.setAttribute("data-theme", resolved);
  document.querySelectorAll(".theme-btn").forEach(b => b.classList.toggle("active", b.dataset.theme === mode));
}

function bindUI() {
  document.querySelectorAll(".nav-item").forEach(el => el.addEventListener("click", () => {
    STATE.section = el.dataset.section;
    localStorage.setItem("gmi_section", STATE.section);
    render();
  }));
  document.querySelectorAll(".theme-btn").forEach(el => el.addEventListener("click", () => applyTheme(el.dataset.theme)));
  document.getElementById("refresh-btn").addEventListener("click", attemptLiveFetch);
  document.getElementById("search-input").addEventListener("input", e => { STATE.filters.q = e.target.value; renderSection(); });
  document.getElementById("score-filter").addEventListener("change", e => { STATE.filters.score = e.target.value; renderSection(); });
  document.getElementById("area-filter").addEventListener("change", e => { STATE.filters.area = e.target.value; renderSection(); });
  document.getElementById("industry-filter").addEventListener("change", e => { STATE.filters.industry = e.target.value; renderSection(); });
  document.getElementById("geo-filter").addEventListener("change", e => { STATE.filters.geo = e.target.value; renderSection(); });
}

document.addEventListener("DOMContentLoaded", init);
