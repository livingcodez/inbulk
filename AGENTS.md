## 🔑 What `!run:` does

1. **Follow** the steps below **from the last file backwards** (start at `cd inbulk/do/taskDefinition.md`, finish at `cd inbulk/do/indexInstruction.md`).
2. **Concurrency:** Only *one* run at a time. Acquire a run lock (see **Step 0a**) before proceeding.

---

## 📂 Key Files & Their Jobs

| File (run `cd …` first)                     | Purpose                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `cd inbulk/do/indexInstruction.md`          | Raw user prompt. Always overwritten.                                                   |
| `cd inbulk/do/taskGenerator.json`           | **Framework** for task generation (constant).                                          |
| `cd inbulk/do/workingOnTaskGenerator.json`  | Scratch space while filling the framework (never backed up; safe to delete/overwrite). |
| `cd inbulk/do/renderedTaskGenerator.json`   | Scratch space for streamed result of `workingOnTaskGenerator`.                         |
| `cd inbulk/do/taskDefinition.json`          | Final prompt that actually updates the repo.     |
| `cd inbulk/do/indexInstructionHistory.md`   | Append‑only history of prior `indexInstruction.md` versions.                           |
| `cd inbulk/do/taskDefinitionHistory.md`     | Append‑only history of prior `taskDefinition.md` versions.                             |
| `cd inbulk/do/CHANGELOG.md` *(recommended)* | One‑line entry per overwrite run (file, timestamp, short note).                        |
| `cd inbulk/do/.runlock` *(ephemeral)*       | Created at run start to block concurrent executions; removed at run end.               |

> **Processing order (always backwards):**
> `cd inbulk/do/taskDefinition.json` → `cd inbulk/do/indexInstruction.md`

---

## 🛠️ Workflow (easy view)

### 0. Preflight + Save / Update the User Prompt

a. **Acquire run lock:** Create `cd inbulk/do/.runlock` containing current timestamp + process ID. If file already exists, **abort** (another run in progress).

b. **Ensure directories:** `mkdir -p inbulk/do` (should exist) and create missing history files (`cd inbulk/do/indexInstructionHistory.md`, `cd inbulk/do/taskDefinitionHistory.md`, and `cd inbulk/do/CHANGELOG.md` if using). Abort on FS‑permission or zero‑length file error.

c. **Capture current index:** Read existing `cd inbulk/do/indexInstruction.md` (if present) into memory for backup.

d. **Strip trigger and format:** … (unchanged logic)

e. **Backup old index:** Append a timestamped block to `cd inbulk/do/indexInstructionHistory.md` *before* overwriting.

f. **Overwrite index:** Write cleaned user prompt to `cd inbulk/do/indexInstruction.md`.

g. **Log changelog entry:** Append `YYYYMMDD‑HHMMSS | indexInstruction.md updated (source=run)` to `cd inbulk/do/CHANGELOG.md`.

---

### 1. Ensure `taskDefinition.json` Exists & Is Filled

a. **Check** `cd inbulk/do/taskDefinition.json`. Because this file is *seeded by previous run and never empty by policy*, treat a missing or zero‑length file as an error condition:

• If file **exists & empty** → go to **3.f.**
• If file **exists & non‑empty** → go to **1.b** (regeneration).

b. **Regenerate `taskDefinition.json`** (recovery / refresh path)

i. Copy `cd inbulk/do/taskGenerator.json` → `cd inbulk/do/workingOnTaskGenerator.json` (overwrite freely; no backup).
ii. …
iv. **Backup current `taskDefinition.json`** (`… | taskDefinition.json previous run`) per **Step 3a**.
v. Overwrite `cd inbulk/do/taskDefinition.json` with `cd inbulk/do/renderedTaskGenerator.json`.
vi. Log changelog entry: `… | taskDefinition.json regenerated from renderedTaskGenerator.json`.

---

### 2. Run the Authorised Prompt

a. **Execute** implement `cd inbulk/do/taskDefinition.json` *verbatim as a prompt*. This is the **only** prompt allowed to modify this repository (`inbulk` current branch).

b. **Post‑run scratch cleanup (recommended):** Truncate scratch files (`cd inbulk/do/workingOnTaskGenerator.json`, `cd inbulk/do/renderedTaskGenerator.json`) …

---

### 3. Backup, Error Reporting & Housekeeping (Safety Net)

(steps unchanged except every file path now begins with `cd inbulk/…`)

---

## 📌 Directory Map (quick reference)

```
/                            (rest of project)
└─ inbulk/
   └─ do/
      ├─ indexInstruction.md
      ├─ taskGenerator.json
      ├─ workingOnTaskGenerator.json
      ├─ renderedTaskGenerator.json
      ├─ taskDefinition.json
      ├─ indexInstructionHistory.md
      ├─ taskDefinitionHistory.md
      ├─ CHANGELOG.md
      └─ .runlock
```

**Follow Steps 0 → 4 every time you see `!run:`.** Whenever you reference one of these files, first `cd` into its path exactly as shown above.