const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const micBtn = document.getElementById('micBtn');
const voiceStatus = document.getElementById('voiceStatus');
const voiceStyle = document.getElementById('voiceStyle');
const systemVoice = document.getElementById('systemVoice');
const autoSpeak = document.getElementById('autoSpeak');
let availableVoices = [];
let recognition = null;

/**
 * @param {string} text
 * @param {'user' | 'atlas'} who
 */
function addMessage(text, who) {
  const row = document.createElement('div');
  row.className = `message ${who === 'user' ? 'user-message' : 'atlas-message'}`;
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = who === 'user' ? 'Y' : 'A';
  const wrap = document.createElement('div');
  wrap.className = 'bubble-wrap';
  const sender = document.createElement('div');
  sender.className = 'sender';
  sender.textContent = who === 'user' ? 'YOU' : 'ATLAS';
  if (who !== 'user') {
    const tag = document.createElement('span');
    tag.textContent = 'ASSISTANT';
    sender.appendChild(tag);
  }
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  wrap.append(sender, bubble);
  row.append(avatar, wrap);
  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
}

/** @param {string} message */
function demoReply(message) {
  const m = message.toLowerCase();
  if (/\b(hello|hi|hey|good morning|good evening)\b/.test(m)) {
    return 'Hello. ATLAS is online and ready to assist. This is the interface prototype; my full AI brain has not been connected yet.';
  }
  if (m.includes('your name') || m.includes('who are you')) {
    return 'I am ATLAS: your planned personal AI assistant. My design combines a loyal assistant with tactical, analytical thinking.';
  }
  if (m.includes('voice')) {
    return 'Use Voice Configuration below to switch between Commander and Companion styles. The actual sound depends on the voices installed on your Android device.';
  }
  if (m.includes('vision') || m.includes('camera') || m.includes('image')) {
    return 'ATLAS is being designed without vision features. This prototype does not request camera access or analyze images.';
  }
  if (m.includes('help')) {
    return 'You can type a message, tap the microphone if your browser supports speech recognition, or change the voice settings below. The next development step is connecting a real AI model.';
  }
  return 'Message received. This is a local prototype, so I cannot reason about that request yet. Once we connect an AI model, ATLAS will be able to generate intelligent answers. No API key is needed for this demo.';
}

function getSelectedVoice() {
  const chosen = systemVoice.value;
  if (chosen) return availableVoices.find(v => v.name === chosen) || null;
  const langVoices = availableVoices.filter(v => /^en(-|_)/i.test(v.lang));
  if (voiceStyle.value === 'commander') {
    return langVoices.find(v => /male|daniel|david|mark|guy|aaron|fred/i.test(v.name)) || langVoices[0] || availableVoices[0] || null;
  }
  return langVoices.find(v => /male|daniel|david|mark|guy|aaron|fred|natural|enhanced/i.test(v.name)) || langVoices[0] || availableVoices[0] || null;
}

/** @param {string} text */
function speak(text) {
  if (!('speechSynthesis' in window) || !autoSpeak.checked) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.voice = getSelectedVoice();
  if (voiceStyle.value === 'commander') {
    utterance.rate = 0.88;
    utterance.pitch = 0.78;
  } else {
    utterance.rate = 1.0;
    utterance.pitch = 0.98;
  }
  window.speechSynthesis.speak(utterance);
}

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  availableVoices = window.speechSynthesis.getVoices();
  const old = systemVoice.value;
  systemVoice.replaceChildren();
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Default system voice';
  systemVoice.appendChild(defaultOption);
  availableVoices.forEach(v => {
    const option = document.createElement('option');
    option.value = v.name;
    option.textContent = `${v.name} (${v.lang})`;
    systemVoice.appendChild(option);
  });
  if (availableVoices.some(v => v.name === old)) systemVoice.value = old;
}
if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  addMessage(message, 'user');
  messageInput.value = '';
  const reply = demoReply(message);
  window.setTimeout(() => {
    addMessage(reply, 'atlas');
    speak(reply);
  }, 250);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  chatLog.replaceChildren();
  addMessage('Conversation cleared. ATLAS is ready for your next command.', 'atlas');
});

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceStatus.textContent = 'SPEECH RECOGNITION NOT AVAILABLE IN THIS BROWSER. TRY CHROME OR TYPE YOUR MESSAGE.';
    return;
  }
  if (recognition) {
    recognition.stop();
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'en-NG';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => {
    micBtn.classList.add('listening');
    voiceStatus.textContent = 'LISTENING… SPEAK NOW';
  };
  recognition.onresult = (/** @type {{ results: ArrayLike<ArrayLike<{ transcript: string }>> }} */ event) => {
    messageInput.value = event.results[0][0].transcript;
    voiceStatus.textContent = 'VOICE CAPTURED · REVIEW OR SEND YOUR MESSAGE';
    messageInput.focus();
  };
  recognition.onerror = (/** @type {{ error: string }} */ event) => {
    voiceStatus.textContent = `VOICE INPUT ERROR: ${event.error}. YOU CAN TYPE INSTEAD.`;
  };
  recognition.onend = () => {
    micBtn.classList.remove('listening');
    recognition = null;
    if (voiceStatus.textContent === 'LISTENING… SPEAK NOW') {
      voiceStatus.textContent = 'VOICE INPUT READY · SPEECH SUPPORT DEPENDS ON YOUR BROWSER';
    }
  };
  recognition.start();
}
micBtn.addEventListener('click', startListening);

if (!('speechSynthesis' in window)) {
  voiceStatus.textContent = 'TEXT CHAT AVAILABLE · THIS BROWSER DOES NOT SUPPORT SPEECH OUTPUT';
}
