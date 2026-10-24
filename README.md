# KAVACHA
### Intelligent Clinical Care Transition & Patient Safety Platform

> **Hackathon Prototype Demonstration & Evaluation Guide**  
> *Synthetic demo data — not for clinical use or real patient care.*

---

## 1. System Overview

**KAVACHA** (*Intelligent Clinical Care Transition & Patient Safety Platform*) is an enterprise-grade clinical transition-of-care orchestration platform designed for hospital care coordinators, charge nurses, physicians, clinical pharmacists, and transport teams. It enforces rigid, multi-disciplinary protocol safety gates across the five critical phases of acute hospital handoffs:

1. **Stage 01 — Clinical Review**: Hemodynamic telemetry stabilization, extubation criteria, and attending physician signoff.
2. **Stage 02 — Medication Reconciliation**: Pharmacist-certified reconciliation of high-alert infusions, anti-coagulants, and step-down oral medications, enriched with **Google DeepMind Science Skills (PubChem & openFDA)**.
3. **Stage 03 — SBAR Handoff**: Structured Situation, Background, Assessment, and Recommendation verbal exchange with mutual receiving nurse acknowledgment.
4. **Stage 04 — Transport Readiness**: Wireless telemetry monitoring, E-cylinder oxygen verification, and dedicated clinical escort logistics.
5. **Stage 05 — Receiving Confirmation**: Physical bed arrival verification, arrival waveform validation, and immutable cryptographic shield certification.

---

## 2. Core Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons.
- **Backend**: Express.js with Vite middleware integration in development and production static bundle serving (`server.ts`).
- **Database & Persistence**: Relational schema persistence engine (`data/app_db.json`) maintaining immutable tables for encounters, transitions, stages, checklists, medications, SBAR documents, transports, users, audit logs, and notification feeds.
- **Role-Based Access Control (RBAC)**: Server-enforced permissions on all `/api/*` endpoints preventing unauthorized stage clearance and safety gate bypasses.
- **Explainable Readiness Engine**: Transparent, weighted 5-pillar calculation (20% Clinical + 25% Med Recon + 20% SBAR + 20% Transport + 15% Receiving) with non-override safety invariants.
- **Bioscience Pharmacology Engine**: Powered by Google DeepMind Science Skills:
  - **PubChem PUG REST API**: Real-time retrieval of 2D chemical structures, molecular formulas, molecular weights, and Canonical SMILES.
  - **openFDA Drug Label API**: Direct inspection of FDA black box warnings, contraindications, and high-alert drug interaction profiles.
- **Clinical Safety Simulation Center**: One-click execution of 5 synthetic scenarios (Scenario A: Successful Golden Path, Scenario B: High-Alert Med Blocker, Scenario C: Biometric Deterioration, Scenario D: Transport Delay, Scenario E: Receiving Unit Rejection).

---

## 3. Demonstration Roles & Preconfigured Personas

Switch between demonstration personas directly via the header role selector:

| Role | Persona Name | Department & Badge | Authorized Capabilities |
|---|---|---|---|
| **Nurse** | Sarah Jensen, BSN, RN, CCRN | Cardiovascular ICU (`RN-9842`) | Checklist execution, telemetry vitals review, SBAR drafting |
| **Physician** | Dr. Katherine Miller, MD, FACS | Surgical Services (`MD-4109`) | Clinical review signoffs, transfer order authorization |
| **Pharmacist** | R. Gupta, PharmD, BCPS | Clinical Pharmacy (`PH-7714`) | High-alert medication reconciliation and digital attestation |
| **Transport** | Marcus Bell, CCT-P | Emergency & Patient Transit (`TR-3390`) | Transport dispatch, equipment pre-flight, escort assignment |
| **Receiving Nurse**| Brenda Hayes, BSN, RN, PCCN | 4-West Telemetry (`RN-4411`) | SBAR verbal acknowledgment, receiving bed intake and arrival vitals confirmation |
| **Administrator** | Dr. Arthur Sterling, MD, MBA | Clinical Operations (`ADM-001`) | System oversight, operational analytics, audit trails, and data reset |

---

## 4. Quick Start & Execution

### Installation

```bash
npm install
```

### Development Server (Port 3000)

```bash
npm run dev
```

The Express full-stack server starts at `http://localhost:3000`, serving both the `/api/*` endpoints and the Vite SPA frontend.

### Production Build

```bash
npm run build
npm run start
```

### Automated Backend Tests

```bash
npm test
```

Runs the test suite verifying health endpoints, RBAC permission checks, stage advance gate validation, analytics computation, PubChem/openFDA science services, and synthetic scenario execution.

---

## 5. Demonstration Walkthrough Guide

1. **Orchestration Canvas & Explainable Readiness Engine**:
   - Notice the **5-Pillar Readiness Index** (e.g. 57%). Click *"How Score Is Calculated"* to view the weighted formula and the non-override safety invariant rule.
   - Inspect the **5-Stage Stepped Conduit** featuring glowing state nodes and connecting rails.
   - Select patient **Eleanor Vance** (Post-CABG Day 4) or **Amara Okafor** (Severe Preeclampsia).

2. **Server-Enforced Role Gate Testing**:
   - While logged in as `Nurse`, try to execute the Stage 02 Medication Reconciliation gate. Notice the server blocks the action and informs you that a `Pharmacist` license is required.
   - Switch the active persona to `Pharmacist` in the header dropdown. The attestation button unlocks and successfully seals the gate with audit trail logging!

3. **Bioscience Pharmacology Inspector (Science Skill)**:
   - Navigate to the **"Med Recon & Science"** view.
   - Click the **"Bio-Science"** button on any medication (e.g., *Metoprolol*, *Milrinone*, *Apixaban*, *Aspirin*).
   - View the live 2D chemical structure from PubChem, molecular formula, weight, Canonical SMILES, and the official FDA Black Box Warning.

4. **Clinical Safety Simulation Center**:
   - Navigate to **"Scenarios"**.
   - Select **Scenario B: High-Alert Medication Blocker** and click **Execute**. Watch the system halt advancement on Amara Okafor with an explicit safety rationale.
   - Select **Scenario C: Biometric Deterioration Alert** to view simulated telemetry alerts (BP 84/52, MAP 62 mmHg).
   - Click **Reset Demo Baseline** at any time to return all records to seed baseline.

5. **Operational Analytics & Audit Trail**:
   - Navigate to **"Analytics"** to view real-time metrics computed directly from stored encounters (throughput velocity, blocker frequencies, departmental demand).
   - Click **"Export CSV"** to download the transition records.
   - Open **"Audit Ledger"** to inspect the append-only chronological event stream with actor, timestamp, and entity metadata.

---

## 6. Regulatory & Clinical Notice

All patient profiles, medical record numbers, vital signs, and encounter scenarios within this prototype are synthetic and generated exclusively for hackathon demonstration. This software is not certified as an electronic health record or diagnostic medical device.
