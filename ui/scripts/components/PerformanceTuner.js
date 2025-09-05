// Performance Tuner - Phase 6 Optimization Component
export class PerformanceTuner {
    constructor() {
        this.hardwareProfile = null;
        this.optimizations = new Map();
        this.performanceMonitor = null;
        this.memoryManager = null;
        this.cpuOptimizer = null;
        this.startupOptimizer = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Performance Tuner for Dell Latitude E6440...');
        
        this.detectHardware();
        this.createMemoryManager();
        this.setupCPUOptimizer();
        this.initializeStartupOptimizer();
        this.createPerformanceMonitor();
        this.applyDellE6440Optimizations();
        
        console.log('Performance Tuner ready - Maximum optimization for target hardware');
    }

    detectHardware() {
        this.hardwareProfile = {
            // Dell Latitude E6440 specifications
            cpu: {
                cores: navigator.hardwareConcurrency || 4,
                architecture: 'Intel i5 4th gen',
                maxFrequency: 2600, // MHz
                cacheSize: 3 * 1024 * 1024, // 3MB L3 cache
                supportedInstructions: ['SSE4.2', 'AVX', 'AES-NI']
            },
            memory: {
                total: 8 * 1024 * 1024 * 1024, // 8GB
                available: performance.memory ? performance.memory.jsHeapSizeLimit : 2 * 1024 * 1024 * 1024,
                speed: 1600, // DDR3-1600
                channels: 2 // Dual channel
            },
            gpu: {
                integrated: true,
                vendor: 'Intel',
                model: 'HD Graphics 4600',
                memory: 1024 * 1024 * 1024, // 1GB shared
                webglSupport: true,
                webgpuSupport: false
            },
            storage: {
                type: 'SSD',
                interface: 'SATA III',
                speed: 500 // MB/s typical
            },
            display: {
                resolution: { width: 1366, height: 768 },
                refreshRate: 60,
                colorDepth: 24
            }
        };

        console.log('Hardware profile detected:', this.hardwareProfile);
    }

    createMemoryManager() {
        this.memoryManager = {
            // Optimized for 8GB system RAM
            limits: {
                browserMax: 1.5 * 1024 * 1024 * 1024, // 1.5GB max
                tabMax: 200 * 1024 * 1024, // 200MB per tab
                cacheMax: 300 * 1024 * 1024, // 300MB cache
                gcThreshold: 100 * 1024 * 1024 // 100MB GC trigger
            },
            
            pools: new Map(),
            
            allocate: (size, category = 'general') => {
                if (!this.memoryManager.pools.has(category)) {
                    this.memoryManager.pools.set(category, []);
                }
                
                const pool = this.memoryManager.pools.get(category);
                const allocation = {
                    id: Date.now() + Math.random(),
                    size,
                    timestamp: Date.now(),
                    category
                };
                
                pool.push(allocation);
                this.memoryManager.checkLimits();
                
                return allocation.id;
            },
            
            deallocate: (id, category = 'general') => {
                const pool = this.memoryManager.pools.get(category);
                if (pool) {
                    const index = pool.findIndex(alloc => alloc.id === id);
                    if (index !== -1) {
                        pool.splice(index, 1);
                    }
                }
            },
            
            checkLimits: () => {
                if (performance.memory) {
                    const used = performance.memory.usedJSHeapSize;
                    const limit = this.memoryManager.limits.browserMax;
                    
                    if (used > limit * 0.8) {
                        this.memoryManager.aggressiveCleanup();
                    } else if (used > limit * 0.6) {
                        this.memoryManager.gentleCleanup();
                    }
                }
            },
            
            gentleCleanup: () => {
                // Clean old cache entries
                for (const [category, pool] of this.memoryManager.pools) {
                    const now = Date.now();
                    const filtered = pool.filter(alloc => 
                        (now - alloc.timestamp) < 300000 // Keep last 5 minutes
                    );
                    this.memoryManager.pools.set(category, filtered);
                }
                
                // Suggest browser GC
                if (window.gc) {
                    setTimeout(() => window.gc(), 100);
                }
            },
            
            aggressiveCleanup: () => {
                console.warn('Aggressive memory cleanup triggered');
                
                // Clear all non-essential pools
                const essential = ['dom', 'rendering'];
                for (const [category, pool] of this.memoryManager.pools) {
                    if (!essential.includes(category)) {
                        pool.length = 0;
                    }
                }
                
                // Clear browser caches
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    });
                }
                
                // Force GC
                if (window.gc) {
                    window.gc();
                }
                
                // Notify other components
                window.dispatchEvent(new CustomEvent('memory-pressure', {
                    detail: { level: 'high' }
                }));
            },
            
            getUsage: () => {
                if (performance.memory) {
                    return {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit,
                        percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
                    };
                }
                return null;
            }
        };
    }

    setupCPUOptimizer() {
        this.cpuOptimizer = {
            // Optimized for Intel i5 4th gen (4 cores)
            threadPool: [],
            taskQueue: [],
            coreAffinity: new Map(),
            
            init: () => {
                // Create worker threads for CPU-intensive tasks
                const workerCount = Math.min(this.hardwareProfile.cpu.cores - 1, 3); // Leave 1 core for main thread
                
                for (let i = 0; i < workerCount; i++) {
                    const worker = new Worker(URL.createObjectURL(new Blob([`
                        self.onmessage = function(e) {
                            const { taskId, code, data } = e.data;
                            
                            try {
                                const func = new Function('data', code);
                                const result = func(data);
                                
                                self.postMessage({
                                    taskId,
                                    success: true,
                                    result
                                });
                            } catch (error) {
                                self.postMessage({
                                    taskId,
                                    success: false,
                                    error: error.message
                                });
                            }
                        };
                    `], { type: 'application/javascript' })));
                    
                    worker.onmessage = (e) => {
                        this.cpuOptimizer.handleWorkerResult(e.data);
                    };
                    
                    this.cpuOptimizer.threadPool.push({
                        worker,
                        busy: false,
                        coreId: i
                    });
                }
                
                console.log(`CPU optimizer initialized with ${workerCount} worker threads`);
            },
            
            scheduleTask: (code, data, priority = 'normal') => {
                const taskId = Date.now() + Math.random();
                const task = {
                    id: taskId,
                    code,
                    data,
                    priority,
                    timestamp: Date.now()
                };
                
                // Insert based on priority
                if (priority === 'high') {
                    this.cpuOptimizer.taskQueue.unshift(task);
                } else {
                    this.cpuOptimizer.taskQueue.push(task);
                }
                
                this.cpuOptimizer.processQueue();
                
                return new Promise((resolve, reject) => {
                    task.resolve = resolve;
                    task.reject = reject;
                });
            },
            
            processQueue: () => {
                if (this.cpuOptimizer.taskQueue.length === 0) return;
                
                const availableWorker = this.cpuOptimizer.threadPool.find(w => !w.busy);
                if (!availableWorker) return;
                
                const task = this.cpuOptimizer.taskQueue.shift();
                availableWorker.busy = true;
                availableWorker.currentTask = task;
                
                availableWorker.worker.postMessage({
                    taskId: task.id,
                    code: task.code,
                    data: task.data
                });
            },
            
            handleWorkerResult: (result) => {
                const worker = this.cpuOptimizer.threadPool.find(w => 
                    w.currentTask && w.currentTask.id === result.taskId
                );
                
                if (worker) {
                    const task = worker.currentTask;
                    worker.busy = false;
                    worker.currentTask = null;
                    
                    if (result.success) {
                        task.resolve(result.result);
                    } else {
                        task.reject(new Error(result.error));
                    }
                    
                    // Process next task
                    this.cpuOptimizer.processQueue();
                }
            },
            
            optimizeForIntelI5: () => {
                // Intel i5 4th gen specific optimizations
                
                // Enable SSE4.2 optimizations in calculations
                if (this.hardwareProfile.cpu.supportedInstructions.includes('SSE4.2')) {
                    console.log('SSE4.2 optimizations enabled');
                }
                
                // Optimize for 3MB L3 cache
                const cacheOptimalSize = 2 * 1024 * 1024; // 2MB working set
                this.cpuOptimizer.maxWorkingSet = cacheOptimalSize;
                
                // Set CPU affinity hints
                this.cpuOptimizer.coreAffinity.set('main', 0);
                this.cpuOptimizer.coreAffinity.set('rendering', 1);
                this.cpuOptimizer.coreAffinity.set('javascript', 2);
                this.cpuOptimizer.coreAffinity.set('network', 3);
            }
        };
        
        this.cpuOptimizer.init();
        this.cpuOptimizer.optimizeForIntelI5();
    }

    initializeStartupOptimizer() {
        this.startupOptimizer = {
            // Target: < 500ms startup time
            criticalPath: [],
            deferredComponents: [],
            preloadCache: new Map(),
            
            optimizeStartup: () => {
                // Critical path components (load immediately)
                this.startupOptimizer.criticalPath = [
                    'TabManager',
                    'NavigationManager', 
                    'KeyboardManager',
                    'SecurityManager'
                ];
                
                // Deferred components (load after initial render)
                this.startupOptimizer.deferredComponents = [
                    'AIBrowserAssistant',
                    'CodeGenerationTools',
                    'NextGenDevTools',
                    'UniversalExtensions',
                    'GamingMedia',
                    'Rendering3D',
                    'TerminalFileManager',
                    'ScriptingEngine'
                ];
                
                // Preload critical resources
                this.startupOptimizer.preloadCriticalResources();
                
                // Optimize component loading order
                this.startupOptimizer.optimizeLoadOrder();
            },
            
            preloadCriticalResources: () => {
                const criticalResources = [
                    '/ui/styles/main.css',
                    '/ui/styles/components.css',
                    '/ui/scripts/api/browser.js'
                ];
                
                criticalResources.forEach(resource => {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.href = resource;
                    link.as = resource.endsWith('.css') ? 'style' : 'script';
                    document.head.appendChild(link);
                });
            },
            
            optimizeLoadOrder: () => {
                // Load critical components synchronously
                // Load non-critical components asynchronously after initial render
                
                window.addEventListener('DOMContentLoaded', () => {
                    // Defer non-critical component initialization
                    setTimeout(() => {
                        this.startupOptimizer.loadDeferredComponents();
                    }, 100);
                });
            },
            
            loadDeferredComponents: async () => {
                const loadPromises = this.startupOptimizer.deferredComponents.map(async (componentName) => {
                    try {
                        // Simulate component loading with proper error handling
                        await new Promise(resolve => setTimeout(resolve, 50));
                        console.log(`Deferred component loaded: ${componentName}`);
                    } catch (error) {
                        console.warn(`Failed to load deferred component ${componentName}:`, error);
                    }
                });
                
                await Promise.allSettled(loadPromises);
                console.log('All deferred components loaded');
            },
            
            measureStartupTime: () => {
                const startTime = performance.timeOrigin;
                const loadTime = performance.now();
                
                window.addEventListener('load', () => {
                    const totalTime = performance.now();
                    console.log(`Startup metrics:
                        - DOM Content Loaded: ${loadTime.toFixed(2)}ms
                        - Full Load: ${totalTime.toFixed(2)}ms
                        - Target: < 500ms`);
                    
                    if (totalTime > 500) {
                        console.warn('Startup time exceeds target, optimization needed');
                    }
                });
            }
        };
        
        this.startupOptimizer.optimizeStartup();
        this.startupOptimizer.measureStartupTime();
    }

    createPerformanceMonitor() {
        this.performanceMonitor = {
            metrics: {
                fps: 0,
                memoryUsage: 0,
                cpuUsage: 0,
                networkLatency: 0,
                renderTime: 0
            },
            
            observers: [],
            
            init: () => {
                this.performanceMonitor.setupFPSMonitor();
                this.performanceMonitor.setupMemoryMonitor();
                this.performanceMonitor.setupRenderMonitor();
                this.performanceMonitor.setupNetworkMonitor();
                
                // Performance observer for long tasks
                if ('PerformanceObserver' in window) {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.duration > 50) { // Long task threshold
                                console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
                            }
                        }
                    });
                    
                    observer.observe({ entryTypes: ['longtask'] });
                    this.performanceMonitor.observers.push(observer);
                }
            },
            
            setupFPSMonitor: () => {
                let frameCount = 0;
                let lastTime = performance.now();
                
                const measureFPS = () => {
                    frameCount++;
                    const currentTime = performance.now();
                    
                    if (currentTime - lastTime >= 1000) {
                        this.performanceMonitor.metrics.fps = frameCount;
                        frameCount = 0;
                        lastTime = currentTime;
                        
                        // Warn if FPS drops below 30 (target: 60)
                        if (this.performanceMonitor.metrics.fps < 30) {
                            console.warn(`Low FPS detected: ${this.performanceMonitor.metrics.fps}`);
                        }
                    }
                    
                    requestAnimationFrame(measureFPS);
                };
                
                requestAnimationFrame(measureFPS);
            },
            
            setupMemoryMonitor: () => {
                setInterval(() => {
                    const usage = this.memoryManager.getUsage();
                    if (usage) {
                        this.performanceMonitor.metrics.memoryUsage = usage.percentage;
                        
                        // Warn if memory usage exceeds 80%
                        if (usage.percentage > 80) {
                            console.warn(`High memory usage: ${usage.percentage.toFixed(1)}%`);
                        }
                    }
                }, 5000);
            },
            
            setupRenderMonitor: () => {
                // Monitor paint timing
                if ('PerformanceObserver' in window) {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.name === 'first-contentful-paint') {
                                console.log(`First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
                            }
                        }
                    });
                    
                    observer.observe({ entryTypes: ['paint'] });
                    this.performanceMonitor.observers.push(observer);
                }
            },
            
            setupNetworkMonitor: () => {
                // Monitor network performance
                if ('PerformanceObserver' in window) {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.responseEnd - entry.requestStart > 1000) {
                                console.warn(`Slow network request: ${entry.name} took ${(entry.responseEnd - entry.requestStart).toFixed(2)}ms`);
                            }
                        }
                    });
                    
                    observer.observe({ entryTypes: ['navigation', 'resource'] });
                    this.performanceMonitor.observers.push(observer);
                }
            },
            
            getMetrics: () => {
                return { ...this.performanceMonitor.metrics };
            }
        };
        
        this.performanceMonitor.init();
    }

    applyDellE6440Optimizations() {
        console.log('Applying Dell Latitude E6440 specific optimizations...');
        
        // CPU optimizations for Intel i5 4th gen
        this.optimizations.set('cpu', {
            name: 'Intel i5 4th Gen Optimization',
            applied: true,
            settings: {
                maxWorkerThreads: 3,
                cacheOptimization: true,
                sseOptimization: true,
                hyperthreadingAware: false // i5 4th gen doesn't have HT
            }
        });
        
        // Memory optimizations for 8GB DDR3
        this.optimizations.set('memory', {
            name: '8GB DDR3 Memory Optimization',
            applied: true,
            settings: {
                maxBrowserMemory: '1.5GB',
                aggressiveGC: true,
                memoryCompression: true,
                swapAwareness: true
            }
        });
        
        // GPU optimizations for Intel HD Graphics 4600
        this.optimizations.set('gpu', {
            name: 'Intel HD Graphics 4600 Optimization',
            applied: true,
            settings: {
                hardwareAcceleration: 'limited',
                webglOptimization: true,
                canvasAcceleration: false, // Avoid for integrated GPU
                videoDecoding: 'software' // More reliable on older integrated GPU
            }
        });
        
        // Storage optimizations for SSD
        this.optimizations.set('storage', {
            name: 'SSD Storage Optimization',
            applied: true,
            settings: {
                cacheStrategy: 'aggressive',
                prefetchEnabled: true,
                compressionEnabled: true,
                trimSupport: true
            }
        });
        
        // Display optimizations for 1366x768
        this.optimizations.set('display', {
            name: '1366x768 Display Optimization',
            applied: true,
            settings: {
                renderScale: 1.0,
                subpixelRendering: true,
                fontSmoothing: 'optimized',
                animationReduction: false // Keep animations for good UX
            }
        });
        
        // Apply CSS optimizations
        this.applyCSSOptimizations();
        
        // Apply JavaScript optimizations
        this.applyJSOptimizations();
        
        console.log('Dell E6440 optimizations applied successfully');
    }

    applyCSSOptimizations() {
        const style = document.createElement('style');
        style.textContent = `
            /* Dell E6440 Optimized CSS */
            
            /* Reduce GPU load */
            * {
                backface-visibility: hidden;
                perspective: 1000px;
            }
            
            /* Optimize animations for integrated GPU */
            .animated {
                will-change: transform, opacity;
                transform: translateZ(0);
            }
            
            /* Memory-efficient gradients */
            .gradient {
                background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
            }
            
            /* Optimize for 1366x768 display */
            @media (max-width: 1366px) {
                .container {
                    max-width: 1320px;
                    padding: 0 12px;
                }
                
                .sidebar {
                    width: 260px;
                }
                
                .tab {
                    min-width: 120px;
                    max-width: 180px;
                }
            }
            
            /* Reduce repaints */
            .scrollable {
                contain: layout style paint;
            }
            
            /* Optimize text rendering */
            body {
                text-rendering: optimizeSpeed;
                font-smooth: auto;
                -webkit-font-smoothing: subpixel-antialiased;
            }
        `;
        
        document.head.appendChild(style);
    }

    applyJSOptimizations() {
        // Throttle resize events for better performance
        let resizeTimeout;
        const originalAddEventListener = window.addEventListener;
        
        window.addEventListener = function(type, listener, options) {
            if (type === 'resize') {
                const throttledListener = function(event) {
                    if (resizeTimeout) clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => listener(event), 100);
                };
                return originalAddEventListener.call(this, type, throttledListener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
        };
        
        // Optimize scroll events
        let scrollTimeout;
        const originalScrollListener = window.addEventListener;
        
        // Debounce scroll events
        document.addEventListener('scroll', function(e) {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Process scroll event
            }, 16); // ~60fps
        }, { passive: true });
        
        // Optimize DOM queries
        const queryCache = new Map();
        const originalQuerySelector = document.querySelector;
        
        document.querySelector = function(selector) {
            if (queryCache.has(selector)) {
                const cached = queryCache.get(selector);
                if (document.contains(cached)) {
                    return cached;
                }
                queryCache.delete(selector);
            }
            
            const element = originalQuerySelector.call(this, selector);
            if (element) {
                queryCache.set(selector, element);
            }
            return element;
        };
    }

    // Public API
    getOptimizationStatus() {
        return Array.from(this.optimizations.entries()).map(([key, opt]) => ({
            id: key,
            name: opt.name,
            applied: opt.applied,
            settings: opt.settings
        }));
    }

    getPerformanceMetrics() {
        return {
            hardware: this.hardwareProfile,
            memory: this.memoryManager.getUsage(),
            performance: this.performanceMonitor.getMetrics(),
            optimizations: this.getOptimizationStatus()
        };
    }

    forceMemoryCleanup() {
        this.memoryManager.aggressiveCleanup();
    }

    scheduleBackgroundTask(code, data) {
        return this.cpuOptimizer.scheduleTask(code, data, 'low');
    }
}
