const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const micBtn = document.getElementById('micBtn');
const voiceStatus = document.getElementById('voiceStatus');
const voiceStyle = document.getElementById('voiceStyle');
const systemVoice = document.getElementById('systemVoice');
const autoSpeak = document.getElementById('autoSpeak');
const serverUrlInput = document.getElementById('serverUrl');
const accessCodeInput = document.getElementById('accessCode');
const saveConnectionBtn = document.getElementById('saveConnection');
const sendBtn = document.getElementById('sendBtn');
const connectionStatus = document.getElementById('connectionStatus');
const aiStatus = document.getElementById('aiStatus');
let availableVoices = [];
let recognition = null;
let conversation = [];
let sending = false;

serverUrlInput.value = localStorage.getItem('atlasServerUrl') || '';
accessCodeInput.value = sessionStorage.getItem('atlasAccessCode') || '';

function addMessage(text, who) {
  const row = document.createElement('div');
  row.className = `message ${who === 'user' ? 'user-message' : 'atlas-message'}`;
  const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.textContent = who === 'user' ? 'Y' : 'A';
  const wrap = document.createElement('div'); wrap.className = 'bubble-wrap';
  const sender = document.createElement('div'); sender.className = 'sender'; sender.textContent = who === 'user' ? 'YOU' : 'ATLAS';
  if (who !== 'user') { const tag = document.createElement('span'); tag.textContent = 'ASSISTANT'; sender.appendChild(tag); }
  const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = text;
  wrap.append(sender, bubble); row.append(avatar, wrap); chatLog.appendChild(row); chatLog.scrollTop = chatLog.scrollHeight;
  return bubble;
}
function setStatus(text, state = '') {
  connectionStatus.textContent = text;
  connectionStatus.parentElement.classList.toggle('connected', state === 'connected');
  connectionStatus.parentElement.classList.toggle('error', state === 'error');
  aiStatus.textContent = state === 'connected' ? 'CONNECTED' : state === 'error' ? 'OFFLINE' : 'CHECKING';
}
function getBaseUrl() { return serverUrlInput.value.trim().replace(/\/+$/, ''); }
async function testConnection(showMessage = true) {
  const base = getBaseUrl();
  if (!base) { setStatus('SERVER NEEDED', 'error'); if (showMessage) addMessage('Paste your deployed ATLAS server URL in Configuration first.', 'atlas'); return false; }
  try {
    const response = await fetch(`${base}/api/health`, { method: 'GET' });
    if (!response.ok) throw new Error('Server health check failed');
    const data = await response.json();
    if (!data.configured) throw new Error('Server is online, but its Gemini key or access code is not configured.');
    setStatus('SERVER LINKED', 'connected');
    if (showMessage) addMessage('Connection successful. ATLAS server is online. Enter your access code and send a message.', 'atlas');
    return true;
  } catch (error) {
    setStatus('LINK FAILED', 'error');
    if (showMessage) addMessage(`Could not connect to the server. ${error.message || 'Check the URL and internet connection.'}`, 'atlas');
    return false;
  }
}
saveConnectionBtn.addEventListener('click', async () => {
  localStorage.setItem('atlasServerUrl', getBaseUrl());
  sessionStorage.setItem('atlasAccessCode', accessCodeInput.value);
  saveConnectionBtn.disabled = true; saveConnectionBtn.textContent = 'TESTING…';
  await testConnection(true);
  saveConnectionBtn.disabled = false; saveConnectionBtn.textContent = 'SAVE & TEST CONNECTION';
});
document.getElementById('forgetCode').addEventListener('click', () => {
  sessionStorage.removeItem('atlasAccessCode'); accessCodeInput.value = '';
  addMessage('Access code removed from this browser tab.', 'atlas');
});
if (getBaseUrl()) testConnection(false); else setStatus('SERVER NEEDED', 'error');

function getSelectedVoice() {
  const chosen = systemVoice.value;
  if (chosen) return availableVoices.find(v => v.name === chosen) || null;
  const langVoices = availableVoices.filter(v => /^en(-|_)/i.test(v.lang));
  if (voiceStyle.value === 'commander') return langVoices.find(v => /male|daniel|david|mark|guy|aaron|fred/i.test(v.name)) || langVoices[0] || availableVoices[0] || null;
  return langVoices.find(v => /male|daniel|david|mark|guy|aaron|fred|natural|enhanced/i.test(v.name)) || langVoices[0] || availableVoices[0] || null;
}
function speak(text) {
  if (!('speechSynthesis' in window) || !autoSpeak.checked) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'en-US'; utterance.voice = getSelectedVoice();
  if (voiceStyle.value === 'commander') { utterance.rate = 0.88; utterance.pitch = 0.78; }
  else { utterance.rate = 1.0; utterance.pitch = 0.98; }
  window.speechSynthesis.speak(utterance);
}
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  availableVoices = window.speechSynthesis.getVoices(); const old = systemVoice.value;
  systemVoice.replaceChildren(); const defaultOption = document.createElement('option'); defaultOption.value = ''; defaultOption.textContent = 'Default system voice'; systemVoice.appendChild(defaultOption);
  availableVoices.forEach(v => { const option = document.createElement('option'); option.value = v.name; option.textContent = `${v.name} (${v.lang})`; systemVoice.appendChild(option); });
  if (availableVoices.some(v => v.name === old)) systemVoice.value = old;
}
if ('speechSynthesis' in window) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message || sending) return;
  const base = getBaseUrl();
  const accessCode = accessCodeInput.value || sessionStorage.getItem('atlasAccessCode') || '';
  if (!base) { addMessage('Before chatting, enter your deployed ATLAS server URL in Configuration.', 'atlas'); return; }
  if (!accessCode) { addMessage('Enter the ATLAS access code in Configuration, then tap SAVE & TEST CONNECTION.', 'atlas'); accessCodeInput.focus(); return; }
  addMessage(message, 'user'); conversation.push({ role: 'user', text: message });
  conversation = conversation.slice(-12); messageInput.value = ''; sending = true; sendBtn.disabled = true; micBtn.disabled = true;
  const pending = addMessage('Processing your request…', 'atlas');
  try {
    const response = await fetch(`${base}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ATLAS-ACCESS-CODE': accessCode },
      body: JSON.stringify({ messages: conversation })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    pending.textContent = data.reply;
    conversation.push({ role: 'assistant', text: data.reply }); conversation = conversation.slice(-12);
    chatLog.scrollTop = chatLog.scrollHeight; speak(data.reply); setStatus('AI CONNECTED', 'connected');
  } catch (error) {
    pending.textContent = `ATLAS could not answer: ${error.message || 'Network error'}`;
    if (error instanceof TypeError) pending.textContent += ' Check your internet, HTTPS server URL, and that the server is deployed.';
    conversation.pop(); setStatus('REQUEST FAILED', 'error');
  } finally { sending = false; sendBtn.disabled = false; micBtn.disabled = false; messageInput.focus(); }
});

document.getElementById('clearBtn').addEventListener('click', () => {
  conversation = []; chatLog.replaceChildren();
  addMessage('Conversation cleared from this page. ATLAS is ready for your next command.', 'atlas');
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
});
function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { voiceStatus.textContent = 'SPEECH RECOGNITION NOT AVAILABLE IN THIS BROWSER. TRY CHROME OR TYPE YOUR MESSAGE.'; return; }
  if (recognition) { recognition.stop(); return; }
  recognition = new SpeechRecognition(); recognition.lang = 'en-NG'; recognition.interimResults = false; recognition.maxAlternatives = 1;
  recognition.onstart = () => { micBtn.classList.add('listening'); voiceStatus.textContent = 'LISTENING… SPEAK NOW'; };
  recognition.onresult = (event) => { messageInput.value = event.results[0][0].transcript; voiceStatus.textContent = 'VOICE CAPTURED · REVIEW OR SEND YOUR MESSAGE'; messageInput.focus(); };
  recognition.onerror = (event) => { voiceStatus.textContent = `VOICE INPUT ERROR: ${event.error}. YOU CAN TYPE INSTEAD.`; };
  recognition.onend = () => { micBtn.classList.remove('listening'); recognition = null; if (voiceStatus.textContent === 'LISTENING… SPEAK NOW') voiceStatus.textContent = 'VOICE INPUT READY · SPEECH SUPPORT DEPENDS ON YOUR BROWSER'; };
  recognition.start();
}
micBtn.addEventListener('click', startListening);
if (!('speechSynthesis' in window)) voiceStatus.textContent = 'TEXT CHAT AVAILABLE · THIS BROWSER DOES NOT SUPPORT SPEECH OUTPUT';
