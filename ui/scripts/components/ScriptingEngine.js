// Custom Scripting Engine - Phase 5 Revolutionary Component
export class ScriptingEngine {
    constructor() {
        this.scripts = new Map();
        this.macros = new Map();
        this.automations = new Map();
        this.scheduler = null;
        this.recorder = null;
        this.interpreter = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Custom Scripting Engine...');
        
        this.createInterpreter();
        this.setupScheduler();
        this.initializeRecorder();
        this.createScriptingUI();
        this.loadBuiltinScripts();
        
        console.log('Scripting Engine ready - Advanced automation capabilities enabled');
    }

    createInterpreter() {
        this.interpreter = {
            context: {
                // Browser APIs
                browser: {
                    navigate: (url) => window.app.navigateToUrl(url),
                    back: () => window.app.goBack(),
                    forward: () => window.app.goForward(),
                    reload: () => window.app.reloadTab(),
                    newTab: () => window.app.createTab(),
                    closeTab: () => window.app.closeTab(),
                    getCurrentUrl: () => window.location.href,
                    getTitle: () => document.title
                },
                
                // DOM manipulation
                dom: {
                    select: (selector) => document.querySelector(selector),
                    selectAll: (selector) => document.querySelectorAll(selector),
                    click: (selector) => {
                        const element = document.querySelector(selector);
                        if (element) element.click();
                    },
                    type: (selector, text) => {
                        const element = document.querySelector(selector);
                        if (element) {
                            element.value = text;
                            element.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    },
                    getText: (selector) => {
                        const element = document.querySelector(selector);
                        return element ? element.textContent : '';
                    },
                    getAttribute: (selector, attr) => {
                        const element = document.querySelector(selector);
                        return element ? element.getAttribute(attr) : null;
                    },
                    setAttribute: (selector, attr, value) => {
                        const element = document.querySelector(selector);
                        if (element) element.setAttribute(attr, value);
                    }
                },
                
                // Utility functions
                utils: {
                    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
                    log: (message) => console.log('[Script]', message),
                    alert: (message) => alert(message),
                    prompt: (message) => prompt(message),
                    random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
                    formatDate: (date) => new Date(date).toLocaleDateString(),
                    parseJSON: (str) => JSON.parse(str),
                    stringifyJSON: (obj) => JSON.stringify(obj)
                },
                
                // Storage APIs
                storage: {
                    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
                    get: (key) => {
                        const item = localStorage.getItem(key);
                        return item ? JSON.parse(item) : null;
                    },
                    remove: (key) => localStorage.removeItem(key),
                    clear: () => localStorage.clear()
                },
                
                // Network APIs
                network: {
                    fetch: async (url, options = {}) => {
                        const response = await fetch(url, options);
                        return {
                            ok: response.ok,
                            status: response.status,
                            text: () => response.text(),
                            json: () => response.json()
                        };
                    },
                    get: (url) => this.interpreter.context.network.fetch(url),
                    post: (url, data) => this.interpreter.context.network.fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    })
                }
            },
            
            execute: async (code) => {
                try {
                    // Create a sandboxed function with the context
                    const func = new Function('context', `
                        with (context) {
                            return (async () => {
                                ${code}
                            })();
                        }
                    `);
                    
                    return await func(this.interpreter.context);
                } catch (error) {
                    console.error('Script execution error:', error);
                    throw error;
                }
            }
        };
    }

    setupScheduler() {
        this.scheduler = {
            tasks: new Map(),
            intervals: new Map(),
            
            schedule: (name, code, interval) => {
                if (this.scheduler.intervals.has(name)) {
                    clearInterval(this.scheduler.intervals.get(name));
                }
                
                const intervalId = setInterval(async () => {
                    try {
                        await this.interpreter.execute(code);
                    } catch (error) {
                        console.error(`Scheduled task '${name}' failed:`, error);
                    }
                }, interval);
                
                this.scheduler.intervals.set(name, intervalId);
                this.scheduler.tasks.set(name, { code, interval });
            },
            
            unschedule: (name) => {
                if (this.scheduler.intervals.has(name)) {
                    clearInterval(this.scheduler.intervals.get(name));
                    this.scheduler.intervals.delete(name);
                    this.scheduler.tasks.delete(name);
                }
            },
            
            list: () => Array.from(this.scheduler.tasks.keys())
        };
    }

    initializeRecorder() {
        this.recorder = {
            isRecording: false,
            actions: [],
            
            start: () => {
                this.recorder.isRecording = true;
                this.recorder.actions = [];
                this.setupEventListeners();
                console.log('Recording started');
            },
            
            stop: () => {
                this.recorder.isRecording = false;
                this.removeEventListeners();
                console.log('Recording stopped');
                return this.generateScript(this.recorder.actions);
            },
            
            recordAction: (action) => {
                if (this.recorder.isRecording) {
                    this.recorder.actions.push({
                        ...action,
                        timestamp: Date.now()
                    });
                }
            }
        };
    }

    setupEventListeners() {
        this.clickListener = (e) => {
            this.recorder.recordAction({
                type: 'click',
                selector: this.generateSelector(e.target),
                x: e.clientX,
                y: e.clientY
            });
        };
        
        this.inputListener = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.recorder.recordAction({
                    type: 'input',
                    selector: this.generateSelector(e.target),
                    value: e.target.value
                });
            }
        };
        
        this.keyListener = (e) => {
            this.recorder.recordAction({
                type: 'keypress',
                key: e.key,
                code: e.code,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey
            });
        };
        
        document.addEventListener('click', this.clickListener, true);
        document.addEventListener('input', this.inputListener, true);
        document.addEventListener('keydown', this.keyListener, true);
    }

    removeEventListeners() {
        document.removeEventListener('click', this.clickListener, true);
        document.removeEventListener('input', this.inputListener, true);
        document.removeEventListener('keydown', this.keyListener, true);
    }

    generateSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        
        if (element.className) {
            return `.${element.className.split(' ')[0]}`;
        }
        
        const path = [];
        while (element && element.nodeType === Node.ELEMENT_NODE) {
            let selector = element.nodeName.toLowerCase();
            if (element.id) {
                selector += `#${element.id}`;
                path.unshift(selector);
                break;
            } else {
                let sibling = element;
                let nth = 1;
                while (sibling = sibling.previousElementSibling) {
                    if (sibling.nodeName.toLowerCase() === selector) nth++;
                }
                if (nth !== 1) selector += `:nth-of-type(${nth})`;
            }
            path.unshift(selector);
            element = element.parentNode;
        }
        
        return path.join(' > ');
    }

    generateScript(actions) {
        let script = '// Auto-generated script\n\n';
        
        actions.forEach((action, index) => {
            switch (action.type) {
                case 'click':
                    script += `dom.click('${action.selector}');\n`;
                    break;
                case 'input':
                    script += `dom.type('${action.selector}', '${action.value}');\n`;
                    break;
                case 'keypress':
                    if (action.key === 'Enter') {
                        script += `// Press Enter\n`;
                    }
                    break;
            }
            
            if (index < actions.length - 1) {
                const delay = actions[index + 1].timestamp - action.timestamp;
                if (delay > 100) {
                    script += `await utils.wait(${Math.min(delay, 2000)});\n`;
                }
            }
        });
        
        return script;
    }

    createScriptingUI() {
        const ui = document.createElement('div');
        ui.id = 'scripting-engine-ui';
        ui.className = 'scripting-engine-ui';
        
        ui.innerHTML = `
            <div class="scripting-header">
                <h3>🤖 Scripting Engine</h3>
                <div class="scripting-controls">
                    <button id="record-macro">🔴 Record</button>
                    <button id="run-script">▶️ Run</button>
                    <button id="save-script">💾 Save</button>
                    <button class="scripting-close">×</button>
                </div>
            </div>
            
            <div class="scripting-content">
                <div class="scripting-tabs">
                    <button class="script-tab active" data-tab="editor">Script Editor</button>
                    <button class="script-tab" data-tab="macros">Macros</button>
                    <button class="script-tab" data-tab="automation">Automation</button>
                    <button class="script-tab" data-tab="library">Library</button>
                </div>
                
                <div class="scripting-panels">
                    <div class="script-panel active" id="editor-panel">
                        <div class="editor-toolbar">
                            <select id="script-template">
                                <option value="">Select Template</option>
                                <option value="form-filler">Form Filler</option>
                                <option value="data-scraper">Data Scraper</option>
                                <option value="auto-clicker">Auto Clicker</option>
                                <option value="page-monitor">Page Monitor</option>
                            </select>
                            <button id="load-template">Load</button>
                            <button id="clear-editor">Clear</button>
                        </div>
                        
                        <textarea id="script-editor" placeholder="// Write your script here
// Available APIs:
// - browser: navigate, back, forward, reload, newTab, closeTab
// - dom: select, click, type, getText, getAttribute
// - utils: wait, log, alert, prompt, random
// - storage: set, get, remove, clear
// - network: fetch, get, post

// Example:
dom.click('#login-button');
await utils.wait(1000);
dom.type('#username', 'myuser');
dom.type('#password', 'mypass');
dom.click('#submit');"></textarea>
                        
                        <div class="editor-status">
                            <span id="script-status">Ready</span>
                            <span id="line-count">Lines: 0</span>
                        </div>
                    </div>
                    
                    <div class="script-panel" id="macros-panel">
                        <div class="macro-controls">
                            <button id="start-recording">🔴 Start Recording</button>
                            <button id="stop-recording" disabled>⏹️ Stop Recording</button>
                            <button id="play-macro">▶️ Play Macro</button>
                        </div>
                        
                        <div class="macro-list" id="macro-list">
                            <p>No macros recorded</p>
                        </div>
                    </div>
                    
                    <div class="script-panel" id="automation-panel">
                        <h4>Scheduled Tasks</h4>
                        <div class="automation-controls">
                            <input type="text" id="task-name" placeholder="Task name">
                            <input type="number" id="task-interval" placeholder="Interval (ms)" value="5000">
                            <button id="schedule-task">Schedule</button>
                        </div>
                        
                        <div class="task-list" id="task-list">
                            <p>No scheduled tasks</p>
                        </div>
                    </div>
                    
                    <div class="script-panel" id="library-panel">
                        <h4>Script Library</h4>
                        <div class="library-grid" id="library-grid"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(ui);
        this.uiElement = ui;
        this.setupScriptingEvents();
        this.updateLibrary();
    }

    setupScriptingEvents() {
        // Tab switching
        document.querySelectorAll('.script-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchScriptTab(e.target.dataset.tab);
            });
        });

        // Script execution
        document.getElementById('run-script').addEventListener('click', () => {
            this.runCurrentScript();
        });

        // Recording
        document.getElementById('start-recording').addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('stop-recording').addEventListener('click', () => {
            this.stopRecording();
        });

        // Template loading
        document.getElementById('load-template').addEventListener('click', () => {
            this.loadTemplate();
        });

        // Task scheduling
        document.getElementById('schedule-task').addEventListener('click', () => {
            this.scheduleTask();
        });

        // Close button
        document.querySelector('.scripting-close').addEventListener('click', () => {
            this.hideUI();
        });

        // Editor updates
        document.getElementById('script-editor').addEventListener('input', () => {
            this.updateEditorStatus();
        });
    }

    loadBuiltinScripts() {
        this.scripts.set('form-filler', {
            name: 'Form Filler',
            description: 'Automatically fill forms with predefined data',
            code: `// Form Filler Script
const formData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890'
};

// Fill name field
const nameField = dom.select('input[name="name"], input[id*="name"]');
if (nameField) dom.type('input[name="name"], input[id*="name"]', formData.name);

// Fill email field
const emailField = dom.select('input[type="email"], input[name="email"]');
if (emailField) dom.type('input[type="email"], input[name="email"]', formData.email);

// Fill phone field
const phoneField = dom.select('input[type="tel"], input[name="phone"]');
if (phoneField) dom.type('input[type="tel"], input[name="phone"]', formData.phone);

utils.log('Form filled successfully');`
        });

        this.scripts.set('data-scraper', {
            name: 'Data Scraper',
            description: 'Extract data from web pages',
            code: `// Data Scraper Script
const data = [];

// Scrape all links
const links = dom.selectAll('a[href]');
links.forEach(link => {
    data.push({
        text: link.textContent.trim(),
        url: link.href
    });
});

// Scrape all images
const images = dom.selectAll('img[src]');
images.forEach(img => {
    data.push({
        alt: img.alt,
        src: img.src
    });
});

// Save to storage
storage.set('scraped_data', data);
utils.log(\`Scraped \${data.length} items\`);`
        });

        this.scripts.set('auto-clicker', {
            name: 'Auto Clicker',
            description: 'Automatically click elements at intervals',
            code: `// Auto Clicker Script
const selector = '#target-button'; // Change this selector
const interval = 1000; // 1 second

let clickCount = 0;
const maxClicks = 10;

const clicker = setInterval(() => {
    const element = dom.select(selector);
    if (element && clickCount < maxClicks) {
        dom.click(selector);
        clickCount++;
        utils.log(\`Click \${clickCount}/\${maxClicks}\`);
    } else {
        clearInterval(clicker);
        utils.log('Auto clicking completed');
    }
}, interval);`
        });
    }

    switchScriptTab(tabId) {
        document.querySelectorAll('.script-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.script-panel').forEach(panel => panel.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-panel`).classList.add('active');
    }

    async runCurrentScript() {
        const editor = document.getElementById('script-editor');
        const code = editor.value;
        
        if (!code.trim()) {
            alert('Please enter a script to run');
            return;
        }

        try {
            document.getElementById('script-status').textContent = 'Running...';
            await this.interpreter.execute(code);
            document.getElementById('script-status').textContent = 'Completed';
        } catch (error) {
            document.getElementById('script-status').textContent = 'Error';
            alert(`Script error: ${error.message}`);
        }
    }

    startRecording() {
        this.recorder.start();
        document.getElementById('start-recording').disabled = true;
        document.getElementById('stop-recording').disabled = false;
    }

    stopRecording() {
        const script = this.recorder.stop();
        document.getElementById('start-recording').disabled = false;
        document.getElementById('stop-recording').disabled = true;
        
        // Add to macros
        const macroId = `macro_${Date.now()}`;
        this.macros.set(macroId, {
            name: `Recorded Macro ${this.macros.size + 1}`,
            script: script,
            created: new Date()
        });
        
        this.updateMacroList();
        document.getElementById('script-editor').value = script;
    }

    loadTemplate() {
        const select = document.getElementById('script-template');
        const templateId = select.value;
        
        if (templateId && this.scripts.has(templateId)) {
            const template = this.scripts.get(templateId);
            document.getElementById('script-editor').value = template.code;
            this.updateEditorStatus();
        }
    }

    scheduleTask() {
        const name = document.getElementById('task-name').value;
        const interval = parseInt(document.getElementById('task-interval').value);
        const code = document.getElementById('script-editor').value;
        
        if (!name || !interval || !code) {
            alert('Please fill all fields');
            return;
        }

        this.scheduler.schedule(name, code, interval);
        this.updateTaskList();
        
        document.getElementById('task-name').value = '';
        document.getElementById('task-interval').value = '5000';
    }

    updateEditorStatus() {
        const editor = document.getElementById('script-editor');
        const lines = editor.value.split('\n').length;
        document.getElementById('line-count').textContent = `Lines: ${lines}`;
        document.getElementById('script-status').textContent = 'Ready';
    }

    updateMacroList() {
        const list = document.getElementById('macro-list');
        
        if (this.macros.size === 0) {
            list.innerHTML = '<p>No macros recorded</p>';
            return;
        }

        list.innerHTML = Array.from(this.macros.entries()).map(([id, macro]) => `
            <div class="macro-item">
                <h5>${macro.name}</h5>
                <p>Created: ${macro.created.toLocaleString()}</p>
                <div class="macro-actions">
                    <button onclick="window.app.scriptingEngine.playMacro('${id}')">▶️ Play</button>
                    <button onclick="window.app.scriptingEngine.editMacro('${id}')">✏️ Edit</button>
                    <button onclick="window.app.scriptingEngine.deleteMacro('${id}')">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateTaskList() {
        const list = document.getElementById('task-list');
        const tasks = this.scheduler.list();
        
        if (tasks.length === 0) {
            list.innerHTML = '<p>No scheduled tasks</p>';
            return;
        }

        list.innerHTML = tasks.map(taskName => {
            const task = this.scheduler.tasks.get(taskName);
            return `
                <div class="task-item">
                    <h5>${taskName}</h5>
                    <p>Interval: ${task.interval}ms</p>
                    <button onclick="window.app.scriptingEngine.unscheduleTask('${taskName}')">Stop</button>
                </div>
            `;
        }).join('');
    }

    updateLibrary() {
        const grid = document.getElementById('library-grid');
        if (!grid) return;
        
        grid.innerHTML = Array.from(this.scripts.entries()).map(([id, script]) => `
            <div class="library-item">
                <h5>${script.name}</h5>
                <p>${script.description}</p>
                <button onclick="window.app.scriptingEngine.loadScript('${id}')">Load</button>
            </div>
        `).join('');
    }

    // Public API methods
    async playMacro(macroId) {
        const macro = this.macros.get(macroId);
        if (macro) {
            await this.interpreter.execute(macro.script);
        }
    }

    editMacro(macroId) {
        const macro = this.macros.get(macroId);
        if (macro) {
            document.getElementById('script-editor').value = macro.script;
            this.switchScriptTab('editor');
        }
    }

    deleteMacro(macroId) {
        if (confirm('Delete this macro?')) {
            this.macros.delete(macroId);
            this.updateMacroList();
        }
    }

    unscheduleTask(taskName) {
        this.scheduler.unschedule(taskName);
        this.updateTaskList();
    }

    loadScript(scriptId) {
        const script = this.scripts.get(scriptId);
        if (script) {
            document.getElementById('script-editor').value = script.code;
            this.switchScriptTab('editor');
            this.updateEditorStatus();
        }
    }

    showUI() {
        this.uiElement.classList.add('show');
    }

    hideUI() {
        this.uiElement.classList.remove('show');
    }

    // Public API
    executeScript(code) {
        return this.interpreter.execute(code);
    }

    addScript(id, script) {
        this.scripts.set(id, script);
        this.updateLibrary();
    }

    getScripts() {
        return Array.from(this.scripts.entries());
    }
}
