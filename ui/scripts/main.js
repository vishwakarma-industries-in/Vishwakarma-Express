// Vishwakarma Express - Main Application Logic
import { BrowserAPI } from './api/browser.js';
import { TabManager } from './components/TabManager.js';
import { BookmarksManager } from './components/BookmarksManager.js';
import { HistoryManager } from './components/HistoryManager.js';
import { AIAssistant } from './components/AIAssistant.js';
import { DownloadManager } from './components/DownloadManager.js';
import { SettingsManager } from './components/SettingsManager.js';
import { DeveloperTools } from './components/DeveloperTools.js';
import { SecurityManager } from './components/SecurityManager.js';
import { PerformanceTuner } from './components/PerformanceTuner.js';
import { UIAnimations } from './components/UIAnimations.js';
import { MemoryOptimizer } from './components/MemoryOptimizer.js';
import { StartupOptimizer } from './components/StartupOptimizer.js';
import { TestingSuite } from './components/TestingSuite.js';
import { ContextMenuSystem } from './components/ContextMenuSystem.js';
import { NotificationSystem } from './components/NotificationSystem.js';
import { CommandPalette } from './components/CommandPalette.js';
import { ModalSystem } from './components/ModalSystem.js';
import { ProgressIndicators } from './components/ProgressIndicators.js';
import { UIEnhancer } from './components/UIEnhancer.js';
import { KeyboardShortcuts } from './components/KeyboardShortcuts.js';
import { PerformanceOptimizer } from './components/PerformanceOptimizer.js';
import { KeyboardManager } from './components/KeyboardManager.js';
import { MultiModelAI } from './components/MultiModelAI.js';
import { AIBrowserAssistant } from './components/AIBrowserAssistant.js';
import { CodeGenerationTools } from './components/CodeGenerationTools.js';
import { NextGenDevTools } from './components/NextGenDevTools.js';
import { UniversalExtensions } from './components/UniversalExtensions.js';
import { QuantumPerformance } from './components/QuantumPerformance.js';
import { UICustomization } from './components/UICustomization.js';
import { GamingMedia } from './components/GamingMedia.js';
import { Rendering3D } from './components/Rendering3D.js';
import { TerminalFileManager } from './components/TerminalFileManager.js';
import { ScriptingEngine } from './components/ScriptingEngine.js';

class VishwakarmaExpress {
    constructor() {
        this.tabs = new Map();
        this.activeTabId = null;
        
        // Core components
        this.tabManager = null;
        this.bookmarksManager = null;
        this.historyManager = null;
        this.aiAssistant = null;
        this.downloadManager = null;
        this.settingsManager = null;
        this.developerTools = null;
        this.securityManager = null;
        this.performanceTuner = null;
        
        // UI Enhancement components
        this.contextMenuSystem = null;
        this.notificationSystem = null;
        this.commandPalette = null;
        this.modalSystem = null;
        this.progressIndicators = null;
        this.sidebarNavigation = null;
        this.uiEnhancer = null;
        this.keyboardShortcuts = null;
        this.performanceOptimizer = null;
        
        // Phase 6 components
        this.uiAnimations = null;
        this.memoryOptimizer = null;
        this.startupOptimizer = null;
        this.testingSuite = null;
        
        // Phase 4 AI components
        this.keyboardManager = null;
        this.multiModelAI = null;
        this.aiBrowserAssistant = null;
        this.codeGenerationTools = null;
        
        // Phase 5 Revolutionary components
        this.nextGenDevTools = null;
        this.universalExtensions = null;
        this.quantumPerformance = null;
        this.uiCustomization = null;
        this.gamingMedia = null;
        this.rendering3D = null;
        this.terminalFileManager = null;
        this.scriptingEngine = null;
        this.init();
    }

    async init() {
        console.log('Initializing Vishwakarma Express...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial tabs
        await this.loadTabs();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initialize components
        this.tabManager = new TabManager();
        this.bookmarksManager = new BookmarksManager();
        this.historyManager = new HistoryManager();
        this.aiAssistant = new AIAssistant();
        this.downloadManager = new DownloadManager();
        this.settingsManager = new SettingsManager();
        this.developerTools = new DeveloperTools();
        this.securityManager = new SecurityManager();
        this.performanceTuner = new PerformanceTuner();
        await this.performanceTuner.init();
        
        this.uiAnimations = null;
        this.memoryOptimizer = null;
        this.startupOptimizer = null;
        this.testingSuite = null;
        
        // Initialize Performance Optimizer first for Dell E6440
        this.performanceOptimizer = new PerformanceOptimizer();
        
        // Initialize UI Enhancement components
        this.progressIndicators = new ProgressIndicators();
        this.notificationSystem = new NotificationSystem();
        this.uiEnhancer = new UIEnhancer();
        this.keyboardShortcuts = new KeyboardShortcuts();
        this.contextMenuSystem = new ContextMenuSystem();
        this.modalSystem = new ModalSystem();
        this.commandPalette = new CommandPalette();
        this.sidebarNavigation = new SidebarNavigation();
        
        // Show startup progress
        const startupProgress = this.progressIndicators.progress('Initializing Vishwakarma Express', 10);
        
        // Initialize Phase 6 components
        startupProgress.update(25, 'Loading UI animations...');
        this.uiAnimations = new UIAnimations();
        
        startupProgress.update(40, 'Optimizing memory...');
        this.memoryOptimizer = new MemoryOptimizer();
        
        startupProgress.update(55, 'Configuring startup optimizer...');
        this.startupOptimizer = new StartupOptimizer();
        
        startupProgress.update(70, 'Preparing testing suite...');
        this.testingSuite = new TestingSuite();
        this.keyboardManager = null;
        this.multiModelAI = null;
        this.aiBrowserAssistant = null;
        this.codeGenerationTools = null;
        this.nextGenDevTools = null;
        
        // Initialize Phase 4 AI components
        startupProgress.update(80, 'Loading AI systems...');
        this.multiModelAI = new MultiModelAI();
        this.aiBrowserAssistant = new AIBrowserAssistant(this.multiModelAI);
        this.codeGenerationTools = new CodeGenerationTools(this.multiModelAI);
        
        // Initialize Phase 5 Revolutionary components
        startupProgress.update(90, 'Activating revolutionary features...');
        this.quantumPerformance = new QuantumPerformance();
        this.nextGenDevTools = new NextGenDevTools(this.multiModelAI);
        this.universalExtensions = new UniversalExtensions();
        this.uiCustomization = new UICustomization();
        this.gamingMedia = new GamingMedia();
        this.rendering3D = new Rendering3D();
        this.terminalFileManager = new TerminalFileManager();
        this.scriptingEngine = new ScriptingEngine();
        
        // Complete startup
        startupProgress.update(100, 'Vishwakarma Express ready!');
        setTimeout(() => {
            startupProgress.close();
            this.notificationSystem.success(
                'Welcome to Vishwakarma Express',
                'All systems initialized and ready for use'
            );
        }, 1000);
        
        // Make components globally accessible
        window.app = {
            tabManager: this.tabManager,
            multiModelAI: this.multiModelAI,
            nextGenDevTools: this.nextGenDevTools,
            extensionCompatibility: this.extensionCompatibility,
            quantumPerformance: this.quantumPerformance,
            customizationSystem: this.customizationSystem,
            gamingMediaCapabilities: this.gamingMediaCapabilities,
            rendering3D: this.rendering3D,
            terminalFileManager: this.terminalFileManager,
            scriptingEngine: this.scriptingEngine,
            sidebarNavigation: this.sidebarNavigation,
            uiAnimations: this.uiAnimations,
            memoryOptimizer: this.memoryOptimizer,
            startupOptimizer: this.startupOptimizer,
            testingSuite: this.testingSuite,
            contextMenuSystem: this.contextMenuSystem,
            notificationSystem: this.notificationSystem,
            commandPalette: this.commandPalette,
            modalSystem: this.modalSystem,
            progressIndicators: this.progressIndicators,
            bookmarksManager: this.bookmarksManager,
            historyManager: this.historyManager,
            aiAssistant: this.aiAssistant,
            downloadManager: this.downloadManager,
            settingsManager: this.settingsManager,
            developerTools: this.developerTools,
            securityManager: this.securityManager,
            performanceTuner: this.performanceTuner,
            uiEnhancer: this.uiEnhancer,
            keyboardShortcuts: this.keyboardShortcuts,
            performanceOptimizer: this.performanceOptimizer
        };
        
        console.log('🌟 Vishwakarma Express Phase 5 - REVOLUTIONARY FEATURES Complete!');
    }

    setupEventListeners() {
        // Navigation controls
        document.getElementById('back-btn').addEventListener('click', () => this.goBack());
        document.getElementById('forward-btn').addEventListener('click', () => this.goForward());
        document.getElementById('reload-btn').addEventListener('click', () => this.reloadTab());
        
        // Address bar
        const addressInput = document.getElementById('address-input');
        addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigate(addressInput.value);
            }
        });
        
        // Welcome screen search
        const welcomeSearch = document.getElementById('welcome-search');
        if (welcomeSearch) {
            welcomeSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.navigate(welcomeSearch.value);
                }
            });
        }
        
        // Quick links
        document.querySelectorAll('.quick-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.getAttribute('data-url');
                if (url) {
                    this.navigate(url);
                }
            });
        });
        
        // New tab button
        document.getElementById('new-tab-btn').addEventListener('click', () => this.createNewTab());
        
        // Menu button
        document.getElementById('menu-btn').addEventListener('click', () => this.toggleMenu());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + T - New tab
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.createNewTab();
            }
            
            // Ctrl/Cmd + W - Close tab
            if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
                e.preventDefault();
                this.closeCurrentTab();
            }
            
            // Ctrl/Cmd + R - Reload
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.reloadTab();
            }
            
            // Ctrl/Cmd + L - Focus address bar
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                document.getElementById('address-input').focus();
                document.getElementById('address-input').select();
            }
            
            // Alt + Left - Go back
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                this.goBack();
            }
            
            // Alt + Right - Go forward
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                this.goForward();
            }
        });
    }

    async loadTabs() {
        try {
            const tabs = await BrowserAPI.getAllTabs();
            const activeTabId = await BrowserAPI.getActiveTabId();
            
            this.activeTabId = activeTabId;
            
            // Clear existing tabs
            this.tabs.clear();
            const tabsContainer = document.getElementById('tabs-container');
            tabsContainer.innerHTML = '';
            
            // Add tabs to UI
            tabs.forEach(tab => {
                this.tabs.set(tab.id, tab);
                this.addTabToUI(tab);
            });
            
            // Update navigation state
            this.updateNavigationState();
            
        } catch (error) {
            console.error('Failed to load tabs:', error);
            this.showToast('Error', 'Failed to load tabs', 'error');
        }
    }

    addTabToUI(tab) {
        const tabsContainer = document.getElementById('tabs-container');
        
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${tab.is_active ? 'active' : ''}`;
        tabElement.setAttribute('data-tab-id', tab.id);
        
        tabElement.innerHTML = `
            <div class="tab-favicon">🌐</div>
            <div class="tab-title">${this.escapeHtml(tab.title)}</div>
            <button class="tab-close" title="Close tab">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
            ${tab.is_loading ? '<div class="tab-loading-indicator"></div>' : ''}
        `;
        
        // Tab click handler
        tabElement.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.setActiveTab(tab.id);
            }
        });
        
        // Close button handler
        const closeBtn = tabElement.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tab.id);
        });
        
        tabsContainer.appendChild(tabElement);
    }

    async createNewTab(url = null) {
        try {
            const tabId = await BrowserAPI.createNewTab(url);
            await this.loadTabs(); // Refresh tabs
            
            // Hide welcome screen if visible
            this.hideWelcomeScreen();
            
            this.showToast('Success', 'New tab created', 'success');
        } catch (error) {
            console.error('Failed to create new tab:', error);
            this.showToast('Error', 'Failed to create new tab', 'error');
        }
    }

    async closeTab(tabId) {
        try {
            await BrowserAPI.closeTab(tabId);
            await this.loadTabs(); // Refresh tabs
            
            // Show welcome screen if no tabs
            if (this.tabs.size === 0) {
                this.showWelcomeScreen();
            }
            
        } catch (error) {
            console.error('Failed to close tab:', error);
            this.showToast('Error', 'Failed to close tab', 'error');
        }
    }

    async closeCurrentTab() {
        if (this.activeTabId) {
            await this.closeTab(this.activeTabId);
        }
    }

    async setActiveTab(tabId) {
        try {
            await BrowserAPI.setActiveTab(tabId);
            this.activeTabId = tabId;
            
            // Update UI
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            const activeTab = document.querySelector(`[data-tab-id="${tabId}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }
            
            // Update address bar
            const tab = this.tabs.get(tabId);
            if (tab) {
                document.getElementById('address-input').value = tab.url;
            }
            
            // Update navigation state
            this.updateNavigationState();
            
            // Hide welcome screen
            this.hideWelcomeScreen();
            
        } catch (error) {
            console.error('Failed to set active tab:', error);
            this.showToast('Error', 'Failed to switch tab', 'error');
        }
    }

    async navigate(input) {
        if (!input.trim()) return;
        
        try {
            let url;
            
            if (BrowserAPI.isValidUrl(input)) {
                url = BrowserAPI.formatUrl(input);
            } else {
                // Treat as search query
                url = BrowserAPI.createSearchUrl(input);
            }
            
            // Create new tab if no active tab
            if (!this.activeTabId) {
                await this.createNewTab(url);
            } else {
                await BrowserAPI.navigateTo(url, this.activeTabId);
                
                // Update address bar
                document.getElementById('address-input').value = url;
                
                // Show loading state
                this.showLoadingIndicator();
                
                // Hide loading after delay (simulate page load)
                setTimeout(() => {
                    this.hideLoadingIndicator();
                }, 2000);
            }
            
            // Hide welcome screen
            this.hideWelcomeScreen();
            
        } catch (error) {
            console.error('Navigation failed:', error);
            this.showToast('Error', 'Navigation failed', 'error');
        }
    }

    async goBack() {
        try {
            const success = await BrowserAPI.goBack(this.activeTabId);
            this.updateNavigationState();
        } catch (error) {
            console.error('Go back failed:', error);
        }
    }

    async goForward() {
        try {
            const success = await BrowserAPI.goForward(this.activeTabId);
            this.updateNavigationState();
        } catch (error) {
            console.error('Go forward failed:', error);
        }
    }

    async reloadTab() {
        try {
            await BrowserAPI.reloadTab(this.activeTabId);
            this.showLoadingIndicator();
            
            setTimeout(() => {
                this.hideLoadingIndicator();
            }, 1500);
            
        } catch (error) {
            console.error('Reload failed:', error);
            this.showToast('Error', 'Failed to reload page', 'error');
        }
    }

    updateNavigationState() {
        const backBtn = document.getElementById('back-btn');
        const forwardBtn = document.getElementById('forward-btn');
        
        // For now, always enable navigation buttons
        // TODO: Implement actual history checking
        backBtn.disabled = false;
        forwardBtn.disabled = false;
    }

    showWelcomeScreen() {
        document.getElementById('welcome-screen').style.display = 'flex';
    }

    hideWelcomeScreen() {
        document.getElementById('welcome-screen').style.display = 'none';
    }

    showLoadingIndicator() {
        document.getElementById('loading-indicator').classList.add('active');
    }

    hideLoadingIndicator() {
        document.getElementById('loading-indicator').classList.remove('active');
    }

    toggleMenu() {
        // TODO: Implement menu functionality
        console.log('Menu clicked');
    }

    showToast(title, message, type = 'info') {
        // Create toast container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${this.getToastIcon(type)}
            </div>
            <div class="toast-content">
                <div class="toast-title">${this.escapeHtml(title)}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;
        
        // Add close handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        // Add to container and show
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vishwakarmaExpress = new VishwakarmaExpress();
});
