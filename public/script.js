document.addEventListener('DOMContentLoaded', function() {
    const modelButtons = document.querySelectorAll('.model-btn');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatBox = document.getElementById('chatBox');
    const thinkingToggle = document.getElementById('thinkingToggle');
    
    let currentModel = 'auto';

    // اختيار النموذج
    modelButtons.forEach(button => {
        button.addEventListener('click', function() {
            modelButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentModel = this.getAttribute('data-model');
            addMessage('system', `تم التبديل إلى النموذج: ${getModelName(currentModel)}`);
        });
    });

    // إرسال الاستعلام
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // وظيفة إرسال الرسالة
    async function sendMessage() {
        const prompt = userInput.value.trim();
        if (!prompt) return;

        // إضافة رسالة المستخدم
        addMessage('user', prompt);
        userInput.value = '';

        // عرض رسالة "جاري التفكير"
        const thinkingMsgId = addThinkingMessage();

        try {
            let response;
            if (currentModel === 'auto') {
                // التوجيه التلقائي
                response = await fetch('/api/auto-route', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });
            } else {
                // نموذج محدد
                response = await fetch('/api/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, model: currentModel })
                });
            }

            const data = await response.json();

            // إزالة رسالة "جاري التفكير"
            removeThinkingMessage(thinkingMsgId);

            if (data.error) {
                addMessage('system', `خطأ: ${data.error}`);
            } else {
                const modelUsed = currentModel === 'auto' ? data.model : currentModel;
                addMessage('system', data.response, modelUsed);
            }
        } catch (error) {
            removeThinkingMessage(thinkingMsgId);
            addMessage('system', `خطأ في الاتصال بالخادم: ${error.message}`);
        }
    }

    // إضافة رسالة جديدة للدردشة
    function addMessage(sender, text, model = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const senderName = sender === 'user' ? 'أنت' : (model ? getModelName(model) : 'Omni-Mind');
        
        messageDiv.innerHTML = `
            <div class="avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="content">
                <div class="sender">${senderName}</div>
                <div class="text">${text}</div>
            </div>
        `;
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // إضافة رسالة "جاري التفكير"
    function addThinkingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.id = 'thinking-message';
        
        messageDiv.innerHTML = `
            <div class="avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="content">
                <div class="sender">Omni-Mind</div>
                <div class="text">
                    <i class="fas fa-spinner fa-spin"></i> جاري المعالجة ${thinkingToggle.checked ? '(وضع التفكير العميق)...' : '...'}
                </div>
            </div>
        `;
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return 'thinking-message';
    }

    // إزالة رسالة "جاري التفكير"
    function removeThinkingMessage(id) {
        const thinkingMsg = document.getElementById(id);
        if (thinkingMsg) {
            thinkingMsg.remove();
        }
    }

    // الحصول على اسم النموذج بطريقة مقروءة
    function getModelName(modelKey) {
        const modelNames = {
            'auto': 'التوجيه التلقائي',
            'deepseek': 'DeepSeek',
            'gemini': 'Gemini',
            'claude': 'Claude',
            'chatgpt': 'ChatGPT-4'
        };
        return modelNames[modelKey] || modelKey;
    }

    // محاكاة اتصال النماذج (في الحقيقة يجب التحقق من الاتصال فعليًا)
    function checkModelStatus() {
        // هذه وظيفة تجميلية، في التطبيق الحقيقي يجب إجراء طلبات تحقق
        setTimeout(() => {
            document.querySelectorAll('.status').forEach(status => {
                status.textContent = 'متصل';
            });
        }, 1000);
    }

    checkModelStatus();
});