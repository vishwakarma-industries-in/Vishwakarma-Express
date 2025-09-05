// Unlimited UI Customization System - Phase 5 Revolutionary Component
export class UICustomization {
    constructor() {
        this.themes = new Map();
        this.layouts = new Map();
        this.customizations = new Map();
        this.activeTheme = 'default';
        this.activeLayout = 'default';
        
        this.init();
    }

    async init() {
        console.log('Initializing Unlimited UI Customization System...');
        
        this.loadDefaultThemes();
        this.loadDefaultLayouts();
        this.createCustomizationUI();
        this.loadUserCustomizations();
        
        console.log('UI Customization System ready - Unlimited personalization enabled');
    }

    loadDefaultThemes() {
        // Default themes
        this.themes.set('default', {
            name: 'Vishwakarma Default',
            colors: {
                primary: '#1a1a1a',
                secondary: '#2a2a2a',
                tertiary: '#3a3a3a',
                accent: '#4f46e5',
                text: '#ffffff',
                textSecondary: '#a0a0a0',
                border: '#404040'
            },
            fonts: {
                primary: 'Inter, sans-serif',
                mono: 'JetBrains Mono, monospace'
            }
        });

        this.themes.set('dark-pro', {
            name: 'Dark Pro',
            colors: {
                primary: '#0d1117',
                secondary: '#161b22',
                tertiary: '#21262d',
                accent: '#58a6ff',
                text: '#f0f6fc',
                textSecondary: '#8b949e',
                border: '#30363d'
            },
            fonts: {
                primary: 'SF Pro Display, sans-serif',
                mono: 'SF Mono, monospace'
            }
        });

        this.themes.set('light-minimal', {
            name: 'Light Minimal',
            colors: {
                primary: '#ffffff',
                secondary: '#f8f9fa',
                tertiary: '#e9ecef',
                accent: '#0066cc',
                text: '#212529',
                textSecondary: '#6c757d',
                border: '#dee2e6'
            },
            fonts: {
                primary: 'system-ui, sans-serif',
                mono: 'Consolas, monospace'
            }
        });
    }

    loadDefaultLayouts() {
        this.layouts.set('default', {
            name: 'Standard Layout',
            config: {
                tabsPosition: 'top',
                sidebarPosition: 'left',
                toolbarVisible: true,
                statusBarVisible: true,
                compactMode: false
            }
        });

        this.layouts.set('compact', {
            name: 'Compact Layout',
            config: {
                tabsPosition: 'top',
                sidebarPosition: 'hidden',
                toolbarVisible: true,
                statusBarVisible: false,
                compactMode: true
            }
        });

        this.layouts.set('developer', {
            name: 'Developer Layout',
            config: {
                tabsPosition: 'top',
                sidebarPosition: 'left',
                toolbarVisible: true,
                statusBarVisible: true,
                compactMode: false,
                devToolsVisible: true
            }
        });
    }

    createCustomizationUI() {
        const ui = document.createElement('div');
        ui.id = 'ui-customization-panel';
        ui.className = 'ui-customization-panel';
        
        ui.innerHTML = `
            <div class="customization-header">
                <h3>🎨 UI Customization</h3>
                <div class="customization-controls">
                    <button id="reset-customization">Reset</button>
                    <button id="export-theme">Export</button>
                    <button id="import-theme">Import</button>
                    <button class="customization-close">×</button>
                </div>
            </div>
            
            <div class="customization-content">
                <div class="customization-tabs">
                    <button class="custom-tab active" data-tab="themes">Themes</button>
                    <button class="custom-tab" data-tab="layouts">Layouts</button>
                    <button class="custom-tab" data-tab="colors">Colors</button>
                    <button class="custom-tab" data-tab="fonts">Fonts</button>
                    <button class="custom-tab" data-tab="advanced">Advanced</button>
                </div>
                
                <div class="customization-panels">
                    <div class="custom-panel active" id="themes-panel">
                        <h4>Theme Selection</h4>
                        <div class="theme-grid" id="theme-grid"></div>
                        
                        <h4>Create Custom Theme</h4>
                        <div class="theme-creator">
                            <input type="text" id="theme-name" placeholder="Theme Name">
                            <button id="create-theme">Create Theme</button>
                        </div>
                    </div>
                    
                    <div class="custom-panel" id="layouts-panel">
                        <h4>Layout Presets</h4>
                        <div class="layout-options" id="layout-options"></div>
                        
                        <h4>Custom Layout</h4>
                        <div class="layout-settings">
                            <div class="setting-group">
                                <label>Tabs Position:</label>
                                <select id="tabs-position">
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                            <div class="setting-group">
                                <label>Sidebar Position:</label>
                                <select id="sidebar-position">
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                    <option value="hidden">Hidden</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="custom-panel" id="colors-panel">
                        <h4>Color Customization</h4>
                        <div class="color-controls">
                            <div class="color-group">
                                <label>Primary Background:</label>
                                <input type="color" id="color-primary" value="#1a1a1a">
                            </div>
                            <div class="color-group">
                                <label>Secondary Background:</label>
                                <input type="color" id="color-secondary" value="#2a2a2a">
                            </div>
                            <div class="color-group">
                                <label>Accent Color:</label>
                                <input type="color" id="color-accent" value="#4f46e5">
                            </div>
                            <div class="color-group">
                                <label>Text Color:</label>
                                <input type="color" id="color-text" value="#ffffff">
                            </div>
                        </div>
                    </div>
                    
                    <div class="custom-panel" id="fonts-panel">
                        <h4>Font Settings</h4>
                        <div class="font-controls">
                            <div class="font-group">
                                <label>Primary Font:</label>
                                <select id="primary-font">
                                    <option value="Inter, sans-serif">Inter</option>
                                    <option value="Roboto, sans-serif">Roboto</option>
                                    <option value="system-ui, sans-serif">System UI</option>
                                </select>
                            </div>
                            <div class="font-group">
                                <label>Font Size:</label>
                                <input type="range" id="font-size" min="12" max="20" value="14">
                                <span id="font-size-value">14px</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="custom-panel" id="advanced-panel">
                        <h4>Advanced Customization</h4>
                        <div class="advanced-controls">
                            <div class="control-group">
                                <label>
                                    <input type="checkbox" id="animations-enabled" checked>
                                    Enable Animations
                                </label>
                            </div>
                            <div class="control-group">
                                <label>
                                    <input type="checkbox" id="blur-effects" checked>
                                    Blur Effects
                                </label>
                            </div>
                            <div class="control-group">
                                <label>Border Radius:</label>
                                <input type="range" id="border-radius" min="0" max="20" value="6">
                                <span id="border-radius-value">6px</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(ui);
        this.uiElement = ui;
        this.setupUIEvents();
        this.populateThemes();
        this.populateLayouts();
    }

    setupUIEvents() {
        // Tab switching
        document.querySelectorAll('.custom-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Theme creation
        document.getElementById('create-theme').addEventListener('click', () => {
            this.createCustomTheme();
        });

        // Color controls
        document.querySelectorAll('[id^="color-"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateColors();
            });
        });

        // Font controls
        document.getElementById('primary-font').addEventListener('change', () => {
            this.updateFonts();
        });

        document.getElementById('font-size').addEventListener('input', (e) => {
            document.getElementById('font-size-value').textContent = `${e.target.value}px`;
            this.updateFonts();
        });

        // Advanced controls
        document.getElementById('border-radius').addEventListener('input', (e) => {
            document.getElementById('border-radius-value').textContent = `${e.target.value}px`;
            this.updateAdvanced();
        });

        // Close button
        document.querySelector('.customization-close').addEventListener('click', () => {
            this.hideUI();
        });
    }

    populateThemes() {
        const grid = document.getElementById('theme-grid');
        grid.innerHTML = '';

        for (const [id, theme] of this.themes) {
            const themeCard = document.createElement('div');
            themeCard.className = 'theme-card';
            themeCard.innerHTML = `
                <div class="theme-preview" style="background: ${theme.colors.primary}; border: 2px solid ${theme.colors.border};">
                    <div class="theme-colors">
                        <span style="background: ${theme.colors.accent};"></span>
                        <span style="background: ${theme.colors.secondary};"></span>
                        <span style="background: ${theme.colors.tertiary};"></span>
                    </div>
                </div>
                <h5>${theme.name}</h5>
                <button onclick="window.app.uiCustomization.applyTheme('${id}')">Apply</button>
            `;
            grid.appendChild(themeCard);
        }
    }

    populateLayouts() {
        const options = document.getElementById('layout-options');
        options.innerHTML = '';

        for (const [id, layout] of this.layouts) {
            const layoutCard = document.createElement('div');
            layoutCard.className = 'layout-card';
            layoutCard.innerHTML = `
                <h5>${layout.name}</h5>
                <button onclick="window.app.uiCustomization.applyLayout('${id}')">Apply</button>
            `;
            options.appendChild(layoutCard);
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.custom-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.custom-panel').forEach(panel => panel.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-panel`).classList.add('active');
    }

    applyTheme(themeId) {
        const theme = this.themes.get(themeId);
        if (!theme) return;

        this.activeTheme = themeId;
        
        // Apply CSS variables
        const root = document.documentElement;
        root.style.setProperty('--bg-primary', theme.colors.primary);
        root.style.setProperty('--bg-secondary', theme.colors.secondary);
        root.style.setProperty('--bg-tertiary', theme.colors.tertiary);
        root.style.setProperty('--accent-color', theme.colors.accent);
        root.style.setProperty('--text-primary', theme.colors.text);
        root.style.setProperty('--text-secondary', theme.colors.textSecondary);
        root.style.setProperty('--border-color', theme.colors.border);
        root.style.setProperty('--font-primary', theme.fonts.primary);
        root.style.setProperty('--font-mono', theme.fonts.mono);

        this.saveCustomizations();
        console.log(`Applied theme: ${theme.name}`);
    }

    applyLayout(layoutId) {
        const layout = this.layouts.get(layoutId);
        if (!layout) return;

        this.activeLayout = layoutId;
        
        // Apply layout changes
        const config = layout.config;
        
        if (config.compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }

        this.saveCustomizations();
        console.log(`Applied layout: ${layout.name}`);
    }

    createCustomTheme() {
        const name = document.getElementById('theme-name').value;
        if (!name) return;

        const customTheme = {
            name: name,
            colors: {
                primary: document.getElementById('color-primary').value,
                secondary: document.getElementById('color-secondary').value,
                tertiary: document.getElementById('color-secondary').value,
                accent: document.getElementById('color-accent').value,
                text: document.getElementById('color-text').value,
                textSecondary: '#a0a0a0',
                border: '#404040'
            },
            fonts: {
                primary: document.getElementById('primary-font').value,
                mono: 'JetBrains Mono, monospace'
            }
        };

        const themeId = `custom-${Date.now()}`;
        this.themes.set(themeId, customTheme);
        this.populateThemes();
        this.applyTheme(themeId);
    }

    updateColors() {
        const colors = {
            primary: document.getElementById('color-primary').value,
            secondary: document.getElementById('color-secondary').value,
            accent: document.getElementById('color-accent').value,
            text: document.getElementById('color-text').value
        };

        const root = document.documentElement;
        root.style.setProperty('--bg-primary', colors.primary);
        root.style.setProperty('--bg-secondary', colors.secondary);
        root.style.setProperty('--accent-color', colors.accent);
        root.style.setProperty('--text-primary', colors.text);
    }

    updateFonts() {
        const primaryFont = document.getElementById('primary-font').value;
        const fontSize = document.getElementById('font-size').value;

        const root = document.documentElement;
        root.style.setProperty('--font-primary', primaryFont);
        root.style.setProperty('--font-size-base', `${fontSize}px`);
    }

    updateAdvanced() {
        const borderRadius = document.getElementById('border-radius').value;
        const animationsEnabled = document.getElementById('animations-enabled').checked;
        const blurEffects = document.getElementById('blur-effects').checked;

        const root = document.documentElement;
        root.style.setProperty('--border-radius', `${borderRadius}px`);
        
        if (!animationsEnabled) {
            root.style.setProperty('--transition-duration', '0s');
        } else {
            root.style.setProperty('--transition-duration', '0.2s');
        }

        if (!blurEffects) {
            root.style.setProperty('--backdrop-filter', 'none');
        } else {
            root.style.setProperty('--backdrop-filter', 'blur(10px)');
        }
    }

    saveCustomizations() {
        const customizations = {
            activeTheme: this.activeTheme,
            activeLayout: this.activeLayout,
            customThemes: Array.from(this.themes.entries()),
            customLayouts: Array.from(this.layouts.entries())
        };

        localStorage.setItem('vishwakarma_customizations', JSON.stringify(customizations));
    }

    loadUserCustomizations() {
        const saved = localStorage.getItem('vishwakarma_customizations');
        if (saved) {
            try {
                const customizations = JSON.parse(saved);
                
                if (customizations.activeTheme) {
                    this.applyTheme(customizations.activeTheme);
                }
                
                if (customizations.activeLayout) {
                    this.applyLayout(customizations.activeLayout);
                }
                
                if (customizations.customThemes) {
                    this.themes = new Map(customizations.customThemes);
                }
                
                if (customizations.customLayouts) {
                    this.layouts = new Map(customizations.customLayouts);
                }
            } catch (error) {
                console.error('Failed to load customizations:', error);
            }
        }
    }

    showUI() {
        this.uiElement.classList.add('show');
    }

    hideUI() {
        this.uiElement.classList.remove('show');
    }

    exportTheme() {
        const theme = this.themes.get(this.activeTheme);
        if (theme) {
            const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    importTheme(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const theme = JSON.parse(e.target.result);
                const themeId = `imported-${Date.now()}`;
                this.themes.set(themeId, theme);
                this.populateThemes();
                this.applyTheme(themeId);
            } catch (error) {
                console.error('Failed to import theme:', error);
            }
        };
        reader.readAsText(file);
    }
}
