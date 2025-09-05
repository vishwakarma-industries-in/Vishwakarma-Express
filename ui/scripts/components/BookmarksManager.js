// Bookmarks Manager Component
export class BookmarksManager {
    constructor() {
        this.bookmarks = [];
        this.bookmarkFolders = [];
        this.storageKey = 'vishwakarma_bookmarks';
        this.foldersKey = 'vishwakarma_bookmark_folders';
        
        this.init();
    }

    async init() {
        await this.loadBookmarks();
        this.setupEventListeners();
        this.renderBookmarksBar();
    }

    async loadBookmarks() {
        try {
            const bookmarksData = localStorage.getItem(this.storageKey);
            const foldersData = localStorage.getItem(this.foldersKey);
            
            this.bookmarks = bookmarksData ? JSON.parse(bookmarksData) : this.getDefaultBookmarks();
            this.bookmarkFolders = foldersData ? JSON.parse(foldersData) : this.getDefaultFolders();
            
            // Ensure default folder exists
            if (!this.bookmarkFolders.find(f => f.id === 'default')) {
                this.bookmarkFolders.unshift({
                    id: 'default',
                    name: 'Bookmarks Bar',
                    created_at: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
            this.bookmarks = this.getDefaultBookmarks();
            this.bookmarkFolders = this.getDefaultFolders();
        }
    }

    getDefaultBookmarks() {
        return [
            {
                id: 'bm1',
                title: 'Vishwakarma Industries',
                url: 'https://vishwakarma.com',
                folder_id: 'default',
                favicon_url: null,
                created_at: new Date().toISOString()
            },
            {
                id: 'bm2',
                title: 'GitHub',
                url: 'https://github.com',
                folder_id: 'default',
                favicon_url: null,
                created_at: new Date().toISOString()
            },
            {
                id: 'bm3',
                title: 'Rust Documentation',
                url: 'https://doc.rust-lang.org',
                folder_id: 'dev',
                favicon_url: null,
                created_at: new Date().toISOString()
            }
        ];
    }

    getDefaultFolders() {
        return [
            {
                id: 'default',
                name: 'Bookmarks Bar',
                created_at: new Date().toISOString()
            },
            {
                id: 'dev',
                name: 'Development',
                created_at: new Date().toISOString()
            }
        ];
    }

    setupEventListeners() {
        // Bookmark button in toolbar
        const bookmarkBtn = document.getElementById('bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', () => this.toggleCurrentPageBookmark());
        }

        // Bookmarks menu button
        const bookmarksMenuBtn = document.getElementById('bookmarks-menu-btn');
        if (bookmarksMenuBtn) {
            bookmarksMenuBtn.addEventListener('click', () => this.showBookmarksMenu());
        }
    }

    renderBookmarksBar() {
        const bookmarksBar = document.getElementById('bookmarks-bar');
        if (!bookmarksBar) return;

        const barBookmarks = this.bookmarks.filter(b => b.folder_id === 'default');
        
        bookmarksBar.innerHTML = '';
        
        barBookmarks.forEach(bookmark => {
            const bookmarkElement = this.createBookmarkElement(bookmark);
            bookmarksBar.appendChild(bookmarkElement);
        });

        // Add folders dropdown if there are other folders
        const otherFolders = this.bookmarkFolders.filter(f => f.id !== 'default');
        if (otherFolders.length > 0) {
            const foldersDropdown = this.createFoldersDropdown(otherFolders);
            bookmarksBar.appendChild(foldersDropdown);
        }
    }

    createBookmarkElement(bookmark) {
        const element = document.createElement('div');
        element.className = 'bookmark-item';
        element.setAttribute('data-bookmark-id', bookmark.id);
        
        const favicon = bookmark.favicon_url 
            ? `<img src="${bookmark.favicon_url}" alt="favicon" class="bookmark-favicon">`
            : '<div class="bookmark-favicon">🔖</div>';
        
        element.innerHTML = `
            ${favicon}
            <span class="bookmark-title">${this.escapeHtml(bookmark.title)}</span>
        `;
        
        // Add event listeners
        element.addEventListener('click', () => this.openBookmark(bookmark));
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showBookmarkContextMenu(e, bookmark);
        });
        
        return element;
    }

    createFoldersDropdown(folders) {
        const dropdown = document.createElement('div');
        dropdown.className = 'bookmark-folder-dropdown';
        
        dropdown.innerHTML = `
            <button class="bookmark-folder-btn">
                <span>📁 Folders</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </button>
            <div class="bookmark-folder-menu">
                ${folders.map(folder => `
                    <div class="bookmark-folder-item" data-folder-id="${folder.id}">
                        <span>📁 ${this.escapeHtml(folder.name)}</span>
                        <div class="bookmark-folder-bookmarks">
                            ${this.bookmarks
                                .filter(b => b.folder_id === folder.id)
                                .map(b => `
                                    <div class="bookmark-item small" data-bookmark-id="${b.id}">
                                        <span class="bookmark-title">${this.escapeHtml(b.title)}</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add event listeners
        const btn = dropdown.querySelector('.bookmark-folder-btn');
        const menu = dropdown.querySelector('.bookmark-folder-menu');
        
        btn.addEventListener('click', () => {
            menu.classList.toggle('show');
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
        
        // Add bookmark click handlers
        dropdown.querySelectorAll('.bookmark-item').forEach(item => {
            item.addEventListener('click', () => {
                const bookmarkId = item.dataset.bookmarkId;
                const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
                if (bookmark) {
                    this.openBookmark(bookmark);
                    menu.classList.remove('show');
                }
            });
        });
        
        return dropdown;
    }

    async openBookmark(bookmark) {
        try {
            // Import TabManager to create new tab
            const { TabManager } = await import('./TabManager.js');
            const tabManager = window.app?.tabManager;
            
            if (tabManager) {
                await tabManager.createTab(bookmark.url);
            } else {
                // Fallback: open in current tab
                window.location.href = bookmark.url;
            }
        } catch (error) {
            console.error('Failed to open bookmark:', error);
            window.open(bookmark.url, '_blank');
        }
    }

    async addBookmark(title, url, folderId = 'default') {
        const bookmark = {
            id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: title || this.extractTitleFromUrl(url),
            url: url,
            folder_id: folderId,
            favicon_url: await this.getFaviconUrl(url),
            created_at: new Date().toISOString()
        };
        
        this.bookmarks.push(bookmark);
        await this.saveBookmarks();
        this.renderBookmarksBar();
        
        return bookmark;
    }

    async removeBookmark(bookmarkId) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== bookmarkId);
        await this.saveBookmarks();
        this.renderBookmarksBar();
    }

    async updateBookmark(bookmarkId, updates) {
        const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
        if (bookmark) {
            Object.assign(bookmark, updates);
            await this.saveBookmarks();
            this.renderBookmarksBar();
        }
    }

    async toggleCurrentPageBookmark() {
        try {
            // Get current tab info
            const { BrowserAPI } = await import('../api/browser.js');
            const activeTabId = await BrowserAPI.getActiveTabId();
            
            if (!activeTabId) return;
            
            const tabInfo = await BrowserAPI.getTabInfo(activeTabId);
            const currentUrl = tabInfo.url;
            
            if (!currentUrl || currentUrl === 'about:blank') return;
            
            // Check if already bookmarked
            const existingBookmark = this.bookmarks.find(b => b.url === currentUrl);
            
            if (existingBookmark) {
                await this.removeBookmark(existingBookmark.id);
                this.showToast('Bookmark removed', 'success');
            } else {
                await this.addBookmark(tabInfo.title, currentUrl);
                this.showToast('Bookmark added', 'success');
            }
            
            this.updateBookmarkButton(currentUrl);
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
            this.showToast('Failed to toggle bookmark', 'error');
        }
    }

    updateBookmarkButton(currentUrl) {
        const bookmarkBtn = document.getElementById('bookmark-btn');
        if (!bookmarkBtn) return;
        
        const isBookmarked = this.bookmarks.some(b => b.url === currentUrl);
        bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
        bookmarkBtn.title = isBookmarked ? 'Remove bookmark' : 'Add bookmark';
    }

    showBookmarkContextMenu(e, bookmark) {
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
            <div class="context-menu-item" data-action="edit">
                <span>Edit</span>
            </div>
            <div class="context-menu-item" data-action="delete">
                <span>Delete</span>
            </div>
        `;
        
        menu.addEventListener('click', async (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                await this.handleBookmarkContextAction(action, bookmark);
            }
            menu.remove();
        });
        
        document.addEventListener('click', () => menu.remove(), { once: true });
        document.body.appendChild(menu);
    }

    async handleBookmarkContextAction(action, bookmark) {
        switch (action) {
            case 'open':
                await this.openBookmark(bookmark);
                break;
            case 'open-new-tab':
                const { TabManager } = await import('./TabManager.js');
                const tabManager = window.app?.tabManager;
                if (tabManager) {
                    await tabManager.createTab(bookmark.url);
                }
                break;
            case 'edit':
                this.showEditBookmarkDialog(bookmark);
                break;
            case 'delete':
                await this.removeBookmark(bookmark.id);
                this.showToast('Bookmark deleted', 'success');
                break;
        }
    }

    showEditBookmarkDialog(bookmark) {
        const dialog = document.createElement('div');
        dialog.className = 'modal show';
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Bookmark</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Title:</label>
                        <input type="text" id="bookmark-title" value="${this.escapeHtml(bookmark.title)}">
                    </div>
                    <div class="form-group">
                        <label>URL:</label>
                        <input type="url" id="bookmark-url" value="${this.escapeHtml(bookmark.url)}">
                    </div>
                    <div class="form-group">
                        <label>Folder:</label>
                        <select id="bookmark-folder">
                            ${this.bookmarkFolders.map(folder => `
                                <option value="${folder.id}" ${folder.id === bookmark.folder_id ? 'selected' : ''}>
                                    ${this.escapeHtml(folder.name)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-edit">Cancel</button>
                    <button class="btn btn-primary" id="save-edit">Save</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        dialog.querySelector('.modal-close').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#cancel-edit').addEventListener('click', () => dialog.remove());
        dialog.querySelector('#save-edit').addEventListener('click', async () => {
            const title = dialog.querySelector('#bookmark-title').value.trim();
            const url = dialog.querySelector('#bookmark-url').value.trim();
            const folderId = dialog.querySelector('#bookmark-folder').value;
            
            if (title && url) {
                await this.updateBookmark(bookmark.id, { title, url, folder_id: folderId });
                this.showToast('Bookmark updated', 'success');
                dialog.remove();
            }
        });
        
        document.body.appendChild(dialog);
    }

    async saveBookmarks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarks));
            localStorage.setItem(this.foldersKey, JSON.stringify(this.bookmarkFolders));
        } catch (error) {
            console.error('Failed to save bookmarks:', error);
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
    getBookmarks() {
        return this.bookmarks;
    }

    getFolders() {
        return this.bookmarkFolders;
    }

    isBookmarked(url) {
        return this.bookmarks.some(b => b.url === url);
    }
}
