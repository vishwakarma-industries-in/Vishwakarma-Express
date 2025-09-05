// Real-time Code Generation and Web Development Tools - Phase 4
export class CodeGenerationTools {
    constructor(multiModelAI) {
        this.ai = multiModelAI;
        this.activeEditor = null;
        this.generatedCode = [];
        this.templates = {};
        this.livePreview = null;
        this.isActive = false;
        
        this.init();
    }

    async init() {
        console.log('Initializing Code Generation Tools...');
        
        this.loadTemplates();
        this.createCodeEditor();
        this.setupLivePreview();
        this.setupEventListeners();
        
        console.log('Code Generation Tools ready');
    }

    createCodeEditor() {
        const editor = document.createElement('div');
        editor.id = 'code-generation-panel';
        editor.className = 'code-generation-panel';
        
        editor.innerHTML = `
            <div class="code-gen-header">
                <h3>⚡ AI Code Generator</h3>
                <div class="code-gen-controls">
                    <select id="code-language">
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="javascript">JavaScript</option>
                        <option value="react">React</option>
                        <option value="vue">Vue.js</option>
                        <option value="python">Python</option>
                        <option value="node">Node.js</option>
                    </select>
                    <button id="generate-code">Generate</button>
                    <button id="clear-code">Clear</button>
                    <button class="code-gen-close">×</button>
                </div>
            </div>
            
            <div class="code-gen-content">
                <div class="code-input-section">
                    <textarea id="code-prompt" placeholder="Describe what you want to build...
Examples:
- Create a responsive navbar with dropdown menu
- Build a todo list with local storage
- Generate a contact form with validation
- Create a data visualization chart"></textarea>
                    <div class="code-templates">
                        <h4>Quick Templates:</h4>
                        <div class="template-buttons" id="template-buttons"></div>
                    </div>
                </div>
                
                <div class="code-output-section">
                    <div class="code-tabs">
                        <button class="code-tab active" data-tab="generated">Generated Code</button>
                        <button class="code-tab" data-tab="preview">Live Preview</button>
                        <button class="code-tab" data-tab="explanation">Explanation</button>
                    </div>
                    
                    <div class="code-tab-content">
                        <div class="tab-panel active" id="generated-panel">
                            <div class="code-actions">
                                <button id="copy-code">📋 Copy</button>
                                <button id="download-code">💾 Download</button>
                                <button id="inject-code">🚀 Inject to Page</button>
                                <button id="improve-code">✨ Improve</button>
                            </div>
                            <pre><code id="generated-code">// Generated code will appear here...</code></pre>
                        </div>
                        
                        <div class="tab-panel" id="preview-panel">
                            <iframe id="code-preview" sandbox="allow-scripts allow-same-origin"></iframe>
                        </div>
                        
                        <div class="tab-panel" id="explanation-panel">
                            <div id="code-explanation">Code explanation will appear here...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(editor);
        this.editorElement = editor;
    }

    setupLivePreview() {
        this.livePreview = document.getElementById('code-preview');
    }

    setupEventListeners() {
        // Generate button
        document.getElementById('generate-code').addEventListener('click', () => {
            this.generateCode();
        });
        
        // Clear button
        document.getElementById('clear-code').addEventListener('click', () => {
            this.clearCode();
        });
        
        // Close button
        document.querySelector('.code-gen-close').addEventListener('click', () => {
            this.hide();
        });
        
        // Code actions
        document.getElementById('copy-code').addEventListener('click', () => {
            this.copyCode();
        });
        
        document.getElementById('download-code').addEventListener('click', () => {
            this.downloadCode();
        });
        
        document.getElementById('inject-code').addEventListener('click', () => {
            this.injectCode();
        });
        
        document.getElementById('improve-code').addEventListener('click', () => {
            this.improveCode();
        });
        
        // Tab switching
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Template buttons
        this.renderTemplateButtons();
        
        // Auto-generate on Enter
        document.getElementById('code-prompt').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateCode();
            }
        });
    }

    loadTemplates() {
        this.templates = {
            'responsive-navbar': {
                name: '📱 Responsive Navbar',
                prompt: 'Create a responsive navigation bar with hamburger menu for mobile, dropdown menus, and smooth animations',
                language: 'html'
            },
            'todo-app': {
                name: '✅ Todo App',
                prompt: 'Build a complete todo list application with add, edit, delete, and local storage persistence',
                language: 'javascript'
            },
            'contact-form': {
                name: '📧 Contact Form',
                prompt: 'Create a contact form with validation, email integration, and success/error messages',
                language: 'html'
            },
            'dashboard': {
                name: '📊 Dashboard',
                prompt: 'Build a modern dashboard with charts, cards, and responsive grid layout',
                language: 'javascript'
            },
            'landing-page': {
                name: '🚀 Landing Page',
                prompt: 'Create a modern landing page with hero section, features, testimonials, and call-to-action',
                language: 'html'
            },
            'api-client': {
                name: '🔌 API Client',
                prompt: 'Build a REST API client with error handling, loading states, and data display',
                language: 'javascript'
            },
            'image-gallery': {
                name: '🖼️ Image Gallery',
                prompt: 'Create an image gallery with lightbox, filtering, and lazy loading',
                language: 'javascript'
            },
            'chat-widget': {
                name: '💬 Chat Widget',
                prompt: 'Build a chat widget with real-time messaging, emoji support, and file uploads',
                language: 'javascript'
            }
        };
    }

    renderTemplateButtons() {
        const container = document.getElementById('template-buttons');
        container.innerHTML = Object.entries(this.templates).map(([key, template]) => 
            `<button class="template-btn" data-template="${key}">${template.name}</button>`
        ).join('');
        
        // Add event listeners
        container.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.useTemplate(e.target.dataset.template);
            });
        });
    }

    useTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (template) {
            document.getElementById('code-prompt').value = template.prompt;
            document.getElementById('code-language').value = template.language;
        }
    }

    async generateCode() {
        const prompt = document.getElementById('code-prompt').value.trim();
        const language = document.getElementById('code-language').value;
        
        if (!prompt) {
            alert('Please enter a description of what you want to build');
            return;
        }
        
        this.showLoading();
        
        try {
            // Generate code
            const codeResponse = await this.ai.generateCode(
                `Create ${language} code for: ${prompt}. 
                
                Requirements:
                - Clean, modern, and well-documented code
                - Follow best practices and conventions
                - Include comments explaining key parts
                - Make it production-ready
                - Add responsive design if applicable
                - Include error handling where appropriate`,
                language,
                {
                    maxTokens: 4096,
                    priority: 'high',
                    temperature: 0.3
                }
            );
            
            // Generate explanation
            const explanationResponse = await this.ai.generateResponse(
                `Explain this ${language} code in detail:
                
                ${codeResponse.text}
                
                Please provide:
                1. Overview of what the code does
                2. Key features and functionality
                3. How to use/implement it
                4. Customization options
                5. Best practices used`,
                {
                    capabilities: ['analysis', 'teaching'],
                    maxTokens: 2048,
                    priority: 'normal'
                }
            );
            
            this.displayGeneratedCode(codeResponse.text, explanationResponse.text, language);
            this.updateLivePreview(codeResponse.text, language);
            
            // Store in history
            this.generatedCode.push({
                prompt,
                language,
                code: codeResponse.text,
                explanation: explanationResponse.text,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.showError(`Failed to generate code: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    displayGeneratedCode(code, explanation, language) {
        const codeElement = document.getElementById('generated-code');
        const explanationElement = document.getElementById('code-explanation');
        
        // Display code with syntax highlighting
        codeElement.textContent = code;
        codeElement.className = `language-${language}`;
        
        // Display explanation
        explanationElement.innerHTML = explanation.replace(/\n/g, '<br>');
        
        // Switch to generated code tab
        this.switchTab('generated');
    }

    updateLivePreview(code, language) {
        const preview = document.getElementById('code-preview');
        
        let previewContent = '';
        
        switch (language) {
            case 'html':
                previewContent = code;
                break;
            case 'css':
                previewContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>${code}</style>
                    </head>
                    <body>
                        <div class="preview-container">
                            <h1>CSS Preview</h1>
                            <p>Your styles are applied to this preview.</p>
                            <button>Sample Button</button>
                            <div class="sample-box">Sample Box</div>
                        </div>
                    </body>
                    </html>
                `;
                break;
            case 'javascript':
                previewContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .preview-container { max-width: 800px; margin: 0 auto; }
                        </style>
                    </head>
                    <body>
                        <div class="preview-container">
                            <h1>JavaScript Preview</h1>
                            <div id="output"></div>
                        </div>
                        <script>
                            try {
                                ${code}
                            } catch (error) {
                                document.getElementById('output').innerHTML = 
                                    '<p style="color: red;">Error: ' + error.message + '</p>';
                            }
                        </script>
                    </body>
                    </html>
                `;
                break;
            case 'react':
                previewContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
                        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                        </style>
                    </head>
                    <body>
                        <div id="root"></div>
                        <script type="text/babel">
                            ${code}
                            
                            // Render the component if it exists
                            const root = ReactDOM.createRoot(document.getElementById('root'));
                            if (typeof App !== 'undefined') {
                                root.render(<App />);
                            }
                        </script>
                    </body>
                    </html>
                `;
                break;
            default:
                previewContent = `
                    <!DOCTYPE html>
                    <html>
                    <body>
                        <div style="padding: 20px; font-family: Arial, sans-serif;">
                            <h2>Code Preview</h2>
                            <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
                                <code>${this.escapeHtml(code)}</code>
                            </pre>
                        </div>
                    </body>
                    </html>
                `;
        }
        
        preview.srcdoc = previewContent;
    }

    async improveCode() {
        const currentCode = document.getElementById('generated-code').textContent;
        const language = document.getElementById('code-language').value;
        
        if (!currentCode || currentCode === '// Generated code will appear here...') {
            alert('No code to improve. Generate some code first.');
            return;
        }
        
        this.showLoading();
        
        try {
            const improvedResponse = await this.ai.generateCode(
                `Improve this ${language} code by making it more efficient, readable, and following best practices:
                
                ${currentCode}
                
                Please:
                1. Optimize performance
                2. Improve code structure
                3. Add better error handling
                4. Enhance accessibility
                5. Add useful comments
                6. Follow modern conventions`,
                language,
                {
                    maxTokens: 4096,
                    priority: 'high',
                    temperature: 0.2
                }
            );
            
            const explanationResponse = await this.ai.generateResponse(
                `Explain the improvements made to this code:
                
                Original:
                ${currentCode}
                
                Improved:
                ${improvedResponse.text}
                
                Please highlight what was changed and why.`,
                {
                    capabilities: ['analysis', 'teaching'],
                    maxTokens: 1024
                }
            );
            
            this.displayGeneratedCode(improvedResponse.text, explanationResponse.text, language);
            this.updateLivePreview(improvedResponse.text, language);
            
        } catch (error) {
            this.showError(`Failed to improve code: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    copyCode() {
        const code = document.getElementById('generated-code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            this.showSuccess('Code copied to clipboard!');
        }).catch(() => {
            this.showError('Failed to copy code');
        });
    }

    downloadCode() {
        const code = document.getElementById('generated-code').textContent;
        const language = document.getElementById('code-language').value;
        const filename = `generated-code.${this.getFileExtension(language)}`;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess(`Code downloaded as ${filename}`);
    }

    injectCode() {
        const code = document.getElementById('generated-code').textContent;
        const language = document.getElementById('code-language').value;
        
        try {
            switch (language) {
                case 'html':
                    document.body.insertAdjacentHTML('beforeend', code);
                    break;
                case 'css':
                    const style = document.createElement('style');
                    style.textContent = code;
                    document.head.appendChild(style);
                    break;
                case 'javascript':
                    const script = document.createElement('script');
                    script.textContent = code;
                    document.body.appendChild(script);
                    break;
                default:
                    this.showError(`Cannot inject ${language} code directly`);
                    return;
            }
            
            this.showSuccess('Code injected into current page!');
        } catch (error) {
            this.showError(`Failed to inject code: ${error.message}`);
        }
    }

    clearCode() {
        document.getElementById('code-prompt').value = '';
        document.getElementById('generated-code').textContent = '// Generated code will appear here...';
        document.getElementById('code-explanation').textContent = 'Code explanation will appear here...';
        document.getElementById('code-preview').srcdoc = '';
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    }

    getFileExtension(language) {
        const extensions = {
            html: 'html',
            css: 'css',
            javascript: 'js',
            react: 'jsx',
            vue: 'vue',
            python: 'py',
            node: 'js'
        };
        return extensions[language] || 'txt';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        const generateBtn = document.getElementById('generate-code');
        generateBtn.textContent = 'Generating...';
        generateBtn.disabled = true;
    }

    hideLoading() {
        const generateBtn = document.getElementById('generate-code');
        generateBtn.textContent = 'Generate';
        generateBtn.disabled = false;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `code-notification ${type}`;
        notification.textContent = message;
        
        this.editorElement.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    show() {
        this.editorElement.classList.add('show');
        this.isActive = true;
    }

    hide() {
        this.editorElement.classList.remove('show');
        this.isActive = false;
    }

    toggle() {
        if (this.isActive) {
            this.hide();
        } else {
            this.show();
        }
    }

    // Public API
    generateFromPrompt(prompt, language = 'javascript') {
        document.getElementById('code-prompt').value = prompt;
        document.getElementById('code-language').value = language;
        this.show();
        this.generateCode();
    }

    getGeneratedCode() {
        return document.getElementById('generated-code').textContent;
    }

    getCodeHistory() {
        return this.generatedCode;
    }
}
