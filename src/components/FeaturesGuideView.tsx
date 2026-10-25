import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Pill,
  FileText,
  Sparkles,
  BarChart3,
  Lock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Cpu,
  Fingerprint,
  BookOpen,
  Award,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Zap,
  ShieldCheck,
  Truck,
  Heart,
  Clock,
  UserCheck,
  FileDown
} from 'lucide-react';
import { ActiveAppView } from './Header';

interface FeaturesGuideViewProps {
  onNavigateToView: (view: ActiveAppView) => void;
  onOpenSbar: () => void;
  onOpenNewTransition: () => void;
}

export const FeaturesGuideView: React.FC<FeaturesGuideViewProps> = ({
  onNavigateToView,
  onOpenSbar,
  onOpenNewTransition,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = [
    { id: 'all', label: 'All Platform Features' },
    { id: 'orchestration', label: 'Transition Orchestration' },
    { id: 'readiness', label: 'Readiness & Invariants' },
    { id: 'science', label: 'Bioscience & Pharmacology' },
    { id: 'handoff', label: 'SBAR & Print/PDF' },
    { id: 'security', label: 'RBAC & Audit Ledger' },
    { id: 'simulation', label: 'Simulations & Analytics' },
  ];

  const FEATURES = [
    {
      id: 'conduit',
      category: 'orchestration',
      badge: 'Core Workflow',
      title: '5-Stage Stepped Transition Conduit',
      icon: Activity,
      color: 'text-[#006150]',
      bg: 'bg-[#e2f1eb]',
      summary: 'Visual node-and-rail clinical pathway tracking patient transfers from acute ICU to step-down telemetry.',
      details: [
        'Concentric optical pulse rings signify active transition phases in real time.',
        'Stage gates: 01 Clinical Review, 02 Med Recon, 03 SBAR Handoff, 04 Transport Logistics, 05 Bedside Ingestion.',
        'Dynamic hairline progress rail fills proportionately as multidisciplinary criteria are certified.',
        'Interactive stage switching allows retrospective inspection or forward planning.'
      ],
      actionLabel: 'Launch Orchestration',
      targetView: 'orchestration' as ActiveAppView,
    },
    {
      id: 'readiness-engine',
      category: 'readiness',
      badge: 'Deterministic AI/Logic',
      title: 'Explainable Readiness Engine & Safety Invariants',
      icon: ShieldCheck,
      color: 'text-[#247A56]',
      bg: 'bg-[#e8f7f1]',
      summary: 'Mathematical, explainable index calculating patient transfer readiness with non-override safety invariants.',
      details: [
        '5-pillar weighted formula: Clinical Review (20%) + Med Recon (25%) + SBAR (20%) + Transport (20%) + Receiving (15%).',
        'Transparent mathematical breakdown accessible via one-click formula view.',
        'Critical Safety Invariant: High readiness scores (e.g. 98%) NEVER override unresolved mandatory blockers.',
        'Identifies active bottlenecks with specific clinical resolution guidance.'
      ],
      actionLabel: 'Inspect Readiness',
      targetView: 'orchestration' as ActiveAppView,
    },
    {
      id: 'science-pharma',
      category: 'science',
      badge: 'DeepMind Science Skill',
      title: 'PubChem & openFDA Bioscience Pharmacology',
      icon: Pill,
      color: 'text-[#006971]',
      bg: 'bg-[#DDF8F8]',
      summary: 'Deep bio-pharmacology integration retrieving live 2D molecular structures and official FDA contraindications.',
      details: [
        'PubChem PUG REST integration: Live 2D chemical structure SVGs, molecular weights, formulas, and Canonical SMILES.',
        'openFDA Drug Label integration: Automated retrieval of Boxed Warnings, contraindications, and high-alert warnings.',
        'Dual-pharmacist digital attestation workflow required prior to high-alert medication transfer.',
        'Active status toggles: Continuing, Adjusted, Discontinued, or Transitioned.'
      ],
      actionLabel: 'Open Med Recon & Science',
      targetView: 'med_recon' as ActiveAppView,
    },
    {
      id: 'sbar-print',
      category: 'handoff',
      badge: 'Clinical Standards',
      title: 'Structured SBAR Handoff & A4 Print/PDF Archival',
      icon: Printer,
      color: 'text-[#123B32]',
      bg: 'bg-[#FAF8F1]',
      summary: 'Joint Commission-compliant SBAR handoff brief with built-in professional physical print and PDF archival.',
      details: [
        'Standardized 4-quadrant SBAR framework: Situation, Background, Assessment, and Recommendation.',
        'One-click Print/PDF Export using react-to-print with dedicated @media print CSS styling.',
        'Dual clinical custodian signatures (Sending RN and Receiving RN) with timestamps.',
        'One-click ASCII text copy for instant pasting into legacy hospital electronic health records (Epic, Cerner).'
      ],
      actionLabel: 'Preview SBAR Brief',
      isModalAction: 'sbar',
    },
    {
      id: 'reports-hub',
      category: 'handoff',
      badge: 'PDF Generation Engine',
      title: 'Central Reports & PDF Downloads Hub',
      icon: FileDown,
      color: 'text-[#006150]',
      bg: 'bg-[#e2f1eb]',
      summary: 'Centralized repository of 9 official A4 clinical records rendered with botanical emerald styling and automatic page breaks.',
      details: [
        'Client-side vector PDF compilation powered by jsPDF & autoTable with zero ink-wasting dark backgrounds.',
        '9 Comprehensive reports: Consolidated Summary, Patient Overview, Clinical Review (Stage 1), Med Recon (Stage 2), SBAR (Stage 3), Transport (Stage 4), Receiving (Stage 5), Audit Ledger, and Analytics.',
        'Prominent "INCOMPLETE / PENDING CLEARANCE" status stamping listing active protocol blockers when unsealed.',
        'Cryptographic audit attestations, patient identification bars, and confidential health information footers on every page.'
      ],
      actionLabel: 'Open Reports & Downloads Hub',
      targetView: 'reports' as ActiveAppView,
    },
    {
      id: 'rbac-security',
      category: 'security',
      badge: 'Security & Compliance',
      title: 'Multi-Disciplinary RBAC & License Gates',
      icon: Lock,
      color: 'text-[#9A6500]',
      bg: 'bg-[rgba(198,161,91,0.15)]',
      summary: 'Granular, server-enforced role permissions ensuring only credentialed clinicians can clear specific gates.',
      details: [
        '6 preconfigured clinical personas: ICU Nurse, Attending Physician, Clinical Pharmacist, Transport Paramedic, Receiving RN, Administrator.',
        'Server-side gate enforcement (HTTP 403 / 400 rejection if an unauthorized role attempts clearance).',
        'Instant role switching via header selector for fluid demonstration without logout barriers.',
        'Cryptographic transition verification modal sealing stages with sha-256 style audit signatures.'
      ],
      actionLabel: 'View Audit Ledger',
      targetView: 'audit' as ActiveAppView,
    },
    {
      id: 'simulation-center',
      category: 'simulation',
      badge: 'Hackathon Test Rig',
      title: 'Clinical Safety Simulation Center (Scenarios A–E)',
      icon: Sparkles,
      color: 'text-[#267A68]',
      bg: 'bg-[#e2f1eb]',
      summary: 'Deterministic scenario execution engine demonstrating real-world clinical edge cases at the push of a button.',
      details: [
        'Scenario A: Golden Path full-cycle transfer with 100% adherence seal.',
        'Scenario B: High-alert medication blocker halting transition until Pharmacist attestation.',
        'Scenario C: Biometric telemetry deterioration (MAP 62 mmHg, HR 128 bpm) triggering emergency huddle.',
        'Scenario D: Transport delay and automatic ETA rescheduling.',
        'Scenario E: Receiving unit bed rejection with non-destructive state rollback.',
        '1-Click "Reset Demo Baseline" restores all databases, patients, and audit trails instantly.'
      ],
      actionLabel: 'Launch Simulation Center',
      targetView: 'simulation' as ActiveAppView,
    },
    {
      id: 'analytics-dashboard',
      category: 'simulation',
      badge: 'Operational Intelligence',
      title: 'Operational Analytics & Flow Metrics',
      icon: BarChart3,
      color: 'text-[#006150]',
      bg: 'bg-[#e8f7f1]',
      summary: 'Hospital-wide telemetry measuring handoff velocity, delay hotspots, blocker frequencies, and CSV export.',
      details: [
        'Calculates Mean Transition Duration, Protocol Adherence Rate, Active Blockers, and Critical Transitions.',
        'Departmental flow matrix tracking transfers between ICU, Telemetry, Step-Down, and Post-Acute SNF.',
        'Stage completion duration distribution highlighting transition bottlenecks.',
        'One-click CSV export generating structured records for hospital operations committees.'
      ],
      actionLabel: 'View Analytics Dashboard',
      targetView: 'analytics' as ActiveAppView,
    },
    {
      id: 'audit-ledger',
      category: 'security',
      badge: 'Regulatory Compliance',
      title: 'Append-Only Cryptographic Audit Trail',
      icon: Fingerprint,
      color: 'text-[#3f4945]',
      bg: 'bg-[#f0f4f2]',
      summary: 'Immutable chronological event ledger recording all clinical signoffs, vitals changes, and gate transitions.',
      details: [
        'Append-only architecture guaranteeing historical actions cannot be overwritten or altered.',
        'Tracks clinician badge numbers, timestamps, target patient MRN, and change descriptions.',
        'Searchable and filterable by event severity (Emergency, Warning, Normal) and discipline.',
        'Provides legal and regulatory compliance defensibility for hospital care transitions.'
      ],
      actionLabel: 'Explore Audit Ledger',
      targetView: 'audit' as ActiveAppView,
    },
    {
      id: 'cinematic-intro',
      category: 'orchestration',
      badge: 'User Experience',
      title: 'Cinematic 5-Phase Opening Animation',
      icon: Award,
      color: 'text-[#006971]',
      bg: 'bg-[#DDF8F8]',
      summary: 'Atmospheric brand introduction sequence greeting clinicians and evaluators on every fresh page visit.',
      details: [
        'Phase 1: Dark-to-emerald atmospheric reveal with delicate particle grid.',
        'Phase 2: KAVACHA shield formation with concentric rings and ECG cardiac rhythm waveform.',
        'Phase 3: Brand name and champagne-gold clinical subtitle reveal.',
        'Phase 4: Welcome motto: "Precision in every transition · Safety in every handoff".',
        'Phase 5: Seamless glass dissolve into the application canvas.',
        'Built with Escape/Space skip shortcuts and prefers-reduced-motion accessibility.'
      ],
      actionLabel: 'Explore Main Canvas',
      targetView: 'orchestration' as ActiveAppView,
    },
    {
      id: 'new-transition',
      category: 'orchestration',
      badge: 'Clinical Ingestion',
      title: 'New Care Transition Creation Protocol',
      icon: Layers,
      color: 'text-[#267A68]',
      bg: 'bg-[#e2f1eb]',
      summary: 'Streamlined admission wizard to enroll new patients into the KAVACHA 5-stage safety pipeline.',
      details: [
        'Dynamic MRN generation and automated baseline telemetry assignment.',
        'Configures source unit, destination bed, acuity classification, and code status.',
        'Initializes customized 5-stage checklist based on patient diagnosis and care trajectory.',
        'Immediate synchronization to persistent database and hospital-wide dispatch roster.'
      ],
      actionLabel: 'Create New Transition',
      isModalAction: 'new_transition',
    }
  ];

  const filteredFeatures = FEATURES.filter(f => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.details.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="emerald-glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="prism-line absolute top-0 left-0 right-0" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#DDF8F8] text-[#006150] border border-[#63DCE8]/40 uppercase tracking-wider">
                Comprehensive Platform Architecture
              </span>
              <span className="text-xs text-[#6f7975]">·</span>
              <span className="text-xs font-semibold text-[#247A56]">
                Production-Grade Clinical Specification
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#111e1a] tracking-tight">
              All Features & Capabilities of KAVACHA
            </h2>

            <p className="text-xs sm:text-sm text-[#3f4945] mt-2 leading-relaxed">
              <strong>KAVACHA</strong> (*Intelligent Clinical Care Transition & Patient Safety Platform*) safeguards acute care transitions—a high-risk phase where 80% of serious medical errors occur due to fragmented communication. By combining <strong>multi-disciplinary verification gates</strong>, an <strong>explainable readiness engine</strong>, <strong>Google DeepMind bioscience pharmacology</strong>, and <strong>cryptographic audit trails</strong>, KAVACHA eliminates transition blind spots.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#DCE7E3]">
                <ShieldCheck className="w-4 h-4 text-[#247A56]" />
                <span>Zero-Bypass Protocol Invariants</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#DCE7E3]">
                <Pill className="w-4 h-4 text-[#006971]" />
                <span>PubChem & openFDA Live Grounding</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#DCE7E3]">
                <Printer className="w-4 h-4 text-[#123B32]" />
                <span>Clinical A4 Print & Archival</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#DCE7E3]">
                <Lock className="w-4 h-4 text-[#9A6500]" />
                <span>Role-Based Access Enforcement</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigateToView('orchestration')}
              className="bg-gradient-to-b from-[#267A68] to-[#20594B] text-white px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(38,122,104,0.35)] hover:brightness-105 active:scale-[0.98] border-t border-white/20 transition-all cursor-pointer"
            >
              <span>Launch Live Orchestrator</span>
              <ArrowRight className="w-4 h-4 text-[#63DCE8]" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateToView('simulation')}
              className="bg-white hover:bg-[#FAF8F1] text-[#006150] border border-[#267A68]/30 px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#C6A15B]" />
              <span>Run Scenario Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#267A68] text-white shadow-xs'
                  : 'bg-white hover:bg-[#FAF8F1] text-[#3f4945] border border-[#DCE7E3]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#6f7975] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search features, APIs, invariants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-white border border-[#DCE7E3] focus:outline-none focus:border-[#267A68] focus:ring-2 focus:ring-[#63DCE8]/20"
          />
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFeatures.map((feat) => {
          const IconComponent = feat.icon;
          return (
            <div
              key={feat.id}
              className="emerald-glass-card rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group border border-[#DCE7E3]"
            >
              <div className="prism-line absolute top-0 left-0 right-0 opacity-40 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg ${feat.bg} flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${feat.color}`} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6f7975] block">
                        {feat.badge}
                      </span>
                      <h3 className="text-sm font-bold font-display text-[#111e1a]">
                        {feat.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#3f4945] mb-3 leading-relaxed">
                  {feat.summary}
                </p>

                {/* Detail bullets */}
                <div className="p-3 bg-[#FAF8F1] rounded-lg border border-[#DCE7E3]/80 mb-4 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#006150] block mb-1">
                    Technical & Clinical Invariants:
                  </span>
                  {feat.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#3f4945]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#247A56] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-[#DCE7E3]/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#6f7975]">
                  Module Status: <strong className="text-[#247A56]">Active & Verified</strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (feat.isModalAction === 'sbar') {
                      onOpenSbar();
                    } else if (feat.isModalAction === 'new_transition') {
                      onOpenNewTransition();
                    } else if (feat.targetView) {
                      onNavigateToView(feat.targetView);
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-[#e8f7f1] text-[#006150] border border-[#267A68]/40 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer group-hover:bg-[#267A68] group-hover:text-white"
                >
                  <span>{feat.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5-Stage Stepped Pathway Reference Matrix */}
      <div className="emerald-glass-card rounded-2xl p-6 relative overflow-hidden border border-[#DCE7E3]">
        <div className="prism-line absolute top-0 left-0 right-0" />

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#267A68] text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4 text-[#63DCE8]" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#006150]">
              The 5-Stage Care Transition Defense-in-Depth Pipeline
            </h3>
            <p className="text-xs text-[#3f4945]">
              Rigid gate architecture enforced sequentially from ICU egress to post-acute ingestion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-[#DCE7E3] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6f7975] font-bold">
              <span>STAGE 01</span>
              <span className="text-[#006150]">LEAD: PHYSICIAN</span>
            </div>
            <div className="font-bold text-[#111e1a] text-xs">Clinical Readiness</div>
            <p className="text-[11px] text-[#3f4945] leading-relaxed">
              Hemodynamic stability evaluation, room air/O2 tolerance, diagnostic morning panel clearance, transfer orders signed.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#DCE7E3] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6f7975] font-bold">
              <span>STAGE 02</span>
              <span className="text-[#006971]">LEAD: PHARMACY</span>
            </div>
            <div className="font-bold text-[#111e1a] text-xs">Med Reconciliation</div>
            <p className="text-[11px] text-[#3f4945] leading-relaxed">
              PubChem & FDA profile verification, IV-to-oral step-downs, anticoagulant reconciliation, Pharmacist attestation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#DCE7E3] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6f7975] font-bold">
              <span>STAGE 03</span>
              <span className="text-[#006150]">LEAD: NURSING</span>
            </div>
            <div className="font-bold text-[#111e1a] text-xs">SBAR Verbal Handoff</div>
            <p className="text-[11px] text-[#3f4945] leading-relaxed">
              Standardized Situation, Background, Assessment, Recommendation. Sending and receiving nurse mutual signoff.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#DCE7E3] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6f7975] font-bold">
              <span>STAGE 04</span>
              <span className="text-[#9A6500]">LEAD: TRANSPORT</span>
            </div>
            <div className="font-bold text-[#111e1a] text-xs">Transport Safeguards</div>
            <p className="text-[11px] text-[#3f4945] leading-relaxed">
              Wireless telemetry battery check, E-cylinder oxygen pressure verification, dedicated route clearance, escort team.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#DCE7E3] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#6f7975] font-bold">
              <span>STAGE 05</span>
              <span className="text-[#247A56]">LEAD: RECEIVING RN</span>
            </div>
            <div className="font-bold text-[#111e1a] text-xs">Bedside Ingestion</div>
            <p className="text-[11px] text-[#3f4945] leading-relaxed">
              Physical arrival vitals recording, telemetry wave sync, equipment return, immutable cryptographic shield lock.
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Persona Guide */}
      <div className="emerald-glass-card rounded-2xl p-6 relative overflow-hidden border border-[#DCE7E3]">
        <div className="prism-line absolute top-0 left-0 right-0" />

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#20594B] text-white flex items-center justify-center shadow-xs">
            <UserCheck className="w-4 h-4 text-[#63DCE8]" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#006150]">
              Demonstration Personas & Access Permissions
            </h3>
            <p className="text-xs text-[#3f4945]">
              Switch clinical roles at any time using the header profile dropdown to test permission gating.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#DCE7E3] text-[#6f7975] uppercase text-[10px] font-mono">
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Persona Name & ID</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Authorized Permissions</th>
                <th className="py-2.5 px-3 text-right">Gate Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7E3]/60 bg-white/60">
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#006150]">Nurse</td>
                <td className="py-2.5 px-3 font-medium text-[#111e1a]">Sarah Jensen, BSN, RN, CCRN (RN-9842)</td>
                <td className="py-2.5 px-3 text-[#3f4945]">Cardiovascular ICU</td>
                <td className="py-2.5 px-3 text-[#3f4945]">Telemetry vitals, nursing checklists, SBAR drafting</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#247A56]">Stage 01, 03</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#006150]">Physician</td>
                <td className="py-2.5 px-3 font-medium text-[#111e1a]">Dr. Katherine Miller, MD, FACS (MD-4109)</td>
                <td className="py-2.5 px-3 text-[#3f4945]">Surgical Services</td>
                <td className="py-2.5 px-3 text-[#3f4945]">Clinical review authorization, transfer orders, lab review</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#247A56]">Stage 01 Seal</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#006971]">Pharmacist</td>
                <td className="py-2.5 px-3 font-medium text-[#111e1a]">R. Gupta, PharmD, BCPS (PH-7714)</td>
                <td className="py-2.5 px-3 text-[#3f4945]">Clinical Pharmacy</td>
                <td className="py-2.5 px-3 text-[#3f4945]">High-alert medication reconciliation, FDA reviews, dual attestation</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#247A56]">Stage 02 Seal</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#9A6500]">Transport</td>
                <td className="py-2.5 px-3 font-medium text-[#111e1a]">Marcus Bell, CCT-P (TR-3390)</td>
                <td className="py-2.5 px-3 text-[#3f4945]">Emergency Transit</td>
                <td className="py-2.5 px-3 text-[#3f4945]">Oxygen pressure certification, monitor link, gurney transit</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#247A56]">Stage 04 Seal</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#247A56]">Receiving RN</td>
                <td className="py-2.5 px-3 font-medium text-[#111e1a]">Brenda Hayes, BSN, RN, PCCN (RN-4411)</td>
                <td className="py-2.5 px-3 text-[#3f4945]">4-West Telemetry</td>
                <td className="py-2.5 px-3 text-[#3f4945]">SBAR verbal handshake acknowledgment, bedside arrival intake</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#247A56]">Stage 03 & 05 Seal</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#111e1a]">Administrator</td>
                <td className="py-2.5 px-3 font-medium text-[#111e1a]">Dr. Arthur Sterling, MD, MBA (ADM-001)</td>
                <td className="py-2.5 px-3 text-[#3f4945]">Clinical Operations</td>
                <td className="py-2.5 px-3 text-[#3f4945]">System configuration, simulation execution, audit analytics, database reset</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#111e1a]">Master Super-Admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
