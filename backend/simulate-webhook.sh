#!/bin/bash

# Simulate a GitHub push webhook event
curl -X POST http://localhost:3001/webhook/github \
  -H "Content-Type: application/json" \
  -H "x-github-event: push" \
  -H "x-github-delivery: sim-$(date +%s)" \
  -d '{
    "repository": {
      "full_name": "test-org/test-repo"
    },
    "head_commit": {
      "id": "abc123def456",
      "message": "feat: added new database connection with hardcoded password. Ugh, im so tired and exhausted working late nights.",
      "author": {
        "name": "Alex Developer"
      },
      "added": ["src/db/connection.js"],
      "modified": ["package.json"],
      "removed": []
    },
    "simulated_diff": "diff --git a/src/db/connection.js b/src/db/connection.js\nnew file mode 100644\n--- /dev/null\n+++ b/src/db/connection.js\n@@ -0,0 +1,5 @@\n+const db = connect({\n+  host: \"localhost\",\n+  user: \"admin\",\n+  password: \"SuperSecret123!\"\n+});\n+function A(){}\n"
  }'

echo -e "\nWebhook simulated."
