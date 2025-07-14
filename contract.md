<!-- DO-ROOT -->

# Command Map
| token | meaning |
|-------|---------|
| `!run:` | **Open this file** and obey the Workflow Contract below. |

---

# Workflow Contract  (plain English, pure text)

1. **Save the user prompt**  
   * Strip `!run:` + whitespace.  
   * Write it to `.do/data/indexInstruction.md` (overwrite).

2. **Generate tasks**  
   * Read `.do/templates/taskGenerator.md`.  
   * Replace `{{y}}` with the content of `.do/data/indexInstruction.md`. 
   * Execute the content of `.do/templates/taskGenerator.md`as a prompt.  
   * Write result to `.do/data/taskDefinition.md`.

3. **Refine without regression**  
   * Read `.do/templates/implementWithoutRegression.md`.  
   * Replace `{{y}}` with the content of `.do/data/taskDefinition.md`.   
   * Execute the content of `.do/templates/implementWithoutRegression.md` as a prompt.  
   * Write result to `.do/data/RefinedUserPrompt.md`.

4. **Authorised output**  
   * Treat `.doc/data/RefinedUserPrompt.md` as the final copy of the users intitial prompt with authorization to make changes to this repo(changes outside)`.do/`.

5. **Back-ups**  
   * Before every overwrite, copy the previous version to `.do/history/{filename}-YYYYMMDD-HHMM.md`.
