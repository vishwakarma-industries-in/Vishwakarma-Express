// Security Manager Component
export class SecurityManager {
    constructor() {
        this.settings = {
            blockTrackers: true,
            blockAds: true,
            blockMalware: true,
            httpsOnly: false,
            sandboxMode: true,
            cookiePolicy: 'block-third-party',
            javascriptPolicy: 'allow',
            popupBlocking: true,
            downloadScanning: true
        };
        
        this.blockedRequests = [];
        this.securityEvents = [];
        this.trustedSites = [];
        this.blockedSites = [];
        
        this.trackerDomains = [
            'google-analytics.com', 'googletagmanager.com', 'facebook.com/tr',
            'doubleclick.net', 'googlesyndication.com', 'amazon-adsystem.com',
            'scorecardresearch.com', 'quantserve.com', 'outbrain.com'
        ];
        
        this.malwareDomains = [
            'malware-example.com', 'phishing-site.net', 'suspicious-domain.org'
        ];
        
        this.storageKey = 'vishwakarma_security';
        this.init();
    }

    async init() {
        this.loadSettings();
        this.setupSecurityInterceptors();
        this.createSecurityPanel();
        this.setupEventListeners();
        this.startSecurityMonitoring();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.settings = { ...this.settings, ...data.settings };
                this.trustedSites = data.trustedSites || [];
                this.blockedSites = data.blockedSites || [];
            }
        } catch (error) {
            console.error('Failed to load security settings:', error);
        }
    }

    saveSettings() {
        try {
            const data = {
                settings: this.settings,
                trustedSites: this.trustedSites,
                blockedSites: this.blockedSites
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save security settings:', error);
        }
    }

    setupSecurityInterceptors() {
        // Intercept network requests for security checks
        this.interceptXHR();
        this.interceptFetch();
        this.interceptImageLoading();
        this.interceptScriptLoading();
    }

    interceptXHR() {
        const originalXHR = window.XMLHttpRequest;
        const self = this;
        
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url, ...args) {
                const securityCheck = self.checkRequestSecurity(url, 'xhr');
                
                if (!securityCheck.allowed) {
                    self.logSecurityEvent('blocked_request', {
                        url,
                        method,
                        reason: securityCheck.reason,
                        type: 'xhr'
                    });
                    
                    // Block the request
                    throw new Error(`Request blocked by security policy: ${securityCheck.reason}`);
                }
                
                return originalOpen.apply(this, [method, url, ...args]);
            };
            
            return xhr;
        };
    }

    interceptFetch() {
        const originalFetch = window.fetch;
        const self = this;
        
        window.fetch = async function(url, options = {}) {
            const securityCheck = self.checkRequestSecurity(url, 'fetch');
            
            if (!securityCheck.allowed) {
                self.logSecurityEvent('blocked_request', {
                    url: typeof url === 'string' ? url : url.url,
                    method: options.method || 'GET',
                    reason: securityCheck.reason,
                    type: 'fetch'
                });
                
                throw new Error(`Request blocked by security policy: ${securityCheck.reason}`);
            }
            
            return originalFetch(url, options);
        };
    }

    interceptImageLoading() {
        const originalCreateElement = document.createElement;
        const self = this;
        
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            if (tagName.toLowerCase() === 'img') {
                const originalSetSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
                
                Object.defineProperty(element, 'src', {
                    set: function(value) {
                        const securityCheck = self.checkRequestSecurity(value, 'image');
                        
                        if (!securityCheck.allowed) {
                            self.logSecurityEvent('blocked_image', {
                                url: value,
                                reason: securityCheck.reason
                            });
                            return; // Don't set the src
                        }
                        
                        originalSetSrc.call(this, value);
                    },
                    get: function() {
                        return this.getAttribute('src');
                    }
                });
            }
            
            return element;
        };
    }

    interceptScriptLoading() {
        const originalCreateElement = document.createElement;
        const self = this;
        
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            if (tagName.toLowerCase() === 'script') {
                const originalSetSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').set;
                
                Object.defineProperty(element, 'src', {
                    set: function(value) {
                        const securityCheck = self.checkRequestSecurity(value, 'script');
                        
                        if (!securityCheck.allowed) {
                            self.logSecurityEvent('blocked_script', {
                                url: value,
                                reason: securityCheck.reason
                            });
                            return; // Don't set the src
                        }
                        
                        originalSetSrc.call(this, value);
                    },
                    get: function() {
                        return this.getAttribute('src');
                    }
                });
            }
            
            return element;
        };
    }

    checkRequestSecurity(url, type) {
        if (!url) return { allowed: true };
        
        try {
            const urlObj = new URL(url, window.location.href);
            const domain = urlObj.hostname;
            
            // Check blocked sites
            if (this.blockedSites.includes(domain)) {
                return { allowed: false, reason: 'Site is in blocked list' };
            }
            
            // Check trusted sites (bypass other checks)
            if (this.trustedSites.includes(domain)) {
                return { allowed: true };
            }
            
            // HTTPS-only mode
            if (this.settings.httpsOnly && urlObj.protocol === 'http:') {
                return { allowed: false, reason: 'HTTPS-only mode enabled' };
            }
            
            // Block trackers
            if (this.settings.blockTrackers && this.isTrackerDomain(domain)) {
                return { allowed: false, reason: 'Tracker blocked' };
            }
            
            // Block malware
            if (this.settings.blockMalware && this.isMalwareDomain(domain)) {
                return { allowed: false, reason: 'Malware domain blocked' };
            }
            
            // JavaScript policy
            if (type === 'script' && this.settings.javascriptPolicy === 'block') {
                return { allowed: false, reason: 'JavaScript blocked by policy' };
            }
            
            return { allowed: true };
            
        } catch (error) {
            // Invalid URL, block it
            return { allowed: false, reason: 'Invalid URL' };
        }
    }

    isTrackerDomain(domain) {
        return this.trackerDomains.some(tracker => 
            domain.includes(tracker) || domain.endsWith(tracker)
        );
    }

    isMalwareDomain(domain) {
        return this.malwareDomains.some(malware => 
            domain.includes(malware) || domain.endsWith(malware)
        );
    }

    logSecurityEvent(type, data) {
        const event = {
            type,
            timestamp: Date.now(),
            data,
            url: window.location.href
        };
        
        this.securityEvents.unshift(event);
        
        // Limit events history
        if (this.securityEvents.length > 1000) {
            this.securityEvents = this.securityEvents.slice(0, 1000);
        }
        
        // Show notification for important events
        if (type === 'blocked_malware' || type === 'security_warning') {
            this.showSecurityNotification(event);
        }
        
        // Update security panel if visible
        this.updateSecurityPanel();
    }

    createSecurityPanel() {
        const panel = document.createElement('div');
        panel.id = 'security-panel';
        panel.className = 'security-panel';
        
        panel.innerHTML = `
            <div class="security-overlay"></div>
            <div class="security-modal">
                <div class="security-header">
                    <h2>🔒 Security & Privacy</h2>
                    <button class="security-close">&times;</button>
                </div>
                
                <div class="security-content">
                    <div class="security-tabs">
                        <button class="security-tab active" data-tab="overview">Overview</button>
                        <button class="security-tab" data-tab="events">Security Events</button>
                        <button class="security-tab" data-tab="sites">Site Management</button>
                        <button class="security-tab" data-tab="settings">Security Settings</button>
                    </div>
                    
                    <div class="security-tab-content">
                        ${this.renderOverviewTab()}
                        ${this.renderEventsTab()}
                        ${this.renderSitesTab()}
                        ${this.renderSettingsTab()}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupPanelEvents(panel);
    }

    renderOverviewTab() {
        const blockedToday = this.securityEvents.filter(e => 
            Date.now() - e.timestamp < 24 * 60 * 60 * 1000
        ).length;
        
        return `
            <div class="security-section active" data-tab="overview">
                <div class="security-stats">
                    <div class="security-stat">
                        <div class="stat-number">${blockedToday}</div>
                        <div class="stat-label">Blocked Today</div>
                    </div>
                    <div class="security-stat">
                        <div class="stat-number">${this.trustedSites.length}</div>
                        <div class="stat-label">Trusted Sites</div>
                    </div>
                    <div class="security-stat">
                        <div class="stat-number">${this.blockedSites.length}</div>
                        <div class="stat-label">Blocked Sites</div>
                    </div>
                </div>
                
                <div class="security-status">
                    <h3>Security Status</h3>
                    <div class="status-item ${this.settings.blockTrackers ? 'enabled' : 'disabled'}">
                        <span class="status-icon">${this.settings.blockTrackers ? '🛡️' : '⚠️'}</span>
                        <span>Tracker Blocking</span>
                        <span class="status-text">${this.settings.blockTrackers ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div class="status-item ${this.settings.blockMalware ? 'enabled' : 'disabled'}">
                        <span class="status-icon">${this.settings.blockMalware ? '🛡️' : '⚠️'}</span>
                        <span>Malware Protection</span>
                        <span class="status-text">${this.settings.blockMalware ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div class="status-item ${this.settings.httpsOnly ? 'enabled' : 'disabled'}">
                        <span class="status-icon">${this.settings.httpsOnly ? '🔒' : '🔓'}</span>
                        <span>HTTPS-Only Mode</span>
                        <span class="status-text">${this.settings.httpsOnly ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderEventsTab() {
        return `
            <div class="security-section" data-tab="events">
                <div class="events-toolbar">
                    <button class="btn btn-secondary" id="clear-events">Clear Events</button>
                    <button class="btn btn-secondary" id="export-events">Export Log</button>
                </div>
                <div class="events-list" id="events-list">
                    ${this.renderSecurityEvents()}
                </div>
            </div>
        `;
    }

    renderSitesTab() {
        return `
            <div class="security-section" data-tab="sites">
                <div class="sites-section">
                    <h3>Trusted Sites</h3>
                    <div class="site-input">
                        <input type="text" id="trusted-site-input" placeholder="Enter domain (e.g., example.com)">
                        <button class="btn btn-primary" id="add-trusted-site">Add</button>
                    </div>
                    <div class="sites-list" id="trusted-sites-list">
                        ${this.renderSitesList(this.trustedSites, 'trusted')}
                    </div>
                </div>
                
                <div class="sites-section">
                    <h3>Blocked Sites</h3>
                    <div class="site-input">
                        <input type="text" id="blocked-site-input" placeholder="Enter domain (e.g., example.com)">
                        <button class="btn btn-primary" id="add-blocked-site">Add</button>
                    </div>
                    <div class="sites-list" id="blocked-sites-list">
                        ${this.renderSitesList(this.blockedSites, 'blocked')}
                    </div>
                </div>
            </div>
        `;
    }

    renderSettingsTab() {
        return `
            <div class="security-section" data-tab="settings">
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="block-trackers" ${this.settings.blockTrackers ? 'checked' : ''}>
                        <label for="block-trackers">Block Trackers</label>
                    </div>
                    <small>Prevent websites from tracking your browsing activity</small>
                </div>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="block-ads" ${this.settings.blockAds ? 'checked' : ''}>
                        <label for="block-ads">Block Advertisements</label>
                    </div>
                    <small>Block intrusive ads and pop-ups</small>
                </div>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="block-malware" ${this.settings.blockMalware ? 'checked' : ''}>
                        <label for="block-malware">Malware Protection</label>
                    </div>
                    <small>Block access to known malicious websites</small>
                </div>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="https-only" ${this.settings.httpsOnly ? 'checked' : ''}>
                        <label for="https-only">HTTPS-Only Mode</label>
                    </div>
                    <small>Only allow secure HTTPS connections</small>
                </div>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="sandbox-mode" ${this.settings.sandboxMode ? 'checked' : ''}>
                        <label for="sandbox-mode">Sandbox Mode</label>
                    </div>
                    <small>Isolate web content for enhanced security</small>
                </div>
                
                <div class="setting-group">
                    <label>Cookie Policy</label>
                    <select id="cookie-policy">
                        <option value="allow" ${this.settings.cookiePolicy === 'allow' ? 'selected' : ''}>Allow All Cookies</option>
                        <option value="block-third-party" ${this.settings.cookiePolicy === 'block-third-party' ? 'selected' : ''}>Block Third-Party Cookies</option>
                        <option value="block-all" ${this.settings.cookiePolicy === 'block-all' ? 'selected' : ''}>Block All Cookies</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <label>JavaScript Policy</label>
                    <select id="javascript-policy">
                        <option value="allow" ${this.settings.javascriptPolicy === 'allow' ? 'selected' : ''}>Allow JavaScript</option>
                        <option value="ask" ${this.settings.javascriptPolicy === 'ask' ? 'selected' : ''}>Ask Before Running</option>
                        <option value="block" ${this.settings.javascriptPolicy === 'block' ? 'selected' : ''}>Block JavaScript</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <button class="btn btn-primary" id="save-security-settings">Save Settings</button>
                    <button class="btn btn-secondary" id="reset-security-settings">Reset to Defaults</button>
                </div>
            </div>
        `;
    }

    renderSecurityEvents() {
        if (this.securityEvents.length === 0) {
            return '<div class="events-empty">No security events recorded</div>';
        }
        
        return this.securityEvents.slice(0, 50).map(event => {
            const time = new Date(event.timestamp).toLocaleTimeString();
            const icon = this.getEventIcon(event.type);
            
            return `
                <div class="event-item ${event.type}">
                    <span class="event-icon">${icon}</span>
                    <div class="event-details">
                        <div class="event-message">${this.getEventMessage(event)}</div>
                        <div class="event-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSitesList(sites, type) {
        if (sites.length === 0) {
            return `<div class="sites-empty">No ${type} sites</div>`;
        }
        
        return sites.map(site => `
            <div class="site-item">
                <span class="site-domain">${site}</span>
                <button class="site-remove" data-site="${site}" data-type="${type}">Remove</button>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Security panel toggle (could be triggered from menu)
        document.addEventListener('click', (e) => {
            if (e.target.id === 'security-btn' || e.target.closest('#security-btn')) {
                this.showPanel();
            }
        });
    }

    setupPanelEvents(panel) {
        // Tab switching
        panel.querySelectorAll('.security-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Close panel
        panel.querySelector('.security-close').addEventListener('click', () => {
            this.hidePanel();
        });
        
        panel.querySelector('.security-overlay').addEventListener('click', () => {
            this.hidePanel();
        });

        // Settings
        panel.querySelector('#save-security-settings')?.addEventListener('click', () => {
            this.saveSecuritySettings(panel);
        });
        
        panel.querySelector('#reset-security-settings')?.addEventListener('click', () => {
            this.resetSecuritySettings();
        });

        // Events
        panel.querySelector('#clear-events')?.addEventListener('click', () => {
            this.clearSecurityEvents();
        });
        
        panel.querySelector('#export-events')?.addEventListener('click', () => {
            this.exportSecurityEvents();
        });

        // Site management
        panel.querySelector('#add-trusted-site')?.addEventListener('click', () => {
            this.addTrustedSite(panel);
        });
        
        panel.querySelector('#add-blocked-site')?.addEventListener('click', () => {
            this.addBlockedSite(panel);
        });

        // Site removal
        panel.addEventListener('click', (e) => {
            if (e.target.classList.contains('site-remove')) {
                this.removeSite(e.target.dataset.site, e.target.dataset.type);
            }
        });
    }

    showPanel() {
        const panel = document.getElementById('security-panel');
        panel.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.updateSecurityPanel();
    }

    hidePanel() {
        const panel = document.getElementById('security-panel');
        panel.classList.remove('show');
        document.body.style.overflow = '';
    }

    switchTab(tabName) {
        const panel = document.getElementById('security-panel');
        
        // Update tab buttons
        panel.querySelectorAll('.security-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update sections
        panel.querySelectorAll('.security-section').forEach(section => {
            section.classList.toggle('active', section.dataset.tab === tabName);
        });
    }

    updateSecurityPanel() {
        const panel = document.getElementById('security-panel');
        if (!panel || !panel.classList.contains('show')) return;
        
        // Update overview stats
        const overviewSection = panel.querySelector('[data-tab="overview"]');
        if (overviewSection) {
            overviewSection.innerHTML = this.renderOverviewTab();
        }
        
        // Update events list
        const eventsList = panel.querySelector('#events-list');
        if (eventsList) {
            eventsList.innerHTML = this.renderSecurityEvents();
        }
    }

    saveSecuritySettings(panel) {
        this.settings = {
            blockTrackers: panel.querySelector('#block-trackers').checked,
            blockAds: panel.querySelector('#block-ads').checked,
            blockMalware: panel.querySelector('#block-malware').checked,
            httpsOnly: panel.querySelector('#https-only').checked,
            sandboxMode: panel.querySelector('#sandbox-mode').checked,
            cookiePolicy: panel.querySelector('#cookie-policy').value,
            javascriptPolicy: panel.querySelector('#javascript-policy').value,
            popupBlocking: this.settings.popupBlocking,
            downloadScanning: this.settings.downloadScanning
        };
        
        this.saveSettings();
        this.showToast('Security settings saved', 'success');
        this.updateSecurityPanel();
    }

    resetSecuritySettings() {
        if (confirm('Reset all security settings to defaults?')) {
            this.settings = {
                blockTrackers: true,
                blockAds: true,
                blockMalware: true,
                httpsOnly: false,
                sandboxMode: true,
                cookiePolicy: 'block-third-party',
                javascriptPolicy: 'allow',
                popupBlocking: true,
                downloadScanning: true
            };
            
            this.saveSettings();
            this.hidePanel();
            this.showToast('Security settings reset to defaults', 'info');
        }
    }

    addTrustedSite(panel) {
        const input = panel.querySelector('#trusted-site-input');
        const domain = input.value.trim().toLowerCase();
        
        if (domain && !this.trustedSites.includes(domain)) {
            this.trustedSites.push(domain);
            this.saveSettings();
            input.value = '';
            
            // Update display
            const list = panel.querySelector('#trusted-sites-list');
            list.innerHTML = this.renderSitesList(this.trustedSites, 'trusted');
            
            this.showToast(`Added ${domain} to trusted sites`, 'success');
        }
    }

    addBlockedSite(panel) {
        const input = panel.querySelector('#blocked-site-input');
        const domain = input.value.trim().toLowerCase();
        
        if (domain && !this.blockedSites.includes(domain)) {
            this.blockedSites.push(domain);
            this.saveSettings();
            input.value = '';
            
            // Update display
            const list = panel.querySelector('#blocked-sites-list');
            list.innerHTML = this.renderSitesList(this.blockedSites, 'blocked');
            
            this.showToast(`Added ${domain} to blocked sites`, 'success');
        }
    }

    removeSite(domain, type) {
        if (type === 'trusted') {
            this.trustedSites = this.trustedSites.filter(site => site !== domain);
        } else {
            this.blockedSites = this.blockedSites.filter(site => site !== domain);
        }
        
        this.saveSettings();
        this.updateSecurityPanel();
        this.showToast(`Removed ${domain} from ${type} sites`, 'success');
    }

    clearSecurityEvents() {
        if (confirm('Clear all security events?')) {
            this.securityEvents = [];
            this.updateSecurityPanel();
            this.showToast('Security events cleared', 'success');
        }
    }

    exportSecurityEvents() {
        const data = JSON.stringify(this.securityEvents, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `security-events-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Security events exported', 'success');
    }

    startSecurityMonitoring() {
        // Monitor for suspicious activity
        setInterval(() => {
            this.checkForSuspiciousActivity();
        }, 30000); // Check every 30 seconds
    }

    checkForSuspiciousActivity() {
        // Check for rapid requests (possible DDoS)
        const recentEvents = this.securityEvents.filter(e => 
            Date.now() - e.timestamp < 60000 // Last minute
        );
        
        if (recentEvents.length > 50) {
            this.logSecurityEvent('suspicious_activity', {
                reason: 'High request rate detected',
                count: recentEvents.length
            });
        }
    }

    showSecurityNotification(event) {
        const notification = document.createElement('div');
        notification.className = 'security-notification';
        notification.innerHTML = `
            <div class="notification-icon">🛡️</div>
            <div class="notification-content">
                <div class="notification-title">Security Alert</div>
                <div class="notification-message">${this.getEventMessage(event)}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            notification.remove();
        }, 10000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getEventIcon(type) {
        const icons = {
            blocked_request: '🚫',
            blocked_tracker: '🛡️',
            blocked_malware: '⚠️',
            blocked_script: '📜',
            blocked_image: '🖼️',
            suspicious_activity: '👁️',
            security_warning: '⚠️'
        };
        return icons[type] || '🔒';
    }

    getEventMessage(event) {
        const messages = {
            blocked_request: `Blocked request to ${event.data.url}`,
            blocked_tracker: `Blocked tracker: ${event.data.url}`,
            blocked_malware: `Blocked malware site: ${event.data.url}`,
            blocked_script: `Blocked script: ${event.data.url}`,
            blocked_image: `Blocked image: ${event.data.url}`,
            suspicious_activity: `Suspicious activity: ${event.data.reason}`,
            security_warning: `Security warning: ${event.data.message}`
        };
        return messages[event.type] || 'Security event occurred';
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
    blockSite(domain) {
        if (!this.blockedSites.includes(domain)) {
            this.blockedSites.push(domain);
            this.saveSettings();
        }
    }

    trustSite(domain) {
        if (!this.trustedSites.includes(domain)) {
            this.trustedSites.push(domain);
            this.saveSettings();
        }
    }

    getSecurityStatus() {
        return {
            settings: this.settings,
            eventsToday: this.securityEvents.filter(e => 
                Date.now() - e.timestamp < 24 * 60 * 60 * 1000
            ).length,
            trustedSites: this.trustedSites.length,
            blockedSites: this.blockedSites.length
        };
    }
}
