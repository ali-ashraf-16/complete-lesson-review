import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import data from "@/data/grade6-revision.json";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grade 6 Math Revision Notebook · Term 1" },
      { name: "description", content: "Printable Grade 6 Math revision notebook for Units 1, 2 & 3: rules, examples and exam tricks." },
      { property: "og:title", content: "Grade 6 Math Revision Notebook" },
      { property: "og:description", content: "Term 1 · Units 1, 2 & 3 · Every rule, example and exam trick." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Item = { label: string; question: string; steps?: string[]; answer: string };

/** Renders `base^{exp}` data notation as a real superscript (e.g. 5^{6} → 5⁶). */
function MathText({ text }: { text: string }) {
  const parts = text.split(/(\^\{[^}]*\})/);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("^{") ? (
          <sup key={i} className="exponent">{p.slice(2, -1)}</sup>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
type Sheet = {
  id: string; unit: string; lesson: string; title: string; rule: string;
  words?: string[][]; items: Item[]; tricks: string[]; note: string;
};
const sheets = data.sheets as Sheet[];
const unitColor: Record<string, string> = { u1: "unit-1", u2: "unit-2", u3: "unit-3" };

function Footer() {
  return <footer className="sheet-footer">Prepared by Mr. Ali Ashraf</footer>;
}

function Cover() {
  return (
    <section className="sheet cover">
      <div className="cover-inner">
        <span className="badge">Grade 6 · Mathematics</span>
        <h1 className="cover-title">{data.title}</h1>
        <p className="cover-sub">Term 1 · Units 1, 2 &amp; 3</p>
        <p className="cover-tag">Every rule, example and exam trick</p>
        <ul className="cover-units">
          {data.units.map((u) => (
            <li key={u.id} className={unitColor[u.id]}>{u.label}</li>
          ))}
        </ul>
        <div className="cover-name">Name: ______________________ &nbsp; Class: ________</div>
      </div>
      <Footer />
    </section>
  );
}

function SheetView({ s, n }: { s: Sheet; n: number }) {
  const unit = data.units.find((u) => u.id === s.unit);
  if (!unit) return null;
  return (
    <section className={`sheet ${unitColor[s.unit]}`} id={s.id}>
      <header className="sheet-head">
        <div className="flex flex-wrap gap-2">
          <span className="badge unit-badge">{unit.label}</span>
          <span className="badge">{s.lesson}</span>
        </div>
        <span className="sheet-no">Sheet {n}</span>
      </header>
      <h2 className="sheet-title">{s.title}</h2>
      <div className="box rule"><h3>Rule</h3><p><MathText text={s.rule} /></p></div>
      {s.words && (
        <div className="box"><h3>Key Words</h3>
          <table className="words"><tbody>
            {s.words.map(([k, v]) => (<tr key={k}><th>{k}</th><td><MathText text={v} /></td></tr>))}
          </tbody></table>
        </div>
      )}
      <div className="examples">
        {s.items.map((it) => (
          <div key={it.label} className="example">
            <span className="ex-label">{it.label}</span>
            <p className="q"><MathText text={it.question} /></p>
            {it.steps && <ol>{it.steps.map((st, i) => <li key={i}><MathText text={st} /></li>)}</ol>}
            <p className="ans"><b>Answer:</b> <MathText text={it.answer} /></p>
          </div>
        ))}
      </div>
      <div className="box tricks"><h3>Exam Tricks</h3>
        <ul>{s.tricks.map((t, i) => <li key={i}><MathText text={t} /></li>)}</ul>
      </div>
      <div className="box note"><b>✎ Note:</b> <MathText text={s.note} /></div>
      <Footer />
    </section>
  );
}

function Index() {
  const [view, setView] = useState<string>("all"); // "all" | "cover" | unit id | sheet id
  const visible =
    view === "all" ? sheets
    : view === "cover" ? []
    : view.length === 2 ? sheets.filter((s) => s.unit === view)
    : sheets.filter((s) => s.id === view);
  const showCover = view === "all" || view === "cover";
  const btn = (id: string) => `nav-btn ${view === id ? "active" : ""}`;

  return (
    <div className="app">
      <aside className="sidebar no-print">
        <div className="brand">Revision Notebook</div>
        <Button variant="ghost" className="print-btn" onClick={() => window.print()}><Printer aria-hidden="true" />Print notebook</Button>
        <p className="hint">Prints the sheets currently shown.</p>
        <Button variant="ghost" className={btn("all")} onClick={() => setView("all")}>View all (printable)</Button>
        <Button variant="ghost" className={btn("cover")} onClick={() => setView("cover")}>Cover page</Button>
        {data.units.map((u) => (
          <div key={u.id} className="nav-unit">
            <Button variant="ghost" className={`${btn(u.id)} unit-btn ${unitColor[u.id]}`} onClick={() => setView(u.id)}>{u.label}</Button>
            {sheets.filter((s) => s.unit === u.id).map((s) => (
              <Button variant="ghost" key={s.id} className={`${btn(s.id)} sub`} onClick={() => setView(s.id)}>{s.title}</Button>
            ))}
          </div>
        ))}
      </aside>
      <main className="pages">
        {showCover && <Cover />}
        {visible.map((s) => <SheetView key={s.id} s={s} n={sheets.indexOf(s) + 1} />)}
      </main>
    </div>
  );
}
