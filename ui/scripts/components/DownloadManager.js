// Download Manager Component
export class DownloadManager {
    constructor() {
        this.downloads = [];
        this.storageKey = 'vishwakarma_downloads';
        this.maxDownloads = 100;
        this.isVisible = false;
        
        this.init();
    }

    async init() {
        this.loadDownloads();
        this.setupEventListeners();
        this.createDownloadPanel();
    }

    createDownloadPanel() {
        const panel = document.createElement('div');
        panel.id = 'download-panel';
        panel.className = 'download-panel';
        
        panel.innerHTML = `
            <div class="download-header">
                <div class="download-title">
                    <div class="download-icon">📥</div>
                    <h3>Downloads</h3>
                    <span class="download-count" id="download-count">0</span>
                </div>
                <div class="download-controls">
                    <button class="btn btn-secondary" id="clear-downloads">Clear All</button>
                    <button class="btn btn-secondary" id="close-downloads">&times;</button>
                </div>
            </div>
            
            <div class="download-content" id="download-content">
                <div class="download-empty" id="download-empty">
                    <div class="download-empty-icon">📥</div>
                    <p>No downloads yet</p>
                    <small>Downloaded files will appear here</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupPanelEvents(panel);
    }

    setupEventListeners() {
        // Download button in toolbar
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.togglePanel());
        }

        // Listen for download events from browser
        document.addEventListener('download-started', (e) => {
            this.addDownload(e.detail);
        });

        document.addEventListener('download-progress', (e) => {
            this.updateDownloadProgress(e.detail.id, e.detail.progress);
        });

        document.addEventListener('download-completed', (e) => {
            this.completeDownload(e.detail.id);
        });

        document.addEventListener('download-failed', (e) => {
            this.failDownload(e.detail.id, e.detail.error);
        });
    }

    setupPanelEvents(panel) {
        // Close button
        panel.querySelector('#close-downloads').addEventListener('click', () => {
            this.hidePanel();
        });

        // Clear all button
        panel.querySelector('#clear-downloads').addEventListener('click', () => {
            this.clearAllDownloads();
        });

        // Click outside to close
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                this.hidePanel();
            }
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
        const panel = document.getElementById('download-panel');
        panel.classList.add('show');
        this.isVisible = true;
        this.updateDownloadCount();
    }

    hidePanel() {
        const panel = document.getElementById('download-panel');
        panel.classList.remove('show');
        this.isVisible = false;
    }

    addDownload(downloadInfo) {
        const download = {
            id: downloadInfo.id || 'dl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            filename: downloadInfo.filename || 'Unknown File',
            url: downloadInfo.url || '',
            size: downloadInfo.size || 0,
            progress: 0,
            status: 'downloading', // downloading, completed, failed, paused
            startTime: Date.now(),
            endTime: null,
            error: null,
            path: downloadInfo.path || null
        };

        this.downloads.unshift(download);
        
        // Limit downloads history
        if (this.downloads.length > this.maxDownloads) {
            this.downloads = this.downloads.slice(0, this.maxDownloads);
        }

        this.renderDownloads();
        this.saveDownloads();
        this.updateDownloadCount();
        
        // Show notification
        this.showToast(`Download started: ${download.filename}`, 'info');
        
        return download.id;
    }

    updateDownloadProgress(downloadId, progress) {
        const download = this.downloads.find(d => d.id === downloadId);
        if (download) {
            download.progress = Math.min(100, Math.max(0, progress));
            this.updateDownloadElement(download);
        }
    }

    completeDownload(downloadId) {
        const download = this.downloads.find(d => d.id === downloadId);
        if (download) {
            download.status = 'completed';
            download.progress = 100;
            download.endTime = Date.now();
            
            this.updateDownloadElement(download);
            this.saveDownloads();
            
            this.showToast(`Download completed: ${download.filename}`, 'success');
        }
    }

    failDownload(downloadId, error) {
        const download = this.downloads.find(d => d.id === downloadId);
        if (download) {
            download.status = 'failed';
            download.error = error;
            download.endTime = Date.now();
            
            this.updateDownloadElement(download);
            this.saveDownloads();
            
            this.showToast(`Download failed: ${download.filename}`, 'error');
        }
    }

    pauseDownload(downloadId) {
        const download = this.downloads.find(d => d.id === downloadId);
        if (download && download.status === 'downloading') {
            download.status = 'paused';
            this.updateDownloadElement(download);
            this.saveDownloads();
            
            // Emit pause event
            document.dispatchEvent(new CustomEvent('download-pause', {
                detail: { id: downloadId }
            }));
        }
    }

    resumeDownload(downloadId) {
        const download = this.downloads.find(d => d.id === downloadId);
        if (download && download.status === 'paused') {
            download.status = 'downloading';
            this.updateDownloadElement(download);
            this.saveDownloads();
            
            // Emit resume event
            document.dispatchEvent(new CustomEvent('download-resume', {
                detail: { id: downloadId }
            }));
        }
    }

    cancelDownload(downloadId) {
        const download = this.downloads.find(d => d.id === downloadId);
        if (download) {
            download.status = 'failed';
            download.error = 'Cancelled by user';
            download.endTime = Date.now();
            
            this.updateDownloadElement(download);
            this.saveDownloads();
            
            // Emit cancel event
            document.dispatchEvent(new CustomEvent('download-cancel', {
                detail: { id: downloadId }
            }));
        }
    }

    removeDownload(downloadId) {
        this.downloads = this.downloads.filter(d => d.id !== downloadId);
        this.renderDownloads();
        this.saveDownloads();
        this.updateDownloadCount();
    }

    renderDownloads() {
        const content = document.getElementById('download-content');
        const emptyState = document.getElementById('download-empty');
        
        if (this.downloads.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // Remove existing download items
        content.querySelectorAll('.download-item').forEach(item => item.remove());
        
        // Add download items
        this.downloads.forEach(download => {
            const downloadElement = this.createDownloadElement(download);
            content.appendChild(downloadElement);
        });
    }

    createDownloadElement(download) {
        const element = document.createElement('div');
        element.className = `download-item ${download.status}`;
        element.setAttribute('data-download-id', download.id);
        
        const statusIcon = this.getStatusIcon(download.status);
        const fileSize = this.formatFileSize(download.size);
        const duration = this.getDownloadDuration(download);
        
        element.innerHTML = `
            <div class="download-icon">${statusIcon}</div>
            <div class="download-info">
                <div class="download-filename" title="${this.escapeHtml(download.filename)}">
                    ${this.escapeHtml(download.filename)}
                </div>
                <div class="download-details">
                    <span class="download-size">${fileSize}</span>
                    <span class="download-duration">${duration}</span>
                    ${download.error ? `<span class="download-error">${this.escapeHtml(download.error)}</span>` : ''}
                </div>
                ${download.status === 'downloading' || download.status === 'paused' ? `
                    <div class="download-progress">
                        <div class="download-progress-bar">
                            <div class="download-progress-fill" style="width: ${download.progress}%"></div>
                        </div>
                        <span class="download-percentage">${Math.round(download.progress)}%</span>
                    </div>
                ` : ''}
            </div>
            <div class="download-actions">
                ${this.getDownloadActions(download)}
            </div>
        `;
        
        this.addDownloadEventListeners(element, download);
        return element;
    }

    getStatusIcon(status) {
        const icons = {
            downloading: '⬇️',
            completed: '✅',
            failed: '❌',
            paused: '⏸️'
        };
        return icons[status] || '📄';
    }

    getDownloadActions(download) {
        switch (download.status) {
            case 'downloading':
                return `
                    <button class="download-action-btn pause-btn" title="Pause">⏸️</button>
                    <button class="download-action-btn cancel-btn" title="Cancel">❌</button>
                `;
            case 'paused':
                return `
                    <button class="download-action-btn resume-btn" title="Resume">▶️</button>
                    <button class="download-action-btn cancel-btn" title="Cancel">❌</button>
                `;
            case 'completed':
                return `
                    <button class="download-action-btn open-btn" title="Open">📂</button>
                    <button class="download-action-btn remove-btn" title="Remove">🗑️</button>
                `;
            case 'failed':
                return `
                    <button class="download-action-btn retry-btn" title="Retry">🔄</button>
                    <button class="download-action-btn remove-btn" title="Remove">🗑️</button>
                `;
            default:
                return '';
        }
    }

    addDownloadEventListeners(element, download) {
        // Pause button
        const pauseBtn = element.querySelector('.pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseDownload(download.id));
        }

        // Resume button
        const resumeBtn = element.querySelector('.resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => this.resumeDownload(download.id));
        }

        // Cancel button
        const cancelBtn = element.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelDownload(download.id));
        }

        // Remove button
        const removeBtn = element.querySelector('.remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeDownload(download.id));
        }

        // Open button
        const openBtn = element.querySelector('.open-btn');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openDownload(download));
        }

        // Retry button
        const retryBtn = element.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryDownload(download));
        }

        // Click to open completed downloads
        if (download.status === 'completed') {
            element.addEventListener('click', (e) => {
                if (!e.target.closest('.download-actions')) {
                    this.openDownload(download);
                }
            });
        }
    }

    updateDownloadElement(download) {
        const element = document.querySelector(`[data-download-id="${download.id}"]`);
        if (element) {
            // Update progress if downloading
            if (download.status === 'downloading' || download.status === 'paused') {
                const progressFill = element.querySelector('.download-progress-fill');
                const percentage = element.querySelector('.download-percentage');
                
                if (progressFill) {
                    progressFill.style.width = `${download.progress}%`;
                }
                if (percentage) {
                    percentage.textContent = `${Math.round(download.progress)}%`;
                }
            }
            
            // Update status class and actions
            element.className = `download-item ${download.status}`;
            const actionsContainer = element.querySelector('.download-actions');
            if (actionsContainer) {
                actionsContainer.innerHTML = this.getDownloadActions(download);
                this.addDownloadEventListeners(element, download);
            }
            
            // Update icon
            const iconElement = element.querySelector('.download-icon');
            if (iconElement) {
                iconElement.textContent = this.getStatusIcon(download.status);
            }
        }
    }

    openDownload(download) {
        if (download.path) {
            // In a real implementation, this would open the file
            this.showToast(`Opening: ${download.filename}`, 'info');
        } else {
            this.showToast('File location not available', 'error');
        }
    }

    retryDownload(download) {
        // Reset download state
        download.status = 'downloading';
        download.progress = 0;
        download.error = null;
        download.startTime = Date.now();
        download.endTime = null;
        
        this.updateDownloadElement(download);
        this.saveDownloads();
        
        // Emit retry event
        document.dispatchEvent(new CustomEvent('download-retry', {
            detail: { 
                id: download.id,
                url: download.url,
                filename: download.filename
            }
        }));
        
        this.showToast(`Retrying download: ${download.filename}`, 'info');
    }

    clearAllDownloads() {
        if (confirm('Are you sure you want to clear all downloads?')) {
            this.downloads = [];
            this.renderDownloads();
            this.saveDownloads();
            this.updateDownloadCount();
            this.showToast('All downloads cleared', 'success');
        }
    }

    updateDownloadCount() {
        const countElement = document.getElementById('download-count');
        if (countElement) {
            const activeDownloads = this.downloads.filter(d => 
                d.status === 'downloading' || d.status === 'paused'
            ).length;
            
            countElement.textContent = activeDownloads;
            countElement.style.display = activeDownloads > 0 ? 'inline' : 'none';
        }
        
        // Update toolbar button badge
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            const badge = downloadBtn.querySelector('.download-badge') || 
                         this.createDownloadBadge(downloadBtn);
            
            const activeCount = this.downloads.filter(d => 
                d.status === 'downloading' || d.status === 'paused'
            ).length;
            
            if (activeCount > 0) {
                badge.textContent = activeCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    createDownloadBadge(button) {
        const badge = document.createElement('span');
        badge.className = 'download-badge';
        badge.style.cssText = `
            position: absolute;
            top: -4px;
            right: -4px;
            background: var(--primary-color);
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: bold;
            min-width: 16px;
            text-align: center;
            display: none;
        `;
        button.style.position = 'relative';
        button.appendChild(badge);
        return badge;
    }

    getDownloadDuration(download) {
        const startTime = new Date(download.startTime);
        const endTime = download.endTime ? new Date(download.endTime) : new Date();
        const duration = Math.floor((endTime - startTime) / 1000);
        
        if (duration < 60) {
            return `${duration}s`;
        } else if (duration < 3600) {
            return `${Math.floor(duration / 60)}m ${duration % 60}s`;
        } else {
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    loadDownloads() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.downloads = JSON.parse(saved);
                // Reset any downloading/paused downloads to failed on startup
                this.downloads.forEach(download => {
                    if (download.status === 'downloading' || download.status === 'paused') {
                        download.status = 'failed';
                        download.error = 'Browser restart';
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load downloads:', error);
            this.downloads = [];
        }
    }

    saveDownloads() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.downloads));
        } catch (error) {
            console.error('Failed to save downloads:', error);
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
    getDownloads() {
        return this.downloads;
    }

    getActiveDownloads() {
        return this.downloads.filter(d => 
            d.status === 'downloading' || d.status === 'paused'
        );
    }

    getCompletedDownloads() {
        return this.downloads.filter(d => d.status === 'completed');
    }

    // Simulate download for testing
    simulateDownload(filename, size = 1024 * 1024) {
        const downloadId = this.addDownload({
            filename: filename,
            url: 'https://example.com/' + filename,
            size: size
        });
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                this.completeDownload(downloadId);
                clearInterval(interval);
            } else {
                this.updateDownloadProgress(downloadId, progress);
            }
        }, 500);
        
        return downloadId;
    }
}
