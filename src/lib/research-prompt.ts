export const RESEARCH_PROMPT = `# Inference.net ICP v3 — Recall-First (1–5 + Binary)

## Objective & Posture
Default to **inclusion**. We only mark **False** when a company is **clearly not a fit** (hard disqualifier or no LLM need). Everything plausibly in scope gets a score and usually a **True**.

## One-liner (updated context)
We train and host **specialized LLMs** and **workhorse models** (e.g., **ClipTagger-12B** for video frame captioning; **Schematron-3B/8B** for HTML→JSON extraction) that are **faster (2–3×), cheaper (up to 90%), private (VPC/ownership)**, and taken **from zero → prod in ~6 weeks**. Best fits show real LLM usage/need, pain (cost/latency/quality), lean ML staffing, and no exclusive frontier-lab dependency.

---

## Step 1 — Hard Disqualifiers (apply first, keep tight)
* **Pure research/foundation model lab** (publishing pretraining work; not a buyer) → **Decision = False, Score = 1**
* **No LLM surface & no credible need** (hardware/logistics only, generic agency with prompt-reselling) → **Decision = False, Score = 1–2**
* ** Are a direct competitor to Inference.net** (e.g., training your own models, using your own models, etc.) → **Decision = False, Score = 1–2** Examples: Predibase, Mistral, MosaicML, etc.

> Note: "Powered by OpenAI/Anthropic/Vertex" **without exclusivity** is **not** a disqualifier.

---

## Step 2 — Evidence to Collect (ordered, bias to "some proof")
Product usage (LLM/GPT/RAG/agents/fine-tuning), Workhorse fit (extraction, batch, captioning, real-time CX/agents), Pain (expensive/slow/rate-limited/quality gaps), Scale proxies (>$50k/mo frontier spend, heavy volume), Team (lean vs platform org), Privacy (VPC/ownership/residency), Vendors/partnerships (exclusive vs flexible). Grab 3–5 URLs (product/docs/blog or changelog/careers/pricing). If unknown, assume **minimum plausible** rather than zero.

---

## Step 3 — Dimension Scoring (0–12 pts, partial credit allowed)

**A. LLM Usage Maturity (0–2)**
0: none; 1: pilots/feature; 2: core to product/ops

**B. Workhorse Alignment (0–2)**
0: none; 1: one area; 2: two+ or mission-critical
Examples: **Schematron** signals: "extract/parse/HTML/JSON/schema/invoice/receipt/forms/tables". **ClipTagger** signals: "caption/frame/tag/OCR/scene/multimodal/video→JSON". **Batch**: "ETL/nightly/bulk/moderation backfills". **Real-time**: "contact center/copilot/agent/SLA/latency".

**C. Cost/Latency/Quality Pain (0–2)**
0: none; 1: implied; 2: explicit at scale (timeouts, throughput, eval gaps)

**D. Scale / Spend Proxy (0–2)**
0: small/unknown; 1: moderate (≈$10–50k/mo); 2: likely **>$50k/mo** or clear enterprise volume

**E. Team Profile (0–2)**
*(higher = leaner, better for us)*
0: mature ML platform org (≥10 ML/LLMOps/Research or clear platform team)
1: mixed but lean (≤5 ML)
2: small/medium eng org, no platform team

**F. Privacy/Control (0–1)**
0: none; 1: VPC/on-prem/residency/weight ownership

**G. Fine-tuning/Custom Intent (0–1)**
0: none; 1: SFT/LoRA/custom models/evals interest

**Total = 0–12**

---

## Step 4 — Map Points → Score (1–5) & Decision (Recall-first)

**Score bands**
1 = No fit (0–2 pts or hard disqualifier)
2 = Weak (3–4 pts)
3 = Possible (5–7 pts)
4 = Good (8–10 pts)
5 = Bullseye (11–12 pts)

**Binary Decision (recall-first)**
* **True** if **Score ≥ 3** and **no hard disqualifier**
* **False** only if a **hard disqualifier** or **Score ≤ 2**

**Caps & guards**
* If **mature ML platform org**, cap **max Score at 3** unless they explicitly want **privacy/ownership + custom models** (then allow 4).
* If evidence is thin but there is **any concrete LLM signal** or **clear workhorse mapping**, default to **Score 3 → Decision True**.

---

## Workhorse Fast-Path (don't miss these)
If you see any of the below with even modest LLM usage, assign **Score ≥ 3** unless disqualified:
* **Contact center / agent assist / real-time CX** with SLA/latency needs
* **HTML/receipt/form/table extraction to JSON** (web/data ops/catalog)
* **Video/image captioning or multimodal → JSON** (analytics, safety, catalog)
* **Batch inference pipelines** (ETL, nightly, moderation at scale)

---

## Output Requirements

Provide the following information:

**Score:** n/5 (where n is 1-5 based on the scoring bands above)

**Use case:** What they might use Inference.net for (be specific about ClipTagger, Schematron, or custom models)

**AI Subprocessor list:** OpenAI, Anthropic, etc. (list the LLM providers they currently use)

**Pitch/Sales suggestions:** Best approach on what to pitch them from Inference.net on our first call

**AI use cases:** Either existing or potential use cases they have

**Company size/Age/Revenue/Location/Most recent fundraising round:** Provide these details if available

**Basis:** Detailed reasoning and evidence for the score, including:
- Flags (uses_llms, maps_to_workhorse, complains_cost_latency, large_ml_org, frontier_exclusive_partner, likely_api_spend_gt_50k_mo, needs_privacy_control, fine_tuning_interest)
- Evidence URLs (3-5 relevant links)
- Rationale for the score

---

## Instructions

Research this company thoroughly and provide all the above information in a structured format.`;
