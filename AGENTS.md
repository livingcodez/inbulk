   0. in taskManager.json the key  `"Received_Input"` represents any user input(string array) needed for the task generation job(executing `taskManager.json`).
   1. ask `taskManager.json` for the complete json object of `"Received_Input"` based on taskManager.json's task generation framework and then overwrite `taskDefinitionStream`.json with the response from `taskManager.json`.
   2. execute `taskDefinitionStream.json`.

