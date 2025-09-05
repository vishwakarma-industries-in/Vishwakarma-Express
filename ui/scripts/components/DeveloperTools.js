// Developer Tools Component
export class DeveloperTools {
    constructor() {
        this.isVisible = false;
        this.activeTab = 'console';
        this.consoleMessages = [];
        this.networkRequests = [];
        this.elements = [];
        this.storageData = {};
        
        this.init();
    }

    async init() {
        this.createDevToolsPanel();
        this.setupEventListeners();
        this.loadStorageData();
        this.startNetworkMonitoring();
    }

    createDevToolsPanel() {
        const panel = document.createElement('div');
        panel.id = 'devtools-panel';
        panel.className = 'devtools-panel';
        
        panel.innerHTML = `
            <div class="devtools-header">
                <div class="devtools-tabs">
                    <button class="devtools-tab active" data-tab="console">Console</button>
                    <button class="devtools-tab" data-tab="elements">Elements</button>
                    <button class="devtools-tab" data-tab="network">Network</button>
                    <button class="devtools-tab" data-tab="storage">Storage</button>
                </div>
                <div class="devtools-controls">
                    <button class="devtools-btn" id="clear-devtools" title="Clear">🗑️</button>
                    <button class="devtools-btn" id="close-devtools" title="Close">&times;</button>
                </div>
            </div>
            
            <div class="devtools-content">
                ${this.renderConsoleTab()}
                ${this.renderElementsTab()}
                ${this.renderNetworkTab()}
                ${this.renderStorageTab()}
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupPanelEvents(panel);
    }

    renderConsoleTab() {
        return `
            <div class="devtools-tab-content active" data-tab="console">
                <div class="console-output" id="console-output">
                    <div class="console-welcome">
                        <div class="console-logo">🛠️</div>
                        <p>Vishwakarma Express Developer Console</p>
                        <small>Type JavaScript commands below or use the browser to see logs</small>
                    </div>
                </div>
                <div class="console-input-container">
                    <span class="console-prompt">&gt;</span>
                    <input type="text" id="console-input" placeholder="Enter JavaScript command..." autocomplete="off">
                    <button class="console-execute" id="console-execute">▶</button>
                </div>
            </div>
        `;
    }

    renderElementsTab() {
        return `
            <div class="devtools-tab-content" data-tab="elements">
                <div class="elements-toolbar">
                    <button class="devtools-btn" id="inspect-element" title="Select Element">🔍</button>
                    <button class="devtools-btn" id="refresh-elements" title="Refresh">🔄</button>
                </div>
                <div class="elements-tree" id="elements-tree">
                    <div class="elements-loading">
                        <p>Click "Select Element" to inspect page elements</p>
                    </div>
                </div>
                <div class="element-properties" id="element-properties">
                    <h4>Properties</h4>
                    <div class="properties-content">
                        <p>Select an element to view its properties</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderNetworkTab() {
        return `
            <div class="devtools-tab-content" data-tab="network">
                <div class="network-toolbar">
                    <button class="devtools-btn" id="clear-network" title="Clear">🗑️</button>
                    <button class="devtools-btn" id="record-network" title="Record" data-recording="true">⏺️</button>
                    <span class="network-stats" id="network-stats">0 requests</span>
                </div>
                <div class="network-table">
                    <div class="network-header">
                        <div class="network-col-name">Name</div>
                        <div class="network-col-status">Status</div>
                        <div class="network-col-type">Type</div>
                        <div class="network-col-size">Size</div>
                        <div class="network-col-time">Time</div>
                    </div>
                    <div class="network-body" id="network-body">
                        <div class="network-empty">
                            <p>No network requests recorded</p>
                            <small>Navigate to a page to see network activity</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStorageTab() {
        return `
            <div class="devtools-tab-content" data-tab="storage">
                <div class="storage-sidebar">
                    <div class="storage-section">
                        <h4>Local Storage</h4>
                        <div class="storage-item active" data-storage="localStorage">
                            📦 localStorage
                        </div>
                    </div>
                    <div class="storage-section">
                        <h4>Session Storage</h4>
                        <div class="storage-item" data-storage="sessionStorage">
                            📋 sessionStorage
                        </div>
                    </div>
                    <div class="storage-section">
                        <h4>Cookies</h4>
                        <div class="storage-item" data-storage="cookies">
                            🍪 Cookies
                        </div>
                    </div>
                </div>
                <div class="storage-content">
                    <div class="storage-toolbar">
                        <button class="devtools-btn" id="refresh-storage" title="Refresh">🔄</button>
                        <button class="devtools-btn" id="clear-storage" title="Clear Selected">🗑️</button>
                    </div>
                    <div class="storage-table" id="storage-table">
                        <div class="storage-table-header">
                            <div class="storage-col-key">Key</div>
                            <div class="storage-col-value">Value</div>
                        </div>
                        <div class="storage-table-body" id="storage-table-body">
                            <!-- Storage items will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // F12 key to toggle dev tools
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                this.togglePanel();
            }
            // Ctrl+Shift+I alternative
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                this.togglePanel();
            }
        });

        // Console logging override
        this.overrideConsole();
        
        // Network request monitoring
        this.overrideXHR();
        this.overrideFetch();
    }

    setupPanelEvents(panel) {
        // Tab switching
        panel.querySelectorAll('.devtools-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Close button
        panel.querySelector('#close-devtools').addEventListener('click', () => {
            this.hidePanel();
        });

        // Clear button
        panel.querySelector('#clear-devtools').addEventListener('click', () => {
            this.clearCurrentTab();
        });

        // Console input
        const consoleInput = panel.querySelector('#console-input');
        const executeBtn = panel.querySelector('#console-execute');
        
        consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeConsoleCommand(consoleInput.value);
                consoleInput.value = '';
            }
        });
        
        executeBtn.addEventListener('click', () => {
            this.executeConsoleCommand(consoleInput.value);
            consoleInput.value = '';
        });

        // Elements tab
        panel.querySelector('#inspect-element').addEventListener('click', () => {
            this.startElementInspection();
        });
        
        panel.querySelector('#refresh-elements').addEventListener('click', () => {
            this.refreshElements();
        });

        // Network tab
        panel.querySelector('#clear-network').addEventListener('click', () => {
            this.clearNetworkRequests();
        });
        
        panel.querySelector('#record-network').addEventListener('click', (e) => {
            this.toggleNetworkRecording(e.target);
        });

        // Storage tab
        panel.querySelectorAll('.storage-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectStorageType(item.dataset.storage);
            });
        });
        
        panel.querySelector('#refresh-storage').addEventListener('click', () => {
            this.refreshStorage();
        });
        
        panel.querySelector('#clear-storage').addEventListener('click', () => {
            this.clearSelectedStorage();
        });
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    showPanel() {
        const panel = document.getElementById('devtools-panel');
        panel.classList.add('show');
        this.isVisible = true;
        
        // Adjust main content
        const browserContainer = document.querySelector('.browser-container');
        if (browserContainer) {
            browserContainer.classList.add('devtools-open');
        }
        
        this.refreshCurrentTab();
    }

    hidePanel() {
        const panel = document.getElementById('devtools-panel');
        panel.classList.remove('show');
        this.isVisible = false;
        
        // Reset main content
        const browserContainer = document.querySelector('.browser-container');
        if (browserContainer) {
            browserContainer.classList.remove('devtools-open');
        }
    }

    switchTab(tabName) {
        const panel = document.getElementById('devtools-panel');
        
        // Update tab buttons
        panel.querySelectorAll('.devtools-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab content
        panel.querySelectorAll('.devtools-tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
        
        this.activeTab = tabName;
        this.refreshCurrentTab();
    }

    refreshCurrentTab() {
        switch (this.activeTab) {
            case 'console':
                this.renderConsoleMessages();
                break;
            case 'elements':
                this.refreshElements();
                break;
            case 'network':
                this.renderNetworkRequests();
                break;
            case 'storage':
                this.refreshStorage();
                break;
        }
    }

    clearCurrentTab() {
        switch (this.activeTab) {
            case 'console':
                this.clearConsole();
                break;
            case 'network':
                this.clearNetworkRequests();
                break;
        }
    }

    // Console functionality
    overrideConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args) => {
            this.addConsoleMessage('log', args);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.addConsoleMessage('error', args);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.addConsoleMessage('warn', args);
            originalWarn.apply(console, args);
        };

        console.info = (...args) => {
            this.addConsoleMessage('info', args);
            originalInfo.apply(console, args);
        };
    }

    addConsoleMessage(type, args) {
        const message = {
            type,
            content: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '),
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.consoleMessages.push(message);
        
        // Limit console history
        if (this.consoleMessages.length > 1000) {
            this.consoleMessages = this.consoleMessages.slice(-1000);
        }
        
        if (this.isVisible && this.activeTab === 'console') {
            this.renderConsoleMessages();
        }
    }

    executeConsoleCommand(command) {
        if (!command.trim()) return;
        
        // Add command to console
        this.addConsoleMessage('command', [command]);
        
        try {
            const result = eval(command);
            this.addConsoleMessage('result', [result]);
        } catch (error) {
            this.addConsoleMessage('error', [error.message]);
        }
    }

    renderConsoleMessages() {
        const output = document.getElementById('console-output');
        if (!output) return;
        
        // Keep welcome message if no messages
        if (this.consoleMessages.length === 0) {
            return;
        }
        
        output.innerHTML = '';
        
        this.consoleMessages.slice(-100).forEach(message => {
            const messageEl = document.createElement('div');
            messageEl.className = `console-message console-${message.type}`;
            
            const icon = this.getConsoleIcon(message.type);
            messageEl.innerHTML = `
                <span class="console-timestamp">${message.timestamp}</span>
                <span class="console-icon">${icon}</span>
                <span class="console-text">${this.escapeHtml(message.content)}</span>
            `;
            
            output.appendChild(messageEl);
        });
        
        // Auto-scroll to bottom
        output.scrollTop = output.scrollHeight;
    }

    getConsoleIcon(type) {
        const icons = {
            log: '📝',
            error: '❌',
            warn: '⚠️',
            info: 'ℹ️',
            command: '▶️',
            result: '✅'
        };
        return icons[type] || '📝';
    }

    clearConsole() {
        this.consoleMessages = [];
        this.renderConsoleMessages();
        
        const output = document.getElementById('console-output');
        if (output) {
            output.innerHTML = `
                <div class="console-welcome">
                    <div class="console-logo">🛠️</div>
                    <p>Console cleared</p>
                </div>
            `;
        }
    }

    // Network monitoring
    overrideXHR() {
        const originalXHR = window.XMLHttpRequest;
        const self = this;
        
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const startTime = Date.now();
            
            const originalOpen = xhr.open;
            const originalSend = xhr.send;
            
            let method, url;
            
            xhr.open = function(m, u, ...args) {
                method = m;
                url = u;
                return originalOpen.apply(this, [m, u, ...args]);
            };
            
            xhr.send = function(...args) {
                xhr.addEventListener('loadend', () => {
                    const endTime = Date.now();
                    self.addNetworkRequest({
                        method,
                        url,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseType: xhr.getResponseHeader('content-type') || 'unknown',
                        size: xhr.responseText?.length || 0,
                        time: endTime - startTime,
                        timestamp: new Date().toLocaleTimeString()
                    });
                });
                
                return originalSend.apply(this, args);
            };
            
            return xhr;
        };
    }

    overrideFetch() {
        const originalFetch = window.fetch;
        const self = this;
        
        window.fetch = async function(url, options = {}) {
            const startTime = Date.now();
            const method = options.method || 'GET';
            
            try {
                const response = await originalFetch(url, options);
                const endTime = Date.now();
                
                self.addNetworkRequest({
                    method,
                    url: typeof url === 'string' ? url : url.url,
                    status: response.status,
                    statusText: response.statusText,
                    responseType: response.headers.get('content-type') || 'unknown',
                    size: parseInt(response.headers.get('content-length')) || 0,
                    time: endTime - startTime,
                    timestamp: new Date().toLocaleTimeString()
                });
                
                return response;
            } catch (error) {
                const endTime = Date.now();
                
                self.addNetworkRequest({
                    method,
                    url: typeof url === 'string' ? url : url.url,
                    status: 0,
                    statusText: 'Failed',
                    responseType: 'error',
                    size: 0,
                    time: endTime - startTime,
                    timestamp: new Date().toLocaleTimeString(),
                    error: error.message
                });
                
                throw error;
            }
        };
    }

    addNetworkRequest(request) {
        this.networkRequests.push(request);
        
        if (this.networkRequests.length > 500) {
            this.networkRequests = this.networkRequests.slice(-500);
        }
        
        if (this.isVisible && this.activeTab === 'network') {
            this.renderNetworkRequests();
        }
    }

    renderNetworkRequests() {
        const body = document.getElementById('network-body');
        const stats = document.getElementById('network-stats');
        
        if (!body || !stats) return;
        
        stats.textContent = `${this.networkRequests.length} requests`;
        
        if (this.networkRequests.length === 0) {
            body.innerHTML = `
                <div class="network-empty">
                    <p>No network requests recorded</p>
                    <small>Navigate to a page to see network activity</small>
                </div>
            `;
            return;
        }
        
        body.innerHTML = '';
        
        this.networkRequests.slice(-50).forEach(request => {
            const row = document.createElement('div');
            row.className = `network-row status-${Math.floor(request.status / 100)}xx`;
            
            const fileName = request.url.split('/').pop() || request.url;
            const statusClass = request.status >= 200 && request.status < 300 ? 'success' : 
                               request.status >= 400 ? 'error' : 'warning';
            
            row.innerHTML = `
                <div class="network-col-name" title="${request.url}">${fileName}</div>
                <div class="network-col-status status-${statusClass}">${request.status}</div>
                <div class="network-col-type">${request.method}</div>
                <div class="network-col-size">${this.formatBytes(request.size)}</div>
                <div class="network-col-time">${request.time}ms</div>
            `;
            
            body.appendChild(row);
        });
    }

    clearNetworkRequests() {
        this.networkRequests = [];
        this.renderNetworkRequests();
    }

    toggleNetworkRecording(button) {
        const isRecording = button.dataset.recording === 'true';
        button.dataset.recording = !isRecording;
        button.textContent = isRecording ? '⏸️' : '⏺️';
        button.title = isRecording ? 'Resume Recording' : 'Pause Recording';
    }

    startNetworkMonitoring() {
        // Monitor for page navigation
        window.addEventListener('beforeunload', () => {
            this.addNetworkRequest({
                method: 'GET',
                url: window.location.href,
                status: 200,
                statusText: 'OK',
                responseType: 'text/html',
                size: document.documentElement.outerHTML.length,
                time: 0,
                timestamp: new Date().toLocaleTimeString()
            });
        });
    }

    // Storage functionality
    loadStorageData() {
        this.storageData = {
            localStorage: { ...localStorage },
            sessionStorage: { ...sessionStorage },
            cookies: this.parseCookies()
        };
    }

    parseCookies() {
        const cookies = {};
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name) {
                cookies[name] = value || '';
            }
        });
        return cookies;
    }

    selectStorageType(storageType) {
        const panel = document.getElementById('devtools-panel');
        
        // Update sidebar selection
        panel.querySelectorAll('.storage-item').forEach(item => {
            item.classList.toggle('active', item.dataset.storage === storageType);
        });
        
        this.renderStorageData(storageType);
    }

    renderStorageData(storageType) {
        const tableBody = document.getElementById('storage-table-body');
        if (!tableBody) return;
        
        this.loadStorageData();
        const data = this.storageData[storageType] || {};
        
        tableBody.innerHTML = '';
        
        if (Object.keys(data).length === 0) {
            tableBody.innerHTML = `
                <div class="storage-empty">
                    <p>No ${storageType} data found</p>
                </div>
            `;
            return;
        }
        
        Object.entries(data).forEach(([key, value]) => {
            const row = document.createElement('div');
            row.className = 'storage-row';
            
            const displayValue = typeof value === 'string' && value.length > 100 
                ? value.substring(0, 100) + '...' 
                : value;
            
            row.innerHTML = `
                <div class="storage-col-key" title="${key}">${key}</div>
                <div class="storage-col-value" title="${value}">${this.escapeHtml(String(displayValue))}</div>
            `;
            
            tableBody.appendChild(row);
        });
    }

    refreshStorage() {
        const activeItem = document.querySelector('.storage-item.active');
        if (activeItem) {
            this.renderStorageData(activeItem.dataset.storage);
        }
    }

    clearSelectedStorage() {
        const activeItem = document.querySelector('.storage-item.active');
        if (!activeItem) return;
        
        const storageType = activeItem.dataset.storage;
        
        if (confirm(`Clear all ${storageType} data?`)) {
            switch (storageType) {
                case 'localStorage':
                    localStorage.clear();
                    break;
                case 'sessionStorage':
                    sessionStorage.clear();
                    break;
                case 'cookies':
                    document.cookie.split(';').forEach(cookie => {
                        const name = cookie.split('=')[0].trim();
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
                    });
                    break;
            }
            
            this.refreshStorage();
        }
    }

    // Element inspection
    startElementInspection() {
        document.body.style.cursor = 'crosshair';
        
        const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            this.inspectElement(e.target);
            document.body.style.cursor = '';
            document.removeEventListener('click', handleClick, true);
        };
        
        document.addEventListener('click', handleClick, true);
    }

    inspectElement(element) {
        const tree = document.getElementById('elements-tree');
        const properties = document.getElementById('element-properties');
        
        if (!tree || !properties) return;
        
        // Render element tree
        tree.innerHTML = this.renderElementTree(element);
        
        // Render element properties
        properties.innerHTML = `
            <h4>Properties</h4>
            <div class="properties-content">
                <div class="property-group">
                    <strong>Tag:</strong> ${element.tagName.toLowerCase()}
                </div>
                <div class="property-group">
                    <strong>ID:</strong> ${element.id || 'none'}
                </div>
                <div class="property-group">
                    <strong>Classes:</strong> ${element.className || 'none'}
                </div>
                <div class="property-group">
                    <strong>Text Content:</strong> ${element.textContent?.substring(0, 100) || 'none'}
                </div>
            </div>
        `;
    }

    renderElementTree(element) {
        const getElementString = (el) => {
            let str = `&lt;${el.tagName.toLowerCase()}`;
            if (el.id) str += ` id="${el.id}"`;
            if (el.className) str += ` class="${el.className}"`;
            str += '&gt;';
            return str;
        };
        
        return `
            <div class="element-tree-item">
                <div class="element-node selected">
                    ${getElementString(element)}
                </div>
            </div>
        `;
    }

    refreshElements() {
        const tree = document.getElementById('elements-tree');
        if (tree && tree.innerHTML.includes('Click "Select Element"')) {
            // Reset to default state
            tree.innerHTML = `
                <div class="elements-loading">
                    <p>Click "Select Element" to inspect page elements</p>
                </div>
            `;
        }
    }

    // Utility functions
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API
    log(...args) {
        this.addConsoleMessage('log', args);
    }

    error(...args) {
        this.addConsoleMessage('error', args);
    }

    warn(...args) {
        this.addConsoleMessage('warn', args);
    }

    info(...args) {
        this.addConsoleMessage('info', args);
    }
}
