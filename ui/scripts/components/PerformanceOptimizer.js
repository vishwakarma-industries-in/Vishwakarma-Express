// Performance Optimizer for Dell Latitude E6440
export class PerformanceOptimizer {
    constructor() {
        this.hardwareProfile = {
            cpu: 'Intel i5 4th gen',
            ram: '8GB',
            gpu: 'Intel HD Graphics 4600',
            maxMemoryUsage: 512 * 1024 * 1024, // 512MB limit
            targetFPS: 30,
            enableGPUAcceleration: false
        };
        
        this.performanceMetrics = {
            memoryUsage: 0,
            cpuUsage: 0,
            frameRate: 0,
            loadTime: 0
        };
        
        this.optimizations = new Map();
        this.monitoring = false;
        
        this.init();
    }

    async init() {
        console.log('Initializing Performance Optimizer for Dell E6440...');
        
        this.detectHardware();
        this.setupOptimizations();
        this.startMonitoring();
        this.optimizeForHardware();
        
        console.log('Performance Optimizer ready');
    }

    detectHardware() {
        // Detect available memory
        if (navigator.deviceMemory) {
            const availableGB = navigator.deviceMemory;
            this.hardwareProfile.ram = `${availableGB}GB`;
            
            // Adjust memory limit based on available RAM
            if (availableGB <= 4) {
                this.hardwareProfile.maxMemoryUsage = 256 * 1024 * 1024; // 256MB
            } else if (availableGB <= 8) {
                this.hardwareProfile.maxMemoryUsage = 512 * 1024 * 1024; // 512MB
            }
        }

        // Detect CPU cores
        if (navigator.hardwareConcurrency) {
            const cores = navigator.hardwareConcurrency;
            if (cores <= 2) {
                this.hardwareProfile.targetFPS = 24;
            } else if (cores <= 4) {
                this.hardwareProfile.targetFPS = 30;
            }
        }

        // Check for GPU acceleration support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const renderer = gl.getParameter(gl.RENDERER);
            if (renderer.includes('Intel HD')) {
                this.hardwareProfile.enableGPUAcceleration = false;
            }
        }
    }

    setupOptimizations() {
        // Memory optimizations
        this.optimizations.set('memory', {
            enabled: true,
            apply: () => this.optimizeMemory(),
            description: 'Reduces memory usage and enables garbage collection'
        });

        // CPU optimizations
        this.optimizations.set('cpu', {
            enabled: true,
            apply: () => this.optimizeCPU(),
            description: 'Reduces CPU-intensive operations and enables throttling'
        });

        // Rendering optimizations
        this.optimizations.set('rendering', {
            enabled: true,
            apply: () => this.optimizeRendering(),
            description: 'Optimizes rendering for integrated graphics'
        });

        // Network optimizations
        this.optimizations.set('network', {
            enabled: true,
            apply: () => this.optimizeNetwork(),
            description: 'Optimizes network requests and caching'
        });

        // Animation optimizations
        this.optimizations.set('animations', {
            enabled: true,
            apply: () => this.optimizeAnimations(),
            description: 'Reduces animation complexity for better performance'
        });
    }

    optimizeForHardware() {
        // Apply all optimizations
        this.optimizations.forEach((optimization, key) => {
            if (optimization.enabled) {
                optimization.apply();
                console.log(`Applied ${key} optimization: ${optimization.description}`);
            }
        });

        // Set CSS variables for hardware-specific optimizations
        document.documentElement.style.setProperty('--animation-duration', '0.15s');
        document.documentElement.style.setProperty('--transition-duration', '0.1s');
        document.documentElement.style.setProperty('--blur-amount', '8px');
        document.documentElement.style.setProperty('--shadow-complexity', 'simple');
    }

    optimizeMemory() {
        // Limit concurrent operations
        window.maxConcurrentRequests = 3;
        
        // Enable aggressive garbage collection
        if (window.gc) {
            setInterval(() => {
                if (this.performanceMetrics.memoryUsage > this.hardwareProfile.maxMemoryUsage * 0.8) {
                    window.gc();
                }
            }, 30000);
        }

        // Limit image cache size
        const imageCache = new Map();
        const maxCacheSize = 50;
        
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            if (tagName.toLowerCase() === 'img') {
                element.addEventListener('load', () => {
                    if (imageCache.size >= maxCacheSize) {
                        const firstKey = imageCache.keys().next().value;
                        imageCache.delete(firstKey);
                    }
                    imageCache.set(element.src, element);
                });
            }
            
            return element;
        };

        // Optimize DOM operations
        this.setupDOMOptimizations();
    }

    optimizeCPU() {
        // Throttle expensive operations
        this.setupRequestThrottling();
        
        // Optimize event listeners
        this.setupEventOptimizations();
        
        // Reduce timer frequency
        this.optimizeTimers();
        
        // Enable CPU-friendly rendering
        document.documentElement.style.setProperty('--gpu-acceleration', 'none');
    }

    optimizeRendering() {
        // Disable expensive visual effects for integrated graphics
        const style = document.createElement('style');
        style.textContent = `
            /* Dell E6440 Optimized Rendering */
            .glass-effect {
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                background: rgba(26, 26, 26, 0.95) !important;
            }
            
            .shadow-heavy {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
            }
            
            .animation-complex {
                animation: none !important;
                transition: opacity 0.1s ease !important;
            }
            
            .gradient-complex {
                background: var(--surface) !important;
            }
            
            /* Reduce visual complexity */
            .notification {
                backdrop-filter: none;
                background: var(--surface);
            }
            
            .modal-dialog {
                backdrop-filter: none;
                background: var(--surface);
            }
            
            .command-palette-container {
                backdrop-filter: none;
                background: var(--surface);
            }
            
            /* Optimize scrolling */
            * {
                scroll-behavior: auto !important;
            }
            
            /* Reduce repaints */
            .hover-lift:hover {
                transform: none !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    optimizeNetwork() {
        // Implement request batching
        const requestQueue = [];
        let processingQueue = false;
        
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            return new Promise((resolve, reject) => {
                requestQueue.push({ args, resolve, reject });
                
                if (!processingQueue) {
                    processingQueue = true;
                    setTimeout(() => {
                        const batch = requestQueue.splice(0, 3); // Process 3 at a time
                        
                        batch.forEach(async ({ args, resolve, reject }) => {
                            try {
                                const response = await originalFetch(...args);
                                resolve(response);
                            } catch (error) {
                                reject(error);
                            }
                        });
                        
                        processingQueue = false;
                        
                        if (requestQueue.length > 0) {
                            setTimeout(arguments.callee, 100);
                        }
                    }, 50);
                }
            });
        };

        // Enable compression
        if ('serviceWorker' in navigator) {
            this.setupServiceWorkerCaching();
        }
    }

    optimizeAnimations() {
        // Reduce animation complexity based on performance
        const reduceAnimations = () => {
            document.documentElement.style.setProperty('--animation-duration', '0.05s');
            document.documentElement.style.setProperty('--transition-duration', '0.05s');
            
            // Disable complex animations
            const complexAnimations = document.querySelectorAll('.pulse-animation, .bounce-in, .shimmer');
            complexAnimations.forEach(el => {
                el.style.animation = 'none';
            });
        };

        // Monitor performance and adjust
        if (this.performanceMetrics.frameRate < 20) {
            reduceAnimations();
        }
    }

    setupDOMOptimizations() {
        // Batch DOM operations
        let domQueue = [];
        let processingDOM = false;
        
        const processDOMQueue = () => {
            if (domQueue.length === 0) {
                processingDOM = false;
                return;
            }
            
            requestAnimationFrame(() => {
                const operations = domQueue.splice(0, 10); // Process 10 operations at a time
                operations.forEach(op => op());
                
                if (domQueue.length > 0) {
                    processDOMQueue();
                } else {
                    processingDOM = false;
                }
            });
        };
        
        window.batchDOMOperation = (operation) => {
            domQueue.push(operation);
            
            if (!processingDOM) {
                processingDOM = true;
                processDOMQueue();
            }
        };
    }

    setupRequestThrottling() {
        // Throttle expensive operations
        const throttledFunctions = new Map();
        
        window.throttle = (func, delay = 100) => {
            if (throttledFunctions.has(func)) {
                return throttledFunctions.get(func);
            }
            
            let timeoutId;
            const throttled = (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func(...args), delay);
            };
            
            throttledFunctions.set(func, throttled);
            return throttled;
        };
    }

    setupEventOptimizations() {
        // Use passive event listeners where possible
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            const passiveEvents = ['scroll', 'wheel', 'touchstart', 'touchmove'];
            
            if (passiveEvents.includes(type) && typeof options !== 'object') {
                options = { passive: true };
            } else if (typeof options === 'object' && options.passive === undefined) {
                options.passive = passiveEvents.includes(type);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
    }

    optimizeTimers() {
        // Reduce timer frequency for background tabs
        let isVisible = true;
        
        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
            
            if (!isVisible) {
                // Slow down timers when tab is not visible
                this.adjustTimerFrequency(0.5);
            } else {
                this.adjustTimerFrequency(1.0);
            }
        });
    }

    adjustTimerFrequency(multiplier) {
        // This would need to be implemented based on specific timer usage
        console.log(`Adjusting timer frequency by ${multiplier}x`);
    }

    setupServiceWorkerCaching() {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered for caching optimization');
        }).catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    }

    startMonitoring() {
        this.monitoring = true;
        
        setInterval(() => {
            this.updateMetrics();
            this.checkPerformance();
        }, 5000);
    }

    updateMetrics() {
        // Memory usage
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
        }

        // Frame rate estimation
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.performanceMetrics.frameRate = frameCount;
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (this.monitoring) {
                requestAnimationFrame(measureFPS);
            }
        };
        
        requestAnimationFrame(measureFPS);
    }

    checkPerformance() {
        const { memoryUsage, frameRate } = this.performanceMetrics;
        const { maxMemoryUsage, targetFPS } = this.hardwareProfile;
        
        // Memory pressure check
        if (memoryUsage > maxMemoryUsage * 0.9) {
            this.handleMemoryPressure();
        }
        
        // Frame rate check
        if (frameRate < targetFPS * 0.8) {
            this.handleLowFrameRate();
        }
        
        // Update UI with performance info
        this.updatePerformanceUI();
    }

    handleMemoryPressure() {
        console.warn('Memory pressure detected, applying emergency optimizations');
        
        // Clear caches
        if (window.app?.memoryOptimizer) {
            window.app.memoryOptimizer.emergencyCleanup();
        }
        
        // Reduce visual effects
        document.documentElement.classList.add('low-memory-mode');
        
        // Notify user
        if (window.app?.notificationSystem) {
            window.app.notificationSystem.warning(
                'Memory Usage High',
                'Performance optimizations have been applied'
            );
        }
    }

    handleLowFrameRate() {
        console.warn('Low frame rate detected, reducing visual complexity');
        
        // Disable animations
        document.documentElement.style.setProperty('--animation-duration', '0s');
        document.documentElement.style.setProperty('--transition-duration', '0s');
        
        // Reduce effects
        document.documentElement.classList.add('low-performance-mode');
    }

    updatePerformanceUI() {
        // Update status bar with performance info
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            let perfIndicator = statusBar.querySelector('.performance-indicator');
            
            if (!perfIndicator) {
                perfIndicator = document.createElement('div');
                perfIndicator.className = 'performance-indicator status-item';
                statusBar.appendChild(perfIndicator);
            }
            
            const memoryMB = Math.round(this.performanceMetrics.memoryUsage / 1024 / 1024);
            const memoryPercent = Math.round((this.performanceMetrics.memoryUsage / this.hardwareProfile.maxMemoryUsage) * 100);
            
            perfIndicator.innerHTML = `
                <span>📊</span>
                <span>${memoryMB}MB (${memoryPercent}%)</span>
            `;
            
            // Color coding based on usage
            if (memoryPercent > 80) {
                perfIndicator.style.color = 'var(--error)';
            } else if (memoryPercent > 60) {
                perfIndicator.style.color = 'var(--warning)';
            } else {
                perfIndicator.style.color = 'var(--success)';
            }
        }
    }

    // Public API
    getMetrics() {
        return { ...this.performanceMetrics };
    }

    getHardwareProfile() {
        return { ...this.hardwareProfile };
    }

    enableOptimization(name) {
        const optimization = this.optimizations.get(name);
        if (optimization) {
            optimization.enabled = true;
            optimization.apply();
        }
    }

    disableOptimization(name) {
        const optimization = this.optimizations.get(name);
        if (optimization) {
            optimization.enabled = false;
        }
    }

    getOptimizations() {
        return Array.from(this.optimizations.entries()).map(([name, opt]) => ({
            name,
            enabled: opt.enabled,
            description: opt.description
        }));
    }
}
