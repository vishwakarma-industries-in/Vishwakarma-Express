// Modal Dialog System
export class ModalSystem {
    constructor() {
        this.activeModals = new Map();
        this.modalStack = [];
        this.zIndexBase = 15000;
        
        this.init();
    }

    async init() {
        console.log('Initializing Modal System...');
        
        this.bindGlobalEvents();
        
        console.log('Modal System ready');
    }

    bindGlobalEvents() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                const topModal = this.modalStack[this.modalStack.length - 1];
                if (topModal.closable !== false) {
                    this.close(topModal.id);
                }
            }
        });
    }

    show(options = {}) {
        const modalId = this.generateId();
        const modal = this.createModal(modalId, options);
        
        document.body.appendChild(modal.element);
        this.activeModals.set(modalId, modal);
        this.modalStack.push(modal);

        // Set z-index based on stack position
        modal.element.style.zIndex = this.zIndexBase + this.modalStack.length;

        // Show with animation
        requestAnimationFrame(() => {
            modal.element.classList.add('show');
        });

        // Auto-focus first input or button
        this.focusFirstElement(modal.element);

        return modalId;
    }

    createModal(id, options) {
        const {
            title = 'Modal',
            content = '',
            size = 'medium',
            closable = true,
            backdrop = true,
            actions = [],
            onClose = null,
            className = ''
        } = options;

        const modalElement = document.createElement('div');
        modalElement.className = `modal-system ${className}`;
        modalElement.dataset.modalId = id;

        modalElement.innerHTML = `
            ${backdrop ? '<div class="modal-backdrop"></div>' : ''}
            <div class="modal-dialog ${size}">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    ${closable ? `<button class="modal-close-btn" data-action="close">✕</button>` : ''}
                </div>
                <div class="modal-body">
                    ${typeof content === 'string' ? content : ''}
                </div>
                ${actions.length > 0 ? `
                    <div class="modal-footer">
                        ${actions.map(action => `
                            <button class="btn ${action.variant || 'btn-secondary'}" 
                                    data-action="${action.action || 'custom'}"
                                    ${action.disabled ? 'disabled' : ''}>
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        // Add custom content if it's an element
        if (typeof content !== 'string' && content instanceof HTMLElement) {
            const modalBody = modalElement.querySelector('.modal-body');
            modalBody.innerHTML = '';
            modalBody.appendChild(content);
        }

        // Bind events
        this.bindModalEvents(modalElement, id, options);

        return {
            id,
            element: modalElement,
            options,
            closable
        };
    }

    bindModalEvents(modalElement, id, options) {
        // Close on backdrop click
        if (options.backdrop !== false) {
            const backdrop = modalElement.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    if (options.closable !== false) {
                        this.close(id);
                    }
                });
            }
        }

        // Handle action buttons
        modalElement.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (!action) return;

            if (action === 'close') {
                this.close(id);
            } else if (action === 'custom') {
                // Find the action configuration
                const actionConfig = options.actions?.find(a => a.label === e.target.textContent);
                if (actionConfig && actionConfig.handler) {
                    const result = actionConfig.handler();
                    if (result !== false && actionConfig.closeOnClick !== false) {
                        this.close(id);
                    }
                }
            }
        });
    }

    close(modalId) {
        const modal = this.activeModals.get(modalId);
        if (!modal) return;

        // Call onClose callback
        if (modal.options.onClose) {
            const shouldClose = modal.options.onClose();
            if (shouldClose === false) return;
        }

        // Hide with animation
        modal.element.classList.remove('show');

        setTimeout(() => {
            // Remove from DOM
            if (modal.element.parentNode) {
                modal.element.parentNode.removeChild(modal.element);
            }

            // Remove from tracking
            this.activeModals.delete(modalId);
            this.modalStack = this.modalStack.filter(m => m.id !== modalId);
        }, 200);
    }

    closeAll() {
        [...this.activeModals.keys()].forEach(id => this.close(id));
    }

    update(modalId, updates) {
        const modal = this.activeModals.get(modalId);
        if (!modal) return;

        const { title, content } = updates;

        if (title) {
            const titleElement = modal.element.querySelector('.modal-title');
            if (titleElement) titleElement.textContent = title;
        }

        if (content) {
            const bodyElement = modal.element.querySelector('.modal-body');
            if (bodyElement) {
                if (typeof content === 'string') {
                    bodyElement.innerHTML = content;
                } else if (content instanceof HTMLElement) {
                    bodyElement.innerHTML = '';
                    bodyElement.appendChild(content);
                }
            }
        }
    }

    focusFirstElement(modalElement) {
        const focusableElements = modalElement.querySelectorAll(
            'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    generateId() {
        return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Convenience methods
    alert(message, title = 'Alert') {
        return this.show({
            title,
            content: `<p>${message}</p>`,
            size: 'small',
            actions: [
                {
                    label: 'OK',
                    variant: 'btn-primary',
                    handler: () => true
                }
            ]
        });
    }

    confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            this.show({
                title,
                content: `<p>${message}</p>`,
                size: 'small',
                actions: [
                    {
                        label: 'Cancel',
                        variant: 'btn-secondary',
                        handler: () => {
                            resolve(false);
                            return true;
                        }
                    },
                    {
                        label: 'OK',
                        variant: 'btn-primary',
                        handler: () => {
                            resolve(true);
                            return true;
                        }
                    }
                ],
                onClose: () => {
                    resolve(false);
                    return true;
                }
            });
        });
    }

    prompt(message, defaultValue = '', title = 'Input') {
        return new Promise((resolve) => {
            const inputId = `prompt-input-${Date.now()}`;
            const content = `
                <p>${message}</p>
                <div class="input-group">
                    <input type="text" id="${inputId}" class="input" value="${defaultValue}" placeholder="Enter value...">
                </div>
            `;

            const modalId = this.show({
                title,
                content,
                size: 'small',
                actions: [
                    {
                        label: 'Cancel',
                        variant: 'btn-secondary',
                        handler: () => {
                            resolve(null);
                            return true;
                        }
                    },
                    {
                        label: 'OK',
                        variant: 'btn-primary',
                        handler: () => {
                            const input = document.getElementById(inputId);
                            resolve(input ? input.value : null);
                            return true;
                        }
                    }
                ],
                onClose: () => {
                    resolve(null);
                    return true;
                }
            });

            // Focus input and select text
            setTimeout(() => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        });
    }

    loading(message = 'Loading...', title = 'Please wait') {
        const content = `
            <div class="loading-spinner">
                <div class="progress-circular"></div>
                <p>${message}</p>
            </div>
        `;

        return this.show({
            title,
            content,
            size: 'small',
            closable: false,
            backdrop: false,
            className: 'modal-loading'
        });
    }

    progress(title = 'Progress', initialProgress = 0) {
        const progressId = `progress-${Date.now()}`;
        const content = `
            <div class="progress-container">
                <div class="progress-bar" id="${progressId}" style="width: ${initialProgress}%"></div>
            </div>
            <p class="progress-text" id="${progressId}-text">${initialProgress}%</p>
        `;

        const modalId = this.show({
            title,
            content,
            size: 'medium',
            closable: false,
            className: 'modal-progress'
        });

        return {
            modalId,
            update: (progress, text) => {
                const progressBar = document.getElementById(progressId);
                const progressText = document.getElementById(`${progressId}-text`);
                
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                
                if (progressText) {
                    progressText.textContent = text || `${progress}%`;
                }
            },
            close: () => this.close(modalId)
        };
    }

    settings() {
        const content = `
            <div class="settings-content">
                <div class="settings-section">
                    <h3>General</h3>
                    <div class="input-group">
                        <label class="input-label">Default Search Engine</label>
                        <select class="input">
                            <option value="google">Google</option>
                            <option value="bing">Bing</option>
                            <option value="duckduckgo">DuckDuckGo</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">
                            <input type="checkbox" checked> Block pop-ups
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Privacy</h3>
                    <div class="input-group">
                        <label class="input-label">
                            <input type="checkbox" checked> Clear cookies on exit
                        </label>
                    </div>
                    <div class="input-group">
                        <label class="input-label">
                            <input type="checkbox"> Enable tracking protection
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Performance</h3>
                    <div class="input-group">
                        <label class="input-label">Memory Limit (MB)</label>
                        <input type="number" class="input" value="512" min="256" max="2048">
                    </div>
                </div>
            </div>
        `;

        return this.show({
            title: 'Settings',
            content,
            size: 'large',
            actions: [
                {
                    label: 'Cancel',
                    variant: 'btn-secondary'
                },
                {
                    label: 'Save',
                    variant: 'btn-primary',
                    handler: () => {
                        // Save settings logic
                        window.app?.notificationSystem?.success('Settings saved', 'Your preferences have been updated');
                        return true;
                    }
                }
            ]
        });
    }

    about() {
        const content = `
            <div class="about-content" style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🌐</div>
                <h2>Vishwakarma Express</h2>
                <p style="margin: 16px 0; color: var(--text-secondary);">Version 1.0.0</p>
                <p>A revolutionary web browser with AI integration, quantum performance, and advanced developer tools.</p>
                
                <div style="margin: 24px 0; padding: 16px; background: var(--surface-variant); border-radius: 8px;">
                    <h4>System Information</h4>
                    <p><strong>Platform:</strong> ${navigator.platform}</p>
                    <p><strong>User Agent:</strong> ${navigator.userAgent.substring(0, 50)}...</p>
                    <p><strong>Memory:</strong> ${navigator.deviceMemory || 'Unknown'} GB</p>
                </div>
                
                <p style="font-size: 12px; color: var(--text-tertiary); margin-top: 24px;">
                    Built with ❤️ for the future of web browsing
                </p>
            </div>
        `;

        return this.show({
            title: 'About Vishwakarma Express',
            content,
            size: 'medium',
            actions: [
                {
                    label: 'Close',
                    variant: 'btn-primary'
                }
            ]
        });
    }
}
