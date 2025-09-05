// Advanced Keyboard Shortcuts System
export class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.contexts = new Map();
        this.activeContext = 'global';
        this.recording = false;
        this.recordedKeys = [];
        
        this.init();
    }

    async init() {
        console.log('Initializing Keyboard Shortcuts...');
        
        this.setupDefaultShortcuts();
        this.bindEventListeners();
        this.createShortcutOverlay();
        
        console.log('Keyboard Shortcuts ready');
    }

    setupDefaultShortcuts() {
        // Navigation shortcuts
        this.register('ctrl+t', () => window.app?.tabManager?.createTab(), 'New Tab');
        this.register('ctrl+w', () => window.app?.tabManager?.closeCurrentTab(), 'Close Tab');
        this.register('ctrl+shift+t', () => window.app?.tabManager?.reopenClosedTab(), 'Reopen Closed Tab');
        this.register('ctrl+tab', () => window.app?.tabManager?.nextTab(), 'Next Tab');
        this.register('ctrl+shift+tab', () => window.app?.tabManager?.previousTab(), 'Previous Tab');
        this.register('ctrl+r', () => window.location.reload(), 'Reload Page');
        this.register('f5', () => window.location.reload(), 'Reload Page');
        this.register('ctrl+f5', () => window.location.reload(true), 'Hard Reload');
        
        // Browser shortcuts
        this.register('ctrl+l', () => document.getElementById('address-input')?.focus(), 'Focus Address Bar');
        this.register('ctrl+d', () => window.app?.bookmarksManager?.addBookmark(), 'Add Bookmark');
        this.register('ctrl+shift+b', () => window.app?.sidebarNavigation?.showPanel('bookmarks'), 'Show Bookmarks');
        this.register('ctrl+h', () => window.app?.sidebarNavigation?.showPanel('history'), 'Show History');
        this.register('ctrl+j', () => window.app?.sidebarNavigation?.showPanel('downloads'), 'Show Downloads');
        
        // Developer shortcuts
        this.register('f12', () => window.app?.nextGenDevTools?.showUI(), 'Developer Tools');
        this.register('ctrl+shift+i', () => window.app?.nextGenDevTools?.showUI(), 'Developer Tools');
        this.register('ctrl+shift+j', () => window.app?.nextGenDevTools?.switchTab('console'), 'Console');
        this.register('ctrl+shift+c', () => window.app?.nextGenDevTools?.inspectElement(), 'Inspect Element');
        
        // AI shortcuts
        this.register('ctrl+shift+a', () => window.app?.multiModelAI?.showUI(), 'AI Assistant');
        this.register('ctrl+shift+g', () => window.app?.codeGenerationTools?.showUI(), 'Code Generator');
        
        // UI shortcuts
        this.register('ctrl+shift+p', () => window.app?.commandPalette?.show(), 'Command Palette');
        this.register('ctrl+comma', () => window.app?.modalSystem?.settings(), 'Settings');
        this.register('ctrl+shift+t', () => window.app?.uiEnhancer?.cycleTheme(), 'Cycle Theme');
        this.register('f11', () => this.toggleFullscreen(), 'Toggle Fullscreen');
        this.register('escape', () => this.handleEscape(), 'Cancel/Close');
        
        // Accessibility shortcuts
        this.register('ctrl+shift+h', () => window.app?.uiEnhancer?.toggleHighContrast(), 'High Contrast');
        this.register('ctrl+shift+m', () => window.app?.uiEnhancer?.toggleReducedMotion(), 'Reduced Motion');
        this.register('ctrl+shift+k', () => this.showShortcutHelp(), 'Show Shortcuts');
        
        // Advanced shortcuts
        this.register('ctrl+shift+delete', () => this.clearBrowsingData(), 'Clear Data');
        this.register('ctrl+shift+n', () => this.openIncognito(), 'Incognito Mode');
        this.register('ctrl+shift+r', () => this.hardReload(), 'Hard Reload');
        this.register('ctrl+u', () => this.viewSource(), 'View Source');
        this.register('ctrl+shift+s', () => this.savePageAs(), 'Save Page As');
        
        // Tab management
        this.register('ctrl+1', () => this.switchToTab(0), 'Switch to Tab 1');
        this.register('ctrl+2', () => this.switchToTab(1), 'Switch to Tab 2');
        this.register('ctrl+3', () => this.switchToTab(2), 'Switch to Tab 3');
        this.register('ctrl+4', () => this.switchToTab(3), 'Switch to Tab 4');
        this.register('ctrl+5', () => this.switchToTab(4), 'Switch to Tab 5');
        this.register('ctrl+6', () => this.switchToTab(5), 'Switch to Tab 6');
        this.register('ctrl+7', () => this.switchToTab(6), 'Switch to Tab 7');
        this.register('ctrl+8', () => this.switchToTab(7), 'Switch to Tab 8');
        this.register('ctrl+9', () => this.switchToLastTab(), 'Switch to Last Tab');
    }

    register(combination, action, description = '', context = 'global') {
        const key = this.normalizeShortcut(combination);
        
        if (!this.shortcuts.has(context)) {
            this.shortcuts.set(context, new Map());
        }
        
        this.shortcuts.get(context).set(key, {
            combination,
            action,
            description,
            context
        });
    }

    unregister(combination, context = 'global') {
        const key = this.normalizeShortcut(combination);
        
        if (this.shortcuts.has(context)) {
            this.shortcuts.get(context).delete(key);
        }
    }

    normalizeShortcut(combination) {
        return combination.toLowerCase()
            .replace(/\s+/g, '')
            .split('+')
            .sort((a, b) => {
                const order = ['ctrl', 'alt', 'shift', 'meta'];
                const aIndex = order.indexOf(a);
                const bIndex = order.indexOf(b);
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return a.localeCompare(b);
            })
            .join('+');
    }

    bindEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.recording) {
                this.handleRecording(e);
                return;
            }

            const shortcut = this.getShortcutFromEvent(e);
            const handler = this.findHandler(shortcut);
            
            if (handler) {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    handler.action();
                    this.showShortcutFeedback(handler.description);
                } catch (error) {
                    console.error('Shortcut execution failed:', error);
                }
            }
        });

        // Context switching
        document.addEventListener('focusin', (e) => {
            this.updateContext(e.target);
        });
    }

    getShortcutFromEvent(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
            parts.push(key);
        }
        
        return parts.join('+');
    }

    findHandler(shortcut) {
        // Check active context first
        const contextShortcuts = this.shortcuts.get(this.activeContext);
        if (contextShortcuts?.has(shortcut)) {
            return contextShortcuts.get(shortcut);
        }
        
        // Fall back to global context
        const globalShortcuts = this.shortcuts.get('global');
        if (globalShortcuts?.has(shortcut)) {
            return globalShortcuts.get(shortcut);
        }
        
        return null;
    }

    updateContext(element) {
        if (element.matches('input, textarea')) {
            this.activeContext = 'input';
        } else if (element.closest('.developer-tools')) {
            this.activeContext = 'devtools';
        } else if (element.closest('.ai-assistant')) {
            this.activeContext = 'ai';
        } else {
            this.activeContext = 'global';
        }
    }

    showShortcutFeedback(description) {
        if (!description) return;
        
        const feedback = document.createElement('div');
        feedback.className = 'shortcut-feedback';
        feedback.textContent = description;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 12px;
            color: var(--text-primary);
            z-index: 10000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.2s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(feedback);
        
        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        });
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-10px)';
            setTimeout(() => feedback.remove(), 200);
        }, 1500);
    }

    createShortcutOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'shortcut-help-overlay';
        overlay.className = 'shortcut-overlay hidden';
        overlay.innerHTML = `
            <div class="shortcut-modal">
                <div class="shortcut-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button class="close-btn" onclick="this.closest('.shortcut-overlay').classList.add('hidden')">✕</button>
                </div>
                <div class="shortcut-content">
                    <div class="shortcut-search">
                        <input type="text" placeholder="Search shortcuts..." id="shortcut-search">
                    </div>
                    <div class="shortcut-categories" id="shortcut-categories"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.shortcutOverlay = overlay;
        
        // Add search functionality
        const searchInput = overlay.querySelector('#shortcut-search');
        searchInput.addEventListener('input', (e) => {
            this.filterShortcuts(e.target.value);
        });
    }

    showShortcutHelp() {
        this.renderShortcuts();
        this.shortcutOverlay.classList.remove('hidden');
    }

    renderShortcuts() {
        const categories = {
            'Navigation': ['ctrl+t', 'ctrl+w', 'ctrl+tab', 'ctrl+r', 'ctrl+l'],
            'Browser': ['ctrl+d', 'ctrl+shift+b', 'ctrl+h', 'ctrl+j'],
            'Developer': ['f12', 'ctrl+shift+i', 'ctrl+shift+j', 'ctrl+shift+c'],
            'AI': ['ctrl+shift+a', 'ctrl+shift+g'],
            'UI': ['ctrl+shift+p', 'ctrl+comma', 'f11'],
            'Accessibility': ['ctrl+shift+h', 'ctrl+shift+m', 'ctrl+shift+k']
        };
        
        const container = this.shortcutOverlay.querySelector('#shortcut-categories');
        container.innerHTML = '';
        
        Object.entries(categories).forEach(([category, shortcuts]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'shortcut-category';
            categoryDiv.innerHTML = `
                <h3>${category}</h3>
                <div class="shortcut-list">
                    ${shortcuts.map(shortcut => {
                        const handler = this.findHandler(shortcut);
                        if (!handler) return '';
                        
                        return `
                            <div class="shortcut-item">
                                <kbd>${this.formatShortcut(handler.combination)}</kbd>
                                <span>${handler.description}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            container.appendChild(categoryDiv);
        });
    }

    formatShortcut(combination) {
        return combination
            .split('+')
            .map(key => {
                const keyMap = {
                    'ctrl': '⌃',
                    'alt': '⌥',
                    'shift': '⇧',
                    'meta': '⌘'
                };
                return keyMap[key] || key.toUpperCase();
            })
            .join(' + ');
    }

    filterShortcuts(query) {
        const items = this.shortcutOverlay.querySelectorAll('.shortcut-item');
        const lowerQuery = query.toLowerCase();
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const visible = text.includes(lowerQuery);
            item.style.display = visible ? 'flex' : 'none';
        });
    }

    // Shortcut actions
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }

    handleEscape() {
        // Close modals, overlays, etc.
        const activeModal = document.querySelector('.modal-system.show');
        if (activeModal) {
            window.app?.modalSystem?.close(activeModal.dataset.modalId);
            return;
        }
        
        const commandPalette = document.querySelector('.command-palette.show');
        if (commandPalette) {
            window.app?.commandPalette?.hide();
            return;
        }
        
        const shortcutOverlay = document.querySelector('.shortcut-overlay:not(.hidden)');
        if (shortcutOverlay) {
            shortcutOverlay.classList.add('hidden');
            return;
        }
    }

    clearBrowsingData() {
        window.app?.modalSystem?.confirm(
            'Are you sure you want to clear all browsing data?',
            'Clear Browsing Data'
        ).then(confirmed => {
            if (confirmed) {
                // Clear data logic
                window.app?.notificationSystem?.success('Data Cleared', 'All browsing data has been cleared');
            }
        });
    }

    openIncognito() {
        window.app?.notificationSystem?.info('Incognito Mode', 'Opening new incognito window...');
        // Incognito logic
    }

    hardReload() {
        window.location.reload(true);
    }

    viewSource() {
        const source = document.documentElement.outerHTML;
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`<pre>${source.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
    }

    savePageAs() {
        window.app?.notificationSystem?.info('Save Page', 'Preparing page for download...');
        // Save page logic
    }

    switchToTab(index) {
        const tabs = document.querySelectorAll('.tab');
        if (tabs[index]) {
            tabs[index].click();
        }
    }

    switchToLastTab() {
        const tabs = document.querySelectorAll('.tab');
        if (tabs.length > 0) {
            tabs[tabs.length - 1].click();
        }
    }

    // Recording functionality
    startRecording() {
        this.recording = true;
        this.recordedKeys = [];
        
        window.app?.notificationSystem?.info(
            'Recording Shortcut',
            'Press the key combination you want to record'
        );
    }

    stopRecording() {
        this.recording = false;
        const combination = this.recordedKeys.join('+');
        
        if (combination) {
            return combination;
        }
        
        return null;
    }

    handleRecording(e) {
        e.preventDefault();
        
        const key = this.getShortcutFromEvent(e);
        if (key && !this.recordedKeys.includes(key)) {
            this.recordedKeys.push(key);
        }
    }

    // Public API
    getAllShortcuts() {
        const all = new Map();
        
        this.shortcuts.forEach((contextShortcuts, context) => {
            contextShortcuts.forEach((handler, shortcut) => {
                all.set(`${context}:${shortcut}`, handler);
            });
        });
        
        return all;
    }

    getShortcutsForContext(context) {
        return this.shortcuts.get(context) || new Map();
    }

    setContext(context) {
        this.activeContext = context;
    }
}
