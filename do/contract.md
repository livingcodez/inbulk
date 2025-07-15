<!-- DO-ROOT -->

# Command Map
| token   | meaning |
|---------|---------|
| `!run:` | ① Open **/do/contract.md** ② Obey the back-to-front Workflow Contract below |

---

# Workflow Contract (plain English, algorithmic)

> **Execution direction:** work **backwards** from  
> `RefinedUserPrompt.md` → `implementWithoutRegression.md` → `taskGenerator.md` → `indexInstruction.md`.

## 0 Save / update user prompt
* Strip `!run:` + whitespace.  
* **Overwrite** `/do/indexInstruction.md` with that text. (Back up the old version first.)

## 1 Ensure `RefinedUserPrompt.md`
1. **Does `/do/RefinedUserPrompt.md` exist & look complete?**  
   *If yes → step 2.  If no → regenerate it from step 1.b.*
2. **Regenerate** if needed  
   a. Read `/do/implementWithoutRegression.md`.  
   b. Replace every `{{y}}` with the full current contents of `/do/taskDefinition.md`.  
   c. Overwrite `/do/RefinedUserPrompt.md` with the rendered result.  
   d. Save a copy of the old file to `history_do/RefinedUserPrompt-<YYYYMMDD-HHMM>.md`.

## 2 Ensure `taskDefinition.md`
1. **Does `/do/taskDefinition.md` exist & look complete?**  
   *If yes → step 3.  If no → regenerate it from step 2.b.*
2. **Regenerate** if needed  
   a. Read `/do/taskGenerator.md`.  
   b. Replace every `{{y}}` with the full current contents of `/do/indexInstruction.md`.  
   c. Overwrite `/do/taskDefinition.md`.  
   d. Back-up the previous version to `history_do/taskDefinition-<timestamp>.md`.

## 3 Authorised output
* **Execute** the content of `/do/RefinedUserPrompt.md` as the only prompt allowed to change anything outside `/do/`.

## 4 Back-ups
* Before **any** overwrite in `/do/`, copy the old file to  
  `history_do/{filename}-YYYYMMDD-HHMM.md` (create folder if missing).

---

# File Roles (quick reference)

| file                                   | role |
|----------------------------------------|------|
| `/do/indexInstruction.md`              | Raw user prompt (variable) |
| `/do/taskGenerator.md`                 | Constant x + variable y (`indexInstruction.md`) |
| `/do/taskDefinition.md`                | Output of taskGenerator |
| `/do/implementWithoutRegression.md`    | Constant x + variable y (`taskDefinition.md`) |
| `/do/RefinedUserPrompt.md`             | Final authorised prompt |


## 📂 Directory map *(All paths are relative to repo root.)*

/                             (all other existing project files)
└─ do/                        (doc-chain workspace — NEW)
   ├─ contract.md             ← root contract (opened first, always)
   ├─ indexInstruction.md     ← user prompt (over-written)
   ├─ taskGenerator.md        ← constant x + variable y
   ├─ taskDefinition.md       ← generated
   ├─ implementWithoutRegression.md  ← constant x + variable y
   └─ history_do/             ← automatic backups