// Enhanced Sidebar Navigation System
export class SidebarNavigation {
    constructor() {
        this.isVisible = false;
        this.activePanel = 'bookmarks';
        this.panels = new Map();
        this.shortcuts = new Map();
        
        this.init();
    }

    async init() {
        console.log('Initializing Enhanced Sidebar Navigation...');
        
        this.createSidebarStructure();
        this.setupPanels();
        this.bindEvents();
        this.registerShortcuts();
        
        console.log('Sidebar Navigation ready');
    }

    createSidebarStructure() {
        const sidebar = document.createElement('div');
        sidebar.id = 'sidebar-navigation';
        sidebar.className = 'sidebar-navigation';
        
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-toggle-group">
                    <button class="sidebar-toggle" id="sidebar-toggle" title="Toggle Sidebar (Ctrl+B)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                        </svg>
                    </button>
                </div>
                <div class="sidebar-tabs">
                    <button class="sidebar-tab active" data-panel="bookmarks" title="Bookmarks">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                    </button>
                    <button class="sidebar-tab" data-panel="history" title="History">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                    </button>
                    <button class="sidebar-tab" data-panel="downloads" title="Downloads">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                    <button class="sidebar-tab" data-panel="extensions" title="Extensions">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                            <line x1="16" y1="8" x2="2" y2="22"/>
                            <line x1="17.5" y1="15" x2="9" y2="15"/>
                        </svg>
                    </button>
                    <button class="sidebar-tab" data-panel="ai" title="AI Assistant">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </button>
                    <button class="sidebar-tab" data-panel="tools" title="Developer Tools">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="sidebar-content">
                <div class="sidebar-panel active" id="bookmarks-panel">
                    <div class="panel-header">
                        <h3>Bookmarks</h3>
                        <div class="panel-actions">
                            <button class="panel-action-btn" id="add-bookmark" title="Add Bookmark">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                            <button class="panel-action-btn" id="bookmark-menu" title="Bookmark Menu">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"/>
                                    <circle cx="19" cy="12" r="1"/>
                                    <circle cx="5" cy="12" r="1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="panel-search">
                        <input type="text" placeholder="Search bookmarks..." class="search-input">
                    </div>
                    <div class="panel-body" id="bookmarks-list">
                        <div class="bookmark-folder">
                            <div class="folder-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                </svg>
                                <span>Bookmarks Bar</span>
                            </div>
                            <div class="folder-content">
                                <div class="bookmark-item">
                                    <div class="bookmark-favicon">🌐</div>
                                    <div class="bookmark-info">
                                        <div class="bookmark-title">GitHub</div>
                                        <div class="bookmark-url">https://github.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-panel" id="history-panel">
                    <div class="panel-header">
                        <h3>History</h3>
                        <div class="panel-actions">
                            <button class="panel-action-btn" id="clear-history" title="Clear History">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3,6 5,6 21,6"/>
                                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="panel-search">
                        <input type="text" placeholder="Search history..." class="search-input">
                    </div>
                    <div class="panel-body" id="history-list">
                        <div class="history-group">
                            <div class="history-date">Today</div>
                            <div class="history-item">
                                <div class="history-favicon">🌐</div>
                                <div class="history-info">
                                    <div class="history-title">Example Website</div>
                                    <div class="history-url">https://example.com</div>
                                    <div class="history-time">2:30 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-panel" id="downloads-panel">
                    <div class="panel-header">
                        <h3>Downloads</h3>
                        <div class="panel-actions">
                            <button class="panel-action-btn" id="clear-downloads" title="Clear Downloads">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3,6 5,6 21,6"/>
                                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="panel-body" id="downloads-list">
                        <div class="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            <p>No downloads yet</p>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-panel" id="extensions-panel">
                    <div class="panel-header">
                        <h3>Extensions</h3>
                        <div class="panel-actions">
                            <button class="panel-action-btn" id="manage-extensions" title="Manage Extensions">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="panel-body" id="extensions-list">
                        <div class="extension-item">
                            <div class="extension-icon">🔧</div>
                            <div class="extension-info">
                                <div class="extension-name">Universal Extensions</div>
                                <div class="extension-status enabled">Enabled</div>
                            </div>
                            <div class="extension-toggle">
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-panel" id="ai-panel">
                    <div class="panel-header">
                        <h3>AI Assistant</h3>
                        <div class="panel-actions">
                            <button class="panel-action-btn" id="ai-settings" title="AI Settings">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="panel-body" id="ai-chat">
                        <div class="ai-conversation">
                            <div class="ai-message">
                                <div class="ai-avatar">🤖</div>
                                <div class="ai-content">
                                    <p>Hello! I'm your AI assistant. How can I help you today?</p>
                                </div>
                            </div>
                        </div>
                        <div class="ai-input-container">
                            <input type="text" placeholder="Ask me anything..." class="ai-input">
                            <button class="ai-send-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-panel" id="tools-panel">
                    <div class="panel-header">
                        <h3>Developer Tools</h3>
                    </div>
                    <div class="panel-body">
                        <div class="tools-grid">
                            <button class="tool-item" id="console-tool">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="4,17 10,11 4,5"/>
                                    <line x1="12" y1="19" x2="20" y2="19"/>
                                </svg>
                                <span>Console</span>
                            </button>
                            <button class="tool-item" id="inspector-tool">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 12l2 2 4-4"/>
                                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                                </svg>
                                <span>Inspector</span>
                            </button>
                            <button class="tool-item" id="network-tool">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M16 3h5v5"/>
                                    <path d="M8 3H3v5"/>
                                    <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/>
                                    <path d="M21 3l-7.828 7.828A4 4 0 0 0 12 13.657V22"/>
                                </svg>
                                <span>Network</span>
                            </button>
                            <button class="tool-item" id="performance-tool">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3v18h18"/>
                                    <path d="M7 12l4-4 4 4 4-4"/>
                                </svg>
                                <span>Performance</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-footer">
                <div class="sidebar-resize-handle"></div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        this.sidebarElement = sidebar;
    }

    setupPanels() {
        // Register all panels
        this.panels.set('bookmarks', {
            element: document.getElementById('bookmarks-panel'),
            title: 'Bookmarks',
            icon: 'bookmark'
        });
        
        this.panels.set('history', {
            element: document.getElementById('history-panel'),
            title: 'History',
            icon: 'clock'
        });
        
        this.panels.set('downloads', {
            element: document.getElementById('downloads-panel'),
            title: 'Downloads',
            icon: 'download'
        });
        
        this.panels.set('extensions', {
            element: document.getElementById('extensions-panel'),
            title: 'Extensions',
            icon: 'puzzle'
        });
        
        this.panels.set('ai', {
            element: document.getElementById('ai-panel'),
            title: 'AI Assistant',
            icon: 'brain'
        });
        
        this.panels.set('tools', {
            element: document.getElementById('tools-panel'),
            title: 'Developer Tools',
            icon: 'wrench'
        });
    }

    bindEvents() {
        // Toggle sidebar
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            this.toggle();
        });
        
        // Tab switching
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const panel = e.currentTarget.dataset.panel;
                this.switchPanel(panel);
            });
        });
        
        // Search functionality
        document.querySelectorAll('.search-input').forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value, e.target.closest('.sidebar-panel').id);
            });
        });
        
        // AI input
        const aiInput = document.querySelector('.ai-input');
        const aiSendBtn = document.querySelector('.ai-send-btn');
        
        aiSendBtn.addEventListener('click', () => {
            this.sendAIMessage(aiInput.value);
            aiInput.value = '';
        });
        
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIMessage(aiInput.value);
                aiInput.value = '';
            }
        });
        
        // Tool items
        document.querySelectorAll('.tool-item').forEach(tool => {
            tool.addEventListener('click', (e) => {
                const toolId = e.currentTarget.id;
                this.openTool(toolId);
            });
        });
        
        // Resize handle
        this.setupResizeHandle();
    }

    registerShortcuts() {
        this.shortcuts.set('Ctrl+B', () => this.toggle());
        this.shortcuts.set('Ctrl+Shift+B', () => this.switchPanel('bookmarks'));
        this.shortcuts.set('Ctrl+H', () => this.switchPanel('history'));
        this.shortcuts.set('Ctrl+Shift+J', () => this.switchPanel('downloads'));
        this.shortcuts.set('Ctrl+Shift+AI', () => this.switchPanel('ai'));
        
        document.addEventListener('keydown', (e) => {
            const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
            const shortcut = this.shortcuts.get(key);
            if (shortcut) {
                e.preventDefault();
                shortcut();
            }
        });
    }

    setupResizeHandle() {
        const handle = document.querySelector('.sidebar-resize-handle');
        let isResizing = false;
        
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        });
        
        const handleResize = (e) => {
            if (!isResizing) return;
            
            const newWidth = e.clientX;
            if (newWidth >= 200 && newWidth <= 500) {
                this.sidebarElement.style.width = `${newWidth}px`;
            }
        };
        
        const stopResize = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        };
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.sidebarElement.classList.toggle('visible', this.isVisible);
        
        // Adjust main content
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.style.marginLeft = this.isVisible ? '320px' : '0';
        }
    }

    switchPanel(panelId) {
        // Update active tab
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.panel === panelId);
        });
        
        // Update active panel
        document.querySelectorAll('.sidebar-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${panelId}-panel`);
        });
        
        this.activePanel = panelId;
        
        // Show sidebar if hidden
        if (!this.isVisible) {
            this.toggle();
        }
    }

    handleSearch(query, panelId) {
        const panel = document.getElementById(panelId);
        const items = panel.querySelectorAll('.bookmark-item, .history-item, .extension-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            item.style.display = matches ? 'flex' : 'none';
        });
    }

    sendAIMessage(message) {
        if (!message.trim()) return;
        
        const conversation = document.querySelector('.ai-conversation');
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.innerHTML = `
            <div class="user-avatar">👤</div>
            <div class="user-content">
                <p>${message}</p>
            </div>
        `;
        conversation.appendChild(userMessage);
        
        // Simulate AI response
        setTimeout(() => {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'ai-message';
            aiMessage.innerHTML = `
                <div class="ai-avatar">🤖</div>
                <div class="ai-content">
                    <p>I understand you're asking about "${message}". Let me help you with that...</p>
                </div>
            `;
            conversation.appendChild(aiMessage);
            conversation.scrollTop = conversation.scrollHeight;
        }, 1000);
        
        conversation.scrollTop = conversation.scrollHeight;
    }

    openTool(toolId) {
        // Integrate with existing developer tools
        if (window.app?.nextGenDevTools) {
            window.app.nextGenDevTools.showUI();
            
            // Switch to specific tool
            switch (toolId) {
                case 'console-tool':
                    window.app.nextGenDevTools.switchTab('console');
                    break;
                case 'inspector-tool':
                    window.app.nextGenDevTools.switchTab('inspector');
                    break;
                case 'network-tool':
                    window.app.nextGenDevTools.switchTab('network');
                    break;
                case 'performance-tool':
                    window.app.nextGenDevTools.switchTab('performance');
                    break;
            }
        }
    }

    // Public API
    show() {
        if (!this.isVisible) this.toggle();
    }

    hide() {
        if (this.isVisible) this.toggle();
    }

    showPanel(panelId) {
        this.switchPanel(panelId);
    }

    addBookmark(title, url, favicon = '🌐') {
        const bookmarksList = document.getElementById('bookmarks-list');
        const folderContent = bookmarksList.querySelector('.folder-content');
        
        const bookmarkItem = document.createElement('div');
        bookmarkItem.className = 'bookmark-item';
        bookmarkItem.innerHTML = `
            <div class="bookmark-favicon">${favicon}</div>
            <div class="bookmark-info">
                <div class="bookmark-title">${title}</div>
                <div class="bookmark-url">${url}</div>
            </div>
        `;
        
        bookmarkItem.addEventListener('click', () => {
            if (window.app?.navigateToUrl) {
                window.app.navigateToUrl(url);
            }
        });
        
        folderContent.appendChild(bookmarkItem);
    }

    addHistoryItem(title, url, favicon = '🌐') {
        const historyList = document.getElementById('history-list');
        const todayGroup = historyList.querySelector('.history-group');
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-favicon">${favicon}</div>
            <div class="history-info">
                <div class="history-title">${title}</div>
                <div class="history-url">${url}</div>
                <div class="history-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        historyItem.addEventListener('click', () => {
            if (window.app?.navigateToUrl) {
                window.app.navigateToUrl(url);
            }
        });
        
        todayGroup.appendChild(historyItem);
    }
}
