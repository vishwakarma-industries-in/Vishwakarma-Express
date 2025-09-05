// Advanced Notification System
export class NotificationSystem {
    constructor() {
        this.notifications = new Map();
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.position = 'top-right';
        
        this.init();
    }

    async init() {
        console.log('Initializing Notification System...');
        
        this.createContainer();
        this.createStyles();
        this.setupEventListeners();
        
        console.log('Notification System ready');
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = `notification-container ${this.position}`;
        document.body.appendChild(this.container);
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: var(--space-3);
                padding: var(--space-4);
                pointer-events: none;
            }

            .notification-container.top-right {
                top: 0;
                right: 0;
                align-items: flex-end;
            }

            .notification-container.top-left {
                top: 0;
                left: 0;
                align-items: flex-start;
            }

            .notification-container.bottom-right {
                bottom: 0;
                right: 0;
                align-items: flex-end;
            }

            .notification-container.bottom-left {
                bottom: 0;
                left: 0;
                align-items: flex-start;
            }

            .notification-container.top-center {
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                align-items: center;
            }

            .notification-container.bottom-center {
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                align-items: center;
            }

            .notification {
                background: var(--surface);
                border: 1px solid var(--neutral-700);
                border-radius: var(--radius-lg);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: var(--space-4);
                min-width: 320px;
                max-width: 400px;
                pointer-events: all;
                opacity: 0;
                transform: translateX(100px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }

            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }

            .notification.hide {
                opacity: 0;
                transform: translateX(100px);
                max-height: 0;
                padding: 0;
                margin: 0;
                border: none;
            }

            .notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--accent-color);
                transform: scaleX(0);
                transform-origin: left;
                transition: transform linear;
            }

            .notification.with-progress::before {
                animation: progress-bar linear forwards;
            }

            @keyframes progress-bar {
                from { transform: scaleX(0); }
                to { transform: scaleX(1); }
            }

            .notification-header {
                display: flex;
                align-items: flex-start;
                gap: var(--space-3);
                margin-bottom: var(--space-2);
            }

            .notification-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 14px;
            }

            .notification-icon.success {
                background: var(--success);
                color: white;
            }

            .notification-icon.error {
                background: var(--error);
                color: white;
            }

            .notification-icon.warning {
                background: var(--warning);
                color: white;
            }

            .notification-icon.info {
                background: var(--info);
                color: white;
            }

            .notification-content {
                flex: 1;
            }

            .notification-title {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: var(--space-1);
                font-size: var(--font-size-sm);
            }

            .notification-message {
                color: var(--text-secondary);
                font-size: var(--font-size-sm);
                line-height: 1.4;
            }

            .notification-actions {
                display: flex;
                gap: var(--space-2);
                margin-top: var(--space-3);
            }

            .notification-action {
                padding: var(--space-1) var(--space-3);
                border: 1px solid var(--neutral-600);
                border-radius: var(--radius-md);
                background: transparent;
                color: var(--text-primary);
                font-size: var(--font-size-xs);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .notification-action:hover {
                background: var(--neutral-700);
            }

            .notification-action.primary {
                background: var(--accent-color);
                border-color: var(--accent-color);
                color: white;
            }

            .notification-action.primary:hover {
                background: var(--primary-600);
            }

            .notification-close {
                position: absolute;
                top: var(--space-2);
                right: var(--space-2);
                width: 20px;
                height: 20px;
                border: none;
                background: transparent;
                color: var(--text-tertiary);
                cursor: pointer;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 14px;
            }

            .notification-close:hover {
                background: var(--neutral-700);
                color: var(--text-primary);
            }

            .notification-progress {
                margin-top: var(--space-3);
                background: var(--neutral-800);
                border-radius: var(--radius-sm);
                height: 4px;
                overflow: hidden;
            }

            .notification-progress-bar {
                height: 100%;
                background: var(--accent-color);
                width: 0%;
                transition: width 0.3s ease;
            }

            /* Toast specific styles */
            .toast {
                min-width: 280px;
                max-width: 320px;
            }

            .toast .notification-header {
                margin-bottom: 0;
            }

            .toast .notification-title {
                margin-bottom: 0;
            }

            /* Persistent notification styles */
            .notification.persistent {
                border-left: 4px solid var(--accent-color);
            }

            .notification.persistent::before {
                display: none;
            }

            /* Interactive notification styles */
            .notification.interactive {
                cursor: pointer;
            }

            .notification.interactive:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            }

            /* Notification types */
            .notification.success {
                border-left-color: var(--success);
            }

            .notification.error {
                border-left-color: var(--error);
            }

            .notification.warning {
                border-left-color: var(--warning);
            }

            .notification.info {
                border-left-color: var(--info);
            }

            /* Animation for container position changes */
            .notification-container.top-right .notification {
                transform: translateX(100px);
            }

            .notification-container.top-left .notification {
                transform: translateX(-100px);
            }

            .notification-container.bottom-right .notification {
                transform: translateX(100px);
            }

            .notification-container.bottom-left .notification {
                transform: translateX(-100px);
            }

            .notification-container.top-center .notification,
            .notification-container.bottom-center .notification {
                transform: translateY(-20px);
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .notification-container {
                    left: var(--space-3) !important;
                    right: var(--space-3) !important;
                    transform: none !important;
                }

                .notification {
                    min-width: auto;
                    max-width: none;
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Listen for system events that should trigger notifications
        window.addEventListener('online', () => {
            this.show('Connection restored', 'You are back online', 'success');
        });

        window.addEventListener('offline', () => {
            this.show('Connection lost', 'You are currently offline', 'warning', { persistent: true });
        });

        // Listen for custom notification events
        document.addEventListener('notification', (e) => {
            this.show(e.detail.title, e.detail.message, e.detail.type, e.detail.options);
        });
    }

    show(title, message, type = 'info', options = {}) {
        const id = this.generateId();
        const notification = this.createNotification(id, title, message, type, options);
        
        // Add to container
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Manage notification count
        this.manageNotificationCount();

        // Show with animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-hide if not persistent
        if (!options.persistent) {
            const duration = options.duration || this.defaultDuration;
            if (options.showProgress) {
                notification.style.setProperty('--progress-duration', `${duration}ms`);
                notification.classList.add('with-progress');
                notification.style.setProperty('animation-duration', `${duration}ms`);
            }
            
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        return id;
    }

    createNotification(id, title, message, type, options) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        if (options.persistent) {
            notification.classList.add('persistent');
        }

        if (options.interactive) {
            notification.classList.add('interactive');
        }

        if (options.toast) {
            notification.classList.add('toast');
        }

        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon ${type}">
                    ${options.icon || iconMap[type] || 'ℹ'}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    ${message ? `<div class="notification-message">${message}</div>` : ''}
                </div>
            </div>
            ${options.actions ? this.createActions(options.actions) : ''}
            ${options.progress !== undefined ? this.createProgress(options.progress) : ''}
            <button class="notification-close" onclick="window.app?.notificationSystem?.hide('${id}')">✕</button>
        `;

        // Add click handler for interactive notifications
        if (options.interactive && options.onClick) {
            notification.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-close') && !e.target.closest('.notification-action')) {
                    options.onClick();
                }
            });
        }

        return notification;
    }

    createActions(actions) {
        const actionsHtml = actions.map(action => 
            `<button class="notification-action ${action.primary ? 'primary' : ''}" 
                     onclick="${action.handler}">${action.label}</button>`
        ).join('');
        
        return `<div class="notification-actions">${actionsHtml}</div>`;
    }

    createProgress(progress) {
        return `
            <div class="notification-progress">
                <div class="notification-progress-bar" style="width: ${progress}%"></div>
            </div>
        `;
    }

    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);
    }

    update(id, updates) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        if (updates.title) {
            const titleElement = notification.querySelector('.notification-title');
            if (titleElement) titleElement.textContent = updates.title;
        }

        if (updates.message) {
            const messageElement = notification.querySelector('.notification-message');
            if (messageElement) messageElement.textContent = updates.message;
        }

        if (updates.progress !== undefined) {
            const progressBar = notification.querySelector('.notification-progress-bar');
            if (progressBar) progressBar.style.width = `${updates.progress}%`;
        }

        if (updates.type) {
            notification.className = `notification ${updates.type}`;
        }
    }

    clear() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
    }

    manageNotificationCount() {
        const notifications = Array.from(this.notifications.values());
        if (notifications.length > this.maxNotifications) {
            const oldest = notifications[0];
            const oldestId = oldest.dataset.id;
            this.hide(oldestId);
        }
    }

    generateId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    setPosition(position) {
        this.position = position;
        this.container.className = `notification-container ${position}`;
    }

    setMaxNotifications(max) {
        this.maxNotifications = max;
    }

    // Convenience methods
    success(title, message, options = {}) {
        return this.show(title, message, 'success', options);
    }

    error(title, message, options = {}) {
        return this.show(title, message, 'error', { ...options, persistent: true });
    }

    warning(title, message, options = {}) {
        return this.show(title, message, 'warning', options);
    }

    info(title, message, options = {}) {
        return this.show(title, message, 'info', options);
    }

    toast(message, type = 'info', duration = 3000) {
        return this.show('', message, type, { toast: true, duration });
    }

    progress(title, message, initialProgress = 0) {
        return this.show(title, message, 'info', {
            persistent: true,
            progress: initialProgress,
            showProgress: true
        });
    }

    // System notifications
    downloadComplete(filename) {
        return this.success('Download Complete', `${filename} has been downloaded`, {
            actions: [
                {
                    label: 'Open',
                    primary: true,
                    handler: `window.app?.downloadManager?.openFile('${filename}')`
                },
                {
                    label: 'Show in folder',
                    handler: `window.app?.downloadManager?.showInFolder('${filename}')`
                }
            ]
        });
    }

    extensionInstalled(name) {
        return this.success('Extension Installed', `${name} has been installed and is ready to use`);
    }

    updateAvailable(version) {
        return this.info('Update Available', `Vishwakarma Express ${version} is available`, {
            persistent: true,
            actions: [
                {
                    label: 'Update Now',
                    primary: true,
                    handler: 'window.app?.updateManager?.startUpdate()'
                },
                {
                    label: 'Later',
                    handler: `window.app?.notificationSystem?.hide('${this.generateId()}')`
                }
            ]
        });
    }

    securityAlert(message) {
        return this.error('Security Alert', message, {
            persistent: true,
            actions: [
                {
                    label: 'Details',
                    primary: true,
                    handler: 'window.app?.securityManager?.showDetails()'
                }
            ]
        });
    }

    aiResponse(response) {
        return this.info('AI Assistant', response, {
            interactive: true,
            onClick: () => {
                if (window.app?.multiModelAI) {
                    window.app.multiModelAI.showUI();
                }
            }
        });
    }
}
