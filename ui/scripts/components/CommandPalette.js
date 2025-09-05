// Command Palette for Quick Actions
export class CommandPalette {
    constructor() {
        this.isVisible = false;
        this.commands = new Map();
        this.history = [];
        this.maxHistory = 10;
        this.searchQuery = '';
        
        this.init();
    }

    async init() {
        console.log('Initializing Command Palette...');
        
        this.createPalette();
        this.registerCommands();
        this.bindEvents();
        
        console.log('Command Palette ready');
    }

    createPalette() {
        const palette = document.createElement('div');
        palette.id = 'command-palette';
        palette.className = 'command-palette';
        
        palette.innerHTML = `
            <div class="command-palette-backdrop"></div>
            <div class="command-palette-container">
                <div class="command-search">
                    <div class="search-icon">⌘</div>
                    <input type="text" id="command-input" placeholder="Type a command or search..." autocomplete="off">
                    <div class="search-shortcut">Ctrl+Shift+P</div>
                </div>
                <div class="command-results" id="command-results">
                    <div class="command-category">
                        <div class="category-title">Recent</div>
                        <div class="category-items" id="recent-commands"></div>
                    </div>
                    <div class="command-category">
                        <div class="category-title">Navigation</div>
                        <div class="category-items" id="navigation-commands"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(palette);
        this.paletteElement = palette;
        this.inputElement = document.getElementById('command-input');
        this.resultsElement = document.getElementById('command-results');
    }

    registerCommands() {
        // Navigation commands
        this.addCommand('new-tab', 'New Tab', 'Create a new tab', '📑', 'navigation', () => {
            window.app?.tabManager?.createTab();
        }, 'Ctrl+T');

        this.addCommand('close-tab', 'Close Tab', 'Close current tab', '✕', 'navigation', () => {
            window.app?.tabManager?.closeCurrentTab();
        }, 'Ctrl+W');

        this.addCommand('reload', 'Reload Page', 'Reload current page', '↻', 'navigation', () => {
            window.location.reload();
        }, 'Ctrl+R');

        // Developer tools
        this.addCommand('dev-tools', 'Developer Tools', 'Open developer tools', '🛠️', 'tools', () => {
            window.app?.nextGenDevTools?.showUI();
        }, 'F12');

        this.addCommand('console', 'Console', 'Open JavaScript console', '⚡', 'tools', () => {
            window.app?.nextGenDevTools?.switchTab('console');
        }, 'Ctrl+Shift+J');

        // AI commands
        this.addCommand('ai-assistant', 'AI Assistant', 'Open AI assistant', '🤖', 'ai', () => {
            window.app?.multiModelAI?.showUI();
        }, 'Ctrl+Shift+AI');

        // Settings
        this.addCommand('settings', 'Settings', 'Open browser settings', '⚙️', 'settings', () => {
            window.app?.settingsManager?.showUI();
        }, 'Ctrl+,');

        // Bookmarks
        this.addCommand('bookmarks', 'Bookmarks', 'Show bookmarks sidebar', '🔖', 'navigation', () => {
            window.app?.sidebarNavigation?.showPanel('bookmarks');
        }, 'Ctrl+Shift+B');

        // Performance
        this.addCommand('performance', 'Performance Monitor', 'Show performance metrics', '📊', 'tools', () => {
            window.app?.quantumPerformance?.showUI();
        }, 'Ctrl+Shift+M');
    }

    addCommand(id, name, description, icon, category, action, shortcut = '') {
        this.commands.set(id, {
            id,
            name,
            description,
            icon,
            category,
            action,
            shortcut,
            keywords: [name.toLowerCase(), description.toLowerCase(), category.toLowerCase()]
        });
    }

    bindEvents() {
        // Show/hide palette
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Search input
        this.inputElement.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.updateResults();
        });

        // Keyboard navigation
        this.inputElement.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });

        // Click outside to close
        this.paletteElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('command-palette-backdrop')) {
                this.hide();
            }
        });
    }

    show() {
        this.isVisible = true;
        this.paletteElement.classList.add('show');
        this.inputElement.focus();
        this.inputElement.value = '';
        this.searchQuery = '';
        this.updateResults();
    }

    hide() {
        this.isVisible = false;
        this.paletteElement.classList.remove('show');
        this.inputElement.blur();
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    updateResults() {
        const filteredCommands = this.filterCommands(this.searchQuery);
        this.renderResults(filteredCommands);
    }

    filterCommands(query) {
        if (!query.trim()) {
            return Array.from(this.commands.values());
        }

        const lowerQuery = query.toLowerCase();
        return Array.from(this.commands.values()).filter(command => 
            command.keywords.some(keyword => keyword.includes(lowerQuery))
        ).sort((a, b) => {
            // Prioritize exact matches
            const aExact = a.name.toLowerCase().includes(lowerQuery);
            const bExact = b.name.toLowerCase().includes(lowerQuery);
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return 0;
        });
    }

    renderResults(commands) {
        // Group commands by category
        const grouped = commands.reduce((acc, command) => {
            if (!acc[command.category]) {
                acc[command.category] = [];
            }
            acc[command.category].push(command);
            return acc;
        }, {});

        let html = '';
        
        // Show recent commands first if no search query
        if (!this.searchQuery && this.history.length > 0) {
            html += `
                <div class="command-category">
                    <div class="category-title">Recent</div>
                    <div class="category-items">
                        ${this.history.map(commandId => {
                            const command = this.commands.get(commandId);
                            return command ? this.renderCommand(command) : '';
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // Render other categories
        Object.entries(grouped).forEach(([category, categoryCommands]) => {
            if (categoryCommands.length > 0) {
                html += `
                    <div class="command-category">
                        <div class="category-title">${this.formatCategoryName(category)}</div>
                        <div class="category-items">
                            ${categoryCommands.map(command => this.renderCommand(command)).join('')}
                        </div>
                    </div>
                `;
            }
        });

        this.resultsElement.innerHTML = html || '<div class="no-results">No commands found</div>';
        
        // Select first result
        const firstCommand = this.resultsElement.querySelector('.command-item');
        if (firstCommand) {
            firstCommand.classList.add('selected');
        }
    }

    renderCommand(command) {
        return `
            <div class="command-item" data-command-id="${command.id}">
                <div class="command-icon">${command.icon}</div>
                <div class="command-info">
                    <div class="command-name">${command.name}</div>
                    <div class="command-description">${command.description}</div>
                </div>
                ${command.shortcut ? `<div class="command-shortcut">${command.shortcut}</div>` : ''}
            </div>
        `;
    }

    formatCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    handleKeyNavigation(e) {
        const items = this.resultsElement.querySelectorAll('.command-item');
        const selected = this.resultsElement.querySelector('.command-item.selected');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = selected?.nextElementSibling || items[0];
            this.selectItem(next);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = selected?.previousElementSibling || items[items.length - 1];
            this.selectItem(prev);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selected) {
                this.executeCommand(selected.dataset.commandId);
            }
        }
    }

    selectItem(item) {
        if (!item) return;
        
        this.resultsElement.querySelectorAll('.command-item').forEach(el => {
            el.classList.remove('selected');
        });
        
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
    }

    executeCommand(commandId) {
        const command = this.commands.get(commandId);
        if (!command) return;

        // Add to history
        this.addToHistory(commandId);
        
        // Execute command
        try {
            command.action();
        } catch (error) {
            console.error('Command execution failed:', error);
        }
        
        // Hide palette
        this.hide();
    }

    addToHistory(commandId) {
        // Remove if already exists
        this.history = this.history.filter(id => id !== commandId);
        
        // Add to beginning
        this.history.unshift(commandId);
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }
    }

    // Public API
    registerCommand(id, name, description, icon, category, action, shortcut) {
        this.addCommand(id, name, description, icon, category, action, shortcut);
    }

    removeCommand(id) {
        this.commands.delete(id);
    }
}
