<!-- DO-ROOT -->

# Command Map
| token | meaning |
|-------|---------|
| `!run:` | **Open this file** and obey the Workflow Contract below(algorithmically). |

---

# Workflow Contract  (plain English, pure text)

1. **Save the user prompt**  
   * Strip `!run:` + whitespace.  
   * Write(overwrite) it to `indexInstruction.md`. `indexInstruction.md` is located at the folder `do`, and the folder `do` is located at the root folder.

2. **Rifinery**
   * run `indexInstruction.md` through `taskGenerator.md` and `implementWithoutRegression.md` in the following manner:

2. (a) **Generate tasks**  
   * Read `taskGenerator.md`. `taskGenerator.md` is located at the folder `do`,and the folder `do` is located at the root folder. 
   * Replace the variable `{{y}}` with is value. the value of `{{y}}` for `taskGenerator.md` is `indexInstruction.md`. 
   * Execute the content of `taskGenerator.md`as a prompt.  
   * Write result to `taskDefinition.md`. `taskDefinition.md` is located at the folder `do`, the folder `do` is located at the root folder.

2. (b) **Refine without regression**  
   * Read `.do/templates/implementWithoutRegression.md`.  
   * Replace the variable `{{y}}` with its value. the value of `{{y}}` for `implementWithoutRegression.md` is `.do/data/taskDefinition.md`.   
   * Execute the content of `implementWithoutRegression.md` as a prompt.  
   * Write result to `.do/data/RefinedUserPrompt.md`.

4. **Authorised output**  
   * Execute `RefinedUserPrompt.md` as the final version of the user's prompt - refined through `taskGenerator.md` and `implementWithoutRegression.md`, and authorization it to make changes to this repo(changes outside) `do` folder.

5. **Back-ups**  
   * Before every overwrite, copy the previous version to `.do/history/{filename}-YYYYMMDD-HHMM.md`.
