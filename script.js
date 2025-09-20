// 1. 移动端菜单切换逻辑
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const icon = menuBtn.querySelector('i');
    if (mobileMenu.classList.contains('hidden')) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    } else {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    }
});

// 2. 锚点平滑滚动逻辑
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        if (!mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            const icon = menuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// 3. 返回顶部按钮逻辑
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.remove('opacity-0', 'invisible');
        backToTopBtn.classList.add('opacity-100', 'visible');
    } else {
        backToTopBtn.classList.remove('opacity-100', 'visible');
        backToTopBtn.classList.add('opacity-0', 'invisible');
    }

    // 4. 导航栏滚动样式变化
    const header = document.querySelector('header');
    if (window.pageYOffset > 50) {
        header.classList.add('py-2', 'shadow');
        header.classList.remove('py-3');
    } else {
        header.classList.add('py-3');
        header.classList.remove('py-2', 'shadow');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 5. 联系表单提交逻辑
const contactForm = document.querySelector('form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('感谢您的留言！我们会尽快回复您。');
        contactForm.reset();
    });
}

// 6. AI问答组件逻辑
const aiButton = document.getElementById('aiButton');
const aiChatWidget = document.getElementById('aiChatWidget');
const closeWidgetBtn = document.getElementById('closeWidget');
const widgetContainer = document.getElementById('aiWidgetContainer');

// 显示/隐藏问答窗口
aiButton.addEventListener('click', () => {
    if (aiChatWidget.classList.contains('opacity-0')) {
        // 显示窗口
        aiChatWidget.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
        aiChatWidget.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
    } else {
        // 隐藏窗口
        aiChatWidget.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
        aiChatWidget.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
    }
});

// 关闭按钮逻辑
closeWidgetBtn.addEventListener('click', () => {
    aiChatWidget.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
    aiChatWidget.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
});

// 球形按钮拖拽功能
let isDragging = false;
let startX, startY, startLeft, startTop;

aiButton.addEventListener('mousedown', (e) => {
    // 防止点击按钮时触发窗口显示
    if (e.target === aiButton || aiButton.contains(e.target)) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = widgetContainer.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        aiButton.classList.add('scale-125');
        document.body.style.userSelect = 'none'; // 防止拖拽时选中文本
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // 计算新位置并设置
    const newLeft = startLeft + dx;
    const newTop = startTop + dy;
    
    // 限制在可视区域内
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxLeft = viewportWidth - widgetContainer.offsetWidth;
    const maxTop = viewportHeight - widgetContainer.offsetHeight;
    
    widgetContainer.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
    widgetContainer.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
    widgetContainer.style.right = 'auto';
    widgetContainer.style.bottom = 'auto';
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        aiButton.classList.remove('scale-125');
        document.body.style.userSelect = '';
    }
});

// 7. 讯飞Spark Lite AI交互逻辑
const appid = 'e861a4a1';
const apiKey = '150c9c05fa524369ecf049992522fcea';
const apiSecret = 'OTJmZjQxMzc0MWQxY2I4OTJjZGY2ZDkx';

let ws = null;
let currentAiMessage = '';
let aiMessageElement = null;

function generateAuthHeaders(apiKey, apiSecret) {
    const date = new Date().toUTCString();
    const signatureOrigin = `host: spark-api.xf-yun.com\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
    const hmac = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    const signature = hmac.toString(CryptoJS.enc.Base64);
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = btoa(authorizationOrigin);
    return { authorization, date, host: 'spark-api.xf-yun.com' };
}

function connectWebSocket() {
    const authHeaders = generateAuthHeaders(apiKey, apiSecret);
    const url = `wss://spark-api.xf-yun.com/v1.1/chat?authorization=${encodeURIComponent(authHeaders.authorization)}&date=${encodeURIComponent(authHeaders.date)}&host=${encodeURIComponent(authHeaders.host)}`;
    
    ws = new WebSocket(url);
    
    ws.onopen = () => {
        console.log('WebSocket 连接成功（Spark Lite）');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleAiResponse(data);
    };
    
    ws.onclose = () => {
        console.log('WebSocket 连接关闭');
        ws = null;
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        showMessage('AI 服务连接出错，请稍后再试', 'ai');
    };
}

function sendMessageToAI(message) {
    if (!ws || ws.readyState !== 1) {
        connectWebSocket();
        setTimeout(() => {
            if (ws && ws.readyState === 1) {
                const payload = {
                    header: { app_id: appid, uid: 'user_' + Date.now() },
                    parameter: {
                        chat: { 
                            domain: 'lite',
                            temperature: 0.7, 
                            max_tokens: 2048 
                        }
                    },
                    payload: {
                        message: { 
                            text: [{ role: "user", content: message }]
                        }
                    }
                };
                ws.send(JSON.stringify(payload));
                showMessage(message, 'user');
            }
        }, 1000);
    } else {
        const payload = {
            header: { app_id: appid, uid: 'user_' + Date.now() },
            parameter: {
                chat: { 
                    domain: 'lite', 
                    temperature: 0.7, 
                    max_tokens: 2048 
                }
            },
            payload: {
                message: { 
                    text: [{ role: "user", content: message }]
                }
            }
        };
        ws.send(JSON.stringify(payload));
        showMessage(message, 'user');
    }
}

function handleAiResponse(data) {
    if (data.header.code === 0) {
        if (data.payload?.choices?.text) {
            const text = data.payload.choices.text[0].content;
            currentAiMessage += text;
            
            if (!aiMessageElement) {
                aiMessageElement = createMessageElement('', 'ai');
                document.getElementById('chatMessages').appendChild(aiMessageElement);
                scrollToBottom();
            }
            aiMessageElement.textContent = currentAiMessage;
        }
        
        if (data.header.status === 2) {
            aiMessageElement = null;
            currentAiMessage = '';
        }
    } else {
        showMessage('AI 响应错误：' + data.header.message, 'ai');
        aiMessageElement = null;
        currentAiMessage = '';
    }
}

function showMessage(content, type) {
    const messageElement = createMessageElement(content, type);
    document.getElementById('chatMessages').appendChild(messageElement);
    scrollToBottom();
}

function createMessageElement(content, type) {
    const div = document.createElement('div');
    div.className = `mb-2 flex ${type === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type === 'user' 
        ? 'bg-primary text-white' 
        : 'bg-gray-100 text-gray-800'} px-3 py-2 rounded-lg max-w-[70%]`;
    messageDiv.textContent = content;
    
    div.appendChild(messageDiv);
    return div;
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 绑定发送按钮事件
document.getElementById('sendMessage').addEventListener('click', () => {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (message) {
        sendMessageToAI(message);
        input.value = '';
    }
});

// 绑定回车发送事件
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('sendMessage').click();
    }
});
    