ATLAS AI — SECURE GEMINI CONNECTION (ANDROID-FRIENDLY)
=====================================================

WHAT THIS BUILD DOES
- Connects ATLAS to Google's Gemini model through a server-side API call.
- Keeps the Gemini API key on the server, never in browser JavaScript.
- Adds an access-code gate and basic request limiting.
- Keeps your existing dark blue interface and device speech input/output.
- Does not add camera or image features.

IMPORTANT
The AI provider may have free-tier quotas, account/region requirements, and changing model availability. Check the current Google AI Studio/Gemini API terms and usage limits before relying on it. Hosting may also have limits. Never publish your API key or access code.

FILES
- index.html, style.css, script.js: browser interface
- server.js: backend proxy; this is where the secret API key is read
- package.json: Node server dependency/start command
- .env.example: names of required secrets only; it contains no real key
- .gitignore: prevents .env and node_modules from being committed

PART A — CREATE YOUR GEMINI API KEY
1. On your Android phone, open https://aistudio.google.com/apikey in Chrome.
2. Sign in and create an API key if your account is eligible.
3. Copy the key temporarily. Do not send it to anyone or paste it into index.html/script.js.

PART B — UPLOAD THE PROJECT TO GITHUB USING YOUR PHONE
1. Extract ATLAS_AI_Upgrade.zip using your phone's file manager or an archive app.
2. Open https://github.com in Chrome and sign in/create an account.
3. Create a NEW private repository, for example atlas-personal-ai. Do not upload any real .env file or API key.
4. Use the repository's Add file / Upload files option to upload the contents of the extracted ATLAS_AI_Upgrade folder. Include the hidden .gitignore file if the mobile interface lets you. Do not upload node_modules or any .env file.
5. Commit the files to the repository's main branch. Make sure package.json, server.js, index.html, script.js, and style.css are at the repository root, not nested in an extra folder.

PART C — DEPLOY THE BACKEND ON RENDER
1. Open https://render.com in Chrome and sign in.
2. Choose New +, then Web Service. Connect your GitHub account and select your private atlas-personal-ai repository.
3. Use these settings:
   - Runtime/language: Node
   - Build command: npm install
   - Start command: npm start
   - Plan: choose an available plan. A free web service may sleep when idle and take time to wake up.
4. Before or after deployment, open the service's Environment section and add these variables:
   GEMINI_API_KEY = your actual key from Part A
   ATLAS_ACCESS_CODE = a long, unique password you create (at least 24 random characters is a good target)
   GEMINI_MODEL = gemini-flash-latest
5. Save and deploy/redeploy. Wait until the service says Live.
6. Copy the public HTTPS URL Render gives your service, such as https://your-service.onrender.com. The example is not your real URL.
7. Open https://YOUR-SERVICE-URL/api/health in Chrome. It should return JSON containing "ok":true and "configured":true. If configured is false, check the two required environment variables and redeploy.

PART D — CONNECT THE ANDROID INTERFACE
1. Open the deployed Render URL in Chrome. This serves the ATLAS app and backend from the same site.
2. Scroll down to Configuration.
3. Paste the Render HTTPS URL into ATLAS server URL.
4. Enter the ATLAS_ACCESS_CODE value you set in Render (not the Gemini API key).
5. Tap SAVE & TEST CONNECTION. A successful check says the server is linked.
6. Send a message. The first request after the server has been idle may take longer.
7. Optionally use Chrome's menu → Add to Home screen to make ATLAS easier to open.

TROUBLESHOOTING
- "Server needed": paste the full https:// URL from Render, with no trailing path.
- "Server is online, but ... not configured": add GEMINI_API_KEY and ATLAS_ACCESS_CODE in Render Environment, then redeploy.
- "Access code not accepted": the access code entered in ATLAS must exactly match ATLAS_ACCESS_CODE in Render.
- "AI provider rejected the server API key": check the Gemini key in Render Environment; do not put it into the app.
- 429 / usage limit: wait and retry; check Google AI Studio usage/quota and the Render service limits.
- Slow first reply: free hosting may spin down after inactivity; wait for it to wake up and retry.
- Speech recognition: browser/device support varies. Typing still works.
- If GitHub mobile upload hides .gitignore, you can still deploy, but be extra careful never to upload a .env file.

SECURITY NOTES
- Do not share the Gemini key or ATLAS access code in chat, screenshots, or public repositories.
- If the Gemini key is exposed, revoke/rotate it in Google AI Studio immediately.
- The access code is a simple shared gate, not a full user-account system. Do not use it for sensitive or high-risk workloads.
- The server includes a lightweight per-IP rate limit; it is not a substitute for usage monitoring or a stronger auth system if ATLAS becomes public.
- Chat messages are sent to Google's Gemini service to generate replies. Do not send information you do not want processed by that provider.

OFFICIAL LINKS
Google AI Studio API keys: https://aistudio.google.com/apikey
Gemini API docs: https://ai.google.dev/gemini-api/docs
Render deploy guide: https://render.com/docs/web-services
Render environment variables: https://render.com/docs/configure-environment-variables
GitHub: https://github.com
