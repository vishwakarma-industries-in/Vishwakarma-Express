// History Manager Component
export class HistoryManager {
    constructor() {
        this.history = [];
        this.storageKey = 'vishwakarma_history';
        this.maxHistoryItems = 1000;
        
        this.init();
    }

    async init() {
        await this.loadHistory();
        this.setupEventListeners();
    }

    async loadHistory() {
        try {
            const historyData = localStorage.getItem(this.storageKey);
            this.history = historyData ? JSON.parse(historyData) : [];
            
            // Clean old entries if exceeding limit
            if (this.history.length > this.maxHistoryItems) {
                this.history = this.history.slice(-this.maxHistoryItems);
                await this.saveHistory();
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            this.history = [];
        }
    }

    setupEventListeners() {
        // History button in toolbar
        const historyBtn = document.getElementById('history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => this.showHistoryPanel());
        }
    }

    async addHistoryEntry(url, title, tabId) {
        // Don't add certain URLs to history
        if (this.shouldSkipUrl(url)) return;

        // Check if this URL was just visited (avoid duplicates)
        const lastEntry = this.history[this.history.length - 1];
        if (lastEntry && lastEntry.url === url && 
            Date.now() - new Date(lastEntry.timestamp).getTime() < 5000) {
            return;
        }

        const entry = {
            id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            url: url,
            title: title || this.extractTitleFromUrl(url),
            timestamp: new Date().toISOString(),
            tab_id: tabId,
            favicon_url: await this.getFaviconUrl(url),
            visit_count: 1
        };

        // Check if URL exists in recent history and update visit count
        const existingIndex = this.history.findIndex(h => h.url === url);
        if (existingIndex !== -1) {
            const existing = this.history[existingIndex];
            existing.visit_count++;
            existing.timestamp = entry.timestamp;
            // Move to end
            this.history.splice(existingIndex, 1);
            this.history.push(existing);
        } else {
            this.history.push(entry);
        }

        // Limit history size
        if (this.history.length > this.maxHistoryItems) {
            this.history.shift();
        }

        await this.saveHistory();
    }

    shouldSkipUrl(url) {
        const skipPatterns = [
            'about:blank',
            'chrome://',
            'moz-extension://',
            'data:',
            'blob:',
            'javascript:'
        ];

        return skipPatterns.some(pattern => url.startsWith(pattern));
    }

    showHistoryPanel() {
        const panel = document.createElement('div');
        panel.className = 'history-panel show';
        
        const recentHistory = this.getRecentHistory(50);
        const groupedHistory = this.groupHistoryByDate(recentHistory);
        
        panel.innerHTML = `
            <div class="history-header">
                <h3>History</h3>
                <div class="history-controls">
                    <input type="search" id="history-search" placeholder="Search history...">
                    <button class="btn btn-secondary" id="clear-history">Clear All</button>
                    <button class="btn btn-secondary" id="close-history">&times;</button>
                </div>
            </div>
            <div class="history-content">
                ${Object.entries(groupedHistory).map(([date, entries]) => `
                    <div class="history-group">
                        <div class="history-date">${this.formatDate(date)}</div>
                        <div class="history-entries">
                            ${entries.map(entry => this.createHistoryEntryHTML(entry)).join('')}
                        </div>
                    </div>
                `).join('')}
                ${recentHistory.length === 0 ? '<div class="history-empty">No history yet</div>' : ''}
            </div>
        `;
        
        this.setupHistoryPanelEvents(panel);
        document.body.appendChild(panel);
    }

    setupHistoryPanelEvents(panel) {
        // Close button
        panel.querySelector('#close-history').addEventListener('click', () => {
            panel.remove();
        });

        // Clear history button
        panel.querySelector('#clear-history').addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all history?')) {
                await this.clearHistory();
                panel.remove();
            }
        });

        // Search functionality
        const searchInput = panel.querySelector('#history-search');
        searchInput.addEventListener('input', (e) => {
            this.filterHistory(panel, e.target.value);
        });

        // History entry clicks
        panel.querySelectorAll('.history-entry').forEach(entry => {
            entry.addEventListener('click', async () => {
                const url = entry.dataset.url;
                await this.openHistoryEntry(url);
                panel.remove();
            });

            entry.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showHistoryContextMenu(e, entry.dataset);
            });
        });

        // Close on outside click
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });
    }

    createHistoryEntryHTML(entry) {
        const timeAgo = this.getTimeAgo(entry.timestamp);
        const favicon = entry.favicon_url 
            ? `<img src="${entry.favicon_url}" alt="favicon" class="history-favicon">`
            : '<div class="history-favicon">🌐</div>';
        
        return `
            <div class="history-entry" data-url="${this.escapeHtml(entry.url)}" data-id="${entry.id}">
                ${favicon}
                <div class="history-info">
                    <div class="history-title">${this.escapeHtml(entry.title)}</div>
                    <div class="history-url">${this.escapeHtml(entry.url)}</div>
                    <div class="history-meta">
                        <span class="history-time">${timeAgo}</span>
                        ${entry.visit_count > 1 ? `<span class="history-visits">${entry.visit_count} visits</span>` : ''}
                    </div>
                </div>
                <button class="history-delete" data-id="${entry.id}" title="Remove from history">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
    }

    groupHistoryByDate(history) {
        const groups = {};
        
        history.forEach(entry => {
            const date = new Date(entry.timestamp).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(entry);
        });
        
        return groups;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return time.toLocaleDateString();
    }

    filterHistory(panel, query) {
        const entries = panel.querySelectorAll('.history-entry');
        const groups = panel.querySelectorAll('.history-group');
        
        if (!query.trim()) {
            entries.forEach(entry => entry.style.display = '');
            groups.forEach(group => group.style.display = '');
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        
        groups.forEach(group => {
            const groupEntries = group.querySelectorAll('.history-entry');
            let hasVisibleEntries = false;
            
            groupEntries.forEach(entry => {
                const title = entry.querySelector('.history-title').textContent.toLowerCase();
                const url = entry.querySelector('.history-url').textContent.toLowerCase();
                
                if (title.includes(lowerQuery) || url.includes(lowerQuery)) {
                    entry.style.display = '';
                    hasVisibleEntries = true;
                } else {
                    entry.style.display = 'none';
                }
            });
            
            group.style.display = hasVisibleEntries ? '' : 'none';
        });
    }

    async openHistoryEntry(url) {
        try {
            const { TabManager } = await import('./TabManager.js');
            const tabManager = window.app?.tabManager;
            
            if (tabManager) {
                await tabManager.createTab(url);
            } else {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Failed to open history entry:', error);
            window.open(url, '_blank');
        }
    }

    showHistoryContextMenu(e, entryData) {
        const menu = document.createElement('div');
        menu.className = 'context-menu show';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        
        menu.innerHTML = `
            <div class="context-menu-item" data-action="open">
                <span>Open</span>
            </div>
            <div class="context-menu-item" data-action="open-new-tab">
                <span>Open in New Tab</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="copy-url">
                <span>Copy URL</span>
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="delete">
                <span>Remove from History</span>
            </div>
        `;
        
        menu.addEventListener('click', async (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                await this.handleHistoryContextAction(action, entryData);
            }
            menu.remove();
        });
        
        document.addEventListener('click', () => menu.remove(), { once: true });
        document.body.appendChild(menu);
    }

    async handleHistoryContextAction(action, entryData) {
        switch (action) {
            case 'open':
                await this.openHistoryEntry(entryData.url);
                break;
            case 'open-new-tab':
                const { TabManager } = await import('./TabManager.js');
                const tabManager = window.app?.tabManager;
                if (tabManager) {
                    await tabManager.createTab(entryData.url);
                }
                break;
            case 'copy-url':
                await navigator.clipboard.writeText(entryData.url);
                this.showToast('URL copied to clipboard', 'success');
                break;
            case 'delete':
                await this.removeHistoryEntry(entryData.id);
                this.showToast('Removed from history', 'success');
                break;
        }
    }

    async removeHistoryEntry(entryId) {
        this.history = this.history.filter(h => h.id !== entryId);
        await this.saveHistory();
        
        // Update UI if history panel is open
        const panel = document.querySelector('.history-panel');
        if (panel) {
            const entry = panel.querySelector(`[data-id="${entryId}"]`);
            if (entry) {
                entry.remove();
            }
        }
    }

    async clearHistory() {
        this.history = [];
        await this.saveHistory();
    }

    getRecentHistory(limit = 50) {
        return this.history
            .slice(-limit)
            .reverse();
    }

    searchHistory(query, limit = 20) {
        const lowerQuery = query.toLowerCase();
        return this.history
            .filter(entry => 
                entry.title.toLowerCase().includes(lowerQuery) ||
                entry.url.toLowerCase().includes(lowerQuery)
            )
            .slice(-limit)
            .reverse();
    }

    getMostVisited(limit = 10) {
        return this.history
            .filter(entry => entry.visit_count > 1)
            .sort((a, b) => b.visit_count - a.visit_count)
            .slice(0, limit);
    }

    async saveHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    extractTitleFromUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return url;
        }
    }

    async getFaviconUrl(url) {
        try {
            const domain = new URL(url).origin;
            return `${domain}/favicon.ico`;
        } catch {
            return null;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
    getHistory() {
        return this.history;
    }

    getHistoryCount() {
        return this.history.length;
    }
}
