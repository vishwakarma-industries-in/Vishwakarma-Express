// Tab Manager Component
import { BrowserAPI } from '../api/browser.js';

export class TabManager {
    constructor() {
        this.tabs = new Map();
        this.activeTabId = null;
        this.tabsContainer = document.getElementById('tabs-container');
        this.newTabBtn = document.getElementById('new-tab-btn');
        
        this.init();
    }

    async init() {
        // Setup event listeners
        this.newTabBtn.addEventListener('click', () => this.createTab());
        
        // Setup tab container for drag and drop
        this.setupDragAndDrop();
        
        // Load existing tabs
        await this.loadTabs();
        
        // Setup tab keyboard shortcuts
        this.setupTabShortcuts();
    }

    async loadTabs() {
        try {
            const tabs = await BrowserAPI.getAllTabs();
            const activeTabId = await BrowserAPI.getActiveTabId();
            
            this.activeTabId = activeTabId;
            this.tabs.clear();
            this.tabsContainer.innerHTML = '';
            
            if (tabs.length === 0) {
                // Create initial tab if none exist
                await this.createTab('about:blank');
                return;
            }
            
            // Render existing tabs
            tabs.forEach(tab => {
                this.tabs.set(tab.id, tab);
                this.renderTab(tab);
            });
            
            this.updateActiveTab();
            
        } catch (error) {
            console.error('Failed to load tabs:', error);
        }
    }

    async createTab(url = null) {
        try {
            const tabId = await BrowserAPI.createNewTab(url);
            await this.loadTabs(); // Refresh all tabs
            
            // Focus the new tab
            if (tabId) {
                await this.setActiveTab(tabId);
            }
            
            return tabId;
        } catch (error) {
            console.error('Failed to create tab:', error);
            this.showError('Failed to create new tab');
        }
    }

    async closeTab(tabId) {
        try {
            const tabElement = this.tabsContainer.querySelector(`[data-tab-id="${tabId}"]`);
            if (tabElement) {
                // Add closing animation
                tabElement.classList.add('closing');
                
                setTimeout(async () => {
                    await BrowserAPI.closeTab(tabId);
                    await this.loadTabs();
                    
                    // Show welcome screen if no tabs left
                    if (this.tabs.size === 0) {
                        document.getElementById('welcome-screen').style.display = 'flex';
                    }
                }, 200);
            }
        } catch (error) {
            console.error('Failed to close tab:', error);
            this.showError('Failed to close tab');
        }
    }

    async setActiveTab(tabId) {
        try {
            await BrowserAPI.setActiveTab(tabId);
            this.activeTabId = tabId;
            this.updateActiveTab();
            
            // Update address bar
            const tab = this.tabs.get(tabId);
            if (tab) {
                document.getElementById('address-input').value = tab.url || '';
            }
            
            // Hide welcome screen
            document.getElementById('welcome-screen').style.display = 'none';
            
        } catch (error) {
            console.error('Failed to set active tab:', error);
            this.showError('Failed to switch tab');
        }
    }

    renderTab(tab) {
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${tab.is_active ? 'active' : ''}`;
        tabElement.setAttribute('data-tab-id', tab.id);
        tabElement.draggable = true;
        
        // Create tab content
        const favicon = this.getFaviconElement(tab);
        const title = this.getTitleElement(tab);
        const closeBtn = this.getCloseButtonElement(tab);
        const loadingIndicator = tab.is_loading ? '<div class="tab-loading-indicator"></div>' : '';
        
        tabElement.innerHTML = `
            ${favicon}
            ${title}
            ${closeBtn}
            ${loadingIndicator}
        `;
        
        // Add event listeners
        this.addTabEventListeners(tabElement, tab);
        
        this.tabsContainer.appendChild(tabElement);
    }

    getFaviconElement(tab) {
        const faviconUrl = tab.favicon_url;
        if (faviconUrl) {
            return `<img class="tab-favicon" src="${faviconUrl}" alt="favicon" onerror="this.style.display='none'">`;
        } else {
            // Default favicon based on URL
            const domain = this.extractDomain(tab.url);
            const icon = this.getDefaultIcon(domain);
            return `<div class="tab-favicon">${icon}</div>`;
        }
    }

    getTitleElement(tab) {
        const title = tab.title || 'New Tab';
        const displayTitle = title.length > 20 ? title.substring(0, 20) + '...' : title;
        return `<div class="tab-title" title="${this.escapeHtml(title)}">${this.escapeHtml(displayTitle)}</div>`;
    }

    getCloseButtonElement(tab) {
        return `
            <button class="tab-close" title="Close tab" data-tab-id="${tab.id}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;
    }

    addTabEventListeners(tabElement, tab) {
        // Tab click to activate
        tabElement.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.setActiveTab(tab.id);
            }
        });

        // Close button click
        const closeBtn = tabElement.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tab.id);
        });

        // Middle click to close
        tabElement.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle mouse button
                e.preventDefault();
                this.closeTab(tab.id);
            }
        });

        // Context menu
        tabElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showTabContextMenu(e, tab);
        });

        // Drag events
        tabElement.addEventListener('dragstart', (e) => this.handleDragStart(e, tab));
        tabElement.addEventListener('dragover', (e) => this.handleDragOver(e));
        tabElement.addEventListener('drop', (e) => this.handleDrop(e, tab));
    }

    updateActiveTab() {
        // Remove active class from all tabs
        this.tabsContainer.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Add active class to current tab
        if (this.activeTabId) {
            const activeTab = this.tabsContainer.querySelector(`[data-tab-id="${this.activeTabId}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        }
    }

    setupDragAndDrop() {
        this.tabsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
    }

    handleDragStart(e, tab) {
        e.dataTransfer.setData('text/plain', tab.id);
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e, targetTab) {
        e.preventDefault();
        const draggedTabId = e.dataTransfer.getData('text/plain');
        
        if (draggedTabId !== targetTab.id) {
            // Implement tab reordering logic here
            console.log(`Moving tab ${draggedTabId} to position of ${targetTab.id}`);
        }
    }

    setupTabShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Tab - Next tab
            if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                this.switchToNextTab();
            }
            
            // Ctrl+Shift+Tab - Previous tab
            if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
                e.preventDefault();
                this.switchToPreviousTab();
            }
            
            // Ctrl+1-9 - Switch to tab by number
            if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                this.switchToTabByIndex(tabIndex);
            }
        });
    }

    switchToNextTab() {
        const tabIds = Array.from(this.tabs.keys());
        const currentIndex = tabIds.indexOf(this.activeTabId);
        const nextIndex = (currentIndex + 1) % tabIds.length;
        this.setActiveTab(tabIds[nextIndex]);
    }

    switchToPreviousTab() {
        const tabIds = Array.from(this.tabs.keys());
        const currentIndex = tabIds.indexOf(this.activeTabId);
        const prevIndex = currentIndex === 0 ? tabIds.length - 1 : currentIndex - 1;
        this.setActiveTab(tabIds[prevIndex]);
    }

    switchToTabByIndex(index) {
        const tabIds = Array.from(this.tabs.keys());
        if (index < tabIds.length) {
            this.setActiveTab(tabIds[index]);
        }
    }

    showTabContextMenu(e, tab) {
        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu show';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        
        menu.innerHTML = `
            <div class="context-menu-item" data-action="reload">
                <span>Reload</span>
            </div>
            <div class="context-menu-item" data-action="duplicate">
                <span>Duplicate</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="pin">
                <span>${tab.is_pinned ? 'Unpin' : 'Pin'} Tab</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="close">
                <span>Close Tab</span>
            </div>
            <div class="context-menu-item" data-action="close-others">
                <span>Close Other Tabs</span>
            </div>
            <div class="context-menu-item" data-action="close-right">
                <span>Close Tabs to the Right</span>
            </div>
        `;
        
        // Add event listeners
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                this.handleContextMenuAction(action, tab);
            }
            menu.remove();
        });
        
        // Close menu on outside click
        document.addEventListener('click', () => menu.remove(), { once: true });
        
        document.body.appendChild(menu);
    }

    async handleContextMenuAction(action, tab) {
        switch (action) {
            case 'reload':
                await BrowserAPI.reloadTab(tab.id);
                break;
            case 'duplicate':
                await this.createTab(tab.url);
                break;
            case 'pin':
                // TODO: Implement pin/unpin functionality
                console.log('Pin/unpin not implemented yet');
                break;
            case 'close':
                await this.closeTab(tab.id);
                break;
            case 'close-others':
                await this.closeOtherTabs(tab.id);
                break;
            case 'close-right':
                await this.closeTabsToTheRight(tab.id);
                break;
        }
    }

    async closeOtherTabs(keepTabId) {
        const tabIds = Array.from(this.tabs.keys()).filter(id => id !== keepTabId);
        for (const tabId of tabIds) {
            await this.closeTab(tabId);
        }
    }

    async closeTabsToTheRight(fromTabId) {
        const tabIds = Array.from(this.tabs.keys());
        const fromIndex = tabIds.indexOf(fromTabId);
        const tabsToClose = tabIds.slice(fromIndex + 1);
        
        for (const tabId of tabsToClose) {
            await this.closeTab(tabId);
        }
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return '';
        }
    }

    getDefaultIcon(domain) {
        const icons = {
            'github.com': '📁',
            'stackoverflow.com': '💡',
            'developer.mozilla.org': '📚',
            'rust-lang.org': '🦀',
            'google.com': '🔍',
            'youtube.com': '📺',
            'twitter.com': '🐦',
            'facebook.com': '📘',
            'linkedin.com': '💼',
            'reddit.com': '🤖'
        };
        
        return icons[domain] || '🌐';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast error show';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">Error</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Public API methods
    getActiveTab() {
        return this.tabs.get(this.activeTabId);
    }

    getTabCount() {
        return this.tabs.size;
    }

    getAllTabs() {
        return Array.from(this.tabs.values());
    }
}
