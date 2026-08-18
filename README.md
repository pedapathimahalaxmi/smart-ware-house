# FlowForge AI — Smart Warehouse Operations & Order Fulfillment System

> **A mission-critical autonomous warehouse control tower and operational decision engine built with React, TypeScript, Tailwind CSS, and local state.**

---

## 📍 Quick Links & Access

- **Live Local URL**: [http://localhost:3000](http://localhost:3000)
- **Project Directory**: [`flowforge-ai/`](file:///C:/Users/pedap/.gemini/antigravity/scratch/flowforge-ai)
- **Standalone Entrypoint**: [`index.html`](file:///C:/Users/pedap/.gemini/antigravity/scratch/flowforge-ai/index.html)

---

## 🚀 Overview

**FlowForge AI** is an autonomous warehouse operations control tower and real-time order fulfillment decision engine. Unlike traditional warehouse management dashboards that merely display static metrics or basic CRUD lists, FlowForge AI **actively makes operational decisions** about:
1. **Dynamic Priority Scoring**: Multi-factor weighting combining Customer Tier, SLA Deadlines, Order Dollar Value, and Assembly-Line Criticality.
2. **Stock Allocation Arbitration**: Intelligent inter-order reservation transfers that rescue critical Enterprise orders from SLA breaches without jeopardizing lower-priority shipments.
3. **Zone Picking Load Balancing**: Automatic detection of throughput bottlenecks in congested warehouse aisles (e.g. Zone B2) and 1-click task reassignment to idle, high-efficiency pickers.
4. **Autonomous Exception Resolution**: Rapid incident triage, cycle count write-downs, and pin-compatible SKU substitutions (e.g. replacing damaged `SKU-1008` with `SKU-1010` Rev B) to eliminate fulfillment downtime.

---

## 🏆 3-Minute Hackathon Demo Script for Judges

Use this step-by-step walkthrough to present FlowForge AI to judges in under 3 minutes:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  00:00 - 00:30  |  THE HOOK & THE CONTROL TOWER                                          │
│  00:30 - 01:15  |  THE CORE PROBLEM & GUIDED DEMO (ORD-1042 vs ORD-1037)                 │
│  01:15 - 01:50  |  ZONE B2 BOTTLENECK & PICKER REASSIGNMENT                              │
│  01:50 - 02:30  |  INCIDENT RESOLUTION (PIN-COMPATIBLE SKU SUBSTITUTION)                 │
│  02:30 - 03:00  |  ANALYTICS, SIMULATION CLOCK, & WRAP-UP                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### ⏱️ Minute 00:00 – 00:30: The Hook & Executive Dashboard
- **Presenter**: *"Judges, modern fulfillment centers lose millions every year not from lack of inventory, but from lack of intelligent decision-making. Traditional WMS dashboards only report problems after deadlines are already missed."*
- **Action**: Open [http://localhost:3000](http://localhost:3000). Show the dark SaaS Dashboard.
- **Key Visuals**:
  - Point to the **4 KPI Cards**: `Total Active Orders`, `96% SLA Fulfillment Rate`, `Low-Stock SKUs`, and `Picking Bottleneck in Zone B2`.
  - Highlight the **6-stage Live Fulfillment Pipeline**: `Created → Allocated → Picking → Packed → QC → Dispatched`.

### ⏱️ Minute 00:30 – 01:15: Guided Demo — Critical Stock Conflict Arbitration
- **Presenter**: *"Let's look at our headline scenario. Enterprise client Apex Robotics just placed critical order ORD-1042 with a 46-minute SLA. It requires 10 Servo Motors (SKU-1001), but only 7 units are unallocated on the shelf."*
- **Action**: Click **`🎯 Guided Demo`** in the top header.
- **Flow**:
  1. **Step 1 & 2**: Show the critical order ingestion and the 3-unit shelf deficit.
  2. **Step 3**: Show how FlowForge AI scans the ledger and finds lower-priority `ORD-1037` (Standard tier, 4.5 hours remaining) holding 5 reserved units.
  3. **Step 4**: Show the AI Recommendation: *“Reallocate 3 units from ORD-1037 to ORD-1042. Protects critical SLA.”*
  4. **Step 5**: Click **`⚡ 1-Click Approve Reallocation`**.
- **Result**: Instant state reconciliation, Web Audio success chime, and celebratory toast: **“Critical order allocation secured. SLA risk removed.”**

### ⏱️ Minute 01:15 – 01:50: Zone B2 Bottleneck & Picker Load Balancing
- **Presenter**: *"Next, let's look at picking congestion. In Zone B2, heavy hydraulics are causing an 18-minute backlog."*
- **Action**: Navigate to **Picking & Packing** via the sidebar.
- **Flow**:
  1. Show the red **Zone B2 Bottleneck Detected** alert banner.
  2. Show the 5-column Kanban board (`Ready`, `In Progress`, `Delayed`, `Packed`, `Quality Check`).
  3. Click **`🔄 Reassign Zone B2`** (or click `Reassign` on `TSK-201`).
  4. Select **Elena Rostova** (Zone A1, 99% efficiency rating, 1 active task) and click **Confirm Reassignment**.
- **Result**: The task shifts out of delay, the banner clears, and throughput is restored.

### ⏱️ Minute 01:50 – 02:30: Exceptions Center & SKU Substitution
- **Presenter**: *"What happens when a picker finds damaged goods in a bin? Usually, orders stall for hours. FlowForge AI handles it in seconds."*
- **Action**: Click **Exceptions Center** on the sidebar.
- **Flow**:
  1. Point to **`EX-901`**: A cracked motor casing reported on `SKU-1008` for Tesla Gigafactory Tier 1 order `ORD-1033`.
  2. Show the 3-step triage: *Issue $\to$ System Decision $\to$ Resolution*.
  3. Click **`⚡ Resolve`**: FlowForge AI automatically substitutes `SKU-1008` with the pin-compatible `SKU-1010` (Rev B), updates the order line items, and unblocks the order back to `Picking`.

### ⏱️ Minute 02:30 – 03:00: Simulation, Analytics & Closing
- **Presenter**: *"Managers can simulate future order spikes and advance time."*
- **Action**:
  1. Click **`+15m`** in the header to advance warehouse simulation time.
  2. Click **`🚨 +Simulate Influx`** to inject a sudden high-priority Defense order into the priority queue.
  3. Click **`📥 Export CSV`** to show full audit export capabilities.
- **Closing**: *"FlowForge AI turns the warehouse from a reactive storage facility into an intelligent, self-balancing fulfillment machine."*

---

## 🧠 Decision Engine Mathematical Architecture

```
                                  ┌────────────────────────┐
                                  │   Incoming Customer    │
                                  │         Order          │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │    1. Priority Scoring Engine   │
                             │  • Tier (40 pts)                │
                             │  • SLA Urgency (35 pts)         │
                             │  • Dollar Value (15 pts)        │
                             │  • Assembly Criticality (10 pts)│
                             └────────────────┬────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │  2. Stock Allocation Arbitrator │
                             │  • Shelf Availability Check     │
                             │  • Low-Priority Reservation Scan│
                             │  • 1-Click Stock Transfer       │
                             └────────────────┬────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │  3. Zone Bottleneck Balancer    │
                             │  • Zone Queue Depth Monitoring  │
                             │  • Picker Overload Detection    │
                             │  • Cross-Zone Task Balancing    │
                             └────────────────┬────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │  4. Automated Exception Triage  │
                             │  • Pin-Compatible Substitutions │
                             │  • Inventory Write-Downs        │
                             │  • Cycle Count Triggers         │
                             └─────────────────────────────────┘
```

### 1. Priority Scoring Formula (`priorityEngine.ts`)
$$\text{Score} = w_{\text{tier}} + w_{\text{sla}} + w_{\text{value}} + w_{\text{urgency}}$$

| Parameter | Criteria | Weight |
| :--- | :--- | :---: |
| **Customer Tier** | `Enterprise` <br> `Premium` <br> `Standard` | **+40 pts** <br> **+25 pts** <br> **+10 pts** |
| **SLA Urgency** | $<45$ min remaining or Overdue <br> $<90$ min <br> $<180$ min <br> $>180$ min | **+35 pts** <br> **+25 pts** <br> **+15 pts** <br> **+5–10 pts** |
| **Order Value** | $>\$5,000$ <br> $>\$2,000$ <br> $\le \$2,000$ | **+15–20 pts** <br> **+10 pts** <br> **+5 pts** |
| **Criticality** | Assembly line-down / Medical cold-chain | **+5–10 pts** |

**Classification Tiers**:
- `Critical` ($\ge 90$ pts): Immediate stock reservation priority & expedited picking.
- `High` ($75 - 89$ pts): Standard priority picking queue.
- `Normal` ($35 - 74$ pts): Standard fulfillment buffer.
- `Low` ($< 35$ pts): Non-urgent replenishment.

---

## 🖥️ Complete Application Pages & Features

| Page | Key Features & Interactions |
| :--- | :--- |
| **1. Executive Dashboard** | • 4 Live KPI Cards (Active Orders, 96% Fulfillment Rate, Low-Stock Count, Zone B2 Delay).<br>• 6-stage interactive fulfillment pipeline progress tracker.<br>• AI Decision Center cards for 1-click stock reallocation and picker reassignment.<br>• Low-stock SKU stream with quick `+ Reorder` triggers.<br>• Live operational incident alert stream. |
| **2. Orders Control** | • Search input & Priority filter tabs (`ALL`, `Critical`, `High`, `Normal`, `Low`).<br>• 14 rich orders with customer tiers, SLA countdowns, and allocation status.<br>• **Detailed Order Modal**: Score breakdown (+40 tier, +35 SLA, +15 value), line items table, and audit trail.<br>• **Fast Workflow Stage Advancer**: Click `Advance ⚡` to progress any order through the fulfillment pipeline. |
| **3. Inventory & SKUs** | • 16 SKUs mapped to Zones A1, A2, B1, B2, C1 with bin coordinates.<br>• Zone filter pills (`ALL`, `A1`, `A2`, `B1`, `B2`, `C1`).<br>• Health status badges (`Healthy`, `Low Stock`, `Out of Stock`, `Damaged`).<br>• **Restock Reorder Modal**: Custom batch quantity adjustor, supplier lead times, and instant stock ledger reconciliation. |
| **4. Allocation Center** | • Primary Demo Conflict: `ORD-1042` (Critical) vs `ORD-1037` (Standard) on `SKU-1001`.<br>• AI Recommendation with reservation diff visualization.<br>• 3 Action buttons: `Approve Reallocation`, `Allocate Partial Stock`, and `Create Reorder Request`. |
| **5. Picking & Packing** | • 5-column Kanban task board (`Ready`, `In Progress`, `Delayed`, `Packed`, `Quality Check`).<br>• Zone B2 bottleneck warning banner (18-min delay, overloaded pickers Marcus Vance & Kenji Takahashi).<br>• **Reassign Picker Modal**: Reassign tasks to available pickers (e.g. *Elena Rostova*, 99% efficiency rating). |
| **6. Exceptions Center** | • 4 Warehouse incidents: Damaged Item (`EX-901`), Missing Item (`EX-902`), Stock Mismatch (`EX-903`), Picking Delay (`EX-904`).<br>• 3-Step Incident Breakdown: Issue $\to$ System Decision $\to$ Recommended Resolution.<br>• **Pin-Compatible SKU Substitution**: Substitutes damaged `SKU-1008` with `SKU-1010` Rev B and unblocks orders. |
| **7. Analytics & SLA** | • Hourly Fulfillment Throughput chart (Orders Created vs Dispatched).<br>• Warehouse Zone Picking Performance & latency benchmarks.<br>• **1-Click Dynamic Zone Load Rebalancer**. |

---

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla JavaScript, React 18 & TypeScript Architecture
- **Styling**: Tailwind CSS (Dark SaaS palette: Slate 950/900, Cyan/Blue accents, Rose critical alerts, Amber warnings, Emerald success)
- **Audio Engine**: Pure Web Audio API Synthesizer (sine/triangle wave synthesis; 0 external asset files needed)
- **Typography**: Google Fonts (*JetBrains Mono* & *Plus Jakarta Sans*)
- **State Management**: Reactive state container with comprehensive local warehouse dataset
- **Zero Backend Required**: Runs 100% locally in any browser with instant interactivity!

---

## 💻 How to Run Locally

### Option 1: Python Built-in Server (Recommended)
```bash
# Navigate to the project directory
cd flowforge-ai

# Start the web server
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option 2: Direct File Open
Double-click [`index.html`](file:///C:/Users/pedap/.gemini/antigravity/scratch/flowforge-ai/index.html) to open directly in Chrome, Edge, Firefox, or Brave.

### Option 3: Node / Vite (if Node.js is installed)
```bash
npm install
npm run dev
```

---

## ✨ Hackathon QA Verification Summary

- [x] **Sidebar Navigation**: Seamless page transitions across all 7 views.
- [x] **Guided Demo Tour**: 5-step interactive walkthrough with 1-click resolution.
- [x] **Approve Reallocation**: Instant state mutation for `ORD-1042`, reservation updates for `ORD-1037`, task queued for Elena Rostova.
- [x] **Reorder Modal**: Accurate batch quantity recalculation and inventory status restoration.
- [x] **Picker Reassignment**: Clears Zone B2 bottleneck and updates task owner.
- [x] **Exception Resolution**: Automatic pin-compatible SKU substitution unblocks order.
- [x] **Simulation Clock**: `+15m` advance and `🚨 +Simulate Influx` order injection.
- [x] **CSV Exporter**: Generates and downloads formatted `.csv` reports.
- [x] **Audio Feedback**: Synthesizes UI clicks, success chords, and alerts without external files.
