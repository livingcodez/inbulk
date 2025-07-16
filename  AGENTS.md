## 🔑 What `!run:` does

1. **Open** `/do/contract.md`.
2. **Follow** the steps below **from the last file backwards** (start at `recordOfImplementWithoutRegression.md`, finish at `indexInstruction.md`).
3. **Concurrency:** Only *one* run at a time. Acquire a run lock (see **Step 0a**) before proceeding.

---

## 📂 Key Files & Their Jobs

| File | Purpose |
| --- | --- |
| `/do/indexInstruction.md` | Raw user prompt. Always overwritten. |
| `/do/taskGenerator.md` | **Framework** for task generation (constant). |
| `/do/workingOnTaskGenerator.md` | Scratch space while filling the framework. (Never backed up; safe to delete/overwrite.) |
| `/do/renderedTaskGenerator.md` | Scratch space for recording output of rendered `workingOnTaskGenerator.md`. (Never backed up; safe to overwrite.)   |
| `/do/taskDefinition.md` | Result of `workingOnTaskGenerator` (**seeded, never empty** by contract). |
| `/do/implementWithoutRegression.md` | Template for repo updates. |
| `/do/workingOnImplementWithoutRegression.md` | Scratch space while embedding `taskDefinition`. (Never backed up; safe to delete/overwrite.) |
| `/do/renderedImplementWithoutRegression.md` | Scratch space for recording output of rendered  `workingOnImplementWithoutRegression.md`. (Never backed up; safe to overwrite.) |
| `/do/recordOfImplementWithoutRegression.md` | Final prompt that actually updates the repo (**seeded, never empty** by contract). |
| `/do/indexInstructionHistory.md` | Append-only history of prior `indexInstruction.md` versions. |
| `/do/taskDefinitionHistory.md` | Append-only history of prior `taskDefinition.md` versions. |
| `/do/recordOfImplementWithoutRegressionHistory.md` | Append-only history of prior `recordOfImplementWithoutRegression.md` versions. |
| `/do/CHANGELOG.md` *(recommended)* | One-line entry per overwrite run (file, timestamp, short note). |
| `/do/.runlock` *(ephemeral)* | Created at run start to block concurrent executions; removed at run end. |

> Processing order (always backwards):
> 
> 
> `recordOfImplementWithoutRegression.md` → `taskDefinition.md` → `indexInstruction.md`
> 

---

## 🛠️ Workflow Contract (easy view)

### 0. Preflight + Save / Update the User Prompt

a. **Acquire run lock:** Create `/do/.runlock` containing current timestamp + process ID. If file already exists, **abort** (another run in progress).

b. **Ensure directories:** `mkdir -p /do` (should exist) and create missing history files (`indexInstructionHistory.md`, `taskDefinitionHistory.md`, `recordOfImplementWithoutRegressionHistory.md`, and `CHANGELOG.md` if using). Abort on FS permission error.

c. **Capture current index:** Read existing `/do/indexInstruction.md` (if present) into memory for backup.

d. **Strip trigger:** Remove `!run:` and leading whitespace from the incoming message. This becomes the *clean user prompt*.

e. **Backup old index (if existed):** Append a timestamped block to `/do/indexInstructionHistory.md` *before* overwriting. Use timestamp format `YYYYMMDD-HHMMSS`; if a duplicate timestamp occurs within the same second, append `-A`, `-B`, etc. (See Step 4a for sample block format.)

f. **Overwrite index:** Write the clean user prompt to `/do/indexInstruction.md`.

g. **Log changelog entry:** Append `YYYYMMDD-HHMMSS | indexInstruction.md updated (source=run)` to `/do/CHANGELOG.md`.

---

### 1. Ensure `taskDefinition.md` Exists & Is Filled

a. **Check** `/do/taskDefinition.md`. Because this file is *seeded and never empty by policy*, treat a missing or zero-length file as an error condition:

• If file **exists & non-empty** → go to **Step 2**.

• If file missing/empty → recover via **1.b** (regeneration).

b. **Regenerate `taskDefinition.md`** (recovery / refresh path)

i.   Copy `/do/taskGenerator.md` → `/do/workingOnTaskGenerator.md` (overwrite freely; no backup).

ii.  In `workingOnTaskGenerator.md`, replace every `{{y}}` with full contents of `/do/indexInstruction.md`.

iii. For record keeping purpose only, and not implementation, **render** `workingOnTaskGenerator.md` as a prompt; then overwrite `renderedTaskGenerator.md` with the captured record or result of the rendered `workingOnTaskGenerator.md`.

iv.  **Backup current `taskDefinition.md`** (if any) per **Step 4a**.

v.   Overwrite `/do/taskDefinition.md` with the generated task definition output on  `/do/renderedTaskGenerator.md`.

vi.  Log changelog entry: `... | taskDefinition.md regenerated from renderedTaskGenerator.md`.

---

### 2. Ensure `recordOfImplementWithoutRegression.md` Exists & Is Filled

a. **Check** `/do/recordOfImplementWithoutRegression.md`. This file is also *seeded, never empty*; treat missing/empty as error requiring recovery:

• If file **exists & non-empty** → go to **Step 3**.

• If missing/empty → go to **2.b**.

b. **Regenerate `recordOfImplementWithoutRegression.md`** (recovery / refresh path)

i.   Copy `/do/implementWithoutRegression.md` → `/do/workingOnImplementWithoutRegression.md` (overwrite freely; no backup).

ii.  In `workingOnImplementWithoutRegression.md`, replace every `{{y}}` with full contents of `/do/taskDefinition.md`.

iii. For record keeping purpose only, and not implementation, **render** `workingOnImplementWithoutRegression.md` as a prompt; then overwrite `renderedImplementWithoutRegression.md` with the captured record or result of the rendered `workingOnImplementWithoutRegression.md`.

iv.  **Backup current `recordOfImplementWithoutRegression.md`** per **Step 4a**.

v.   Overwrite `/do/recordOfImplementWithoutRegression.md` with the rendered implementation record on  `/do/renderedImplementWithoutRegression.md`.

vi.  Log changelog entry: `... | recordOfImplementWithoutRegression.md regenerated from renderedImplementWithoutRegression`.

---

### 3. Run the Authorised Prompt

a. **Execute** `/do/recordOfImplementWithoutRegression.md` *verbatim*. This is the **only** prompt allowed to modify the repository.

b. **Post-run scratch cleanup (recommended):** Truncate both scratch files (`workingOnTaskGenerator.md`, `workingOnImplementWithoutRegression.md`, `renderedTaskGenerator.md`, `renderedImplementWithoutRegression`) to a short marker (e.g., `<!-- cleared after run YYYYMMDD-HHMMSS -->`) so stale instructions aren’t mistaken for live ones next run.

---

### 4. Backup & Housekeeping (Safety Net)

> Apply these rules every time you overwrite a non-scratch file (Steps 0, 1, and 2 above).
> 

a. **Backup block format:** Append to that file’s `*History.md` using the pattern below:

```
--- BEGIN BACKUP YYYYMMDD-HHMMSS[-X] ---
<previous file contents>
--- END BACKUP YYYYMMDD-HHMMSS[-X] ---

```

Use `-X` suffix (A, B, C… or short UUID) if more than one backup happens in the same second.

b. **Append-only:** Never delete old history blocks.

c. **CHANGELOG:** Append one-line summary per overwrite:

`YYYYMMDD-HHMMSS | <filename> | action=<updated|regenerated|created> | note=<short>`

d. **Release run lock:** Remove `/do/.runlock` once backups and changelog writes succeed. If cleanup fails, warn and leave lock in place to prevent unsafe next run.

e. **FS error handling:** If at any point a write fails, log an error entry in `CHANGELOG.md` (if writable) and abort the run; do **not** proceed to later steps with partial state.

---

## 📌 Directory Map (quick reference)

```
/                            (rest of project)
└─ do/
   ├─ contract.md
   ├─ indexInstruction.md
   ├─ taskGenerator.md
   ├─ workingOnTaskGenerator.md
   ├─ renderedTaskGenerator.md
   ├─ taskDefinition.md
   ├─ implementWithoutRegression.md
   ├─ workingOnImplementWithoutRegression.md
   ├─ renderedImplementWithoutRegression.md
   ├─ recordOfImplementWithoutRegression.md
   ├─ indexInstructionHistory.md
   ├─ taskDefinitionHistory.md
   ├─ recordOfImplementWithoutRegressionHistory.md
   ├─ CHANGELOG.md                # optional but recommended
   └─ .runlock                    # ephemeral lockfile during active run

```

**Follow Steps 0 → 4 every time you see `!run:`.**

That’s the whole pipeline—now in one glance.