// Progress Indicators & Loading States
export class ProgressIndicators {
    constructor() {
        this.activeIndicators = new Map();
        this.loadingStates = new Map();
        
        this.init();
    }

    async init() {
        console.log('Initializing Progress Indicators...');
        
        this.createGlobalLoadingOverlay();
        
        console.log('Progress Indicators ready');
    }

    createGlobalLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'global-loading-overlay';
        overlay.className = 'loading-overlay hidden';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-dots">
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                </div>
                <div class="loading-text">Loading...</div>
            </div>
        `;
        document.body.appendChild(overlay);
        this.globalOverlay = overlay;
    }

    // Progress Bar Component
    createProgressBar(container, options = {}) {
        const {
            value = 0,
            max = 100,
            animated = true,
            striped = false,
            color = 'primary',
            size = 'medium',
            showText = true,
            label = ''
        } = options;

        const progressId = this.generateId();
        const progressElement = document.createElement('div');
        progressElement.className = `progress-wrapper ${size}`;
        progressElement.innerHTML = `
            ${label ? `<div class="progress-label">${label}</div>` : ''}
            <div class="progress-container ${striped ? 'striped' : ''} ${animated ? 'animated' : ''}">
                <div class="progress-bar ${color}" 
                     style="width: ${(value / max) * 100}%"
                     data-progress-id="${progressId}">
                    ${showText ? `<span class="progress-text">${Math.round((value / max) * 100)}%</span>` : ''}
                </div>
            </div>
        `;

        if (container) {
            container.appendChild(progressElement);
        }

        const progressBar = {
            id: progressId,
            element: progressElement,
            update: (newValue) => this.updateProgressBar(progressId, newValue, max, showText),
            setMax: (newMax) => { max = newMax; },
            destroy: () => this.destroyProgressBar(progressId)
        };

        this.activeIndicators.set(progressId, progressBar);
        return progressBar;
    }

    updateProgressBar(progressId, value, max = 100, showText = true) {
        const indicator = this.activeIndicators.get(progressId);
        if (!indicator) return;

        const bar = indicator.element.querySelector(`[data-progress-id="${progressId}"]`);
        const percentage = Math.round((value / max) * 100);
        
        if (bar) {
            bar.style.width = `${percentage}%`;
            
            if (showText) {
                const textElement = bar.querySelector('.progress-text');
                if (textElement) {
                    textElement.textContent = `${percentage}%`;
                }
            }
        }
    }

    // Circular Progress Component
    createCircularProgress(container, options = {}) {
        const {
            value = 0,
            max = 100,
            size = 40,
            strokeWidth = 3,
            color = '#ff6a00',
            backgroundColor = '#374151',
            showText = true,
            animated = true
        } = options;

        const progressId = this.generateId();
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const progress = (value / max) * 100;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        const svgElement = document.createElement('div');
        svgElement.className = 'circular-progress-wrapper';
        svgElement.innerHTML = `
            <svg class="circular-progress ${animated ? 'animated' : ''}" 
                 width="${size}" height="${size}" data-progress-id="${progressId}">
                <circle class="progress-bg" 
                        cx="${size / 2}" cy="${size / 2}" r="${radius}"
                        stroke="${backgroundColor}" 
                        stroke-width="${strokeWidth}" 
                        fill="transparent"/>
                <circle class="progress-circle" 
                        cx="${size / 2}" cy="${size / 2}" r="${radius}"
                        stroke="${color}" 
                        stroke-width="${strokeWidth}" 
                        fill="transparent"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${strokeDashoffset}"
                        transform="rotate(-90 ${size / 2} ${size / 2})"/>
                ${showText ? `<text x="50%" y="50%" text-anchor="middle" dy="0.3em" class="progress-text">${Math.round(progress)}%</text>` : ''}
            </svg>
        `;

        if (container) {
            container.appendChild(svgElement);
        }

        const circularProgress = {
            id: progressId,
            element: svgElement,
            update: (newValue) => this.updateCircularProgress(progressId, newValue, max, size, strokeWidth),
            destroy: () => this.destroyProgressBar(progressId)
        };

        this.activeIndicators.set(progressId, circularProgress);
        return circularProgress;
    }

    updateCircularProgress(progressId, value, max = 100, size = 40, strokeWidth = 3) {
        const indicator = this.activeIndicators.get(progressId);
        if (!indicator) return;

        const svg = indicator.element.querySelector(`[data-progress-id="${progressId}"]`);
        const circle = svg?.querySelector('.progress-circle');
        const text = svg?.querySelector('.progress-text');
        
        if (circle) {
            const radius = (size - strokeWidth) / 2;
            const circumference = radius * 2 * Math.PI;
            const progress = (value / max) * 100;
            const strokeDashoffset = circumference - (progress / 100) * circumference;
            
            circle.style.strokeDashoffset = strokeDashoffset;
            
            if (text) {
                text.textContent = `${Math.round(progress)}%`;
            }
        }
    }

    // Loading Spinner Component
    createSpinner(container, options = {}) {
        const {
            type = 'dots',
            size = 'medium',
            color = 'primary',
            text = ''
        } = options;

        const spinnerId = this.generateId();
        const spinnerElement = document.createElement('div');
        spinnerElement.className = `spinner-container ${size}`;
        spinnerElement.dataset.spinnerId = spinnerId;

        let spinnerHTML = '';
        
        switch (type) {
            case 'dots':
                spinnerHTML = `
                    <div class="spinner-dots ${color}">
                        <div class="spinner-dot"></div>
                        <div class="spinner-dot"></div>
                        <div class="spinner-dot"></div>
                    </div>
                `;
                break;
            case 'circular':
                spinnerHTML = `<div class="progress-circular ${color}"></div>`;
                break;
            case 'pulse':
                spinnerHTML = `<div class="spinner-pulse ${color}"></div>`;
                break;
            case 'bars':
                spinnerHTML = `
                    <div class="spinner-bars ${color}">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>
                `;
                break;
        }

        spinnerElement.innerHTML = `
            ${spinnerHTML}
            ${text ? `<div class="spinner-text">${text}</div>` : ''}
        `;

        if (container) {
            container.appendChild(spinnerElement);
        }

        const spinner = {
            id: spinnerId,
            element: spinnerElement,
            updateText: (newText) => {
                const textElement = spinnerElement.querySelector('.spinner-text');
                if (textElement) {
                    textElement.textContent = newText;
                }
            },
            destroy: () => this.destroySpinner(spinnerId)
        };

        this.activeIndicators.set(spinnerId, spinner);
        return spinner;
    }

    // Skeleton Loading Component
    createSkeleton(container, options = {}) {
        const {
            type = 'text',
            count = 3,
            height = '1em',
            width = '100%',
            animated = true
        } = options;

        const skeletonId = this.generateId();
        const skeletonElement = document.createElement('div');
        skeletonElement.className = `skeleton-container ${animated ? 'animated' : ''}`;
        skeletonElement.dataset.skeletonId = skeletonId;

        let skeletonHTML = '';
        
        for (let i = 0; i < count; i++) {
            switch (type) {
                case 'text':
                    skeletonHTML += `<div class="loading-skeleton skeleton-text" style="height: ${height}; width: ${i === count - 1 ? '60%' : width};"></div>`;
                    break;
                case 'title':
                    skeletonHTML += `<div class="loading-skeleton skeleton-title" style="height: ${height}; width: ${width};"></div>`;
                    break;
                case 'avatar':
                    skeletonHTML += `<div class="loading-skeleton skeleton-avatar"></div>`;
                    break;
                case 'card':
                    skeletonHTML += `
                        <div class="skeleton-card">
                            <div class="loading-skeleton skeleton-title"></div>
                            <div class="loading-skeleton skeleton-text"></div>
                            <div class="loading-skeleton skeleton-text" style="width: 80%;"></div>
                        </div>
                    `;
                    break;
            }
        }

        skeletonElement.innerHTML = skeletonHTML;

        if (container) {
            container.appendChild(skeletonElement);
        }

        const skeleton = {
            id: skeletonId,
            element: skeletonElement,
            destroy: () => this.destroySkeleton(skeletonId)
        };

        this.activeIndicators.set(skeletonId, skeleton);
        return skeleton;
    }

    // Loading States Management
    showLoading(target, options = {}) {
        const {
            type = 'overlay',
            text = 'Loading...',
            spinner = 'dots'
        } = options;

        const loadingId = this.generateId();
        let loadingElement;

        if (type === 'overlay') {
            loadingElement = document.createElement('div');
            loadingElement.className = 'loading-overlay';
            loadingElement.innerHTML = `
                <div class="loading-spinner">
                    ${this.getSpinnerHTML(spinner)}
                    <div class="loading-text">${text}</div>
                </div>
            `;

            if (target === 'global' || !target) {
                document.body.appendChild(loadingElement);
            } else {
                target.style.position = 'relative';
                target.appendChild(loadingElement);
            }
        } else if (type === 'inline') {
            loadingElement = this.createSpinner(target, { text, type: spinner }).element;
        }

        this.loadingStates.set(loadingId, {
            element: loadingElement,
            target: target
        });

        return loadingId;
    }

    hideLoading(loadingId) {
        const loadingState = this.loadingStates.get(loadingId);
        if (!loadingState) return;

        const { element } = loadingState;
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }

        this.loadingStates.delete(loadingId);
    }

    // Global Loading Methods
    showGlobalLoading(text = 'Loading...') {
        this.globalOverlay.querySelector('.loading-text').textContent = text;
        this.globalOverlay.classList.remove('hidden');
    }

    hideGlobalLoading() {
        this.globalOverlay.classList.add('hidden');
    }

    // Utility Methods
    getSpinnerHTML(type) {
        switch (type) {
            case 'dots':
                return `
                    <div class="spinner-dots">
                        <div class="spinner-dot"></div>
                        <div class="spinner-dot"></div>
                        <div class="spinner-dot"></div>
                    </div>
                `;
            case 'circular':
                return `<div class="progress-circular"></div>`;
            case 'pulse':
                return `<div class="spinner-pulse"></div>`;
            default:
                return `<div class="progress-circular"></div>`;
        }
    }

    destroyProgressBar(progressId) {
        const indicator = this.activeIndicators.get(progressId);
        if (indicator && indicator.element && indicator.element.parentNode) {
            indicator.element.parentNode.removeChild(indicator.element);
        }
        this.activeIndicators.delete(progressId);
    }

    destroySpinner(spinnerId) {
        const spinner = this.activeIndicators.get(spinnerId);
        if (spinner && spinner.element && spinner.element.parentNode) {
            spinner.element.parentNode.removeChild(spinner.element);
        }
        this.activeIndicators.delete(spinnerId);
    }

    destroySkeleton(skeletonId) {
        const skeleton = this.activeIndicators.get(skeletonId);
        if (skeleton && skeleton.element && skeleton.element.parentNode) {
            skeleton.element.parentNode.removeChild(skeleton.element);
        }
        this.activeIndicators.delete(skeletonId);
    }

    generateId() {
        return `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Convenience Methods for Common Use Cases
    showPageLoading() {
        return this.showLoading('global', {
            text: 'Loading page...',
            spinner: 'circular'
        });
    }

    showDownloadProgress(filename) {
        const container = document.createElement('div');
        container.className = 'download-progress-container';
        
        const progressBar = this.createProgressBar(container, {
            label: `Downloading ${filename}`,
            animated: true,
            striped: true,
            showText: true
        });

        // Add to notification or sidebar
        if (window.app?.notificationSystem) {
            window.app.notificationSystem.show(
                'Download Started',
                container.outerHTML,
                'info',
                { persistent: true }
            );
        }

        return progressBar;
    }

    showUploadProgress(filename) {
        const container = document.createElement('div');
        container.className = 'upload-progress-container';
        
        const progressBar = this.createProgressBar(container, {
            label: `Uploading ${filename}`,
            animated: true,
            color: 'success',
            showText: true
        });

        return progressBar;
    }

    showAIThinking() {
        const container = document.createElement('div');
        container.className = 'ai-thinking-container';
        container.innerHTML = `
            <div class="ai-thinking">
                <div class="spinner-dots">
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                    <div class="spinner-dot"></div>
                </div>
                <span>AI is thinking...</span>
            </div>
        `;

        return this.createSpinner(container, {
            type: 'dots',
            text: 'AI is processing your request...'
        });
    }
}
