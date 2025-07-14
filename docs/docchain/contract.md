<!-- DOCCHAIN-ROOT -->

# Command Map
| token | meaning |
|-------|---------|
| `!run:` | **Open this file** and obey the Workflow Contract below. |

---

# Workflow Contract  (plain English, pure text)

1. **Save the user prompt**  
   * Strip `!run:` + whitespace.  
   * Write it to `.docchain/data/indexInstruction.md` (overwrite).

2. **Generate tasks**  
   * Read `.docchain/templates/taskGenerator.md`.  
   * Replace `{{y}}` with `.docchain/data/indexInstruction.md`. 
   * Execute `.docchain/templates/taskGenerator.md`.  
   * Write result to `.docchain/data/taskDefinition.md`.

3. **Refine without regression**  
   * Read `.docchain/templates/implementWithoutRegression.md`.  
   * Replace `{{y}}` with `.docchain/data/taskDefinition.md`.   
   * Execute `.docchain/templates/implementWithoutRegression.md`.  
   * Write result to `.docchain/data/RefinedUserPrompt.md`.

4. **Authorised output**  
   * Only `.docchain/data/RefinedUserPrompt.md` may instruct changes outside `.docchain/`.

5. **Back-ups**  
   * Before every overwrite, copy the previous version to `.docchain/history/{filename}-YYYYMMDD-HHMM.md`.
