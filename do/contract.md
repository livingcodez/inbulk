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
   * overwrite the result of the execution to `taskDefinition.md`. `taskDefinition.md` is located at the folder `do`, the folder `do` is located at the root folder.

2. (b) **Refine without regression**  
   * Read `implementWithoutRegression.md`. `implementWithoutRegression.md` is located at the folder `do`, the folder `do` is located at the root folder.
   * Replace the variable `{{y}}` with its value. the value of `{{y}}` for `implementWithoutRegression.md` is `taskDefinition.md`.   
   * Execute the content of `implementWithoutRegression.md` as a prompt.  
   * Overwrite the result of the execution to `RefinedUserPrompt.md`. `RefinedUserPrompt.md` is located at the folder `do`, the folder `do` is located at the root folder.

3. **Authorised output**  
   * Execute the content of `RefinedUserPrompt.md` as a prompt.

4. **Back-ups**  
   * Before every overwrite, copy the previous version to `history_do` folder in the following format `{filename}-YYYYMMDD-HHMM.md`. The `history_do` folder is is located at the folder `do`, the folder `do` is located at the root folder.
