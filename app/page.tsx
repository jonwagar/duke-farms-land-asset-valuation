"use client";

import { useEffect, useMemo, useState } from "react";
import type { Opportunity, QualitativeLevel, RiskLevel, Scenario } from "@/content/opportunities";
import { criteria, opportunities as seededOpportunities, principles, site, sourceNotes } from "@/content/opportunities";

type Lens = "Mission first" | "Balanced" | "Revenue stress test" | "Risk screen";

const scenarioLabels: Record<Scenario, string> = {
  low: "Conservative",
  base: "Base",
  high: "Upside",
};

const missionOrder: Record<QualitativeLevel, number> = {
  "Very strong": 5,
  Strong: 4,
  Moderate: 3,
  Limited: 2,
  Sensitive: 1,
};

const riskOrder: Record<RiskLevel, number> = {
  Low: 1,
  Managed: 2,
  Material: 3,
  High: 4,
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Math.round(value / 1000) * 1000);
}

function annualNet(item: Opportunity, scenario: Scenario) {
  return item.annualRevenue[scenario] - item.operatingCost[scenario];
}

function npv(item: Opportunity, scenario: Scenario, horizon: number, discount: number) {
  const rate = discount / 100;
  const factor = rate === 0 ? horizon : (1 - Math.pow(1 + rate, -horizon)) / rate;
  return annualNet(item, scenario) * factor - item.implementationCost[scenario];
}

function payback(item: Opportunity, scenario: Scenario) {
  const net = annualNet(item, scenario);
  if (net <= 0) return "Not recovered";
  const years = item.implementationCost[scenario] / net;
  if (years < 1) return "<1 year";
  if (years > 30) return "30+ years";
  return `${years.toFixed(1)} years`;
}

function posture(item: Opportunity, scenario: Scenario, lens: Lens) {
  const mission = missionOrder[item.missionFit];
  const ecology = missionOrder[item.ecologicalValue];
  const benefit = missionOrder[item.publicBenefit];
  const risk = riskOrder[item.risk];

  if (lens === "Risk screen" && risk >= 4) return "Hold pending restrictions";
  if (lens === "Revenue stress test" && annualNet(item, scenario) <= 0) return "Watch until economics improve";
  if (mission >= 5 && ecology >= 4 && risk <= 2) return "Advance to diligence";
  if (mission >= 4 && benefit >= 4 && risk <= 3) return "Design a partnership";
  if (risk >= 3) return "Resolve constraints first";
  return "Watch and refine";
}

function tone(value: QualitativeLevel | RiskLevel) {
  if (value === "Very strong" || value === "Strong" || value === "Low" || value === "Managed") return "good";
  if (value === "Moderate" || value === "Material") return "caution";
  return "sensitive";
}

function sortPortfolio(items: Opportunity[], scenario: Scenario, lens: Lens, horizon: number, discount: number) {
  return [...items].sort((a, b) => {
    const missionA = missionOrder[a.missionFit] + missionOrder[a.ecologicalValue] + missionOrder[a.publicBenefit];
    const missionB = missionOrder[b.missionFit] + missionOrder[b.ecologicalValue] + missionOrder[b.publicBenefit];
    const riskA = riskOrder[a.risk];
    const riskB = riskOrder[b.risk];
    const npvA = npv(a, scenario, horizon, discount);
    const npvB = npv(b, scenario, horizon, discount);

    if (lens === "Revenue stress test") return npvB - npvA || missionB - missionA || riskA - riskB;
    if (lens === "Risk screen") return riskA - riskB || missionB - missionA || npvB - npvA;
    if (lens === "Balanced") return missionB - missionA || npvB - npvA || riskA - riskB;
    return missionB - missionA || riskA - riskB || npvB - npvA;
  });
}

export default function Home() {
  const [items, setItems] = useState<Opportunity[]>(seededOpportunities);
  const [selectedId, setSelectedId] = useState(seededOpportunities[0].id);
  const [category, setCategory] = useState("All categories");
  const [scenario, setScenario] = useState<Scenario>("base");
  const [lens, setLens] = useState<Lens>("Mission first");
  const [horizon, setHorizon] = useState(10);
  const [discount, setDiscount] = useState(5);
  const [sourceStatus, setSourceStatus] = useState("Seeded public-source assumptions");
  const [intake, setIntake] = useState({
    implementationCost: 75000,
    missionFit: "Strong" as QualitativeLevel,
    name: "New opportunity",
    operatingCost: 15000,
    publicBenefit: "Strong" as QualitativeLevel,
    revenue: 60000,
    risk: "Managed" as RiskLevel,
    type: "Solar lease or energy offtake",
  });

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      try {
        const response = await fetch("/api/land-assets/airtable", { cache: "no-store" });
        const payload = (await response.json()) as { connected?: boolean; message?: string; opportunities?: Opportunity[] };
        if (cancelled) return;
        if (response.ok && payload.connected && payload.opportunities?.length) {
          setItems(payload.opportunities);
          setSelectedId(payload.opportunities[0].id);
          setSourceStatus(`${payload.opportunities.length} records synced from Airtable`);
          return;
        }
        setSourceStatus(payload.message ?? "Seeded public-source assumptions");
      } catch {
        if (!cancelled) setSourceStatus("Seeded public-source assumptions");
      }
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => ["All categories", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const visible = useMemo(() => {
    const scoped = category === "All categories" ? items : items.filter((item) => item.category === category);
    return sortPortfolio(scoped, scenario, lens, horizon, discount);
  }, [category, discount, horizon, items, lens, scenario]);

  const selected = items.find((item) => item.id === selectedId) ?? visible[0] ?? items[0];
  const intakeNet = intake.revenue - intake.operatingCost;
  const intakePosture =
    riskOrder[intake.risk] >= 4
      ? "Hold pending restrictions"
      : missionOrder[intake.missionFit] >= 4 && missionOrder[intake.publicBenefit] >= 4 && riskOrder[intake.risk] <= 2
        ? "Advance to diligence"
        : missionOrder[intake.missionFit] >= 4
          ? "Design a partnership"
          : "Watch and refine";

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Duke Farms land asset valuation home">
          <img src="/brand/logos/ddf-lockup-1line-blue-black.svg" alt="Doris Duke Foundation" />
          <span>
            <strong>Duke Farms</strong>
            <em>DDF Center | Nature</em>
          </span>
        </a>
        <nav aria-label="Page sections">
          <a href="#portfolio">Portfolio</a>
          <a href="#opportunity">Opportunity</a>
          <a href="#intake">Intake</a>
          <a href="#sources">Sources</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-visual" aria-hidden="true">
            <span className="water" />
            <span className="solar" />
            <span className="path" />
          </div>
          <div className="shade" />
          <div className="hero-copy">
            <p className="eyebrow">{site.eyebrow}</p>
            <h1>{site.title}</h1>
            <p>{site.description}</p>
            <div className="hero-actions">
              <a href="#portfolio">Review opportunities</a>
              <a href="#intake">Draft intake</a>
            </div>
            <ul className="signals">
              <li><strong>Mission first</strong><span>Qualitative board posture before numeric ranking</span></li>
              <li><strong>10 asset types</strong><span>Solar, credits, easements, agriculture, events, carbon, water</span></li>
              <li><strong>Simple model</strong><span>Revenue, NPV, cost, payback, risk, readiness</span></li>
              <li><strong>{site.airtableBaseId}</strong><span>Airtable-ready source base</span></li>
            </ul>
          </div>
        </section>

        <section className="band dashboard" id="portfolio">
          <div className="inner">
            <div className="section-head with-status">
              <div>
                <p className="eyebrow">Portfolio view</p>
                <h2>Mission-first opportunity screen</h2>
              </div>
              <aside className="status"><span>Data source</span><strong>{sourceStatus}</strong></aside>
            </div>

            <div className="controls">
              <label><span>Asset group</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <fieldset>
                <legend>Scenario</legend>
                <div className="segments">
                  {Object.entries(scenarioLabels).map(([value, label]) => (
                    <button className={scenario === value ? "active" : ""} key={value} type="button" onClick={() => setScenario(value as Scenario)}>{label}</button>
                  ))}
                </div>
              </fieldset>
              <label><span>Strategic lens</span><select value={lens} onChange={(event) => setLens(event.target.value as Lens)}><option>Mission first</option><option>Balanced</option><option>Revenue stress test</option><option>Risk screen</option></select></label>
              <label><span>Horizon</span><input type="range" min="5" max="20" value={horizon} onChange={(event) => setHorizon(Number(event.target.value))} /><b>{horizon} years</b></label>
              <label><span>Discount</span><input type="range" min="0" max="10" step="0.5" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /><b>{discount}%</b></label>
            </div>

            <div className="portfolio-table">
              {visible.map((item) => {
                const currentNpv = npv(item, scenario, horizon, discount);
                return (
                  <button className={selected.id === item.id ? "row selected" : "row"} key={item.id} type="button" onClick={() => setSelectedId(item.id)}>
                    <span><strong>{item.name}</strong><em>{item.type}</em></span>
                    <span className={`pill ${tone(item.missionFit)}`}>{item.missionFit}</span>
                    <span>{money(item.annualRevenue[scenario])}</span>
                    <span className={currentNpv >= 0 ? "positive-money" : "negative-money"}>{money(currentNpv)}</span>
                    <span className={`pill ${tone(item.risk)}`}>{item.risk}</span>
                    <span>{posture(item, scenario, lens)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="band tinted" id="opportunity">
          <div className="inner opportunity-grid">
            <article className="panel opportunity-main">
              <p className="eyebrow">{selected.category}</p>
              <h2>{selected.name}</h2>
              <p>{selected.summary}</p>
              <dl className="metrics">
                <div><dt>Annual revenue</dt><dd>{money(selected.annualRevenue[scenario])}</dd></div>
                <div><dt>Implementation cost</dt><dd>{money(selected.implementationCost[scenario])}</dd></div>
                <div><dt>Net present value</dt><dd>{money(npv(selected, scenario, horizon, discount))}</dd></div>
                <div><dt>Payback</dt><dd>{payback(selected, scenario)}</dd></div>
              </dl>
              <div className="posture"><span>Board posture</span><strong>{posture(selected, scenario, lens)}</strong><p>{selected.nextStep}</p></div>
            </article>
            <aside className="panel">
              <dl className="qual">
                <div><dt>Mission</dt><dd className={`pill ${tone(selected.missionFit)}`}>{selected.missionFit}</dd></div>
                <div><dt>Ecology</dt><dd className={`pill ${tone(selected.ecologicalValue)}`}>{selected.ecologicalValue}</dd></div>
                <div><dt>Public benefit</dt><dd className={`pill ${tone(selected.publicBenefit)}`}>{selected.publicBenefit}</dd></div>
                <div><dt>Revenue confidence</dt><dd className={`pill ${tone(selected.revenueConfidence)}`}>{selected.revenueConfidence}</dd></div>
                <div><dt>Risk</dt><dd className={`pill ${tone(selected.risk)}`}>{selected.risk}</dd></div>
                <div><dt>Readiness</dt><dd>{selected.readiness}</dd></div>
              </dl>
            </aside>
            <div className="evidence">
              <article className="panel"><h3>Restrictions and guardrails</h3><ul>{selected.constraints.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className="panel"><h3>Diligence questions</h3><ul>{selected.diligence.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className="panel"><h3>Revenue model</h3><p>{selected.revenueModel}</p><p className="muted">{selected.location}</p></article>
            </div>
          </div>
        </section>

        <section className="band">
          <div className="inner rubric">
            <div className="section-head"><p className="eyebrow">Qualitative rubric</p><h2>Board language for mission-first valuation</h2></div>
            <div className="cards">{principles.map((item) => <article className="panel rule" key={item}>{item}</article>)}</div>
            <div className="cards criteria">{criteria.map((item) => <article className="panel" key={item}><h3>{item}</h3><p>Use qualitative judgment and evidence notes rather than false numeric precision.</p></article>)}</div>
          </div>
        </section>

        <section className="band tinted" id="intake">
          <div className="inner intake-grid">
            <div className="section-head"><p className="eyebrow">Draft intake</p><h2>First-pass review for a new opportunity</h2></div>
            <form className="panel intake-form">
              <label><span>Name</span><input value={intake.name} onChange={(event) => setIntake({ ...intake, name: event.target.value })} /></label>
              <label><span>Type</span><input value={intake.type} onChange={(event) => setIntake({ ...intake, type: event.target.value })} /></label>
              <label><span>Annual revenue</span><input min="0" step="5000" type="number" value={intake.revenue} onChange={(event) => setIntake({ ...intake, revenue: Number(event.target.value) })} /></label>
              <label><span>Operating cost</span><input min="0" step="5000" type="number" value={intake.operatingCost} onChange={(event) => setIntake({ ...intake, operatingCost: Number(event.target.value) })} /></label>
              <label><span>Implementation cost</span><input min="0" step="5000" type="number" value={intake.implementationCost} onChange={(event) => setIntake({ ...intake, implementationCost: Number(event.target.value) })} /></label>
              <label><span>Mission alignment</span><select value={intake.missionFit} onChange={(event) => setIntake({ ...intake, missionFit: event.target.value as QualitativeLevel })}>{Object.keys(missionOrder).map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span>Public benefit</span><select value={intake.publicBenefit} onChange={(event) => setIntake({ ...intake, publicBenefit: event.target.value as QualitativeLevel })}>{Object.keys(missionOrder).map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span>Risk</span><select value={intake.risk} onChange={(event) => setIntake({ ...intake, risk: event.target.value as RiskLevel })}>{Object.keys(riskOrder).map((item) => <option key={item}>{item}</option>)}</select></label>
            </form>
            <aside className="panel intake-result"><span>{intake.name}</span><strong>{intakePosture}</strong><dl><div><dt>Annual net</dt><dd>{money(intakeNet)}</dd></div><div><dt>Payback</dt><dd>{intakeNet > 0 ? `${(intake.implementationCost / intakeNet).toFixed(1)} years` : "Not recovered"}</dd></div><div><dt>Mission</dt><dd className={`pill ${tone(intake.missionFit)}`}>{intake.missionFit}</dd></div><div><dt>Risk</dt><dd className={`pill ${tone(intake.risk)}`}>{intake.risk}</dd></div></dl></aside>
          </div>
        </section>

        <section className="band" id="sources">
          <div className="inner">
            <div className="section-head"><p className="eyebrow">Source notes</p><h2>Current evidence base</h2></div>
            <div className="cards">{sourceNotes.map((item) => <article className="panel" key={item}>{item}</article>)}</div>
          </div>
        </section>
      </main>
    </>
  );
}
