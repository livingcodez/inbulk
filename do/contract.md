## 🔑 What `!run:` does

1. **Open** `/do/contract.md`.
2. **Follow** the steps below **from the last file backwards** (start at `taskDefinition.md`, finish at `indexInstruction.md`).
3. **Concurrency:** Only *one* run at a time. Acquire a run lock (see **Step 0a**) before proceeding.

---

## 📂 Key Files & Their Jobs

| File | Purpose |
| --- | --- |
| `/do/indexInstruction.md` | Raw user prompt. Always overwritten. |
| `/do/taskGenerator.json` | **Framework** for task generation (constant). |
| `/do/workingOnTaskGenerator.json` | Scratch space while filling the framework. (Never backed up; safe to delete/overwrite.) |
| `/do/renderedTaskGenerator.json` | Scratch space for streamed result of `workingOnTaskGenerator`  |
| `/do/taskDefinition.json` | Final prompt that actually updates the repo (**seeded, never empty** by contract). |
| `/do/indexInstructionHistory.md` | Append-only history of prior `indexInstruction.md` versions. |
| `/do/taskDefinitionHistory.md` | Append-only history of prior `taskDefinition.md` versions. |
| `/do/CHANGELOG.md` *(recommended)* | One-line entry per overwrite run (file, timestamp, short note). |
| `/do/.runlock` *(ephemeral)* | Created at run start to block concurrent executions; removed at run end. |

> Processing order (always backwards):
> 
> 
> `taskDefinition.json` → `indexInstruction.md`
> 

---

## 🛠️ Workflow Contract (easy view)

### 0. Preflight + Save / Update the User Prompt

a. **Acquire run lock:** Create `/do/.runlock` containing current timestamp + process ID. If file already exists, **abort** (another run in progress).

b. **Ensure directories:** `mkdir -p /do` (should exist) and create missing history files (`indexInstructionHistory.md`, `taskDefinitionHistory.md`, and `CHANGELOG.md` if using). Abort on FS permission or zero-length file error.

c. **Capture current index:** Read existing `/do/indexInstruction.md` (if present) into memory for backup.

d. **Strip trigger:** Remove `!run:` and leading whitespace from the incoming message. This becomes the *clean user prompt*.

e. **Backup old index (if existed):** Append a timestamped block to `/do/indexInstructionHistory.md` *before* overwriting. Use timestamp format `YYYYMMDD-HHMMSS`; if a duplicate timestamp occurs within the same second, append `-A`, `-B`, etc. (See Step 4a for sample block format.)

f. **Overwrite index:** Write the clean user prompt to `/do/indexInstruction.md`.

g. **Log changelog entry:** Append `YYYYMMDD-HHMMSS | indexInstruction.md updated (source=run)` to `/do/CHANGELOG.md`.

---

### 1. Ensure `taskDefinition.json` Exists & Is Filled

a. **Check** `/do/taskDefinition.json`. Because this file is *seeded by previous run and never empty by policy*, treat a missing or zero-length file as an error condition:

• If file **exists & empty** → go to **3.f.**

• If file **exists & non-empty** → go to  **1.b** (regeneration). 

b. **Regenerate `taskDefinition.json`** (recovery / refresh path)

i.   Copy `/do/taskGenerator.json` → `/do/workingOnTaskGenerator.json` (overwrite freely; no backup).

ii.  In `workingOnTaskGenerator.json`, replace the value`{{y}}` whose key is `"Received_Input"` with full contents of `/do/indexInstruction.md`. and render 

iii.  For record keeping purpose only, and not implementation, **stream** the updated `/do/workingOnTaskGenerator.json` to `/do/renderedTaskGenerator.json`; overwriting  `/do/renderedTaskGenerator.json` with the captured record or result of the updated `/do/workingOnTaskGenerator.json`.

iv.  **Backup current `taskDefinition.json`** (`... | taskDefinition.json previous run`) per **Step 4a**.

v.   Overwrite `/do/taskDefinition.json` with `/do/renderedTaskGenerator.json`.

vi.  Log changelog entry: `... | taskDefinition.json regenerated from renderedTaskGenerator.json`.

---

### 2. Run the Authorised Prompt

a. **Execute** `/do/taskDefinition.json` *verbatim as a prompt*. This is the **only** prompt allowed to modify the repository(`.inbulk[current branch`] ).

b. **Post-run scratch cleanup (recommended):** Truncate all scratch files (`workingOnTaskGenerator.json`, , `renderedTaskGenerator.json` to a short marker (e.g., `<!-- cleared after run YYYYMMDD-HHMMSS -->`) so stale instructions aren’t mistaken for live ones next run.

---

### 3. Backup, Error Reporting & Housekeeping (Safety Net)

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
f. **Zero-length file error handling:** treat a missing or zero-length `taskDefinition.md` as an error condition: and abort the run; do **not** proceed to later steps with partial state.

---

## 📌 Directory Map (quick reference)

```
/                            (rest of project)
└─ do/
   ├─ contract.md
   ├─ indexInstruction.md
   ├─ taskGenerator.json
   ├─ workingOnTaskGenerator.json
   ├─ renderedTaskGenerator.json   
   ├─ taskDefinition.json
   ├─ indexInstructionHistory.md
   ├─ taskDefinitionHistory.md
   ├─ recordOfImplementWithoutRegressionHistory.md
   ├─ CHANGELOG.md                # optional but recommended
   └─ .runlock                    # ephemeral lockfile during active run

```

**Follow Steps 0 → 4 every time you see `!run:`.**