ATLAS — Build 0.1 (Android-friendly prototype)

FILES
- index.html: app structure
- style.css: JARVIS-inspired black/blue interface
- script.js: chat demo, speech input where supported, and device text-to-speech

HOW TO OPEN IN ACODE
1. Extract ATLAS.zip into a folder named ATLAS.
2. Open index.html in Acode.
3. Use Acode's Preview / browser preview option to run the page.
4. If speech recognition does not work in the preview, try opening the page in Chrome or use text input.
5. Allow microphone permission only if you want to test voice input.

IMPORTANT LIMITATIONS
- This is the interface prototype, not a connected large language model.
- Replies are local demo responses, not genuine AI reasoning.
- Voice availability depends on Android/browser voices. Pitch and rate changes cannot guarantee two distinct male voices.
- Some browsers require HTTPS for speech recognition.
- Google Fonts needs internet; system fonts are used if it cannot load.
- No camera or image-analysis feature is included.
- Do not paste secret API keys into client-side JavaScript. For a real AI connection, we'll choose a safe free-access provider or a local model in the next phase.
