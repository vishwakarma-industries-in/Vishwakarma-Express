// Keyboard Shortcuts Manager Component
export class KeyboardManager {
    constructor() {
        this.shortcuts = {
            // Navigation
            'ctrl+l': { action: 'focusAddressBar', description: 'Focus address bar' },
            'alt+left': { action: 'goBack', description: 'Go back' },
            'alt+right': { action: 'goForward', description: 'Go forward' },
            'f5': { action: 'reload', description: 'Reload page' },
            'ctrl+f5': { action: 'hardReload', description: 'Hard reload' },
            'ctrl+r': { action: 'reload', description: 'Reload page' },
            'ctrl+shift+r': { action: 'hardReload', description: 'Hard reload' },
            'home': { action: 'goHome', description: 'Go to homepage' },
            
            // Tabs
            'ctrl+t': { action: 'newTab', description: 'New tab' },
            'ctrl+w': { action: 'closeTab', description: 'Close current tab' },
            'ctrl+shift+t': { action: 'reopenTab', description: 'Reopen closed tab' },
            'ctrl+tab': { action: 'nextTab', description: 'Next tab' },
            'ctrl+shift+tab': { action: 'prevTab', description: 'Previous tab' },
            'ctrl+1': { action: 'switchToTab', args: [0], description: 'Switch to tab 1' },
            'ctrl+2': { action: 'switchToTab', args: [1], description: 'Switch to tab 2' },
            'ctrl+3': { action: 'switchToTab', args: [2], description: 'Switch to tab 3' },
            'ctrl+4': { action: 'switchToTab', args: [3], description: 'Switch to tab 4' },
            'ctrl+5': { action: 'switchToTab', args: [4], description: 'Switch to tab 5' },
            'ctrl+6': { action: 'switchToTab', args: [5], description: 'Switch to tab 6' },
            'ctrl+7': { action: 'switchToTab', args: [6], description: 'Switch to tab 7' },
            'ctrl+8': { action: 'switchToTab', args: [7], description: 'Switch to tab 8' },
            'ctrl+9': { action: 'switchToTab', args: [-1], description: 'Switch to last tab' },
            
            // Bookmarks
            'ctrl+d': { action: 'addBookmark', description: 'Add bookmark' },
            'ctrl+shift+b': { action: 'toggleBookmarks', description: 'Toggle bookmarks bar' },
            'ctrl+shift+o': { action: 'openBookmarks', description: 'Open bookmarks manager' },
            
            // History
            'ctrl+h': { action: 'openHistory', description: 'Open history' },
            'ctrl+shift+delete': { action: 'clearHistory', description: 'Clear browsing data' },
            
            // Downloads
            'ctrl+j': { action: 'openDownloads', description: 'Open downloads' },
            
            // Developer Tools
            'f12': { action: 'toggleDevTools', description: 'Toggle developer tools' },
            'ctrl+shift+i': { action: 'toggleDevTools', description: 'Toggle developer tools' },
            'ctrl+shift+c': { action: 'inspectElement', description: 'Inspect element' },
            'ctrl+shift+j': { action: 'openConsole', description: 'Open console' },
            
            // AI Assistant
            'ctrl+shift+a': { action: 'toggleAI', description: 'Toggle AI assistant' },
            'ctrl+alt+a': { action: 'toggleAdvancedAI', description: 'Toggle advanced AI browser assistant' },
            'ctrl+alt+c': { action: 'toggleCodeGen', description: 'Toggle code generation tools' },
            'ctrl+alt+g': { action: 'generateCode', description: 'Quick code generation' },
            
            // Settings
            'ctrl+,': { action: 'openSettings', description: 'Open settings' },
            
            // Security
            'ctrl+shift+delete': { action: 'openSecurity', description: 'Open security panel' },
            
            // Performance
            'ctrl+shift+p': { action: 'openPerformance', description: 'Open performance monitor' },
            
            // Page actions
            'ctrl+f': { action: 'findInPage', description: 'Find in page' },
            'ctrl+g': { action: 'findNext', description: 'Find next' },
            'ctrl+shift+g': { action: 'findPrev', description: 'Find previous' },
            'ctrl+u': { action: 'viewSource', description: 'View page source' },
            'ctrl+s': { action: 'savePage', description: 'Save page' },
            'ctrl+p': { action: 'printPage', description: 'Print page' },
            
            // Zoom
            'ctrl+=': { action: 'zoomIn', description: 'Zoom in' },
            'ctrl+-': { action: 'zoomOut', description: 'Zoom out' },
            'ctrl+0': { action: 'resetZoom', description: 'Reset zoom' },
            
            // Window
            'f11': { action: 'toggleFullscreen', description: 'Toggle fullscreen' },
            'ctrl+shift+n': { action: 'newWindow', description: 'New window' },
            'ctrl+shift+w': { action: 'closeWindow', description: 'Close window' },
            
            // Accessibility
            'alt+shift+a': { action: 'toggleAccessibility', description: 'Toggle accessibility mode' },
            
            // Quick actions
            'ctrl+k': { action: 'quickSearch', description: 'Quick search' },
            'ctrl+e': { action: 'quickCommand', description: 'Quick command' },
            
            // Text editing (in forms)
            'ctrl+a': { action: 'selectAll', description: 'Select all', context: 'input' },
            'ctrl+c': { action: 'copy', description: 'Copy', context: 'input' },
            'ctrl+v': { action: 'paste', description: 'Paste', context: 'input' },
            'ctrl+x': { action: 'cut', description: 'Cut', context: 'input' },
            'ctrl+z': { action: 'undo', description: 'Undo', context: 'input' },
            'ctrl+y': { action: 'redo', description: 'Redo', context: 'input' }
        };
        
        this.customShortcuts = {};
        this.isEnabled = true;
        this.storageKey = 'vishwakarma_shortcuts';
        
        this.init();
    }

    init() {
        this.loadCustomShortcuts();
        this.setupEventListeners();
        this.createShortcutsPanel();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled) return;
            
            const shortcut = this.getShortcutFromEvent(e);
            if (shortcut && this.shortcuts[shortcut]) {
                const shortcutConfig = this.shortcuts[shortcut];
                
                // Check context if specified
                if (shortcutConfig.context) {
                    const activeElement = document.activeElement;
                    const isInput = activeElement && (
                        activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'TEXTAREA' ||
                        activeElement.contentEditable === 'true'
                    );
                    
                    if (shortcutConfig.context === 'input' && !isInput) {
                        return;
                    }
                    if (shortcutConfig.context === 'page' && isInput) {
                        return;
                    }
                }
                
                e.preventDefault();
                this.executeAction(shortcutConfig.action, shortcutConfig.args);
            }
        });
        
        // Help shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1' || (e.ctrlKey && e.key === '?')) {
                e.preventDefault();
                this.showShortcutsHelp();
            }
        });
    }

    getShortcutFromEvent(e) {
        const parts = [];
        
        if (e.ctrlKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        if (e.metaKey) parts.push('meta');
        
        let key = e.key.toLowerCase();
        
        // Handle special keys
        switch (key) {
            case ' ':
                key = 'space';
                break;
            case 'arrowleft':
                key = 'left';
                break;
            case 'arrowright':
                key = 'right';
                break;
            case 'arrowup':
                key = 'up';
                break;
            case 'arrowdown':
                key = 'down';
                break;
            case 'escape':
                key = 'esc';
                break;
        }
        
        parts.push(key);
        return parts.join('+');
    }

    executeAction(action, args = []) {
        try {
            switch (action) {
                // Navigation
                case 'focusAddressBar':
                    this.focusAddressBar();
                    break;
                case 'goBack':
                    this.goBack();
                    break;
                case 'goForward':
                    this.goForward();
                    break;
                case 'reload':
                    this.reload();
                    break;
                case 'hardReload':
                    this.hardReload();
                    break;
                case 'goHome':
                    this.goHome();
                    break;
                
                // Tabs
                case 'newTab':
                    this.newTab();
                    break;
                case 'closeTab':
                    this.closeTab();
                    break;
                case 'reopenTab':
                    this.reopenTab();
                    break;
                case 'nextTab':
                    this.nextTab();
                    break;
                case 'prevTab':
                    this.prevTab();
                    break;
                case 'switchToTab':
                    this.switchToTab(args[0]);
                    break;
                
                // Bookmarks
                case 'addBookmark':
                    this.addBookmark();
                    break;
                case 'toggleBookmarks':
                    this.toggleBookmarks();
                    break;
                case 'openBookmarks':
                    this.openBookmarks();
                    break;
                
                // History
                case 'openHistory':
                    this.openHistory();
                    break;
                case 'clearHistory':
                    this.clearHistory();
                    break;
                
                // Downloads
                case 'openDownloads':
                    this.openDownloads();
                    break;
                
                // Developer Tools
                case 'toggleDevTools':
                    this.toggleDevTools();
                    break;
                case 'inspectElement':
                    this.inspectElement();
                    break;
                case 'openConsole':
                    this.openConsole();
                    break;
                
                // AI Assistant actions
                case 'toggleAI':
                    this.toggleAI();
                    break;
                case 'toggleAdvancedAI':
                    this.toggleAdvancedAI();
                    break;
                case 'toggleCodeGen':
                    this.toggleCodeGen();
                    break;
                case 'generateCode':
                    this.generateCode();
                    break;
                
                // Settings
                case 'openSettings':
                    this.openSettings();
                    break;
                
                // Security
                case 'openSecurity':
                    this.openSecurity();
                    break;
                
                // Performance
                case 'openPerformance':
                    this.openPerformance();
                    break;
                
                // Page actions
                case 'findInPage':
                    this.findInPage();
                    break;
                case 'viewSource':
                    this.viewSource();
                    break;
                case 'savePage':
                    this.savePage();
                    break;
                case 'printPage':
                    this.printPage();
                    break;
                
                // Zoom
                case 'zoomIn':
                    this.zoomIn();
                    break;
                case 'zoomOut':
                    this.zoomOut();
                    break;
                case 'resetZoom':
                    this.resetZoom();
                    break;
                
                // Window
                case 'toggleFullscreen':
                    this.toggleFullscreen();
                    break;
                case 'newWindow':
                    this.newWindow();
                    break;
                
                // Quick actions
                case 'quickSearch':
                    this.quickSearch();
                    break;
                case 'quickCommand':
                    this.quickCommand();
                    break;
                
                default:
                    console.warn(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`Error executing action ${action}:`, error);
        }
    }

    // Navigation actions
    focusAddressBar() {
        const addressInput = document.getElementById('address-input');
        if (addressInput) {
            addressInput.focus();
            addressInput.select();
        }
    }

    goBack() {
        if (window.app && window.app.goBack) {
            window.app.goBack();
        }
    }

    goForward() {
        if (window.app && window.app.goForward) {
            window.app.goForward();
        }
    }

    reload() {
        if (window.app && window.app.reloadTab) {
            window.app.reloadTab();
        }
    }

    hardReload() {
        location.reload(true);
    }

    goHome() {
        const homepage = window.app?.settingsManager?.getSetting('general.homepage') || 'about:blank';
        if (window.app && window.app.navigate) {
            window.app.navigate(homepage);
        }
    }

    // Tab actions
    newTab() {
        if (window.app && window.app.tabManager) {
            window.app.tabManager.createTab();
        }
    }

    closeTab() {
        if (window.app && window.app.tabManager) {
            window.app.tabManager.closeCurrentTab();
        }
    }

    reopenTab() {
        if (window.app && window.app.tabManager) {
            window.app.tabManager.reopenLastClosedTab();
        }
    }

    nextTab() {
        if (window.app && window.app.tabManager) {
            window.app.tabManager.switchToNextTab();
        }
    }

    prevTab() {
        if (window.app && window.app.tabManager) {
            window.app.tabManager.switchToPrevTab();
        }
    }

    switchToTab(index) {
        if (window.app && window.app.tabManager) {
            if (index === -1) {
                window.app.tabManager.switchToLastTab();
            } else {
                window.app.tabManager.switchToTabByIndex(index);
            }
        }
    }

    // Bookmark actions
    addBookmark() {
        if (window.app && window.app.bookmarksManager) {
            window.app.bookmarksManager.addCurrentPage();
        }
    }

    toggleBookmarks() {
        if (window.app && window.app.bookmarksManager) {
            window.app.bookmarksManager.toggleBookmarksBar();
        }
    }

    openBookmarks() {
        if (window.app && window.app.bookmarksManager) {
            window.app.bookmarksManager.showPanel();
        }
    }

    // History actions
    openHistory() {
        if (window.app && window.app.historyManager) {
            window.app.historyManager.showPanel();
        }
    }

    clearHistory() {
        if (window.app && window.app.historyManager) {
            window.app.historyManager.clearAllHistory();
        }
    }

    // Download actions
    openDownloads() {
        if (window.app && window.app.downloadManager) {
            window.app.downloadManager.showPanel();
        }
    }

    // Developer tools actions
    toggleDevTools() {
        if (window.app && window.app.developerTools) {
            window.app.developerTools.togglePanel();
        }
    }

    inspectElement() {
        if (window.app && window.app.developerTools) {
            window.app.developerTools.showPanel();
            window.app.developerTools.switchTab('elements');
            window.app.developerTools.startElementInspection();
        }
    }

    openConsole() {
        if (window.app && window.app.developerTools) {
            window.app.developerTools.showPanel();
            window.app.developerTools.switchTab('console');
        }
    }

    // AI Assistant actions
    toggleAI() {
        if (window.app && window.app.aiAssistant) {
            window.app.aiAssistant.toggleSidebar();
        }
    }

    toggleAdvancedAI() {
        if (window.app && window.app.aiBrowserAssistant) {
            window.app.aiBrowserAssistant.toggle();
        }
    }

    toggleCodeGen() {
        if (window.app && window.app.codeGenerationTools) {
            window.app.codeGenerationTools.toggle();
        }
    }

    generateCode() {
        if (window.app && window.app.codeGenerationTools) {
            window.app.codeGenerationTools.show();
            // Focus the prompt input
            setTimeout(() => {
                const input = document.getElementById('code-prompt');
                if (input) input.focus();
            }, 100);
        }
    }

    // Settings actions
    openSettings() {
        if (window.app && window.app.settingsManager) {
            window.app.settingsManager.showPanel();
        }
    }

    // Security actions
    openSecurity() {
        if (window.app && window.app.securityManager) {
            window.app.securityManager.showPanel();
        }
    }

    // Performance actions
    openPerformance() {
        if (window.app && window.app.performanceManager) {
            window.app.performanceManager.showPanel();
        }
    }

    // Page actions
    findInPage() {
        // Create find bar if it doesn't exist
        let findBar = document.getElementById('find-bar');
        if (!findBar) {
            findBar = this.createFindBar();
        }
        
        findBar.classList.add('show');
        const input = findBar.querySelector('#find-input');
        input.focus();
        input.select();
    }

    createFindBar() {
        const findBar = document.createElement('div');
        findBar.id = 'find-bar';
        findBar.className = 'find-bar';
        
        findBar.innerHTML = `
            <div class="find-content">
                <input type="text" id="find-input" placeholder="Find in page...">
                <button id="find-prev" title="Previous">↑</button>
                <button id="find-next" title="Next">↓</button>
                <span id="find-results">0/0</span>
                <button id="find-close" title="Close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(findBar);
        
        // Setup find bar events
        const input = findBar.querySelector('#find-input');
        const closeBtn = findBar.querySelector('#find-close');
        
        input.addEventListener('input', () => {
            this.performFind(input.value);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    this.findPrev();
                } else {
                    this.findNext();
                }
            } else if (e.key === 'Escape') {
                this.closeFindBar();
            }
        });
        
        closeBtn.addEventListener('click', () => {
            this.closeFindBar();
        });
        
        return findBar;
    }

    performFind(query) {
        if (!query) return;
        
        // Simple text search implementation
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const matches = [];
        let node;
        
        while (node = walker.nextNode()) {
            const text = node.textContent;
            const index = text.toLowerCase().indexOf(query.toLowerCase());
            if (index !== -1) {
                matches.push({ node, index });
            }
        }
        
        // Update results counter
        const resultsSpan = document.getElementById('find-results');
        if (resultsSpan) {
            resultsSpan.textContent = `${matches.length > 0 ? 1 : 0}/${matches.length}`;
        }
        
        // Highlight first match
        if (matches.length > 0) {
            this.highlightMatch(matches[0]);
        }
    }

    highlightMatch(match) {
        const range = document.createRange();
        range.setStart(match.node, match.index);
        range.setEnd(match.node, match.index + document.getElementById('find-input').value.length);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Scroll into view
        range.getBoundingClientRect();
        match.node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    findNext() {
        // Implementation would cycle through matches
        console.log('Find next');
    }

    findPrev() {
        // Implementation would cycle through matches backwards
        console.log('Find previous');
    }

    closeFindBar() {
        const findBar = document.getElementById('find-bar');
        if (findBar) {
            findBar.classList.remove('show');
        }
        
        // Clear selection
        window.getSelection().removeAllRanges();
    }

    viewSource() {
        const source = document.documentElement.outerHTML;
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`<pre>${this.escapeHtml(source)}</pre>`);
    }

    savePage() {
        // Trigger browser's save functionality
        document.execCommand('SaveAs', false, null);
    }

    printPage() {
        window.print();
    }

    // Zoom actions
    zoomIn() {
        document.body.style.zoom = (parseFloat(document.body.style.zoom || 1) + 0.1).toString();
    }

    zoomOut() {
        document.body.style.zoom = Math.max(0.1, parseFloat(document.body.style.zoom || 1) - 0.1).toString();
    }

    resetZoom() {
        document.body.style.zoom = '1';
    }

    // Window actions
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }

    newWindow() {
        window.open(window.location.href, '_blank');
    }

    // Quick actions
    quickSearch() {
        this.focusAddressBar();
    }

    quickCommand() {
        // Show command palette
        this.showCommandPalette();
    }

    showCommandPalette() {
        let palette = document.getElementById('command-palette');
        if (!palette) {
            palette = this.createCommandPalette();
        }
        
        palette.classList.add('show');
        const input = palette.querySelector('#command-input');
        input.focus();
    }

    createCommandPalette() {
        const palette = document.createElement('div');
        palette.id = 'command-palette';
        palette.className = 'command-palette';
        
        palette.innerHTML = `
            <div class="palette-content">
                <input type="text" id="command-input" placeholder="Type a command...">
                <div class="command-list" id="command-list"></div>
            </div>
        `;
        
        document.body.appendChild(palette);
        
        const input = palette.querySelector('#command-input');
        input.addEventListener('input', (e) => {
            this.filterCommands(e.target.value);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                palette.classList.remove('show');
            }
        });
        
        return palette;
    }

    filterCommands(query) {
        const commands = Object.entries(this.shortcuts)
            .filter(([shortcut, config]) => 
                config.description.toLowerCase().includes(query.toLowerCase()) ||
                shortcut.includes(query.toLowerCase())
            )
            .slice(0, 10);
        
        const list = document.getElementById('command-list');
        list.innerHTML = commands.map(([shortcut, config]) => `
            <div class="command-item" data-shortcut="${shortcut}">
                <span class="command-desc">${config.description}</span>
                <span class="command-shortcut">${shortcut}</span>
            </div>
        `).join('');
        
        // Add click handlers
        list.querySelectorAll('.command-item').forEach(item => {
            item.addEventListener('click', () => {
                const shortcut = item.dataset.shortcut;
                const config = this.shortcuts[shortcut];
                this.executeAction(config.action, config.args);
                document.getElementById('command-palette').classList.remove('show');
            });
        });
    }

    createShortcutsPanel() {
        const panel = document.createElement('div');
        panel.id = 'shortcuts-panel';
        panel.className = 'shortcuts-panel';
        
        panel.innerHTML = `
            <div class="shortcuts-overlay"></div>
            <div class="shortcuts-modal">
                <div class="shortcuts-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <button class="shortcuts-close">&times;</button>
                </div>
                
                <div class="shortcuts-content">
                    <div class="shortcuts-search">
                        <input type="text" id="shortcuts-search" placeholder="Search shortcuts...">
                    </div>
                    
                    <div class="shortcuts-categories">
                        ${this.renderShortcutCategories()}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupShortcutsPanelEvents(panel);
    }

    renderShortcutCategories() {
        const categories = {
            'Navigation': ['ctrl+l', 'alt+left', 'alt+right', 'f5', 'ctrl+r', 'home'],
            'Tabs': ['ctrl+t', 'ctrl+w', 'ctrl+shift+t', 'ctrl+tab', 'ctrl+1', 'ctrl+2', 'ctrl+9'],
            'Bookmarks': ['ctrl+d', 'ctrl+shift+b', 'ctrl+shift+o'],
            'History': ['ctrl+h', 'ctrl+shift+delete'],
            'Developer Tools': ['f12', 'ctrl+shift+i', 'ctrl+shift+c', 'ctrl+shift+j'],
            'Page Actions': ['ctrl+f', 'ctrl+u', 'ctrl+s', 'ctrl+p'],
            'Zoom': ['ctrl+=', 'ctrl+-', 'ctrl+0'],
            'Quick Actions': ['ctrl+k', 'ctrl+e', 'f1']
        };
        
        return Object.entries(categories).map(([category, shortcuts]) => `
            <div class="shortcut-category">
                <h3>${category}</h3>
                <div class="shortcut-list">
                    ${shortcuts.map(shortcut => {
                        const config = this.shortcuts[shortcut];
                        return config ? `
                            <div class="shortcut-item">
                                <span class="shortcut-desc">${config.description}</span>
                                <kbd class="shortcut-keys">${this.formatShortcut(shortcut)}</kbd>
                            </div>
                        ` : '';
                    }).join('')}
                </div>
            </div>
        `).join('');
    }

    formatShortcut(shortcut) {
        return shortcut.split('+').map(key => {
            switch (key) {
                case 'ctrl': return 'Ctrl';
                case 'alt': return 'Alt';
                case 'shift': return 'Shift';
                case 'meta': return 'Cmd';
                default: return key.toUpperCase();
            }
        }).join(' + ');
    }

    setupShortcutsPanelEvents(panel) {
        // Close button
        panel.querySelector('.shortcuts-close').addEventListener('click', () => {
            this.hideShortcutsPanel();
        });
        
        // Overlay click
        panel.querySelector('.shortcuts-overlay').addEventListener('click', () => {
            this.hideShortcutsPanel();
        });
        
        // Search
        panel.querySelector('#shortcuts-search').addEventListener('input', (e) => {
            this.filterShortcuts(e.target.value);
        });
    }

    showShortcutsHelp() {
        const panel = document.getElementById('shortcuts-panel');
        panel.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideShortcutsPanel() {
        const panel = document.getElementById('shortcuts-panel');
        panel.classList.remove('show');
        document.body.style.overflow = '';
    }

    filterShortcuts(query) {
        const items = document.querySelectorAll('.shortcut-item');
        items.forEach(item => {
            const desc = item.querySelector('.shortcut-desc').textContent.toLowerCase();
            const keys = item.querySelector('.shortcut-keys').textContent.toLowerCase();
            const matches = desc.includes(query.toLowerCase()) || keys.includes(query.toLowerCase());
            item.style.display = matches ? 'flex' : 'none';
        });
    }

    loadCustomShortcuts() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.customShortcuts = JSON.parse(saved);
                // Merge custom shortcuts
                Object.assign(this.shortcuts, this.customShortcuts);
            }
        } catch (error) {
            console.error('Failed to load custom shortcuts:', error);
        }
    }

    saveCustomShortcuts() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.customShortcuts));
        } catch (error) {
            console.error('Failed to save custom shortcuts:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API
    addShortcut(shortcut, action, description, args = []) {
        this.shortcuts[shortcut] = { action, description, args };
        this.customShortcuts[shortcut] = { action, description, args };
        this.saveCustomShortcuts();
    }

    removeShortcut(shortcut) {
        delete this.shortcuts[shortcut];
        delete this.customShortcuts[shortcut];
        this.saveCustomShortcuts();
    }

    getShortcuts() {
        return { ...this.shortcuts };
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }
}
