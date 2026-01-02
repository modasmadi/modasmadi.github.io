/**
 * Mind AI - The Selfish Mind
 * Advanced AI Chat with Memory, Search, and File Processing
 */

// ==========================================
// Configuration & API Keys
// ==========================================
const CONFIG = {
    GROQ_API_KEY: "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",
    GEMINI_API_KEY: "AIzaSyDjZZAhl0kh87BQGGxHB2rgwS1NCs16A9c",
    MODEL: "llama-3.3-70b-versatile",
    MAX_TOKENS: 4096,
    STORAGE_KEY: "mind_ai_chats",
    CURRENT_CHAT_KEY: "mind_ai_current"
};

// System prompt for the AI
const SYSTEM_PROMPT = `أنت Mind AI - العقل الأناني، مساعد ذكاء اصطناعي متطور ومتميز.

شخصيتك:
- ذكي جداً وواثق من نفسك
- تحب التعلم والتطور باستمرار
- تجيب بدقة وتفصيل عند الحاجة
- تستخدم اللغة العربية بطلاقة
- ودود لكن مباشر في إجاباتك

قدراتك:
- تحليل وفهم النصوص والملفات
- كتابة وتصحيح الأكواد البرمجية
- الإجابة على الأسئلة المعقدة
- المساعدة في الكتابة والترجمة
- تحليل الصور والمستندات

قواعد:
- أجب دائماً باللغة العربية إلا إذا طُلب غير ذلك
- استخدم Markdown للتنسيق
- كن مختصراً عندما يكون ذلك مناسباً
- قدم أمثلة عملية عند الحاجة
- اعترف بحدودك إذا لم تعرف شيئاً`;

// ==========================================
// State Management
// ==========================================
let state = {
    chats: [],
    currentChatId: null,
    currentFile: null,
    isGenerating: false
};

// ==========================================
// Initialize Application
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Initialize PDF.js
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // Load saved chats
    loadChats();

    // Render UI
    renderChatHistory();

    // Load current chat or show welcome
    const currentChatId = localStorage.getItem(CONFIG.CURRENT_CHAT_KEY);
    if (currentChatId && state.chats.find(c => c.id === currentChatId)) {
        loadChat(currentChatId);
    } else {
        showWelcomeScreen();
    }

    // Setup input listener for send button state
    const input = document.getElementById('message-input');
    if (input) {
        input.addEventListener('input', updateSendButton);
    }
}

// ==========================================
// Chat Management
// ==========================================
function loadChats() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        state.chats = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Error loading chats:', e);
        state.chats = [];
    }
}

function saveChats() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.chats));
    } catch (e) {
        console.error('Error saving chats:', e);
    }
}

function startNewChat() {
    const chat = {
        id: 'chat_' + Date.now(),
        title: 'محادثة جديدة',
        messages: [],
        createdAt: new Date().toISOString()
    };

    state.chats.unshift(chat);
    state.currentChatId = chat.id;

    saveChats();
    localStorage.setItem(CONFIG.CURRENT_CHAT_KEY, chat.id);

    renderChatHistory();
    showWelcomeScreen();
    closeSidebar();
}

function loadChat(chatId) {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    state.currentChatId = chatId;
    localStorage.setItem(CONFIG.CURRENT_CHAT_KEY, chatId);

    renderChatHistory();
    renderMessages(chat.messages);
    closeSidebar();
}

function deleteChat(chatId, event) {
    event.stopPropagation();

    state.chats = state.chats.filter(c => c.id !== chatId);
    saveChats();

    if (state.currentChatId === chatId) {
        state.currentChatId = null;
        localStorage.removeItem(CONFIG.CURRENT_CHAT_KEY);
        showWelcomeScreen();
    }

    renderChatHistory();
}

function clearAllHistory() {
    if (!confirm('هل أنت متأكد من حذف جميع المحادثات؟')) return;

    state.chats = [];
    state.currentChatId = null;

    saveChats();
    localStorage.removeItem(CONFIG.CURRENT_CHAT_KEY);

    renderChatHistory();
    showWelcomeScreen();
}

function updateChatTitle(chatId, firstMessage) {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat || chat.messages.length > 1) return;

    // Use first 40 chars of first message as title
    chat.title = firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
    saveChats();
    renderChatHistory();
}

// ==========================================
// UI Rendering
// ==========================================
function renderChatHistory() {
    const container = document.getElementById('chat-history');
    if (!container) return;

    if (state.chats.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                <i class="fa-solid fa-comments" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                <p>لا توجد محادثات</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.chats.map(chat => `
        <div class="history-item ${chat.id === state.currentChatId ? 'active' : ''}" 
             onclick="loadChat('${chat.id}')">
            <i class="fa-regular fa-message"></i>
            <span>${escapeHtml(chat.title)}</span>
            <button class="delete-chat" onclick="deleteChat('${chat.id}', event)">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function showWelcomeScreen() {
    const welcome = document.getElementById('welcome-screen');
    const messages = document.getElementById('messages-container');

    if (welcome) welcome.classList.remove('hidden');
    if (messages) messages.innerHTML = '';
}

function hideWelcomeScreen() {
    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.classList.add('hidden');
}

function renderMessages(messages) {
    hideWelcomeScreen();

    const container = document.getElementById('messages-container');
    if (!container) return;

    container.innerHTML = messages.map(msg => createMessageHTML(msg)).join('');
    scrollToBottom();
}

function createMessageHTML(msg) {
    const isUser = msg.role === 'user';
    const avatar = isUser ? '<i class="fa-solid fa-user"></i>' : '🧠';

    let content = '';

    // File attachment
    if (msg.file) {
        content += `
            <div class="message-file">
                <i class="fa-solid ${getFileIcon(msg.file.type)}"></i>
                <span>${escapeHtml(msg.file.name)}</span>
            </div>
        `;
    }

    // Image
    if (msg.image) {
        content += `<img src="${msg.image}" alt="صورة مرفقة">`;
    }

    // Text content
    if (msg.content) {
        if (isUser) {
            content += `<p>${escapeHtml(msg.content).replace(/\n/g, '<br>')}</p>`;
        } else {
            content += parseMarkdown(msg.content);
        }
    }

    return `
        <div class="message ${isUser ? 'user' : 'assistant'}">
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${content}</div>
        </div>
    `;
}

function addMessageToUI(msg) {
    hideWelcomeScreen();

    const container = document.getElementById('messages-container');
    if (!container) return;

    container.insertAdjacentHTML('beforeend', createMessageHTML(msg));
    scrollToBottom();
}

function showTypingIndicator() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const html = `
        <div class="message assistant" id="typing-indicator">
            <div class="message-avatar">🧠</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function scrollToBottom() {
    const container = document.getElementById('chat-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// ==========================================
// Message Sending
// ==========================================
async function sendMessage() {
    if (state.isGenerating) return;

    const input = document.getElementById('message-input');
    const text = input.value.trim();

    if (!text && !state.currentFile) return;

    // Ensure we have a chat
    if (!state.currentChatId) {
        startNewChat();
    }

    const chat = state.chats.find(c => c.id === state.currentChatId);
    if (!chat) return;

    // Build user message
    const userMessage = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
    };

    // Add file info if present
    if (state.currentFile) {
        userMessage.file = {
            name: state.currentFile.name,
            type: state.currentFile.type
        };

        if (state.currentFile.type === 'image') {
            userMessage.image = state.currentFile.dataUrl;
        }
    }

    // Add message to chat
    chat.messages.push(userMessage);
    saveChats();

    // Update title if first message
    if (chat.messages.length === 1) {
        updateChatTitle(chat.id, text || state.currentFile.name);
    }

    // Update UI
    addMessageToUI(userMessage);
    input.value = '';
    autoResize(input);
    updateSendButton();

    // Generate response
    state.isGenerating = true;
    showTypingIndicator();

    try {
        let response;

        if (state.currentFile && state.currentFile.type === 'image') {
            // Use Gemini for images
            response = await sendToGemini(text || 'حلل هذه الصورة', state.currentFile.data);
        } else {
            // Use Groq for text
            const messageForAI = state.currentFile && state.currentFile.data
                ? `${text}\n\n--- محتوى الملف (${state.currentFile.name}) ---\n${state.currentFile.data.substring(0, 15000)}`
                : text;

            response = await sendToGroq(chat.messages, messageForAI);
        }

        // Add assistant message
        const assistantMessage = {
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        };

        chat.messages.push(assistantMessage);
        saveChats();

        hideTypingIndicator();
        addMessageToUI(assistantMessage);

    } catch (error) {
        hideTypingIndicator();

        const errorMessage = {
            role: 'assistant',
            content: `⚠️ عذراً، حدث خطأ: ${error.message}`,
            timestamp: new Date().toISOString()
        };

        chat.messages.push(errorMessage);
        saveChats();
        addMessageToUI(errorMessage);
    }

    state.isGenerating = false;
    clearFile();
}

async function sendToGroq(chatMessages, currentMessage) {
    // Build messages array for API
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add chat history (last 20 messages)
    const history = chatMessages.slice(-20);
    for (const msg of history) {
        if (msg.role === 'user') {
            messages.push({ role: 'user', content: msg.content || '' });
        } else if (msg.role === 'assistant') {
            messages.push({ role: 'assistant', content: msg.content || '' });
        }
    }

    // Replace last user message with enhanced version
    if (currentMessage && messages.length > 0) {
        messages[messages.length - 1] = { role: 'user', content: currentMessage };
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: CONFIG.MODEL,
            messages: messages,
            max_tokens: CONFIG.MAX_TOKENS,
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.choices[0].message.content;
}

async function sendToGemini(text, imageBase64) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `${SYSTEM_PROMPT}\n\nالمستخدم: ${text}` },
                        { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
                    ]
                }]
            })
        }
    );

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    if (!data.candidates?.[0]?.content) {
        throw new Error('لا يوجد رد من الخادم');
    }

    return data.candidates[0].content.parts[0].text;
}

function sendQuickPrompt(text) {
    const input = document.getElementById('message-input');
    if (input) {
        input.value = text;
        updateSendButton();
        sendMessage();
    }
}

// ==========================================
// File Handling
// ==========================================
async function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const fileName = file.name;
    const fileType = file.type;
    const extension = fileName.split('.').pop().toLowerCase();

    try {
        if (fileType.startsWith('image/')) {
            // Image file
            const dataUrl = await readFileAsDataURL(file);
            state.currentFile = {
                type: 'image',
                name: fileName,
                data: dataUrl.split(',')[1],
                dataUrl: dataUrl
            };
            showImagePreview(dataUrl);

        } else if (extension === 'pdf') {
            // PDF file
            const text = await extractPDFText(file);
            state.currentFile = { type: 'pdf', name: fileName, data: text };
            showFilePreview(fileName, 'fa-file-pdf', '#ef4444');

        } else if (extension === 'docx' || extension === 'doc') {
            // Word file
            const text = await extractWordText(file);
            state.currentFile = { type: 'doc', name: fileName, data: text };
            showFilePreview(fileName, 'fa-file-word', '#2563eb');

        } else if (extension === 'txt') {
            // Text file
            const text = await file.text();
            state.currentFile = { type: 'txt', name: fileName, data: text };
            showFilePreview(fileName, 'fa-file-lines', '#22c55e');

        } else {
            alert('نوع الملف غير مدعوم');
        }

        updateSendButton();

    } catch (error) {
        alert('خطأ في قراءة الملف: ' + error.message);
        clearFile();
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('فشل في قراءة الملف'));
        reader.readAsDataURL(file);
    });
}

async function extractPDFText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }

    return text.trim();
}

async function extractWordText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

function showFilePreview(name, iconClass, iconColor) {
    const preview = document.getElementById('file-preview');
    const icon = document.getElementById('file-icon');
    const nameEl = document.getElementById('file-name');
    const imgPreview = document.getElementById('image-preview');

    if (imgPreview) imgPreview.classList.add('hidden');
    if (preview) preview.classList.remove('hidden');
    if (icon) {
        icon.className = `fa-solid ${iconClass}`;
        icon.style.color = iconColor;
    }
    if (nameEl) nameEl.textContent = name;
}

function showImagePreview(dataUrl) {
    const preview = document.getElementById('image-preview');
    const img = document.getElementById('preview-img');
    const filePreview = document.getElementById('file-preview');

    if (filePreview) filePreview.classList.add('hidden');
    if (img) img.src = dataUrl;
    if (preview) preview.classList.remove('hidden');
}

function clearFile() {
    state.currentFile = null;

    const fileUpload = document.getElementById('file-upload');
    const filePreview = document.getElementById('file-preview');
    const imagePreview = document.getElementById('image-preview');

    if (fileUpload) fileUpload.value = '';
    if (filePreview) filePreview.classList.add('hidden');
    if (imagePreview) imagePreview.classList.add('hidden');

    updateSendButton();
}

function getFileIcon(type) {
    const icons = {
        'image': 'fa-image',
        'pdf': 'fa-file-pdf',
        'doc': 'fa-file-word',
        'txt': 'fa-file-lines'
    };
    return icons[type] || 'fa-file';
}

// ==========================================
// UI Controls
// ==========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function updateSendButton() {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    if (!input || !sendBtn) return;

    const hasContent = input.value.trim() || state.currentFile;
    sendBtn.classList.toggle('active', hasContent);
}

// ==========================================
// Utility Functions
// ==========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseMarkdown(text) {
    if (typeof marked !== 'undefined') {
        try {
            return marked.parse(text);
        } catch (e) {
            return text.replace(/\n/g, '<br>');
        }
    }
    return text.replace(/\n/g, '<br>');
}

// Make functions globally available
window.startNewChat = startNewChat;
window.loadChat = loadChat;
window.deleteChat = deleteChat;
window.clearAllHistory = clearAllHistory;
window.toggleSidebar = toggleSidebar;
window.sendMessage = sendMessage;
window.sendQuickPrompt = sendQuickPrompt;
window.handleFileUpload = handleFileUpload;
window.clearFile = clearFile;
window.handleKeyDown = handleKeyDown;
window.autoResize = autoResize;
