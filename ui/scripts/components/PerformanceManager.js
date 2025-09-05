// Performance Manager Component - Optimized for Dell Latitude E6440
export class PerformanceManager {
    constructor() {
        this.settings = {
            memoryLimit: 2048, // MB - Conservative for 8GB system
            maxTabs: 10, // Limit concurrent tabs
            enableGPUAcceleration: false, // Disabled for integrated graphics
            preloadPages: false, // Disabled to save memory
            imageOptimization: true,
            scriptOptimization: true,
            cacheManagement: true,
            backgroundThrottling: true,
            animationReduction: false
        };
        
        this.metrics = {
            memoryUsage: 0,
            cpuUsage: 0,
            tabCount: 0,
            loadTime: 0,
            renderTime: 0
        };
        
        this.observers = [];
        this.storageKey = 'vishwakarma_performance';
        
        this.init();
    }

    async init() {
        this.loadSettings();
        this.detectHardware();
        this.setupPerformanceOptimizations();
        this.startPerformanceMonitoring();
        this.createPerformancePanel();
    }

    detectHardware() {
        // Detect system capabilities
        const memory = navigator.deviceMemory || 4; // GB
        const cores = navigator.hardwareConcurrency || 4;
        
        // Adjust settings based on detected hardware
        if (memory <= 4) {
            this.settings.memoryLimit = 1024;
            this.settings.maxTabs = 6;
            this.settings.preloadPages = false;
        } else if (memory <= 8) {
            this.settings.memoryLimit = 2048;
            this.settings.maxTabs = 10;
        }
        
        // Conservative settings for older hardware
        if (cores <= 4) {
            this.settings.backgroundThrottling = true;
            this.settings.animationReduction = true;
        }
        
        console.log(`Hardware detected: ${memory}GB RAM, ${cores} cores`);
    }

    setupPerformanceOptimizations() {
        this.optimizeImages();
        this.optimizeScripts();
        this.setupMemoryManagement();
        this.setupCacheManagement();
        this.setupAnimationOptimization();
        this.setupTabThrottling();
    }

    optimizeImages() {
        if (!this.settings.imageOptimization) return;
        
        // Lazy loading for images
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observe all images with data-src
        document.addEventListener('DOMNodeInserted', (e) => {
            if (e.target.tagName === 'IMG' && e.target.dataset.src) {
                imageObserver.observe(e.target);
            }
        });

        this.observers.push(imageObserver);
    }

    optimizeScripts() {
        if (!this.settings.scriptOptimization) return;
        
        // Defer non-critical scripts
        const originalCreateElement = document.createElement;
        const self = this;
        
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            if (tagName.toLowerCase() === 'script') {
                // Add defer attribute to non-critical scripts
                if (!element.hasAttribute('async') && !element.hasAttribute('defer')) {
                    element.defer = true;
                }
                
                // Monitor script loading
                element.addEventListener('load', () => {
                    self.updateMetrics();
                });
            }
            
            return element;
        };
    }

    setupMemoryManagement() {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                this.metrics.memoryUsage = Math.round(memInfo.usedJSHeapSize / 1024 / 1024);
                
                // Trigger cleanup if memory usage is high
                if (this.metrics.memoryUsage > this.settings.memoryLimit * 0.8) {
                    this.performMemoryCleanup();
                }
            }, 10000);
        }
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.performMemoryCleanup();
        });
    }

    setupCacheManagement() {
        if (!this.settings.cacheManagement) return;
        
        // Implement intelligent cache management
        const cacheSize = this.settings.memoryLimit * 0.1 * 1024 * 1024; // 10% of memory limit
        
        // Clear old cache entries periodically
        setInterval(() => {
            this.cleanupCache();
        }, 300000); // Every 5 minutes
    }

    setupAnimationOptimization() {
        if (this.settings.animationReduction) {
            // Reduce animations for better performance
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.1s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0.1s !important;
                    transition-delay: 0s !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupTabThrottling() {
        // Monitor tab count and throttle background tabs
        document.addEventListener('tab-created', () => {
            this.metrics.tabCount++;
            this.checkTabLimits();
        });
        
        document.addEventListener('tab-closed', () => {
            this.metrics.tabCount--;
        });
        
        // Throttle background tabs
        if (this.settings.backgroundThrottling) {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.throttleBackgroundActivity();
                } else {
                    this.resumeActivity();
                }
            });
        }
    }

    checkTabLimits() {
        if (this.metrics.tabCount > this.settings.maxTabs) {
            this.showPerformanceWarning(
                `Too many tabs open (${this.metrics.tabCount}/${this.settings.maxTabs}). Consider closing some tabs for better performance.`
            );
        }
    }

    performMemoryCleanup() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear unused resources
        this.clearUnusedImages();
        this.clearOldCacheEntries();
        
        // Emit cleanup event
        document.dispatchEvent(new CustomEvent('memory-cleanup'));
        
        console.log('Memory cleanup performed');
    }

    clearUnusedImages() {
        // Remove images that are not visible
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (!isVisible && img.src && !img.dataset.keepLoaded) {
                img.dataset.originalSrc = img.src;
                img.src = '';
            }
        });
    }

    clearOldCacheEntries() {
        // Clear old localStorage entries
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        const now = Date.now();
        
        Object.keys(localStorage).forEach(key => {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item.timestamp && now - item.timestamp > maxAge) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                // Not a timestamped item, skip
            }
        });
    }

    throttleBackgroundActivity() {
        // Reduce activity when tab is in background
        document.dispatchEvent(new CustomEvent('throttle-activity'));
        
        // Pause non-essential animations
        const animations = document.getAnimations();
        animations.forEach(animation => {
            if (!animation.effect.target.dataset.essential) {
                animation.pause();
            }
        });
    }

    resumeActivity() {
        // Resume activity when tab becomes active
        document.dispatchEvent(new CustomEvent('resume-activity'));
        
        // Resume animations
        const animations = document.getAnimations();
        animations.forEach(animation => {
            if (animation.playState === 'paused') {
                animation.play();
            }
        });
    }

    startPerformanceMonitoring() {
        // Monitor performance metrics
        setInterval(() => {
            this.updateMetrics();
        }, 5000);
        
        // Monitor page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.metrics.loadTime = Math.round(perfData.loadEventEnd - perfData.fetchStart);
        });
        
        // Monitor rendering performance
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'paint') {
                        this.metrics.renderTime = Math.round(entry.startTime);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['paint', 'measure'] });
            this.observers.push(observer);
        }
    }

    updateMetrics() {
        // Update CPU usage estimation
        const start = performance.now();
        const iterations = 10000;
        for (let i = 0; i < iterations; i++) {
            Math.random();
        }
        const end = performance.now();
        this.metrics.cpuUsage = Math.min(100, (end - start) * 10);
        
        // Update memory usage if available
        if ('memory' in performance) {
            this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        
        // Update performance panel if visible
        this.updatePerformancePanel();
    }

    createPerformancePanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-panel';
        panel.className = 'performance-panel';
        
        panel.innerHTML = `
            <div class="performance-header">
                <h3>🚀 Performance Monitor</h3>
                <button class="performance-close">&times;</button>
            </div>
            
            <div class="performance-content">
                <div class="performance-metrics">
                    <div class="metric-item">
                        <div class="metric-label">Memory Usage</div>
                        <div class="metric-value" id="memory-usage">0 MB</div>
                        <div class="metric-bar">
                            <div class="metric-fill" id="memory-fill"></div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-label">CPU Usage</div>
                        <div class="metric-value" id="cpu-usage">0%</div>
                        <div class="metric-bar">
                            <div class="metric-fill" id="cpu-fill"></div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-label">Active Tabs</div>
                        <div class="metric-value" id="tab-count">0</div>
                        <div class="metric-limit">/ ${this.settings.maxTabs}</div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-label">Load Time</div>
                        <div class="metric-value" id="load-time">${this.metrics.loadTime}ms</div>
                    </div>
                </div>
                
                <div class="performance-actions">
                    <button class="btn btn-primary" id="optimize-now">Optimize Now</button>
                    <button class="btn btn-secondary" id="performance-settings">Settings</button>
                </div>
                
                <div class="performance-tips">
                    <h4>Performance Tips</h4>
                    <ul id="performance-tips-list">
                        ${this.generatePerformanceTips()}
                    </ul>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.setupPanelEvents(panel);
    }

    setupPanelEvents(panel) {
        // Close button
        panel.querySelector('.performance-close').addEventListener('click', () => {
            this.hidePanel();
        });
        
        // Optimize now button
        panel.querySelector('#optimize-now').addEventListener('click', () => {
            this.performOptimization();
        });
        
        // Settings button
        panel.querySelector('#performance-settings').addEventListener('click', () => {
            this.showPerformanceSettings();
        });
    }

    showPanel() {
        const panel = document.getElementById('performance-panel');
        panel.classList.add('show');
        this.updatePerformancePanel();
    }

    hidePanel() {
        const panel = document.getElementById('performance-panel');
        panel.classList.remove('show');
    }

    updatePerformancePanel() {
        const panel = document.getElementById('performance-panel');
        if (!panel || !panel.classList.contains('show')) return;
        
        // Update memory usage
        const memoryUsage = panel.querySelector('#memory-usage');
        const memoryFill = panel.querySelector('#memory-fill');
        if (memoryUsage && memoryFill) {
            memoryUsage.textContent = `${this.metrics.memoryUsage} MB`;
            const memoryPercent = (this.metrics.memoryUsage / this.settings.memoryLimit) * 100;
            memoryFill.style.width = `${Math.min(100, memoryPercent)}%`;
            memoryFill.className = `metric-fill ${memoryPercent > 80 ? 'critical' : memoryPercent > 60 ? 'warning' : 'good'}`;
        }
        
        // Update CPU usage
        const cpuUsage = panel.querySelector('#cpu-usage');
        const cpuFill = panel.querySelector('#cpu-fill');
        if (cpuUsage && cpuFill) {
            cpuUsage.textContent = `${Math.round(this.metrics.cpuUsage)}%`;
            cpuFill.style.width = `${this.metrics.cpuUsage}%`;
            cpuFill.className = `metric-fill ${this.metrics.cpuUsage > 80 ? 'critical' : this.metrics.cpuUsage > 60 ? 'warning' : 'good'}`;
        }
        
        // Update tab count
        const tabCount = panel.querySelector('#tab-count');
        if (tabCount) {
            tabCount.textContent = this.metrics.tabCount;
            tabCount.className = `metric-value ${this.metrics.tabCount > this.settings.maxTabs ? 'critical' : 'good'}`;
        }
        
        // Update load time
        const loadTime = panel.querySelector('#load-time');
        if (loadTime) {
            loadTime.textContent = `${this.metrics.loadTime}ms`;
        }
    }

    performOptimization() {
        // Perform immediate optimization
        this.performMemoryCleanup();
        this.clearOldCacheEntries();
        
        // Close excess tabs if any
        if (this.metrics.tabCount > this.settings.maxTabs) {
            document.dispatchEvent(new CustomEvent('close-excess-tabs', {
                detail: { maxTabs: this.settings.maxTabs }
            }));
        }
        
        this.showToast('Performance optimization completed', 'success');
        this.updatePerformancePanel();
    }

    generatePerformanceTips() {
        const tips = [
            'Close unused tabs to free up memory',
            'Clear browsing data regularly',
            'Disable unnecessary extensions',
            'Use bookmarks instead of keeping tabs open',
            'Enable hardware acceleration if available'
        ];
        
        // Add specific tips based on current metrics
        if (this.metrics.memoryUsage > this.settings.memoryLimit * 0.7) {
            tips.unshift('Memory usage is high - consider closing some tabs');
        }
        
        if (this.metrics.tabCount > this.settings.maxTabs * 0.8) {
            tips.unshift('Too many tabs open - performance may be affected');
        }
        
        return tips.map(tip => `<li>${tip}</li>`).join('');
    }

    showPerformanceSettings() {
        // Show performance settings in main settings panel
        if (window.app && window.app.settingsManager) {
            window.app.settingsManager.showPanel();
            // Switch to advanced tab where performance settings would be
            setTimeout(() => {
                const advancedTab = document.querySelector('[data-section="advanced"]');
                if (advancedTab) {
                    advancedTab.click();
                }
            }, 100);
        }
    }

    showPerformanceWarning(message) {
        const warning = document.createElement('div');
        warning.className = 'performance-warning';
        warning.innerHTML = `
            <div class="warning-icon">⚠️</div>
            <div class="warning-message">${message}</div>
            <button class="warning-close">&times;</button>
        `;
        
        document.body.appendChild(warning);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            warning.remove();
        }, 10000);
        
        // Manual close
        warning.querySelector('.warning-close').addEventListener('click', () => {
            warning.remove();
        });
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

    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load performance settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save performance settings:', error);
        }
    }

    // Public API
    getMetrics() {
        return { ...this.metrics };
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Apply setting immediately
        switch (key) {
            case 'animationReduction':
                this.setupAnimationOptimization();
                break;
            case 'imageOptimization':
                this.optimizeImages();
                break;
            case 'memoryLimit':
            case 'maxTabs':
                this.checkTabLimits();
                break;
        }
    }

    cleanup() {
        // Cleanup observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers = [];
    }
}
