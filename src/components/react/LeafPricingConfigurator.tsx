"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════
type ModuleDef = {
  id: string;
  name: string;
  tagline: string;
  taglineIt: string;
  price: number;       // annual on-premise license (list price)
  weight: number;      // 1-3 complexity weight for bundle discount formula
  color: string;
};

type SupportTier = {
  id: string;
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  monthly: number;
};

type PackVariant = {
  id: string;
  label: string;
  labelIt: string;
  modules: string[];
  listPrice: number;
  packPrice: number;
};

type PackDef = {
  id: string;
  name: string;
  tagline: string;
  taglineIt: string;
  description: string;
  descriptionIt: string;
  modules?: string[];
  listPrice?: number;
  packPrice?: number;
  savings: number;
  hasVariants?: boolean;
  variants?: PackVariant[];
  idealFor: string;
  idealForIt: string;
  color: string;
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE ICONS  (same SVGs as EcosystemMap.tsx)
// ══════════════════════════════════════════════════════════════════════════════
function ModuleIcon({ id, color, size = 22 }: { id: string; color: string; size?: number }) {
  const s: React.CSSProperties = {
    width: size,
    height: size,
    fill: "none",
    stroke: color,
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (id) {
    case "rotor":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "rootview":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="6" y1="20" x2="6" y2="16" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      );
    case "fastoo":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "lawrf":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case "elytra":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "glide":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      );
    case "verdanthr":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════════════════

const MODULES: ModuleDef[] = [
  { id: "glide",     name: "Glide",     tagline: "Workflow Automation",    taglineIt: "Automazione Workflow",    price: 4800, weight: 3, color: "#06b6d4" },
  { id: "verdanthr", name: "VerdantHR", tagline: "HR Management",          taglineIt: "Gestione HR",             price: 4800, weight: 3, color: "#22c55e" },
  { id: "lawrf",     name: "LawRF",     tagline: "Legal & Compliance",     taglineIt: "Legale & Compliance",     price: 3600, weight: 2, color: "#ef4444" },
  { id: "rootview",  name: "RootView",  tagline: "Accounting & Finance",   taglineIt: "Contabilità & Finanza",   price: 3000, weight: 2, color: "#3b82f6" },
  { id: "fastoo",    name: "FasToo",    tagline: "Cash Flow Intelligence", taglineIt: "Intelligenza Cash Flow",  price: 2400, weight: 2, color: "#10b981" },
  { id: "rotor",     name: "Rotor",     tagline: "Workshop Management",    taglineIt: "Gestione Officina",       price: 2100, weight: 1, color: "#f97316" },
  { id: "elytra",    name: "Elytra",    tagline: "CRM & Clients",          taglineIt: "CRM & Clienti",           price: 1500, weight: 1, color: "#a855f7" },
];

const SUPPORT_TIERS: SupportTier[] = [
  { id: "none",     name: "No Support",   nameIt: "Senza Assistenza",     description: "Self-managed, documentation access only",                    descriptionIt: "Self-managed, solo accesso alla documentazione",          monthly: 0    },
  { id: "base",     name: "Base",          nameIt: "Base",                 description: "Email support, 48h response, business hours",                descriptionIt: "Supporto email, risposta 48h, orario lavorativo",        monthly: 250  },
  { id: "pro",      name: "Professional",  nameIt: "Professionale",        description: "Priority support, 24h response, remote sessions",            descriptionIt: "Supporto prioritario, risposta 24h, sessioni remote",    monthly: 600  },
  { id: "premium",  name: "Premium",       nameIt: "Premium",              description: "Dedicated account manager, 4h response, proactive monitoring", descriptionIt: "Account manager dedicato, risposta 4h, monitoraggio proattivo", monthly: 1200 },
];

const PACKS: PackDef[] = [
  {
    id: "pmi", name: "PMI Pack", color: "#3b82f6",
    tagline: "Administration Essentials", taglineIt: "Essenziali per l'Amministrazione",
    description: "RootView + VerdantHR — the complete foundation for any SME. Accounting, payroll, and HR unified.",
    descriptionIt: "RootView + VerdantHR — la base completa per ogni PMI. Contabilità, paghe e HR unificati.",
    modules: ["rootview", "verdanthr"], listPrice: 7800, packPrice: 5850, savings: 0.25,
    idealFor: "Accountants, SMEs, professional service firms",
    idealForIt: "Studi commercialisti, PMI, imprese di servizi professionali",
  },
  {
    id: "controller", name: "Controller Pack", color: "#ef4444",
    tagline: "Audit & Cash Flow Control", taglineIt: "Revisione & Controllo di Gestione",
    description: "LawRF or FasToo + Glide — orchestrate compliance or cash-flow management with workflow automation.",
    descriptionIt: "LawRF o FasToo + Glide — orchestra compliance o gestione cash-flow con automazione flussi.",
    savings: 0.20, hasVariants: true,
    variants: [
      { id: "lawrf",  label: "LawRF + Glide",  labelIt: "LawRF + Glide",  modules: ["lawrf", "glide"],  listPrice: 8400, packPrice: 6720 },
      { id: "fastoo", label: "FasToo + Glide",  labelIt: "FasToo + Glide", modules: ["fastoo", "glide"], listPrice: 7200, packPrice: 5760 },
    ],
    idealFor: "Fiscal auditors, controlling managers, CFOs",
    idealForIt: "Revisori fiscali, controller, CFO",
  },
  {
    id: "agency", name: "Agency Pack", color: "#a855f7",
    tagline: "CRM & Workflow Automation", taglineIt: "CRM & Automazione Flussi",
    description: "Elytra + Glide — your clients, your workflows, automated. CRM combined with process automation.",
    descriptionIt: "Elytra + Glide — i tuoi clienti, i tuoi flussi, automatizzati. CRM con automazione processi.",
    modules: ["elytra", "glide"], listPrice: 6300, packPrice: 5040, savings: 0.20,
    idealFor: "Agencies, consultants, service providers",
    idealForIt: "Agenzie, consulenti, fornitori di servizi",
  },
  {
    id: "workshop", name: "Workshop Pack", color: "#f97316",
    tagline: "Operations & Client Management", taglineIt: "Operazioni & Gestione Clienti",
    description: "Rotor + Elytra — built for trades and workshops. Manage jobs while keeping clients engaged.",
    descriptionIt: "Rotor + Elytra — pensato per officine e artigiani. Gestisci commesse e riparazioni.",
    modules: ["rotor", "elytra"], listPrice: 3600, packPrice: 2880, savings: 0.20,
    idealFor: "Automotive workshops, trades, repair shops",
    idealForIt: "Officine auto, artigiani, centri di riparazione",
  },
];

const ENTERPRISE_FEATURES = {
  cloud: {
    en: [
      "All 7 Leaf modules included",
      "Managed cloud, 99.9% uptime SLA",
      "Continuous product updates",
      "Security patches, priority delivery",
      "All bug fixes guaranteed",
      "Premium support with dedicated account manager",
    ],
    it: [
      "Tutti i 7 moduli Leaf inclusi",
      "Cloud gestito, SLA uptime 99.9%",
      "Aggiornamenti continui del prodotto",
      "Patch di sicurezza, consegna prioritaria",
      "Tutti i bug fix garantiti",
      "Supporto Premium con account manager dedicato",
    ],
  },
  onpremise: {
    en: [
      "All 7 Leaf modules on-premise",
      "New versions delivered annually",
      "Security patches, remote installation",
      "All bug fixes guaranteed",
      "Premium support with dedicated account manager",
      "Remote service & monitoring guarantee",
    ],
    it: [
      "Tutti i 7 moduli Leaf on-premise",
      "Nuove versioni rilasciate annualmente",
      "Patch di sicurezza installate da remoto",
      "Tutti i bug fix garantiti",
      "Supporto Premium con account manager dedicato",
      "Garanzia di servizio e monitoraggio da remoto",
    ],
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// PRICING FORMULAS
// ══════════════════════════════════════════════════════════════════════════════

function calcBundleDiscount(mods: ModuleDef[]): number {
  if (mods.length <= 1) return 0;
  const totalWeight = mods.reduce((s, m) => s + m.weight, 0);
  if (mods.length === 2) return totalWeight >= 5 ? 0.18 : 0.15;
  return totalWeight >= 7 ? 0.25 : 0.22;
}

const DEPLOYMENT_MULT: Record<string, number> = {
  onpremise: 1.0,
  "cloud-fixed": 1.25,
  "cloud-saas": 1.55,
};

const COMMITMENT_DISCOUNTS: Record<string, { label: string; labelIt: string; discount: number }> = {
  "1yr":  { label: "Annual",    labelIt: "Annuale",   discount: 0 },
  "3yr":  { label: "3-Year",    labelIt: "Triennale", discount: 0.10 },
};

const FIRST_YEAR_PROMO_THRESHOLD = 8000;
const FIRST_YEAR_PROMO_DISCOUNT = 0.10;

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const fmt = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function ModulePill({ id, lang }: { id: string; lang: "en" | "it" }) {
  const m = MODULES.find((m) => m.id === id);
  if (!m) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ backgroundColor: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30` }}
    >
      <ModuleIcon id={m.id} color={m.color} size={13} />
      {m.name}
    </span>
  );
}

function CustomSelect({
  value,
  onChange,
  options,
  lang,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ModuleDef[];
  lang: "en" | "it";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", zIndex: 20 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white transition-all"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${open ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.10)"}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${selected.color}18` }}>
            <ModuleIcon id={selected.id} color={selected.color} size={18} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-white">{selected.name}</div>
            <div className="text-xs text-neutral-500">{lang === "it" ? selected.taglineIt : selected.tagline}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
          <span className="text-xs text-emerald-400 font-semibold">
            {fmt(selected.price)}
            {lang === "it" ? "/anno" : "/yr"}
          </span>
          <svg
            style={{ width: 14, height: 14, color: "#6b7280", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s" }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/10 overflow-hidden"
          style={{ background: "rgba(12,12,22,0.98)", backdropFilter: "blur(20px)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}
        >
          {options.map((m, i) => (
            <button
              key={m.id}
              onClick={() => { onChange(m.id); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm transition-all text-left"
              style={{
                borderBottom: i < options.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: m.id === value ? "rgba(16,185,129,0.08)" : "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = m.id === value ? "rgba(16,185,129,0.10)" : "rgba(255,255,255,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = m.id === value ? "rgba(16,185,129,0.08)" : "transparent")}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                  <ModuleIcon id={m.id} color={m.color} size={15} />
                </div>
                <div>
                  <div className="text-white font-medium">{m.name}</div>
                  <div className="text-xs text-neutral-500">{lang === "it" ? m.taglineIt : m.tagline}</div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex-shrink-0 ml-4">
                {fmt(m.price)}
                {lang === "it" ? "/anno" : "/yr"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
interface LeafPricingConfiguratorProps {
  lang?: "en" | "it";
  contactPath?: string;
}

export function LeafPricingConfigurator({ lang = "en", contactPath = "/contact" }: LeafPricingConfiguratorProps) {
  const it = lang === "it";
  const mo = it ? "/mese" : "/mo";
  const yr = it ? "/anno" : "/yr";

  const [tab, setTab] = useState<"plans" | "packs" | "builder">("plans");

  // Starter
  const [starterModuleId, setStarterModuleId] = useState("rotor");

  // Professional
  const [proModules, setProModules] = useState<Set<string>>(new Set(["rootview", "glide"]));
  const [proDeployment, setProDeployment] = useState<"onpremise" | "cloud-fixed" | "cloud-saas">("cloud-saas");
  const [proSupport, setProSupport] = useState("pro");
  const [proCommitment, setProCommitment] = useState<"1yr" | "3yr">("1yr");

  // Enterprise
  const [entVariant, setEntVariant] = useState<"cloud" | "onpremise">("cloud");

  // Packs
  const [packVariants, setPackVariants] = useState<Record<string, string>>({ controller: "lawrf" });

  // Builder
  const [builderSelected, setBuilderSelected] = useState<Set<string>>(new Set(["rotor"]));
  const [builderSupport, setBuilderSupport] = useState("base");
  const [builderDeployment, setBuilderDeployment] = useState<"onpremise" | "cloud-fixed" | "cloud-saas">("onpremise");
  const [builderCommitment, setBuilderCommitment] = useState<"1yr" | "3yr">("1yr");

  // ── Starter computed ──
  const starterMod = MODULES.find((m) => m.id === starterModuleId)!;
  const starterSupport = SUPPORT_TIERS.find((t) => t.id === "base")!;
  const starterLicenseYr = starterMod.price;
  const starterSupportYr = starterSupport.monthly * 12;
  const starterTotalYr = starterLicenseYr + starterSupportYr;
  const starterTotalMo = Math.round(starterTotalYr / 12);

  // ── Professional computed ──
  const proMods = useMemo(() => MODULES.filter((m) => proModules.has(m.id)), [proModules]);
  const proListTotal = proMods.reduce((s, m) => s + m.price, 0);
  const proBundleDiscount = calcBundleDiscount(proMods);
  const proBundledLicense = Math.round(proListTotal * (1 - proBundleDiscount));
  const proDeployMult = DEPLOYMENT_MULT[proDeployment];
  const proAfterDeploy = Math.round(proBundledLicense * proDeployMult);
  const proSupportTier = SUPPORT_TIERS.find((t) => t.id === proSupport)!;
  const proSupportYr = proSupportTier.monthly * 12;
  const proCommitDiscount = COMMITMENT_DISCOUNTS[proCommitment].discount;
  const proBeforeCommit = proAfterDeploy + proSupportYr;
  const proFinalYr = Math.round(proBeforeCommit * (1 - proCommitDiscount));
  const proFinalMo = Math.round(proFinalYr / 12);

  const toggleProModule = (id: string) => {
    setProModules((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        if (n.size <= 2) return prev;
        n.delete(id);
      } else {
        if (n.size >= 3) return prev;
        n.add(id);
      }
      return n;
    });
  };

  // ── Builder computed ──
  const builderMods = useMemo(() => MODULES.filter((m) => builderSelected.has(m.id)), [builderSelected]);
  const builderListYr = builderMods.reduce((s, m) => s + m.price, 0);
  const builderDeployMult = DEPLOYMENT_MULT[builderDeployment];
  const builderAfterDeploy = Math.round(builderListYr * builderDeployMult);
  const builderSupportTier = SUPPORT_TIERS.find((t) => t.id === builderSupport)!;
  const builderSupportYr = builderSupportTier.monthly * 12;
  const builderCommitDiscount = COMMITMENT_DISCOUNTS[builderCommitment].discount;
  const builderBeforeCommit = builderAfterDeploy + builderSupportYr;
  const builderFinalYr = Math.round(builderBeforeCommit * (1 - builderCommitDiscount));
  const builderFinalMo = Math.round(builderFinalYr / 12);
  const builderHasPromo = builderListYr >= FIRST_YEAR_PROMO_THRESHOLD;
  const builderFirstYearPrice = builderHasPromo ? Math.round(builderFinalYr * (1 - FIRST_YEAR_PROMO_DISCOUNT)) : builderFinalYr;

  const toggleBuilder = (id: string) =>
    setBuilderSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const tabs = [
    { id: "plans" as const, label: it ? "Piani" : "Plans" },
    { id: "packs" as const, label: it ? "Pack Aziendali" : "Business Packs" },
    { id: "builder" as const, label: it ? "Costruisci" : "Build Your Own" },
  ];

  const deployLabels: Record<string, { en: string; it: string }> = {
    onpremise: { en: "On-Premise", it: "On-Premise" },
    "cloud-fixed": { en: "Cloud Fixed", it: "Cloud Fisso" },
    "cloud-saas": { en: "Cloud SaaS", it: "Cloud SaaS" },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl border border-white/5 w-fit mx-auto mb-10" style={{ background: "rgba(10,10,18,0.7)" }}>
        {tabs.map((t_) => (
          <button
            key={t_.id}
            onClick={() => setTab(t_.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t_.id ? "bg-emerald-500 text-black shadow-sm" : "text-neutral-400 hover:text-white"
            }`}
          >
            {t_.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PLANS TAB
         ══════════════════════════════════════════════════════════════════ */}
      {tab === "plans" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── STARTER ── */}
          <div className="rounded-2xl p-7 border border-white/5 flex flex-col" style={{ background: "rgba(18,18,28,0.6)" }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-black text-white">Starter</h3>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium text-neutral-400" style={{ background: "rgba(255,255,255,0.06)" }}>
                {it ? "Punto di Partenza" : "Entry Point"}
              </span>
            </div>
            <p className="text-neutral-400 text-sm mb-5">
              {it
                ? "1 modulo a tua scelta, on-premise versione fissa, con supporto Base incluso."
                : "1 module of your choice, on-premise fixed version, with Base support included."}
            </p>

            <div className="mb-5">
              <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider font-medium">
                {it ? "Scegli il modulo" : "Choose module"}
              </label>
              <CustomSelect value={starterModuleId} onChange={setStarterModuleId} options={MODULES} lang={lang} />
            </div>

            <div className="rounded-xl p-5 space-y-3 flex-1" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">{it ? "Licenza annua" : "Annual license"}</span>
                <span className="text-white font-semibold">{fmt(starterLicenseYr)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">{it ? "Supporto Base" : "Base Support"}</span>
                <span className="text-white font-semibold">{fmt(starterSupport.monthly)}{mo}</span>
              </div>
              <div className="border-t border-white/5 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-neutral-400">{it ? "Totale stimato" : "Est. total"}</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{fmt(starterTotalMo)}</span>
                    <span className="text-neutral-500 text-xs">{mo}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>{it ? "Totale anno 1" : "Year 1 total"}</span>
                  <span>{fmt(starterTotalYr)}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-600 mt-4 mb-5 leading-relaxed">
              {it
                ? "On-premise, versione fissa. Non include aggiornamenti del prodotto."
                : "On-premise, fixed version. Product updates not included."}
            </p>
            <a
              href={contactPath}
              className="block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all"
              style={{ border: "1px solid rgba(16,185,129,0.35)", color: "#34d399" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.10)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {it ? "Richiedi Preventivo" : "Request a Quote"}
            </a>
          </div>

          {/* ── PROFESSIONAL ── */}
          <div
            className="relative rounded-2xl p-7 border flex flex-col overflow-hidden"
            style={{ background: "rgba(16,18,30,0.8)", borderColor: "rgba(16,185,129,0.28)", boxShadow: "0 0 60px rgba(16,185,129,0.06)" }}
          >
            <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-xs font-black text-black" style={{ background: "#10b981" }}>
              {it ? "Consigliato" : "Recommended"}
            </div>
            <h3 className="text-xl font-black text-white mb-1">Professional</h3>
            <p className="text-neutral-400 text-sm mb-4">
              {it
                ? "Scegli 2 o 3 moduli, il deployment e il livello di assistenza. Prezzo calcolato su misura."
                : "Pick 2 or 3 modules, deployment and support level. Price tailored to your needs."}
            </p>

            {/* Module selection */}
            <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider font-medium">
              {it ? `Moduli (${proModules.size}/3)` : `Modules (${proModules.size}/3)`}
            </label>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {MODULES.map((m) => {
                const sel = proModules.has(m.id);
                const disabled = !sel && proModules.size >= 3;
                return (
                  <button
                    key={m.id}
                    onClick={() => !disabled && toggleProModule(m.id)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left"
                    style={{
                      background: sel ? `${m.color}12` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${sel ? `${m.color}40` : "rgba(255,255,255,0.06)"}`,
                      opacity: disabled ? 0.35 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                      color: sel ? m.color : "#9ca3af",
                    }}
                  >
                    <ModuleIcon id={m.id} color={sel ? m.color : "#6b7280"} size={14} />
                    {m.name}
                    {sel && (
                      <svg className="ml-auto flex-shrink-0" style={{ width: 12, height: 12, color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Deployment */}
            <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider font-medium">
              Deployment
            </label>
            <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {(["onpremise", "cloud-fixed", "cloud-saas"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setProDeployment(v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    proDeployment === v
                      ? v === "cloud-saas"
                        ? "bg-emerald-500 text-black"
                        : "text-white"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  style={proDeployment === v && v !== "cloud-saas" ? { background: "rgba(255,255,255,0.10)" } : {}}
                >
                  {it ? deployLabels[v].it : deployLabels[v].en}
                </button>
              ))}
            </div>

            {/* Support tier */}
            <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider font-medium">
              {it ? "Assistenza" : "Support"}
            </label>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {SUPPORT_TIERS.filter((t) => t.id !== "none").map((t) => (
                <button
                  key={t.id}
                  onClick={() => setProSupport(t.id)}
                  className="px-3 py-2 rounded-lg text-left transition-all"
                  style={{
                    background: proSupport === t.id ? "rgba(16,185,129,0.10)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${proSupport === t.id ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <div className="text-xs font-semibold" style={{ color: proSupport === t.id ? "#34d399" : "#d4d4d4" }}>
                    {it ? t.nameIt : t.name}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">{fmt(t.monthly)}{mo}</div>
                </button>
              ))}
            </div>

            {/* Commitment */}
            <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {(["1yr", "3yr"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setProCommitment(c)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    proCommitment === c ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  style={proCommitment === c ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" } : {}}
                >
                  {it ? COMMITMENT_DISCOUNTS[c].labelIt : COMMITMENT_DISCOUNTS[c].label}
                  {COMMITMENT_DISCOUNTS[c].discount > 0 && (
                    <span className="ml-1 text-emerald-400">–{Math.round(COMMITMENT_DISCOUNTS[c].discount * 100)}%</span>
                  )}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="rounded-xl p-4 space-y-2 mt-auto" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {proMods.length >= 2 ? (
                <>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>{it ? "Prezzo di listino" : "List price"}</span>
                    <span className="line-through">{fmt(proListTotal)}{yr}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400">
                      {it ? `Sconto bundle (–${Math.round(proBundleDiscount * 100)}%)` : `Bundle discount (–${Math.round(proBundleDiscount * 100)}%)`}
                    </span>
                    <span className="text-emerald-400">–{fmt(proListTotal - proBundledLicense)}</span>
                  </div>
                  {proDeployment !== "onpremise" && (
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>{it ? deployLabels[proDeployment].it : deployLabels[proDeployment].en}</span>
                      <span>×{proDeployMult.toFixed(2)}</span>
                    </div>
                  )}
                  {proCommitDiscount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-400">
                      <span>{it ? "Sconto triennale" : "3-year discount"}</span>
                      <span>–{Math.round(proCommitDiscount * 100)}%</span>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-2 mt-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-neutral-400">{it ? "Totale" : "Total"}</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-400">{fmt(proFinalMo)}</span>
                        <span className="text-neutral-500 text-xs">{mo}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 mt-1">
                      <span>{it ? "Totale annuo" : "Yearly total"}</span>
                      <span>{fmt(proFinalYr)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-neutral-500 text-center py-2">
                  {it ? "Seleziona almeno 2 moduli" : "Select at least 2 modules"}
                </p>
              )}
            </div>

            <a
              href={contactPath}
              className="mt-5 block text-center py-3 px-6 rounded-xl font-bold text-sm transition-colors text-black"
              style={{ background: "#10b981" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#34d399")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#10b981")}
            >
              {it ? "Contattaci" : "Contact Us"}
            </a>
          </div>

          {/* ── ENTERPRISE ── */}
          <div
            className="relative rounded-2xl p-7 border flex flex-col overflow-hidden"
            style={{ background: "rgba(10,8,20,0.9)", borderColor: "rgba(168,85,247,0.25)", boxShadow: "0 0 60px rgba(168,85,247,0.05)" }}
          >
            <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-xs font-black text-white" style={{ background: "rgba(168,85,247,0.8)" }}>
              {it ? "Chiavi in Mano" : "All-In-One"}
            </div>
            <h3 className="text-xl font-black text-white mb-1">Enterprise</h3>
            <p className="text-neutral-400 text-sm mb-5">
              {it
                ? "Tutti i 7 moduli, supporto Premium dedicato, aggiornamenti e sicurezza garantiti."
                : "All 7 modules, dedicated Premium support, updates and security guaranteed."}
            </p>

            <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {(
                [
                  ["cloud", "Cloud All-In"],
                  ["onpremise", it ? "On-Premise + Remoto" : "On-Premise + Remote"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setEntVariant(v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    entVariant === v ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  style={entVariant === v ? { background: "rgba(168,85,247,0.22)", border: "1px solid rgba(168,85,247,0.3)" } : {}}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="rounded-xl p-5 flex-1 space-y-4" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="text-3xl font-black" style={{ color: "#c084fc" }}>
                    {entVariant === "cloud" ? "€3.900" : "€3.100"}
                  </span>
                  <span className="text-neutral-400 text-sm">{it ? "/mese (indicativo)" : "/month (indicative)"}</span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">
                  {it ? "Prezzo personalizzato in base a dimensioni e utenti." : "Custom pricing based on company size and users."}
                </p>
              </div>
              <ul className="space-y-2">
                {(entVariant === "cloud" ? ENTERPRISE_FEATURES.cloud : ENTERPRISE_FEATURES.onpremise)[lang === "it" ? "it" : "en"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <svg style={{ width: 14, height: 14, color: "#c084fc", flexShrink: 0, marginTop: 1 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/5 pt-3">
                <p className="text-xs text-neutral-500">
                  {it
                    ? "Include supporto Premium (account manager dedicato, risposta 4h, monitoraggio proattivo)."
                    : "Includes Premium support (dedicated account manager, 4h response, proactive monitoring)."}
                </p>
              </div>
            </div>

            <a
              href={contactPath}
              className="mt-5 block text-center py-3 px-6 rounded-xl font-bold text-sm transition-all text-white"
              style={{ border: "1px solid rgba(168,85,247,0.5)", color: "#c084fc" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {it ? "Richiedi Preventivo Enterprise" : "Get Enterprise Quote"}
            </a>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PACKS TAB
         ══════════════════════════════════════════════════════════════════ */}
      {tab === "packs" && (
        <div>
          <div className="text-center mb-8">
            <p className="text-neutral-400 max-w-2xl mx-auto text-sm">
              {it
                ? "Suite preconfigurate per tipologia di impresa. Prezzi scontati rispetto alle singole licenze, on-premise versione fissa."
                : "Pre-configured suites for specific business types. Discounted vs individual licenses, on-premise fixed version."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PACKS.map((pack) => {
              const variant = pack.hasVariants ? packVariants[pack.id] ?? pack.variants![0].id : null;
              const activeVariant = pack.hasVariants ? pack.variants!.find((v) => v.id === variant)! : null;
              const packPrice = activeVariant ? activeVariant.packPrice : pack.packPrice!;
              const listPrice = activeVariant ? activeVariant.listPrice : pack.listPrice!;
              const moduleIds = activeVariant ? activeVariant.modules : pack.modules!;
              const packMo = Math.round(packPrice / 12);

              return (
                <div key={pack.id} className="rounded-2xl p-6 border flex flex-col" style={{ background: `${pack.color}05`, borderColor: `${pack.color}22` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-white">{pack.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${pack.color}20`, color: pack.color }}>
                          –{Math.round(pack.savings * 100)}%
                        </span>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: pack.color }}>
                        {it ? pack.taglineIt : pack.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-400 leading-relaxed mb-4">{it ? pack.descriptionIt : pack.description}</p>

                  {pack.hasVariants && (
                    <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      {pack.variants!.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setPackVariants((prev) => ({ ...prev, [pack.id]: v.id }))}
                          className="flex-1 py-1.5 rounded-md text-xs font-semibold transition-all"
                          style={{
                            background: variant === v.id ? `${pack.color}25` : "transparent",
                            color: variant === v.id ? pack.color : "#6b7280",
                            border: variant === v.id ? `1px solid ${pack.color}40` : "1px solid transparent",
                          }}
                        >
                          {it ? v.labelIt : v.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {moduleIds.map((id) => (
                      <ModulePill key={id} id={id} lang={lang} />
                    ))}
                  </div>

                  <div className="rounded-xl p-4 mt-auto" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="text-2xl font-black" style={{ color: pack.color }}>
                          {fmt(packMo)}
                        </span>
                        <span className="text-neutral-500 text-xs">{mo}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-neutral-600 line-through">{fmt(listPrice)}{yr}</div>
                        <div className="text-xs font-semibold" style={{ color: pack.color }}>
                          {fmt(packPrice)}{yr}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      {it ? "On-premise, versione fissa. Assistenza aggiuntiva disponibile." : "On-premise, fixed version. Support add-ons available."}
                    </p>
                  </div>

                  <div className="mt-3 text-xs text-neutral-600">
                    <span className="font-medium" style={{ color: `${pack.color}80` }}>
                      {it ? "Ideale per: " : "Ideal for: "}
                    </span>
                    {it ? pack.idealForIt : pack.idealFor}
                  </div>

                  <a
                    href={contactPath}
                    className="mt-4 block text-center py-2.5 px-5 rounded-xl font-semibold text-sm transition-all"
                    style={{ border: `1px solid ${pack.color}35`, color: pack.color }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = `${pack.color}12`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {it ? "Richiedi Preventivo" : "Request a Quote"}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          BUILDER TAB
         ══════════════════════════════════════════════════════════════════ */}
      {tab === "builder" && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{it ? "Costruisci la Tua Suite" : "Build Your Suite"}</h3>
              <p className="text-neutral-400 text-sm">
                {it
                  ? "Scegli moduli, deployment e assistenza. Leaf è completamente modulare: parti con quello che ti serve, aggiungi il resto quando cresci."
                  : "Choose modules, deployment, and support. Leaf is fully modular: start with what you need, scale when you grow."}
              </p>
            </div>

            {/* Module grid */}
            <div>
              <label className="block text-xs text-neutral-500 mb-3 uppercase tracking-wider font-medium">
                {it ? "Moduli" : "Modules"}
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {MODULES.map((m) => {
                  const sel = builderSelected.has(m.id);
                  return (
                    <label
                      key={m.id}
                      className="relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200"
                      style={{
                        borderColor: sel ? `${m.color}50` : "rgba(255,255,255,0.06)",
                        background: sel ? `${m.color}08` : "rgba(18,18,28,0.5)",
                      }}
                    >
                      <input type="checkbox" className="sr-only" checked={sel} onChange={() => toggleBuilder(m.id)} />
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${m.color}18`, border: `1px solid ${m.color}35` }}
                      >
                        <ModuleIcon id={m.id} color={m.color} size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="text-white font-semibold text-sm">{m.name}</span>
                          <span className="text-xs text-neutral-400">{fmt(m.price)}{yr}</span>
                        </div>
                        <span className="text-xs" style={{ color: `${m.color}cc` }}>
                          {it ? m.taglineIt : m.tagline}
                        </span>
                      </div>
                      {sel && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg style={{ width: 10, height: 10, color: "black" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Deployment */}
            <div>
              <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider font-medium">
                Deployment
              </label>
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
                {(["onpremise", "cloud-fixed", "cloud-saas"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setBuilderDeployment(v)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      builderDeployment === v
                        ? v === "cloud-saas"
                          ? "bg-emerald-500 text-black"
                          : "text-white"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                    style={builderDeployment === v && v !== "cloud-saas" ? { background: "rgba(255,255,255,0.10)" } : {}}
                  >
                    <div>{it ? deployLabels[v].it : deployLabels[v].en}</div>
                    {v !== "onpremise" && (
                      <div className="text-[10px] mt-0.5 opacity-60">
                        ×{DEPLOYMENT_MULT[v].toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Support tiers */}
            <div>
              <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider font-medium">
                {it ? "Livello di Assistenza" : "Support Level"}
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                {SUPPORT_TIERS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBuilderSupport(t.id)}
                    className="px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: builderSupport === t.id ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${builderSupport === t.id ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold" style={{ color: builderSupport === t.id ? "#34d399" : "#d4d4d4" }}>
                        {it ? t.nameIt : t.name}
                      </span>
                      <span className="text-xs font-bold" style={{ color: builderSupport === t.id ? "#34d399" : "#6b7280" }}>
                        {t.monthly === 0 ? (it ? "Gratis" : "Free") : `${fmt(t.monthly)}${mo}`}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">{it ? t.descriptionIt : t.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Commitment */}
            <div>
              <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider font-medium">
                {it ? "Impegno Contrattuale" : "Commitment"}
              </label>
              <div className="flex gap-2">
                {(["1yr", "3yr"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setBuilderCommitment(c)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: builderCommitment === c ? "rgba(16,185,129,0.10)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${builderCommitment === c ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`,
                      color: builderCommitment === c ? "#34d399" : "#9ca3af",
                    }}
                  >
                    {it ? COMMITMENT_DISCOUNTS[c].labelIt : COMMITMENT_DISCOUNTS[c].label}
                    {COMMITMENT_DISCOUNTS[c].discount > 0 && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                        –{Math.round(COMMITMENT_DISCOUNTS[c].discount * 100)}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(12,12,22,0.8)", position: "sticky", top: "96px" }}>
              <h4 className="text-white font-bold mb-4">{it ? "Il tuo preventivo" : "Your estimate"}</h4>
              {builderSelected.size === 0 ? (
                <p className="text-neutral-500 text-sm">{it ? "Seleziona almeno un modulo" : "Select at least one module"}</p>
              ) : (
                <>
                  <div className="space-y-2 mb-3">
                    {builderMods.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <ModuleIcon id={m.id} color={m.color} size={14} />
                          <span className="text-neutral-400">{m.name}</span>
                        </div>
                        <span className="text-white">{fmt(m.price)}</span>
                      </div>
                    ))}
                  </div>

                  {builderDeployment !== "onpremise" && (
                    <div className="flex justify-between text-sm text-neutral-500 mb-1">
                      <span>{it ? deployLabels[builderDeployment].it : deployLabels[builderDeployment].en}</span>
                      <span>×{builderDeployMult.toFixed(2)}</span>
                    </div>
                  )}

                  {builderSupportTier.monthly > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-400">
                        {it ? `Assistenza ${builderSupportTier.nameIt}` : `${builderSupportTier.name} Support`}
                      </span>
                      <span className="text-white">{fmt(builderSupportTier.monthly)}{mo}</span>
                    </div>
                  )}

                  {builderCommitDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-400 mb-1">
                      <span>{it ? "Sconto triennale" : "3-year discount"}</span>
                      <span>–{Math.round(builderCommitDiscount * 100)}%</span>
                    </div>
                  )}

                  <div className="border-t border-white/5 pt-4 mt-3 space-y-2">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span className="text-sm text-neutral-400">{it ? "Totale annuo" : "Yearly total"}</span>
                      <span className="text-2xl font-black text-emerald-400">{fmt(builderFinalYr)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }} className="text-sm">
                      <span className="text-neutral-500">{it ? "Equivalente mensile" : "Monthly equiv."}</span>
                      <span className="text-neutral-300 font-semibold">{fmt(builderFinalMo)}{mo}</span>
                    </div>

                    {builderHasPromo && (
                      <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <svg style={{ width: 14, height: 14, color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                          <span className="text-xs font-bold text-emerald-400">
                            {it ? `Primo anno: –${Math.round(FIRST_YEAR_PROMO_DISCOUNT * 100)}%` : `First year: –${Math.round(FIRST_YEAR_PROMO_DISCOUNT * 100)}%`}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-400">{it ? "Anno 1" : "Year 1"}</span>
                          <span className="text-emerald-400 font-bold">{fmt(builderFirstYearPrice)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-500 mt-0.5">
                          <span>{it ? "Dal 2° anno" : "From year 2"}</span>
                          <span>{fmt(builderFinalYr)}</span>
                        </div>
                      </div>
                    )}

                    {builderCommitment === "3yr" && (
                      <div className="mt-2 p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="flex justify-between text-xs text-neutral-400 mb-1">
                          <span>{it ? "Costo 3 anni" : "3-year cost"}</span>
                          <span className="text-white font-semibold">
                            {fmt(builderHasPromo ? builderFirstYearPrice + builderFinalYr * 2 : builderFinalYr * 3)}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-600">
                          {it ? "Risparmi reali grazie allo sconto triennale." : "Real savings from multi-year commitment."}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-xs text-neutral-500">
                      {it
                        ? "Leaf è modulare e scalabile: puoi aggiungere moduli in qualsiasi momento senza cambiare piattaforma."
                        : "Leaf is modular and scalable: add modules at any time without changing platforms."}
                    </p>
                  </div>
                </>
              )}

              <a
                href={contactPath}
                className="mt-6 block text-center py-3 px-6 rounded-xl font-bold text-sm text-black transition-colors"
                style={{ background: "#10b981" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#34d399")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#10b981")}
              >
                {it ? "Richiedi Preventivo Personalizzato" : "Request a Custom Quote"}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeafPricingConfigurator;
