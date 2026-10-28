import { useEffect, useState } from "react";

const API = "https://spellchecker-ak2f.onrender.com";
const SAMPLE = "Teh quick brown fox jumpd over the lazy dog. The dog was not happpy, but the fox did not care.";

export default function App() {
  const [text, setText] = useState(SAMPLE);
  const [result, setResult] = useState(null);
  const [active, setActive] = useState(null);   // misspelled word whose suggestions are open
  const [stats, setStats] = useState(null);
  const [newWord, setNewWord] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadStats = () =>
    fetch(`${API}/stats`).then((r) => r.json()).then(setStats).catch(() => {});

  async function check(value = text) {
    setBusy(true); setError(""); setActive(null);
    try {
      const r = await fetch(`${API}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      setResult(await r.json());
    } catch {
      setError("Cannot reach the backend. Start it with: uvicorn main:app --reload");
    }
    setBusy(false);
  }

  useEffect(() => { loadStats(); check(SAMPLE); }, []);

  function replaceWord(bad, good) {
    const re = new RegExp(`\\b${bad}\\b`, "gi");
    const next = text.replace(re, good);
    setText(next); check(next);
  }

  async function addWord() {
    if (!newWord.trim()) return;
    const r = await fetch(`${API}/add-word`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: newWord }),
    }).then((r) => r.json());
    setMsg(r.message);
    if (r.success) { setNewWord(""); loadStats(); check(); }
  }

  // Build the marked-up preview: wrong words become clickable
  const parts = text.split(/([A-Za-z']+)/);
  const preview = parts.map((p, i) => {
    const key = p.toLowerCase().replace(/^'+|'+$/g, "");
    if (result && key in result.wrong) {
      return (
        <button key={i} className={"miss" + (active === key ? " open" : "")}
                onClick={() => setActive(active === key ? null : key)}>{p}</button>
      );
    }
    return <span key={i}>{p}</span>;
  });

  const wrongCount = result ? Object.keys(result.wrong).length : 0;

  return (
    <div className="page">
      <header>
        <h1>Proofread</h1>
        <p>Paste text, find misspelled words, fix them in one click.</p>
      </header>

      <main>
        <section className="editor">
          <label htmlFor="t">Your text</label>
          <textarea id="t" value={text} onChange={(e) => setText(e.target.value)} rows={7} />
          <div className="row">
            <button className="primary" onClick={() => check()} disabled={busy}>
              {busy ? "Checking…" : "Check spelling"}
            </button>
            {result && (
              <span className="count">
                {wrongCount === 0 ? "No misspelled words." : `${wrongCount} misspelled word${wrongCount > 1 ? "s" : ""} in ${result.total} words`}
              </span>
            )}
          </div>
          {error && <p className="err">{error}</p>}
        </section>

        <section className="review">
          <h2>Review</h2>
          <p className="preview">{preview}</p>
          {active && result?.wrong[active] && (
            <div className="sugg">
              <span>Replace “{active}” with:</span>
              {result.wrong[active].length === 0 && <em>No suggestions found.</em>}
              {result.wrong[active].map((s) => (
                <button key={s} onClick={() => replaceWord(active, s)}>{s}</button>
              ))}
            </div>
          )}
        </section>

        <section className="chart">
          <h2>Most used words</h2>
          {result?.chart
            ? <img alt="Bar chart of the ten most frequent words" src={`data:image/png;base64,${result.chart}`} />
            : <p className="muted">Check some text to see the chart.</p>}
        </section>

        <aside>
          <h2>Dictionary</h2>
          <div className="add">
            <input value={newWord} placeholder="Add a word"
                   onChange={(e) => setNewWord(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && addWord()} />
            <button onClick={addWord}>Add word</button>
          </div>
          {msg && <p className="muted">{msg}</p>}
          {stats && (
            <dl>
              <dt>Words stored</dt><dd>{stats.words}</dd>
              <dt>Buckets</dt><dd>{stats.buckets}</dd>
              <dt>Buckets in use</dt><dd>{stats.used_buckets}</dd>
              <dt>Load factor</dt><dd>{stats.load_factor}</dd>
              <dt>Longest chain</dt><dd>{stats.longest_chain}</dd>
            </dl>
          )}
        </aside>
      </main>
    </div>
  );
}
