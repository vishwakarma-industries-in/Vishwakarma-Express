// AI Assistant Component - Gemini 2.0 Flash Integration
export class AIAssistant {
    constructor() {
        this.apiKey = 'AIzaSyBb5PODqrabPjKD5_t_Vg7hoOqwabn_TxE';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        this.isVisible = false;
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
        
        this.init();
    }

    async init() {
        this.createSidebar();
        this.setupEventListeners();
        this.loadConversationHistory();
    }

    createSidebar() {
        // Create AI sidebar
        const sidebar = document.createElement('div');
        sidebar.id = 'ai-sidebar';
        sidebar.className = 'ai-sidebar';
        
        sidebar.innerHTML = `
            <div class="ai-header">
                <div class="ai-title">
                    <div class="ai-icon">🤖</div>
                    <h3>Vishwakarma AI</h3>
                </div>
                <button class="ai-close" id="ai-close-btn" title="Close AI Assistant">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <div class="ai-content">
                <div class="ai-chat" id="ai-chat">
                    <div class="ai-welcome">
                        <div class="ai-avatar">🤖</div>
                        <div class="ai-message">
                            <p>Hello! I'm Vishwakarma AI, your intelligent browsing assistant powered by Gemini 2.0 Flash.</p>
                            <p>I can help you with:</p>
                            <ul>
                                <li>🔍 Summarizing web pages</li>
                                <li>💡 Answering questions about content</li>
                                <li>🔗 Finding related information</li>
                                <li>📝 Explaining complex topics</li>
                                <li>🛠️ Web development assistance</li>
                            </ul>
                            <p>How can I assist you today?</p>
                        </div>
                    </div>
                </div>
                
                <div class="ai-suggestions" id="ai-suggestions">
                    <div class="suggestion-chip" data-prompt="Summarize this page">📄 Summarize Page</div>
                    <div class="suggestion-chip" data-prompt="Explain the main concepts on this page">💡 Explain Concepts</div>
                    <div class="suggestion-chip" data-prompt="Find related topics">🔗 Related Topics</div>
                    <div class="suggestion-chip" data-prompt="Help me understand this better">❓ Need Help</div>
                </div>
                
                <div class="ai-input-container">
                    <div class="ai-input-wrapper">
                        <textarea 
                            id="ai-input" 
                            class="ai-input" 
                            placeholder="Ask me anything about this page or the web..."
                            rows="1"
                        ></textarea>
                        <button id="ai-send-btn" class="ai-send-btn" title="Send message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="ai-controls">
                        <button id="ai-clear-btn" class="ai-control-btn" title="Clear conversation">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                            Clear
                        </button>
                        <button id="ai-context-btn" class="ai-control-btn" title="Include page context">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            <span id="context-status">Context: ON</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
    }

    setupEventListeners() {
        // AI toggle button in toolbar
        const aiBtn = document.getElementById('ai-btn');
        if (aiBtn) {
            aiBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Close button
        document.getElementById('ai-close-btn').addEventListener('click', () => this.hideSidebar());

        // Send button and input
        document.getElementById('ai-send-btn').addEventListener('click', () => this.sendMessage());
        const input = document.getElementById('ai-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => this.autoResizeTextarea(input));

        // Suggestion chips
        document.getElementById('ai-suggestions').addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const prompt = e.target.dataset.prompt;
                this.sendMessage(prompt);
            }
        });

        // Control buttons
        document.getElementById('ai-clear-btn').addEventListener('click', () => this.clearConversation());
        document.getElementById('ai-context-btn').addEventListener('click', () => this.toggleContext());

        // Keyboard shortcut (Ctrl+Shift+A)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.toggleSidebar();
            }
        });
    }

    toggleSidebar() {
        if (this.isVisible) {
            this.hideSidebar();
        } else {
            this.showSidebar();
        }
    }

    showSidebar() {
        const sidebar = document.getElementById('ai-sidebar');
        const mainContent = document.querySelector('.browser-container');
        
        sidebar.classList.add('visible');
        mainContent.classList.add('ai-sidebar-open');
        this.isVisible = true;

        // Focus input
        setTimeout(() => {
            document.getElementById('ai-input').focus();
        }, 300);
    }

    hideSidebar() {
        const sidebar = document.getElementById('ai-sidebar');
        const mainContent = document.querySelector('.browser-container');
        
        sidebar.classList.remove('visible');
        mainContent.classList.remove('ai-sidebar-open');
        this.isVisible = false;
    }

    async sendMessage(customPrompt = null) {
        const input = document.getElementById('ai-input');
        const message = customPrompt || input.value.trim();
        
        if (!message) return;

        // Clear input if not using custom prompt
        if (!customPrompt) {
            input.value = '';
            this.autoResizeTextarea(input);
        }

        // Add user message to chat
        this.addMessageToChat('user', message);

        // Show typing indicator
        const typingId = this.showTypingIndicator();

        try {
            // Get current page context if enabled
            const context = await this.getPageContext();
            
            // Send to Gemini API
            const response = await this.callGeminiAPI(message, context);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            // Add AI response to chat
            this.addMessageToChat('assistant', response);
            
            // Save conversation
            this.saveConversationHistory();
            
        } catch (error) {
            console.error('AI Assistant error:', error);
            this.removeTypingIndicator(typingId);
            this.addMessageToChat('assistant', 'I apologize, but I encountered an error. Please try again later.');
        }
    }

    async callGeminiAPI(message, context = null) {
        const systemPrompt = `You are Vishwakarma AI, an intelligent browsing assistant integrated into the Vishwakarma Express browser. You help users understand web content, answer questions, and provide assistance with browsing tasks. Be helpful, concise, and friendly.`;
        
        let prompt = message;
        if (context && context.enabled) {
            prompt = `Current page context:
Title: ${context.title}
URL: ${context.url}
Content summary: ${context.content}

User question: ${message}

Please answer the user's question considering the current page context.`;
        }

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: systemPrompt + '\n\n' + prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024
            }
        };

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Unexpected API response format');
        }
    }

    async getPageContext() {
        try {
            // Get current tab info
            const { BrowserAPI } = await import('../api/browser.js');
            const activeTabId = await BrowserAPI.getActiveTabId();
            
            if (!activeTabId) return { enabled: false };
            
            const tabInfo = await BrowserAPI.getTabInfo(activeTabId);
            
            // Check if context is enabled
            const contextBtn = document.getElementById('context-status');
            const contextEnabled = contextBtn.textContent.includes('ON');
            
            if (!contextEnabled) return { enabled: false };
            
            return {
                enabled: true,
                title: tabInfo.title || 'Unknown',
                url: tabInfo.url || '',
                content: this.extractPageContent() // Simplified content extraction
            };
        } catch (error) {
            console.error('Failed to get page context:', error);
            return { enabled: false };
        }
    }

    extractPageContent() {
        // Simple content extraction from current page
        // In a real implementation, this would extract from the actual web content
        const title = document.title || '';
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        
        return `${title}. ${metaDescription}`.substring(0, 500);
    }

    addMessageToChat(sender, message) {
        const chat = document.getElementById('ai-chat');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message-container ${sender}`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        const senderName = sender === 'user' ? 'You' : 'Vishwakarma AI';
        
        messageDiv.innerHTML = `
            <div class="ai-avatar">${avatar}</div>
            <div class="ai-message">
                <div class="ai-sender">${senderName}</div>
                <div class="ai-text">${this.formatMessage(message)}</div>
                <div class="ai-timestamp">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        chat.appendChild(messageDiv);
        chat.scrollTop = chat.scrollHeight;
        
        // Add to conversation history
        this.conversationHistory.push({
            sender,
            message,
            timestamp: Date.now()
        });
        
        // Limit history length
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory.shift();
        }
    }

    formatMessage(message) {
        // Basic markdown-like formatting
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const chat = document.getElementById('ai-chat');
        const typingDiv = document.createElement('div');
        const typingId = 'typing-' + Date.now();
        typingDiv.id = typingId;
        typingDiv.className = 'ai-message-container assistant typing';
        
        typingDiv.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="ai-message">
                <div class="ai-sender">Vishwakarma AI</div>
                <div class="ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chat.appendChild(typingDiv);
        chat.scrollTop = chat.scrollHeight;
        
        return typingId;
    }

    removeTypingIndicator(typingId) {
        const typingElement = document.getElementById(typingId);
        if (typingElement) {
            typingElement.remove();
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    clearConversation() {
        const chat = document.getElementById('ai-chat');
        const messages = chat.querySelectorAll('.ai-message-container:not(.ai-welcome)');
        messages.forEach(msg => msg.remove());
        
        this.conversationHistory = [];
        this.saveConversationHistory();
        
        this.showToast('Conversation cleared', 'success');
    }

    toggleContext() {
        const contextStatus = document.getElementById('context-status');
        const isEnabled = contextStatus.textContent.includes('ON');
        
        contextStatus.textContent = isEnabled ? 'Context: OFF' : 'Context: ON';
        
        this.showToast(
            isEnabled ? 'Page context disabled' : 'Page context enabled', 
            'info'
        );
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('vishwakarma_ai_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                
                // Restore messages to chat
                this.conversationHistory.forEach(item => {
                    this.addMessageToChat(item.sender, item.message);
                });
            }
        } catch (error) {
            console.error('Failed to load conversation history:', error);
        }
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('vishwakarma_ai_history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Failed to save conversation history:', error);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type} show`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Public API
    isOpen() {
        return this.isVisible;
    }

    async askAboutPage(question) {
        if (!this.isVisible) {
            this.showSidebar();
        }
        
        await this.sendMessage(question);
    }

    getConversationHistory() {
        return this.conversationHistory;
    }
}
