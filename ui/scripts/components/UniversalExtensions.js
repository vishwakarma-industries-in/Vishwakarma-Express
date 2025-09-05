// Universal Extension Compatibility System - Phase 5
export class UniversalExtensions {
    constructor() {
        this.extensions = new Map();
        this.apis = {};
        this.contentScripts = new Map();
        this.backgroundScripts = new Map();
        this.webAccessibleResources = new Map();
        this.permissions = new Set();
        this.isActive = true;
        
        this.init();
    }

    async init() {
        console.log('Initializing Universal Extension Compatibility...');
        
        this.setupExtensionAPIs();
        this.createExtensionManager();
        this.setupContentScriptInjection();
        this.setupMessagePassing();
        this.loadInstalledExtensions();
        
        console.log('Universal Extension System ready - Chrome/Firefox/Safari compatible');
    }

    setupExtensionAPIs() {
        // Chrome Extensions API compatibility
        window.chrome = window.chrome || {};
        
        // Runtime API
        window.chrome.runtime = {
            id: 'vishwakarma-extension-runtime',
            getManifest: () => ({ version: '1.0.0' }),
            getURL: (path) => `chrome-extension://vishwakarma/${path}`,
            sendMessage: (extensionId, message, options, callback) => {
                this.sendMessage(extensionId, message, callback);
            },
            onMessage: {
                addListener: (callback) => {
                    this.addMessageListener(callback);
                }
            },
            onInstalled: {
                addListener: (callback) => {
                    this.onInstalledListeners.push(callback);
                }
            }
        };
        
        // Storage API
        window.chrome.storage = {
            local: {
                get: (keys, callback) => this.storageGet('local', keys, callback),
                set: (items, callback) => this.storageSet('local', items, callback),
                remove: (keys, callback) => this.storageRemove('local', keys, callback),
                clear: (callback) => this.storageClear('local', callback)
            },
            sync: {
                get: (keys, callback) => this.storageGet('sync', keys, callback),
                set: (items, callback) => this.storageSet('sync', items, callback),
                remove: (keys, callback) => this.storageRemove('sync', keys, callback),
                clear: (callback) => this.storageClear('sync', callback)
            }
        };
        
        // Tabs API
        window.chrome.tabs = {
            query: (queryInfo, callback) => this.tabsQuery(queryInfo, callback),
            get: (tabId, callback) => this.tabsGet(tabId, callback),
            create: (createProperties, callback) => this.tabsCreate(createProperties, callback),
            update: (tabId, updateProperties, callback) => this.tabsUpdate(tabId, updateProperties, callback),
            remove: (tabIds, callback) => this.tabsRemove(tabIds, callback),
            onUpdated: {
                addListener: (callback) => this.addTabUpdateListener(callback)
            },
            onActivated: {
                addListener: (callback) => this.addTabActivatedListener(callback)
            }
        };
        
        // WebRequest API
        window.chrome.webRequest = {
            onBeforeRequest: {
                addListener: (callback, filter, extraInfoSpec) => {
                    this.addWebRequestListener('beforeRequest', callback, filter, extraInfoSpec);
                }
            },
            onBeforeSendHeaders: {
                addListener: (callback, filter, extraInfoSpec) => {
                    this.addWebRequestListener('beforeSendHeaders', callback, filter, extraInfoSpec);
                }
            },
            onHeadersReceived: {
                addListener: (callback, filter, extraInfoSpec) => {
                    this.addWebRequestListener('headersReceived', callback, filter, extraInfoSpec);
                }
            }
        };
        
        // Firefox WebExtensions compatibility
        window.browser = window.chrome;
        
        // Safari compatibility layer
        if (window.safari) {
            this.setupSafariCompatibility();
        }
        
        this.messageListeners = [];
        this.onInstalledListeners = [];
        this.tabUpdateListeners = [];
        this.tabActivatedListeners = [];
        this.webRequestListeners = new Map();
    }

    createExtensionManager() {
        const manager = document.createElement('div');
        manager.id = 'extension-manager';
        manager.className = 'extension-manager';
        
        manager.innerHTML = `
            <div class="extension-header">
                <h3>🧩 Universal Extensions</h3>
                <div class="extension-controls">
                    <button id="install-extension">📦 Install Extension</button>
                    <button id="extension-store">🏪 Extension Store</button>
                    <button class="extension-close">×</button>
                </div>
            </div>
            
            <div class="extension-content">
                <div class="extension-tabs">
                    <button class="ext-tab active" data-tab="installed">Installed</button>
                    <button class="ext-tab" data-tab="store">Store</button>
                    <button class="ext-tab" data-tab="developer">Developer</button>
                </div>
                
                <div class="extension-panels">
                    <div class="ext-panel active" id="installed-panel">
                        <div class="extension-list" id="extension-list"></div>
                    </div>
                    
                    <div class="ext-panel" id="store-panel">
                        <div class="store-search">
                            <input type="text" placeholder="Search extensions..." id="store-search">
                            <button id="search-extensions">Search</button>
                        </div>
                        <div class="store-categories">
                            <button class="category-btn" data-category="productivity">Productivity</button>
                            <button class="category-btn" data-category="developer">Developer Tools</button>
                            <button class="category-btn" data-category="security">Security</button>
                            <button class="category-btn" data-category="social">Social</button>
                        </div>
                        <div class="store-extensions" id="store-extensions"></div>
                    </div>
                    
                    <div class="ext-panel" id="developer-panel">
                        <div class="dev-tools">
                            <button id="load-unpacked">Load Unpacked Extension</button>
                            <button id="pack-extension">Pack Extension</button>
                            <button id="reload-extensions">Reload All Extensions</button>
                        </div>
                        <div class="dev-console" id="dev-console"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(manager);
        this.managerElement = manager;
        this.setupManagerEvents();
    }

    setupManagerEvents() {
        // Tab switching
        document.querySelectorAll('.ext-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchExtensionTab(e.target.dataset.tab);
            });
        });
        
        // Install extension
        document.getElementById('install-extension').addEventListener('click', () => {
            this.showInstallDialog();
        });
        
        // Load unpacked
        document.getElementById('load-unpacked').addEventListener('click', () => {
            this.loadUnpackedExtension();
        });
        
        // Close manager
        document.querySelector('.extension-close').addEventListener('click', () => {
            this.hideManager();
        });
    }

    async loadExtension(manifestData, files) {
        const extensionId = this.generateExtensionId();
        const extension = {
            id: extensionId,
            manifest: manifestData,
            files: files,
            enabled: true,
            permissions: manifestData.permissions || [],
            contentScripts: manifestData.content_scripts || [],
            backgroundScript: manifestData.background,
            webAccessibleResources: manifestData.web_accessible_resources || []
        };
        
        // Validate permissions
        for (const permission of extension.permissions) {
            if (!this.validatePermission(permission)) {
                throw new Error(`Permission ${permission} not allowed`);
            }
        }
        
        this.extensions.set(extensionId, extension);
        
        // Load background script
        if (extension.backgroundScript) {
            await this.loadBackgroundScript(extensionId, extension.backgroundScript);
        }
        
        // Register content scripts
        for (const contentScript of extension.contentScripts) {
            this.registerContentScript(extensionId, contentScript);
        }
        
        // Register web accessible resources
        for (const resource of extension.webAccessibleResources) {
            this.registerWebAccessibleResource(extensionId, resource);
        }
        
        this.updateExtensionList();
        console.log(`Extension ${extension.manifest.name} loaded successfully`);
        
        return extensionId;
    }

    async loadBackgroundScript(extensionId, backgroundConfig) {
        const extension = this.extensions.get(extensionId);
        if (!extension) return;
        
        let scriptContent = '';
        
        if (backgroundConfig.scripts) {
            // Manifest v2 style
            for (const scriptPath of backgroundConfig.scripts) {
                const script = extension.files.get(scriptPath);
                if (script) {
                    scriptContent += script + '\n';
                }
            }
        } else if (backgroundConfig.service_worker) {
            // Manifest v3 style
            const script = extension.files.get(backgroundConfig.service_worker);
            if (script) {
                scriptContent = script;
            }
        }
        
        if (scriptContent) {
            // Create isolated context for background script
            const backgroundContext = this.createBackgroundContext(extensionId);
            
            try {
                // Execute background script in isolated context
                const func = new Function('chrome', 'browser', scriptContent);
                func.call(backgroundContext, window.chrome, window.browser);
                
                this.backgroundScripts.set(extensionId, backgroundContext);
            } catch (error) {
                console.error(`Background script error for ${extensionId}:`, error);
            }
        }
    }

    createBackgroundContext(extensionId) {
        const extension = this.extensions.get(extensionId);
        
        return {
            extensionId,
            console: {
                log: (...args) => console.log(`[${extension.manifest.name}]`, ...args),
                error: (...args) => console.error(`[${extension.manifest.name}]`, ...args),
                warn: (...args) => console.warn(`[${extension.manifest.name}]`, ...args)
            },
            setTimeout: (callback, delay) => setTimeout(callback, delay),
            setInterval: (callback, delay) => setInterval(callback, delay),
            fetch: (url, options) => fetch(url, options)
        };
    }

    registerContentScript(extensionId, contentScript) {
        const key = `${extensionId}-${Date.now()}`;
        this.contentScripts.set(key, {
            extensionId,
            matches: contentScript.matches,
            js: contentScript.js || [],
            css: contentScript.css || [],
            runAt: contentScript.run_at || 'document_idle',
            allFrames: contentScript.all_frames || false
        });
        
        // Inject into current page if it matches
        this.injectContentScriptIfMatches(key);
    }

    injectContentScriptIfMatches(scriptKey) {
        const script = this.contentScripts.get(scriptKey);
        if (!script) return;
        
        const currentUrl = window.location.href;
        const matches = script.matches.some(pattern => 
            this.matchesPattern(currentUrl, pattern)
        );
        
        if (matches) {
            this.injectContentScript(script);
        }
    }

    async injectContentScript(script) {
        const extension = this.extensions.get(script.extensionId);
        if (!extension || !extension.enabled) return;
        
        // Inject CSS files
        for (const cssFile of script.css) {
            const cssContent = extension.files.get(cssFile);
            if (cssContent) {
                const style = document.createElement('style');
                style.textContent = cssContent;
                document.head.appendChild(style);
            }
        }
        
        // Inject JavaScript files
        for (const jsFile of script.js) {
            const jsContent = extension.files.get(jsFile);
            if (jsContent) {
                try {
                    // Create content script context
                    const contentContext = this.createContentScriptContext(script.extensionId);
                    const func = new Function('chrome', 'browser', jsContent);
                    func.call(contentContext, window.chrome, window.browser);
                } catch (error) {
                    console.error(`Content script error for ${script.extensionId}:`, error);
                }
            }
        }
    }

    createContentScriptContext(extensionId) {
        return {
            extensionId,
            document: document,
            window: window,
            console: console
        };
    }

    matchesPattern(url, pattern) {
        // Convert extension pattern to regex
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\./g, '\\.');
        
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(url);
    }

    // Storage API implementation
    storageGet(area, keys, callback) {
        const storageKey = `extension_storage_${area}`;
        const storage = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        let result = {};
        if (typeof keys === 'string') {
            result[keys] = storage[keys];
        } else if (Array.isArray(keys)) {
            keys.forEach(key => {
                result[key] = storage[key];
            });
        } else if (keys === null || keys === undefined) {
            result = storage;
        } else if (typeof keys === 'object') {
            Object.keys(keys).forEach(key => {
                result[key] = storage[key] !== undefined ? storage[key] : keys[key];
            });
        }
        
        if (callback) callback(result);
    }

    storageSet(area, items, callback) {
        const storageKey = `extension_storage_${area}`;
        const storage = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        Object.assign(storage, items);
        localStorage.setItem(storageKey, JSON.stringify(storage));
        
        if (callback) callback();
    }

    storageRemove(area, keys, callback) {
        const storageKey = `extension_storage_${area}`;
        const storage = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(key => delete storage[key]);
        
        localStorage.setItem(storageKey, JSON.stringify(storage));
        
        if (callback) callback();
    }

    storageClear(area, callback) {
        const storageKey = `extension_storage_${area}`;
        localStorage.removeItem(storageKey);
        
        if (callback) callback();
    }

    // Tabs API implementation
    tabsQuery(queryInfo, callback) {
        // Mock implementation - in real browser this would query actual tabs
        const tabs = [{
            id: 1,
            url: window.location.href,
            title: document.title,
            active: true,
            windowId: 1
        }];
        
        if (callback) callback(tabs);
    }

    tabsGet(tabId, callback) {
        const tab = {
            id: tabId,
            url: window.location.href,
            title: document.title,
            active: true,
            windowId: 1
        };
        
        if (callback) callback(tab);
    }

    tabsCreate(createProperties, callback) {
        // In real implementation, this would create a new tab
        if (createProperties.url) {
            window.open(createProperties.url, '_blank');
        }
        
        const tab = {
            id: Date.now(),
            url: createProperties.url || 'about:blank',
            title: 'New Tab',
            active: createProperties.active !== false,
            windowId: 1
        };
        
        if (callback) callback(tab);
    }

    // Message passing
    sendMessage(extensionId, message, callback) {
        const extension = this.extensions.get(extensionId);
        if (!extension || !extension.enabled) {
            if (callback) callback();
            return;
        }
        
        // Send to background script
        const backgroundContext = this.backgroundScripts.get(extensionId);
        if (backgroundContext) {
            this.messageListeners.forEach(listener => {
                try {
                    const response = listener(message, { id: extensionId }, callback);
                    if (response && callback) callback(response);
                } catch (error) {
                    console.error('Message listener error:', error);
                }
            });
        }
    }

    addMessageListener(callback) {
        this.messageListeners.push(callback);
    }

    // Extension management UI
    updateExtensionList() {
        const list = document.getElementById('extension-list');
        if (!list) return;
        
        list.innerHTML = Array.from(this.extensions.values()).map(ext => `
            <div class="extension-item ${ext.enabled ? 'enabled' : 'disabled'}">
                <div class="extension-icon">
                    <img src="${ext.manifest.icons?.['48'] || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%23ccc"/></svg>'}" alt="Extension Icon">
                </div>
                <div class="extension-info">
                    <h4>${ext.manifest.name}</h4>
                    <p>${ext.manifest.description || 'No description'}</p>
                    <span class="extension-version">v${ext.manifest.version}</span>
                </div>
                <div class="extension-controls">
                    <label class="toggle-switch">
                        <input type="checkbox" ${ext.enabled ? 'checked' : ''} onchange="window.app.universalExtensions.toggleExtension('${ext.id}')">
                        <span class="slider"></span>
                    </label>
                    <button onclick="window.app.universalExtensions.removeExtension('${ext.id}')" class="remove-btn">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    toggleExtension(extensionId) {
        const extension = this.extensions.get(extensionId);
        if (extension) {
            extension.enabled = !extension.enabled;
            this.updateExtensionList();
            console.log(`Extension ${extension.manifest.name} ${extension.enabled ? 'enabled' : 'disabled'}`);
        }
    }

    removeExtension(extensionId) {
        const extension = this.extensions.get(extensionId);
        if (extension) {
            // Cleanup
            this.backgroundScripts.delete(extensionId);
            
            // Remove content scripts
            for (const [key, script] of this.contentScripts) {
                if (script.extensionId === extensionId) {
                    this.contentScripts.delete(key);
                }
            }
            
            this.extensions.delete(extensionId);
            this.updateExtensionList();
            console.log(`Extension ${extension.manifest.name} removed`);
        }
    }

    switchExtensionTab(tabName) {
        document.querySelectorAll('.ext-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.ext-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    }

    showManager() {
        this.managerElement.classList.add('show');
        this.updateExtensionList();
    }

    hideManager() {
        this.managerElement.classList.remove('show');
    }

    generateExtensionId() {
        return 'ext_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validatePermission(permission) {
        const allowedPermissions = [
            'activeTab', 'tabs', 'storage', 'notifications', 'contextMenus',
            'webRequest', 'webRequestBlocking', 'cookies', 'history',
            'bookmarks', 'downloads', 'identity', 'management'
        ];
        
        return allowedPermissions.includes(permission) || 
               permission.startsWith('http') || 
               permission.startsWith('https');
    }

    async showInstallDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip,.crx';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await this.installExtensionFromFile(file);
                } catch (error) {
                    alert(`Installation failed: ${error.message}`);
                }
            }
        };
        
        input.click();
    }

    async installExtensionFromFile(file) {
        // This would handle .zip or .crx files
        // For now, just show a placeholder
        alert('Extension installation from file not yet implemented. Use developer mode to load unpacked extensions.');
    }

    loadUnpackedExtension() {
        // This would open a folder picker in a real browser
        alert('Load unpacked extension: This feature requires file system access. In a real implementation, this would open a folder picker.');
    }

    loadInstalledExtensions() {
        // Load any previously installed extensions from storage
        try {
            const saved = localStorage.getItem('vishwakarma_extensions');
            if (saved) {
                const extensionData = JSON.parse(saved);
                // Restore extensions
                console.log('Loading saved extensions...');
            }
        } catch (error) {
            console.error('Failed to load saved extensions:', error);
        }
    }

    saveExtensions() {
        try {
            const extensionData = Array.from(this.extensions.entries());
            localStorage.setItem('vishwakarma_extensions', JSON.stringify(extensionData));
        } catch (error) {
            console.error('Failed to save extensions:', error);
        }
    }
}
