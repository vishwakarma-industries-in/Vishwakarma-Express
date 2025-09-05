// Modern Context Menu System
export class ContextMenuSystem {
    constructor() {
        this.activeMenu = null;
        this.menuTemplates = new Map();
        this.customMenus = new Map();
        
        this.init();
    }

    async init() {
        console.log('Initializing Context Menu System...');
        
        this.createMenuStyles();
        this.setupMenuTemplates();
        this.bindGlobalEvents();
        
        console.log('Context Menu System ready');
    }

    createMenuStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .context-menu {
                position: fixed;
                background: var(--surface);
                border: 1px solid var(--neutral-700);
                border-radius: var(--radius-lg);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: var(--space-2);
                min-width: 200px;
                z-index: 10000;
                opacity: 0;
                transform: scale(0.95);
                transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
            }

            .context-menu.show {
                opacity: 1;
                transform: scale(1);
            }

            .context-menu-item {
                display: flex;
                align-items: center;
                padding: var(--space-2) var(--space-3);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all 0.1s ease;
                font-size: var(--font-size-sm);
                color: var(--text-primary);
                gap: var(--space-3);
            }

            .context-menu-item:hover:not(.disabled) {
                background: var(--neutral-800);
                color: var(--text-primary);
            }

            .context-menu-item.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .context-menu-item.danger:hover {
                background: var(--error);
                color: white;
            }

            .context-menu-icon {
                width: 16px;
                height: 16px;
                flex-shrink: 0;
            }

            .context-menu-label {
                flex: 1;
            }

            .context-menu-shortcut {
                font-size: var(--font-size-xs);
                color: var(--text-tertiary);
                font-family: 'Fira Code', monospace;
            }

            .context-menu-separator {
                height: 1px;
                background: var(--neutral-700);
                margin: var(--space-2) 0;
            }

            .context-menu-submenu {
                position: relative;
            }

            .context-menu-submenu::after {
                content: '▶';
                font-size: 10px;
                color: var(--text-tertiary);
                margin-left: auto;
            }

            .context-submenu {
                position: absolute;
                left: 100%;
                top: 0;
                margin-left: var(--space-1);
            }

            /* Tooltip styles */
            .tooltip {
                position: fixed;
                background: var(--neutral-900);
                color: var(--text-primary);
                padding: var(--space-2) var(--space-3);
                border-radius: var(--radius-md);
                font-size: var(--font-size-xs);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 10001;
                opacity: 0;
                transform: translateY(4px);
                transition: all 0.2s ease;
                pointer-events: none;
                white-space: nowrap;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }

            .tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }

            .tooltip::before {
                content: '';
                position: absolute;
                top: -4px;
                left: 50%;
                transform: translateX(-50%);
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-bottom: 4px solid var(--neutral-900);
            }
        `;
        
        document.head.appendChild(style);
    }

    setupMenuTemplates() {
        // Page context menu
        this.menuTemplates.set('page', [
            {
                label: 'Back',
                icon: '←',
                shortcut: 'Alt+←',
                action: () => window.history.back(),
                enabled: () => window.history.length > 1
            },
            {
                label: 'Forward',
                icon: '→',
                shortcut: 'Alt+→',
                action: () => window.history.forward(),
                enabled: () => window.history.length > 1
            },
            {
                label: 'Reload',
                icon: '↻',
                shortcut: 'Ctrl+R',
                action: () => window.location.reload()
            },
            { type: 'separator' },
            {
                label: 'Save as...',
                icon: '💾',
                shortcut: 'Ctrl+S',
                action: () => this.savePageAs()
            },
            {
                label: 'Print...',
                icon: '🖨️',
                shortcut: 'Ctrl+P',
                action: () => window.print()
            },
            { type: 'separator' },
            {
                label: 'View page source',
                icon: '📄',
                shortcut: 'Ctrl+U',
                action: () => this.viewPageSource()
            },
            {
                label: 'Inspect element',
                icon: '🔍',
                shortcut: 'F12',
                action: () => this.inspectElement()
            }
        ]);

        // Link context menu
        this.menuTemplates.set('link', [
            {
                label: 'Open link',
                icon: '🔗',
                action: (data) => window.open(data.href, '_self')
            },
            {
                label: 'Open link in new tab',
                icon: '📑',
                shortcut: 'Ctrl+Click',
                action: (data) => window.open(data.href, '_blank')
            },
            {
                label: 'Open link in new window',
                icon: '🪟',
                action: (data) => window.open(data.href, '_blank', 'width=800,height=600')
            },
            { type: 'separator' },
            {
                label: 'Copy link address',
                icon: '📋',
                action: (data) => navigator.clipboard.writeText(data.href)
            },
            {
                label: 'Save link as...',
                icon: '💾',
                action: (data) => this.downloadLink(data.href)
            }
        ]);

        // Image context menu
        this.menuTemplates.set('image', [
            {
                label: 'Open image in new tab',
                icon: '🖼️',
                action: (data) => window.open(data.src, '_blank')
            },
            {
                label: 'Save image as...',
                icon: '💾',
                action: (data) => this.downloadImage(data.src)
            },
            {
                label: 'Copy image',
                icon: '📋',
                action: (data) => this.copyImage(data.src)
            },
            {
                label: 'Copy image address',
                icon: '🔗',
                action: (data) => navigator.clipboard.writeText(data.src)
            },
            { type: 'separator' },
            {
                label: 'Inspect element',
                icon: '🔍',
                action: () => this.inspectElement()
            }
        ]);

        // Text selection context menu
        this.menuTemplates.set('selection', [
            {
                label: 'Copy',
                icon: '📋',
                shortcut: 'Ctrl+C',
                action: () => document.execCommand('copy')
            },
            {
                label: 'Search with Google',
                icon: '🔍',
                action: (data) => window.open(`https://google.com/search?q=${encodeURIComponent(data.text)}`, '_blank')
            },
            {
                label: 'Translate',
                icon: '🌐',
                action: (data) => this.translateText(data.text)
            },
            { type: 'separator' },
            {
                label: 'Ask AI',
                icon: '🤖',
                action: (data) => this.askAI(data.text)
            }
        ]);

        // Tab context menu
        this.menuTemplates.set('tab', [
            {
                label: 'New tab',
                icon: '➕',
                shortcut: 'Ctrl+T',
                action: () => this.createNewTab()
            },
            {
                label: 'Duplicate tab',
                icon: '📑',
                action: (data) => this.duplicateTab(data.tabId)
            },
            { type: 'separator' },
            {
                label: 'Pin tab',
                icon: '📌',
                action: (data) => this.pinTab(data.tabId),
                enabled: (data) => !data.pinned
            },
            {
                label: 'Unpin tab',
                icon: '📌',
                action: (data) => this.unpinTab(data.tabId),
                enabled: (data) => data.pinned
            },
            {
                label: 'Mute tab',
                icon: '🔇',
                action: (data) => this.muteTab(data.tabId),
                enabled: (data) => !data.muted
            },
            {
                label: 'Unmute tab',
                icon: '🔊',
                action: (data) => this.unmuteTab(data.tabId),
                enabled: (data) => data.muted
            },
            { type: 'separator' },
            {
                label: 'Close tab',
                icon: '✕',
                shortcut: 'Ctrl+W',
                action: (data) => this.closeTab(data.tabId)
            },
            {
                label: 'Close other tabs',
                icon: '✕',
                action: (data) => this.closeOtherTabs(data.tabId)
            },
            {
                label: 'Close tabs to the right',
                icon: '✕',
                action: (data) => this.closeTabsToRight(data.tabId)
            }
        ]);
    }

    bindGlobalEvents() {
        // Hide menu on click outside
        document.addEventListener('click', (e) => {
            if (this.activeMenu && !this.activeMenu.contains(e.target)) {
                this.hideMenu();
            }
        });

        // Hide menu on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeMenu) {
                this.hideMenu();
            }
        });

        // Prevent default context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleContextMenu(e);
        });

        // Setup tooltips
        this.setupTooltips();
    }

    handleContextMenu(e) {
        const target = e.target;
        let menuType = 'page';
        let menuData = {};

        // Determine context menu type
        if (target.tagName === 'A') {
            menuType = 'link';
            menuData = { href: target.href };
        } else if (target.tagName === 'IMG') {
            menuType = 'image';
            menuData = { src: target.src, alt: target.alt };
        } else if (window.getSelection().toString().trim()) {
            menuType = 'selection';
            menuData = { text: window.getSelection().toString().trim() };
        } else if (target.closest('.tab')) {
            menuType = 'tab';
            const tab = target.closest('.tab');
            menuData = {
                tabId: tab.dataset.tabId,
                pinned: tab.classList.contains('pinned'),
                muted: tab.classList.contains('muted')
            };
        }

        this.showMenu(menuType, e.clientX, e.clientY, menuData);
    }

    showMenu(templateName, x, y, data = {}) {
        this.hideMenu();

        const template = this.menuTemplates.get(templateName);
        if (!template) return;

        const menu = this.createMenuElement(template, data);
        document.body.appendChild(menu);

        // Position menu
        this.positionMenu(menu, x, y);

        // Show with animation
        requestAnimationFrame(() => {
            menu.classList.add('show');
        });

        this.activeMenu = menu;
    }

    createMenuElement(template, data) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';

        template.forEach(item => {
            if (item.type === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'context-menu-separator';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                
                if (item.danger) {
                    menuItem.classList.add('danger');
                }

                // Check if item should be enabled
                const isEnabled = !item.enabled || item.enabled(data);
                if (!isEnabled) {
                    menuItem.classList.add('disabled');
                }

                menuItem.innerHTML = `
                    <div class="context-menu-icon">${item.icon || ''}</div>
                    <div class="context-menu-label">${item.label}</div>
                    ${item.shortcut ? `<div class="context-menu-shortcut">${item.shortcut}</div>` : ''}
                `;

                if (isEnabled) {
                    menuItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        item.action(data);
                        this.hideMenu();
                    });
                }

                menu.appendChild(menuItem);
            }
        });

        return menu;
    }

    positionMenu(menu, x, y) {
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust position to keep menu in viewport
        let adjustedX = x;
        let adjustedY = y;

        if (x + rect.width > viewportWidth) {
            adjustedX = viewportWidth - rect.width - 10;
        }

        if (y + rect.height > viewportHeight) {
            adjustedY = viewportHeight - rect.height - 10;
        }

        menu.style.left = `${Math.max(10, adjustedX)}px`;
        menu.style.top = `${Math.max(10, adjustedY)}px`;
    }

    hideMenu() {
        if (this.activeMenu) {
            this.activeMenu.classList.remove('show');
            setTimeout(() => {
                if (this.activeMenu && this.activeMenu.parentNode) {
                    this.activeMenu.parentNode.removeChild(this.activeMenu);
                }
                this.activeMenu = null;
            }, 150);
        }
    }

    setupTooltips() {
        // Add tooltip support for elements with title attribute
        document.addEventListener('mouseenter', (e) => {
            if (e.target.hasAttribute('title') || e.target.hasAttribute('data-tooltip')) {
                this.showTooltip(e.target);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.hasAttribute('title') || e.target.hasAttribute('data-tooltip')) {
                this.hideTooltip();
            }
        }, true);
    }

    showTooltip(element) {
        const text = element.getAttribute('data-tooltip') || element.getAttribute('title');
        if (!text) return;

        // Temporarily remove title to prevent default tooltip
        if (element.hasAttribute('title')) {
            element.setAttribute('data-original-title', element.getAttribute('title'));
            element.removeAttribute('title');
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let x = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let y = rect.top - tooltipRect.height - 8;

        // Keep tooltip in viewport
        x = Math.max(10, Math.min(x, window.innerWidth - tooltipRect.width - 10));
        if (y < 10) {
            y = rect.bottom + 8;
            tooltip.style.transform = 'rotate(180deg)';
        }

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;

        // Show with animation
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });

        this.activeTooltip = tooltip;
        this.tooltipElement = element;
    }

    hideTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.classList.remove('show');
            setTimeout(() => {
                if (this.activeTooltip && this.activeTooltip.parentNode) {
                    this.activeTooltip.parentNode.removeChild(this.activeTooltip);
                }
                this.activeTooltip = null;
            }, 200);
        }

        // Restore original title
        if (this.tooltipElement && this.tooltipElement.hasAttribute('data-original-title')) {
            this.tooltipElement.setAttribute('title', this.tooltipElement.getAttribute('data-original-title'));
            this.tooltipElement.removeAttribute('data-original-title');
            this.tooltipElement = null;
        }
    }

    // Menu actions
    savePageAs() {
        // Implement save page functionality
        console.log('Save page as...');
    }

    viewPageSource() {
        const source = document.documentElement.outerHTML;
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`<pre>${source.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
    }

    inspectElement() {
        if (window.app?.nextGenDevTools) {
            window.app.nextGenDevTools.showUI();
        }
    }

    downloadLink(href) {
        const a = document.createElement('a');
        a.href = href;
        a.download = '';
        a.click();
    }

    downloadImage(src) {
        const a = document.createElement('a');
        a.href = src;
        a.download = '';
        a.click();
    }

    copyImage(src) {
        // Modern clipboard API for images
        fetch(src)
            .then(response => response.blob())
            .then(blob => {
                const item = new ClipboardItem({ [blob.type]: blob });
                navigator.clipboard.write([item]);
            })
            .catch(err => console.error('Failed to copy image:', err));
    }

    translateText(text) {
        window.open(`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}`, '_blank');
    }

    askAI(text) {
        if (window.app?.multiModelAI) {
            window.app.multiModelAI.query(`Explain this: "${text}"`);
        }
    }

    // Tab actions
    createNewTab() {
        if (window.app?.tabManager) {
            window.app.tabManager.createTab();
        }
    }

    duplicateTab(tabId) {
        if (window.app?.tabManager) {
            window.app.tabManager.duplicateTab(tabId);
        }
    }

    pinTab(tabId) {
        const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tab) {
            tab.classList.add('pinned');
        }
    }

    unpinTab(tabId) {
        const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tab) {
            tab.classList.remove('pinned');
        }
    }

    muteTab(tabId) {
        const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tab) {
            tab.classList.add('muted');
        }
    }

    unmuteTab(tabId) {
        const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tab) {
            tab.classList.remove('muted');
        }
    }

    closeTab(tabId) {
        if (window.app?.tabManager) {
            window.app.tabManager.closeTab(tabId);
        }
    }

    closeOtherTabs(tabId) {
        if (window.app?.tabManager) {
            window.app.tabManager.closeOtherTabs(tabId);
        }
    }

    closeTabsToRight(tabId) {
        if (window.app?.tabManager) {
            window.app.tabManager.closeTabsToRight(tabId);
        }
    }

    // Public API
    registerCustomMenu(name, template) {
        this.menuTemplates.set(name, template);
    }

    showCustomMenu(name, x, y, data = {}) {
        this.showMenu(name, x, y, data);
    }
}
