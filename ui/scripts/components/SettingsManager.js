// Settings Manager Component
export class SettingsManager {
    constructor() {
        this.settings = {
            general: {
                homepage: 'about:blank',
                searchEngine: 'google',
                newTabPage: 'blank',
                downloadLocation: '~/Downloads',
                theme: 'auto'
            },
            privacy: {
                blockTrackers: true,
                clearOnExit: false,
                dnt: true,
                cookies: 'allow',
                javascript: true
            },
            advanced: {
                hardwareAcceleration: true,
                memoryLimit: 2048,
                cacheSize: 512,
                proxyEnabled: false,
                proxyUrl: ''
            }
        };
        
        this.storageKey = 'vishwakarma_settings';
        this.isVisible = false;
        
        this.init();
    }

    async init() {
        this.loadSettings();
        this.createSettingsPanel();
        this.setupEventListeners();
    }

    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.className = 'settings-panel';
        
        panel.innerHTML = `
            <div class="settings-overlay"></div>
            <div class="settings-modal">
                <div class="settings-header">
                    <h2>Settings</h2>
                    <button class="settings-close">&times;</button>
                </div>
                
                <div class="settings-content">
                    <div class="settings-sidebar">
                        <div class="settings-nav">
                            <button class="settings-nav-item active" data-section="general">
                                ⚙️ General
                            </button>
                            <button class="settings-nav-item" data-section="privacy">
                                🔒 Privacy & Security
                            </button>
                            <button class="settings-nav-item" data-section="advanced">
                                🔧 Advanced
                            </button>
                        </div>
                    </div>
                    
                    <div class="settings-main">
                        ${this.renderGeneralSettings()}
                        ${this.renderPrivacySettings()}
                        ${this.renderAdvancedSettings()}
                    </div>
                </div>
                
                <div class="settings-footer">
                    <button class="btn btn-secondary" id="settings-reset">Reset to Defaults</button>
                    <div class="settings-actions">
                        <button class="btn btn-secondary" id="settings-cancel">Cancel</button>
                        <button class="btn btn-primary" id="settings-save">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupPanelEvents(panel);
    }

    renderGeneralSettings() {
        return `
            <div class="settings-section active" data-section="general">
                <h3>General Settings</h3>
                
                <div class="setting-group">
                    <label>Homepage</label>
                    <input type="url" id="homepage" value="${this.settings.general.homepage}" 
                           placeholder="Enter homepage URL">
                    <small>The page that opens when you start the browser</small>
                </div>
                
                <div class="setting-group">
                    <label>Default Search Engine</label>
                    <select id="searchEngine">
                        <option value="google" ${this.settings.general.searchEngine === 'google' ? 'selected' : ''}>Google</option>
                        <option value="bing" ${this.settings.general.searchEngine === 'bing' ? 'selected' : ''}>Bing</option>
                        <option value="duckduckgo" ${this.settings.general.searchEngine === 'duckduckgo' ? 'selected' : ''}>DuckDuckGo</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <label>New Tab Page</label>
                    <select id="newTabPage">
                        <option value="blank" ${this.settings.general.newTabPage === 'blank' ? 'selected' : ''}>Blank Page</option>
                        <option value="homepage" ${this.settings.general.newTabPage === 'homepage' ? 'selected' : ''}>Homepage</option>
                        <option value="bookmarks" ${this.settings.general.newTabPage === 'bookmarks' ? 'selected' : ''}>Bookmarks</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <label>Download Location</label>
                    <div class="input-with-button">
                        <input type="text" id="downloadLocation" value="${this.settings.general.downloadLocation}">
                        <button class="btn btn-secondary" id="browse-download">Browse</button>
                    </div>
                </div>
                
                <div class="setting-group">
                    <label>Theme</label>
                    <select id="theme">
                        <option value="auto" ${this.settings.general.theme === 'auto' ? 'selected' : ''}>Auto (System)</option>
                        <option value="light" ${this.settings.general.theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${this.settings.general.theme === 'dark' ? 'selected' : ''}>Dark</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderPrivacySettings() {
        return `
            <div class="settings-section" data-section="privacy">
                <h3>Privacy & Security</h3>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="blockTrackers" ${this.settings.privacy.blockTrackers ? 'checked' : ''}>
                        <label for="blockTrackers">Block Trackers</label>
                    </div>
                    <small>Prevent websites from tracking your browsing activity</small>
                </div>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="clearOnExit" ${this.settings.privacy.clearOnExit ? 'checked' : ''}>
                        <label for="clearOnExit">Clear Data on Exit</label>
                    </div>
                    <small>Automatically clear browsing data when closing the browser</small>
                </div>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="dnt" ${this.settings.privacy.dnt ? 'checked' : ''}>
                        <label for="dnt">Send "Do Not Track" Signal</label>
                    </div>
                    <small>Request websites not to track you</small>
                </div>
                
                <div class="setting-group">
                    <label>Cookie Policy</label>
                    <select id="cookies">
                        <option value="allow" ${this.settings.privacy.cookies === 'allow' ? 'selected' : ''}>Allow All Cookies</option>
                        <option value="block-third-party" ${this.settings.privacy.cookies === 'block-third-party' ? 'selected' : ''}>Block Third-Party</option>
                        <option value="block-all" ${this.settings.privacy.cookies === 'block-all' ? 'selected' : ''}>Block All Cookies</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="javascript" ${this.settings.privacy.javascript ? 'checked' : ''}>
                        <label for="javascript">Enable JavaScript</label>
                    </div>
                    <small>Allow websites to run JavaScript (recommended)</small>
                </div>
                
                <div class="setting-group">
                    <button class="btn btn-secondary" id="clear-data">Clear Browsing Data</button>
                    <small>Remove history, cookies, and cached files</small>
                </div>
            </div>
        `;
    }

    renderAdvancedSettings() {
        return `
            <div class="settings-section" data-section="advanced">
                <h3>Advanced Settings</h3>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="hardwareAcceleration" ${this.settings.advanced.hardwareAcceleration ? 'checked' : ''}>
                        <label for="hardwareAcceleration">Hardware Acceleration</label>
                    </div>
                    <small>Use GPU for better performance (restart required)</small>
                </div>
                
                <div class="setting-group">
                    <label>Memory Limit (MB)</label>
                    <input type="range" id="memoryLimit" min="512" max="4096" step="256" 
                           value="${this.settings.advanced.memoryLimit}">
                    <div class="range-value">${this.settings.advanced.memoryLimit} MB</div>
                    <small>Maximum memory usage for the browser</small>
                </div>
                
                <div class="setting-group">
                    <label>Cache Size (MB)</label>
                    <input type="range" id="cacheSize" min="128" max="2048" step="128" 
                           value="${this.settings.advanced.cacheSize}">
                    <div class="range-value">${this.settings.advanced.cacheSize} MB</div>
                    <small>Amount of disk space for cached files</small>
                </div>
                
                <div class="setting-group">
                    <div class="setting-toggle">
                        <input type="checkbox" id="proxyEnabled" ${this.settings.advanced.proxyEnabled ? 'checked' : ''}>
                        <label for="proxyEnabled">Use Proxy Server</label>
                    </div>
                </div>
                
                <div class="setting-group proxy-settings" ${!this.settings.advanced.proxyEnabled ? 'style="display: none;"' : ''}>
                    <label>Proxy URL</label>
                    <input type="url" id="proxyUrl" value="${this.settings.advanced.proxyUrl}" 
                           placeholder="http://proxy.example.com:8080">
                </div>
                
                <div class="setting-group">
                    <button class="btn btn-secondary" id="export-settings">Export Settings</button>
                    <button class="btn btn-secondary" id="import-settings">Import Settings</button>
                    <input type="file" id="import-file" accept=".json" style="display: none;">
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Settings button in menu
        document.addEventListener('click', (e) => {
            if (e.target.id === 'settings-btn' || e.target.closest('#settings-btn')) {
                this.showPanel();
            }
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === ',') {
                e.preventDefault();
                this.showPanel();
            }
        });
    }

    setupPanelEvents(panel) {
        // Navigation
        panel.querySelectorAll('.settings-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchSection(item.dataset.section);
            });
        });

        // Close buttons
        panel.querySelector('.settings-close').addEventListener('click', () => this.hidePanel());
        panel.querySelector('#settings-cancel').addEventListener('click', () => this.hidePanel());
        panel.querySelector('.settings-overlay').addEventListener('click', () => this.hidePanel());

        // Save and reset
        panel.querySelector('#settings-save').addEventListener('click', () => this.saveSettings());
        panel.querySelector('#settings-reset').addEventListener('click', () => this.resetSettings());

        // Range inputs
        panel.querySelectorAll('input[type="range"]').forEach(range => {
            range.addEventListener('input', (e) => {
                const valueDisplay = e.target.parentNode.querySelector('.range-value');
                valueDisplay.textContent = `${e.target.value} MB`;
            });
        });

        // Proxy toggle
        panel.querySelector('#proxyEnabled').addEventListener('change', (e) => {
            const proxySettings = panel.querySelector('.proxy-settings');
            proxySettings.style.display = e.target.checked ? 'block' : 'none';
        });

        // Clear data
        panel.querySelector('#clear-data').addEventListener('click', () => this.clearBrowsingData());

        // Export/Import
        panel.querySelector('#export-settings').addEventListener('click', () => this.exportSettings());
        panel.querySelector('#import-settings').addEventListener('click', () => {
            panel.querySelector('#import-file').click();
        });
        panel.querySelector('#import-file').addEventListener('change', (e) => this.importSettings(e));
    }

    switchSection(sectionName) {
        const panel = document.getElementById('settings-panel');
        
        // Update navigation
        panel.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionName);
        });
        
        // Update sections
        panel.querySelectorAll('.settings-section').forEach(section => {
            section.classList.toggle('active', section.dataset.section === sectionName);
        });
    }

    showPanel() {
        const panel = document.getElementById('settings-panel');
        panel.classList.add('show');
        this.isVisible = true;
        document.body.style.overflow = 'hidden';
    }

    hidePanel() {
        const panel = document.getElementById('settings-panel');
        panel.classList.remove('show');
        this.isVisible = false;
        document.body.style.overflow = '';
    }

    saveSettings() {
        const panel = document.getElementById('settings-panel');
        
        // Collect all settings
        const newSettings = {
            general: {
                homepage: panel.querySelector('#homepage').value,
                searchEngine: panel.querySelector('#searchEngine').value,
                newTabPage: panel.querySelector('#newTabPage').value,
                downloadLocation: panel.querySelector('#downloadLocation').value,
                theme: panel.querySelector('#theme').value
            },
            privacy: {
                blockTrackers: panel.querySelector('#blockTrackers').checked,
                clearOnExit: panel.querySelector('#clearOnExit').checked,
                dnt: panel.querySelector('#dnt').checked,
                cookies: panel.querySelector('#cookies').value,
                javascript: panel.querySelector('#javascript').checked
            },
            advanced: {
                hardwareAcceleration: panel.querySelector('#hardwareAcceleration').checked,
                memoryLimit: parseInt(panel.querySelector('#memoryLimit').value),
                cacheSize: parseInt(panel.querySelector('#cacheSize').value),
                proxyEnabled: panel.querySelector('#proxyEnabled').checked,
                proxyUrl: panel.querySelector('#proxyUrl').value
            }
        };
        
        this.settings = newSettings;
        this.persistSettings();
        this.applySettings();
        this.hidePanel();
        
        this.showToast('Settings saved successfully', 'success');
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            this.settings = this.getDefaultSettings();
            this.persistSettings();
            this.hidePanel();
            this.showToast('Settings reset to defaults', 'info');
        }
    }

    clearBrowsingData() {
        if (confirm('This will clear all browsing history, cookies, and cached files. Continue?')) {
            // Clear localStorage data
            localStorage.removeItem('vishwakarma_history');
            localStorage.removeItem('vishwakarma_bookmarks');
            
            // Clear AI conversation history
            localStorage.removeItem('vishwakarma_ai_conversations');
            
            this.showToast('Browsing data cleared', 'success');
        }
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'vishwakarma-settings.json';
        link.click();
        
        this.showToast('Settings exported', 'success');
    }

    importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target.result);
                this.settings = { ...this.getDefaultSettings(), ...importedSettings };
                this.persistSettings();
                this.hidePanel();
                this.showToast('Settings imported successfully', 'success');
            } catch (error) {
                this.showToast('Invalid settings file', 'error');
            }
        };
        reader.readAsText(file);
    }

    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.general.theme);
        
        // Emit settings change event
        document.dispatchEvent(new CustomEvent('settings-changed', {
            detail: this.settings
        }));
    }

    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.classList.add('dark-theme');
        } else if (theme === 'light') {
            root.classList.remove('dark-theme');
        } else { // auto
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark-theme', prefersDark);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.settings = { ...this.getDefaultSettings(), ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = this.getDefaultSettings();
        }
        
        this.applySettings();
    }

    persistSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    getDefaultSettings() {
        return {
            general: {
                homepage: 'about:blank',
                searchEngine: 'google',
                newTabPage: 'blank',
                downloadLocation: '~/Downloads',
                theme: 'auto'
            },
            privacy: {
                blockTrackers: true,
                clearOnExit: false,
                dnt: true,
                cookies: 'allow',
                javascript: true
            },
            advanced: {
                hardwareAcceleration: true,
                memoryLimit: 2048,
                cacheSize: 512,
                proxyEnabled: false,
                proxyUrl: ''
            }
        };
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
    getSetting(path) {
        const keys = path.split('.');
        let value = this.settings;
        for (const key of keys) {
            value = value?.[key];
        }
        return value;
    }

    setSetting(path, value) {
        const keys = path.split('.');
        let target = this.settings;
        for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]];
        }
        target[keys[keys.length - 1]] = value;
        this.persistSettings();
        this.applySettings();
    }

    getSettings() {
        return { ...this.settings };
    }
}
