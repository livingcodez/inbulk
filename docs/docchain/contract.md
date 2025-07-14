<!-- DOCCHAIN-ROOT -->

# Command Map
| token | meaning |
|-------|---------|
| `!run:` | **Open this file** and obey the Workflow Contract below. |

---

# Workflow Contract  (plain English, pure text)

1. **Save the user prompt**  
   * Strip `!run:` + whitespace.  
   * Write it to `.docs/docchain/data/indexInstruction.md` (overwrite).

2. **Generate tasks**  
   * Read `.docs/docchain/templates/taskGenerator.md`.  
   * Replace `{{y}}` with `.docs/docchain/data/indexInstruction.md`. 
   * Execute `.docs/docchain/templates/taskGenerator.md`.  
   * Write result to `.docs/docchain/data/taskDefinition.md`.

3. **Refine without regression**  
   * Read `.docs/docchain/templates/implementWithoutRegression.md`.  
   * Replace `{{y}}` with `.docs/docchain/data/taskDefinition.md`.   
   * Execute `.docs/docchain/templates/implementWithoutRegression.md`.  
   * Write result to `.docs/docchain/data/RefinedUserPrompt.md`.

4. **Authorised output**  
   * Only `.docs/docchain/data/RefinedUserPrompt.md` may instruct changes outside `.docchain/`.

5. **Back-ups**  
   * Before every overwrite, copy the previous version to `.docs/docchain/history/{filename}-YYYYMMDD-HHMM.md`.
