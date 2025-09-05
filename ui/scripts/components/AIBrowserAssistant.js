// Revolutionary AI Browser Assistant - Phase 4 Advanced Component
export class AIBrowserAssistant {
    constructor(multiModelAI) {
        this.ai = multiModelAI;
        this.contextBuffer = [];
        this.maxContextSize = 50;
        this.isActive = false;
        this.currentPage = null;
        this.userPreferences = {};
        this.conversationHistory = [];
        this.capabilities = {
            contentAnalysis: true,
            codeGeneration: true,
            webDevelopment: true,
            dataExtraction: true,
            automation: true,
            predictiveBrowsing: true
        };
        
        this.init();
    }

    async init() {
        console.log('Initializing Revolutionary AI Browser Assistant...');
        
        this.loadUserPreferences();
        this.setupContextMonitoring();
        this.createAdvancedUI();
        this.setupEventListeners();
        
        console.log('AI Browser Assistant ready with advanced capabilities');
    }

    setupContextMonitoring() {
        // Monitor page changes
        const observer = new MutationObserver(() => {
            this.updatePageContext();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });

        // Monitor user interactions
        document.addEventListener('click', (e) => this.trackInteraction('click', e));
        document.addEventListener('scroll', () => this.trackInteraction('scroll'));
        document.addEventListener('input', (e) => this.trackInteraction('input', e));
    }

    updatePageContext() {
        const context = {
            url: window.location.href,
            title: document.title,
            timestamp: Date.now(),
            content: this.extractPageContent(),
            forms: this.analyzeForms(),
            links: this.analyzeLinks(),
            media: this.analyzeMedia(),
            code: this.detectCode(),
            userIntent: this.predictUserIntent()
        };
        
        this.contextBuffer.push(context);
        if (this.contextBuffer.length > this.maxContextSize) {
            this.contextBuffer.shift();
        }
        
        this.currentPage = context;
    }

    extractPageContent() {
        const content = {
            headings: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
                .map(h => ({ level: h.tagName, text: h.textContent.trim() })),
            paragraphs: Array.from(document.querySelectorAll('p'))
                .map(p => p.textContent.trim()).filter(text => text.length > 20),
            lists: Array.from(document.querySelectorAll('ul,ol'))
                .map(list => Array.from(list.querySelectorAll('li')).map(li => li.textContent.trim())),
            tables: Array.from(document.querySelectorAll('table'))
                .map(table => this.extractTableData(table)),
            metadata: this.extractMetadata()
        };
        
        return content;
    }

    analyzeForms() {
        return Array.from(document.querySelectorAll('form')).map(form => ({
            action: form.action,
            method: form.method,
            fields: Array.from(form.querySelectorAll('input,select,textarea')).map(field => ({
                name: field.name,
                type: field.type,
                placeholder: field.placeholder,
                required: field.required,
                value: field.value
            }))
        }));
    }

    analyzeLinks() {
        return Array.from(document.querySelectorAll('a[href]')).map(link => ({
            href: link.href,
            text: link.textContent.trim(),
            external: !link.href.startsWith(window.location.origin)
        }));
    }

    analyzeMedia() {
        return {
            images: Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt,
                dimensions: { width: img.width, height: img.height }
            })),
            videos: Array.from(document.querySelectorAll('video')).map(video => ({
                src: video.src,
                duration: video.duration,
                controls: video.controls
            }))
        };
    }

    detectCode() {
        const codeElements = document.querySelectorAll('code, pre, .highlight, .code');
        return Array.from(codeElements).map(el => ({
            language: this.detectLanguage(el.textContent),
            content: el.textContent.trim(),
            element: el.tagName
        }));
    }

    detectLanguage(code) {
        const patterns = {
            javascript: /(?:function|const|let|var|=>|console\.log)/,
            python: /(?:def|import|from|print|if __name__)/,
            html: /(?:<[^>]+>|<!DOCTYPE)/,
            css: /(?:\{[^}]*\}|@media|\.[\w-]+)/,
            sql: /(?:SELECT|FROM|WHERE|INSERT|UPDATE)/i
        };
        
        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(code)) return lang;
        }
        return 'unknown';
    }

    predictUserIntent() {
        const recentInteractions = this.contextBuffer.slice(-5);
        const patterns = {
            learning: /(?:tutorial|learn|how to|guide|documentation)/i,
            shopping: /(?:buy|price|cart|checkout|product)/i,
            development: /(?:code|github|stackoverflow|documentation)/i,
            research: /(?:search|find|information|about|what is)/i,
            entertainment: /(?:video|music|game|movie|watch)/i
        };
        
        const currentUrl = window.location.href;
        const currentTitle = document.title;
        
        for (const [intent, pattern] of Object.entries(patterns)) {
            if (pattern.test(currentUrl) || pattern.test(currentTitle)) {
                return intent;
            }
        }
        
        return 'browsing';
    }

    createAdvancedUI() {
        const assistant = document.createElement('div');
        assistant.id = 'ai-browser-assistant';
        assistant.className = 'ai-assistant-advanced';
        
        assistant.innerHTML = `
            <div class="ai-assistant-header">
                <div class="ai-status">
                    <div class="ai-indicator"></div>
                    <span class="ai-model-info">AI Ready</span>
                </div>
                <div class="ai-controls">
                    <button class="ai-minimize" title="Minimize">−</button>
                    <button class="ai-close" title="Close">×</button>
                </div>
            </div>
            
            <div class="ai-assistant-content">
                <div class="ai-context-panel">
                    <h4>📊 Page Context</h4>
                    <div class="context-summary" id="context-summary">Analyzing page...</div>
                </div>
                
                <div class="ai-capabilities">
                    <button class="ai-capability" data-action="analyze">🔍 Analyze Content</button>
                    <button class="ai-capability" data-action="generate">⚡ Generate Code</button>
                    <button class="ai-capability" data-action="extract">📋 Extract Data</button>
                    <button class="ai-capability" data-action="automate">🤖 Automate Task</button>
                </div>
                
                <div class="ai-chat-container">
                    <div class="ai-messages" id="ai-messages"></div>
                    <div class="ai-input-container">
                        <textarea id="ai-input" placeholder="Ask me anything about this page or request assistance..."></textarea>
                        <button id="ai-send">Send</button>
                    </div>
                </div>
                
                <div class="ai-suggestions" id="ai-suggestions"></div>
            </div>
        `;
        
        document.body.appendChild(assistant);
        this.assistantElement = assistant;
    }

    setupEventListeners() {
        // Capability buttons
        document.querySelectorAll('.ai-capability').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.executeCapability(e.target.dataset.action);
            });
        });
        
        // Chat input
        const input = document.getElementById('ai-input');
        const sendBtn = document.getElementById('ai-send');
        
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Control buttons
        document.querySelector('.ai-minimize').addEventListener('click', () => {
            this.assistantElement.classList.toggle('minimized');
        });
        
        document.querySelector('.ai-close').addEventListener('click', () => {
            this.hide();
        });
        
        // Auto-update context
        setInterval(() => {
            this.updateContextDisplay();
            this.generateSuggestions();
        }, 5000);
    }

    async executeCapability(action) {
        this.showLoading();
        
        try {
            switch (action) {
                case 'analyze':
                    await this.analyzeCurrentPage();
                    break;
                case 'generate':
                    await this.generateCodeForPage();
                    break;
                case 'extract':
                    await this.extractPageData();
                    break;
                case 'automate':
                    await this.suggestAutomation();
                    break;
            }
        } catch (error) {
            this.addMessage('assistant', `Error: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async analyzeCurrentPage() {
        const context = this.currentPage;
        const prompt = `Analyze this webpage and provide insights:
        
        URL: ${context.url}
        Title: ${context.title}
        Content: ${JSON.stringify(context.content, null, 2)}
        
        Please provide:
        1. Content summary
        2. Key insights
        3. Potential improvements
        4. User experience assessment`;
        
        const response = await this.ai.analyzeContent(prompt, 'webpage', {
            maxTokens: 2048,
            priority: 'high'
        });
        
        this.addMessage('assistant', response.text, 'analysis');
    }

    async generateCodeForPage() {
        const context = this.currentPage;
        const codeElements = context.code;
        
        if (codeElements.length === 0) {
            this.addMessage('assistant', 'No code detected on this page. Would you like me to generate code for a specific task?');
            return;
        }
        
        const prompt = `Based on the code found on this page, generate improved or related code:
        
        Detected Code:
        ${codeElements.map(code => `Language: ${code.language}\n${code.content}`).join('\n\n')}
        
        Please provide:
        1. Code improvements
        2. Related utilities
        3. Best practices
        4. Alternative implementations`;
        
        const response = await this.ai.generateCode(prompt, 'javascript', {
            maxTokens: 4096,
            priority: 'high'
        });
        
        this.addMessage('assistant', response.text, 'code');
    }

    async extractPageData() {
        const context = this.currentPage;
        const prompt = `Extract structured data from this webpage:
        
        Content: ${JSON.stringify(context.content, null, 2)}
        Forms: ${JSON.stringify(context.forms, null, 2)}
        
        Please provide:
        1. Key data points
        2. Structured JSON format
        3. Data relationships
        4. Export suggestions`;
        
        const response = await this.ai.analyzeContent(prompt, 'data_extraction', {
            maxTokens: 2048,
            priority: 'high'
        });
        
        this.addMessage('assistant', response.text, 'data');
    }

    async suggestAutomation() {
        const context = this.currentPage;
        const forms = context.forms;
        
        const prompt = `Suggest automation opportunities for this webpage:
        
        URL: ${context.url}
        Forms: ${JSON.stringify(forms, null, 2)}
        User Intent: ${context.userIntent}
        
        Please provide:
        1. Automation opportunities
        2. Script suggestions
        3. Workflow improvements
        4. Time-saving tips`;
        
        const response = await this.ai.generateResponse(prompt, {
            capabilities: ['automation', 'analysis'],
            maxTokens: 2048,
            priority: 'high'
        });
        
        this.addMessage('assistant', response.text, 'automation');
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage('user', message);
        input.value = '';
        
        this.showLoading();
        
        try {
            const context = this.buildConversationContext();
            const response = await this.ai.chat(message, {
                context: context,
                maxTokens: 2048,
                priority: 'normal'
            });
            
            this.addMessage('assistant', response.text);
            this.conversationHistory.push({ user: message, assistant: response.text });
            
        } catch (error) {
            this.addMessage('assistant', `I apologize, but I encountered an error: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    buildConversationContext() {
        const context = {
            currentPage: this.currentPage,
            recentHistory: this.contextBuffer.slice(-3),
            userIntent: this.currentPage?.userIntent,
            conversation: this.conversationHistory.slice(-5)
        };
        
        return JSON.stringify(context, null, 2);
    }

    addMessage(sender, content, type = 'normal') {
        const messagesContainer = document.getElementById('ai-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender} ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender">${sender === 'user' ? 'You' : 'AI Assistant'}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${this.formatMessage(content, type)}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content, type) {
        if (type === 'code') {
            return `<pre><code>${content}</code></pre>`;
        } else if (type === 'data') {
            return `<div class="data-output">${content}</div>`;
        } else if (type === 'error') {
            return `<div class="error-message">${content}</div>`;
        }
        
        return content.replace(/\n/g, '<br>');
    }

    updateContextDisplay() {
        const summary = document.getElementById('context-summary');
        if (this.currentPage) {
            summary.innerHTML = `
                <div class="context-item">
                    <strong>Page:</strong> ${this.currentPage.title}
                </div>
                <div class="context-item">
                    <strong>Intent:</strong> ${this.currentPage.userIntent}
                </div>
                <div class="context-item">
                    <strong>Content:</strong> ${this.currentPage.content.headings.length} headings, 
                    ${this.currentPage.content.paragraphs.length} paragraphs
                </div>
            `;
        }
    }

    async generateSuggestions() {
        if (!this.currentPage) return;
        
        const suggestions = [];
        
        // Context-based suggestions
        if (this.currentPage.code.length > 0) {
            suggestions.push('🔧 I can help improve the code on this page');
        }
        
        if (this.currentPage.forms.length > 0) {
            suggestions.push('📝 I can help automate form filling');
        }
        
        if (this.currentPage.userIntent === 'learning') {
            suggestions.push('📚 I can explain concepts on this page');
        }
        
        if (this.currentPage.userIntent === 'development') {
            suggestions.push('💻 I can generate related code examples');
        }
        
        this.displaySuggestions(suggestions);
    }

    displaySuggestions(suggestions) {
        const container = document.getElementById('ai-suggestions');
        if (suggestions.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <h5>💡 Suggestions</h5>
            ${suggestions.map(suggestion => 
                `<div class="suggestion-item">${suggestion}</div>`
            ).join('')}
        `;
    }

    showLoading() {
        const indicator = document.querySelector('.ai-indicator');
        indicator.classList.add('loading');
    }

    hideLoading() {
        const indicator = document.querySelector('.ai-indicator');
        indicator.classList.remove('loading');
    }

    show() {
        this.assistantElement.classList.add('show');
        this.isActive = true;
        this.updatePageContext();
    }

    hide() {
        this.assistantElement.classList.remove('show');
        this.isActive = false;
    }

    toggle() {
        if (this.isActive) {
            this.hide();
        } else {
            this.show();
        }
    }

    // Utility methods
    extractTableData(table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        return rows.map(row => 
            Array.from(row.querySelectorAll('td,th')).map(cell => cell.textContent.trim())
        );
    }

    extractMetadata() {
        const meta = {};
        document.querySelectorAll('meta').forEach(tag => {
            const name = tag.getAttribute('name') || tag.getAttribute('property');
            const content = tag.getAttribute('content');
            if (name && content) {
                meta[name] = content;
            }
        });
        return meta;
    }

    trackInteraction(type, event = null) {
        const interaction = {
            type,
            timestamp: Date.now(),
            element: event?.target?.tagName,
            url: window.location.href
        };
        
        // Store recent interactions for context
        if (!this.recentInteractions) this.recentInteractions = [];
        this.recentInteractions.push(interaction);
        if (this.recentInteractions.length > 20) {
            this.recentInteractions.shift();
        }
    }

    loadUserPreferences() {
        try {
            const prefs = localStorage.getItem('ai_assistant_preferences');
            if (prefs) {
                this.userPreferences = JSON.parse(prefs);
            }
        } catch (error) {
            console.error('Failed to load AI assistant preferences:', error);
        }
    }

    saveUserPreferences() {
        try {
            localStorage.setItem('ai_assistant_preferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.error('Failed to save AI assistant preferences:', error);
        }
    }
}
