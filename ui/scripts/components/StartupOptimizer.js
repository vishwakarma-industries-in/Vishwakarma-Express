// Startup Optimizer - Phase 6 Performance Component
export class StartupOptimizer {
    constructor() {
        this.bootSequence = null;
        this.lazyLoader = null;
        this.preloader = null;
        this.criticalPath = null;
        this.startupMetrics = {
            startTime: performance.timeOrigin,
            phases: new Map(),
            loadTimes: new Map()
        };
        
        this.init();
    }

    async init() {
        console.log('Initializing Startup Optimizer...');
        
        this.createBootSequence();
        this.setupLazyLoader();
        this.initializePreloader();
        this.optimizeCriticalPath();
        this.measureStartupPerformance();
        
        console.log('Startup Optimizer ready - Fast boot sequence enabled');
    }

    createBootSequence() {
        this.bootSequence = {
            phases: [
                { name: 'core', priority: 1, required: true },
                { name: 'ui', priority: 2, required: true },
                { name: 'features', priority: 3, required: false },
                { name: 'extensions', priority: 4, required: false },
                { name: 'ai', priority: 5, required: false }
            ],
            
            currentPhase: 0,
            loadedModules: new Set(),
            
            start: async () => {
                const startTime = performance.now();
                this.startupMetrics.phases.set('boot_start', startTime);
                
                console.log('🚀 Starting Vishwakarma Express boot sequence...');
                
                // Load phases sequentially for critical, parallel for non-critical
                for (const phase of this.bootSequence.phases) {
                    const phaseStart = performance.now();
                    
                    try {
                        if (phase.required) {
                            await this.bootSequence.loadPhase(phase);
                        } else {
                            // Load non-critical phases in background
                            this.bootSequence.loadPhase(phase).catch(error => {
                                console.warn(`Non-critical phase ${phase.name} failed:`, error);
                            });
                        }
                        
                        const phaseTime = performance.now() - phaseStart;
                        this.startupMetrics.phases.set(phase.name, phaseTime);
                        
                        console.log(`✅ Phase ${phase.name} loaded in ${phaseTime.toFixed(2)}ms`);
                        
                    } catch (error) {
                        console.error(`❌ Critical phase ${phase.name} failed:`, error);
                        if (phase.required) {
                            throw error;
                        }
                    }
                }
                
                const totalTime = performance.now() - startTime;
                this.startupMetrics.phases.set('boot_total', totalTime);
                
                console.log(`🎉 Boot sequence completed in ${totalTime.toFixed(2)}ms`);
                return totalTime;
            },
            
            loadPhase: async (phase) => {
                switch (phase.name) {
                    case 'core':
                        return this.bootSequence.loadCore();
                    case 'ui':
                        return this.bootSequence.loadUI();
                    case 'features':
                        return this.bootSequence.loadFeatures();
                    case 'extensions':
                        return this.bootSequence.loadExtensions();
                    case 'ai':
                        return this.bootSequence.loadAI();
                    default:
                        throw new Error(`Unknown phase: ${phase.name}`);
                }
            },
            
            loadCore: async () => {
                // Load essential browser core
                const modules = [
                    'TabManager',
                    'NavigationManager',
                    'SecurityManager'
                ];
                
                return Promise.all(modules.map(module => 
                    this.bootSequence.loadModule(module)
                ));
            },
            
            loadUI: async () => {
                // Load UI components
                const modules = [
                    'UICustomization',
                    'KeyboardShortcuts',
                    'SettingsPanel'
                ];
                
                return Promise.all(modules.map(module => 
                    this.bootSequence.loadModule(module)
                ));
            },
            
            loadFeatures: async () => {
                // Load advanced features (can be deferred)
                const modules = [
                    'QuantumPerformance',
                    'NextGenDevTools',
                    'GamingMedia',
                    'Rendering3D'
                ];
                
                // Load one at a time to avoid memory pressure
                for (const module of modules) {
                    await this.bootSequence.loadModule(module);
                    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
                }
            },
            
            loadExtensions: async () => {
                // Load extension system
                return this.bootSequence.loadModule('UniversalExtensions');
            },
            
            loadAI: async () => {
                // Load AI components
                const modules = [
                    'MultiModelAI',
                    'ScriptingEngine'
                ];
                
                return Promise.all(modules.map(module => 
                    this.bootSequence.loadModule(module)
                ));
            },
            
            loadModule: async (moduleName) => {
                if (this.bootSequence.loadedModules.has(moduleName)) {
                    return; // Already loaded
                }
                
                const moduleStart = performance.now();
                
                try {
                    // Simulate module loading (in real implementation, would import actual modules)
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
                    
                    this.bootSequence.loadedModules.add(moduleName);
                    
                    const loadTime = performance.now() - moduleStart;
                    this.startupMetrics.loadTimes.set(moduleName, loadTime);
                    
                    console.log(`  📦 ${moduleName} loaded in ${loadTime.toFixed(2)}ms`);
                    
                } catch (error) {
                    console.error(`Failed to load module ${moduleName}:`, error);
                    throw error;
                }
            }
        };
    }

    setupLazyLoader() {
        this.lazyLoader = {
            pendingModules: new Map(),
            loadedModules: new Set(),
            
            register: (moduleName, loader, trigger = 'idle') => {
                this.lazyLoader.pendingModules.set(moduleName, {
                    loader,
                    trigger,
                    loaded: false
                });
                
                // Set up trigger
                switch (trigger) {
                    case 'idle':
                        this.lazyLoader.scheduleIdleLoad(moduleName);
                        break;
                    case 'interaction':
                        this.lazyLoader.scheduleInteractionLoad(moduleName);
                        break;
                    case 'viewport':
                        this.lazyLoader.scheduleViewportLoad(moduleName);
                        break;
                    case 'timer':
                        this.lazyLoader.scheduleTimerLoad(moduleName, 5000); // 5 second delay
                        break;
                }
            },
            
            scheduleIdleLoad: (moduleName) => {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => {
                        this.lazyLoader.loadModule(moduleName);
                    }, { timeout: 10000 });
                } else {
                    // Fallback for browsers without requestIdleCallback
                    setTimeout(() => {
                        this.lazyLoader.loadModule(moduleName);
                    }, 100);
                }
            },
            
            scheduleInteractionLoad: (moduleName) => {
                const events = ['click', 'keydown', 'scroll', 'touchstart'];
                
                const loadOnInteraction = () => {
                    this.lazyLoader.loadModule(moduleName);
                    events.forEach(event => {
                        document.removeEventListener(event, loadOnInteraction);
                    });
                };
                
                events.forEach(event => {
                    document.addEventListener(event, loadOnInteraction, { once: true, passive: true });
                });
            },
            
            scheduleViewportLoad: (moduleName) => {
                if ('IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                this.lazyLoader.loadModule(moduleName);
                                observer.disconnect();
                            }
                        });
                    });
                    
                    // Observe a trigger element (could be a placeholder)
                    const triggerElement = document.querySelector(`[data-lazy-module="${moduleName}"]`);
                    if (triggerElement) {
                        observer.observe(triggerElement);
                    }
                }
            },
            
            scheduleTimerLoad: (moduleName, delay) => {
                setTimeout(() => {
                    this.lazyLoader.loadModule(moduleName);
                }, delay);
            },
            
            loadModule: async (moduleName) => {
                const module = this.lazyLoader.pendingModules.get(moduleName);
                if (!module || module.loaded) return;
                
                const loadStart = performance.now();
                
                try {
                    console.log(`🔄 Lazy loading ${moduleName}...`);
                    
                    await module.loader();
                    module.loaded = true;
                    this.lazyLoader.loadedModules.add(moduleName);
                    
                    const loadTime = performance.now() - loadStart;
                    console.log(`✅ ${moduleName} lazy loaded in ${loadTime.toFixed(2)}ms`);
                    
                } catch (error) {
                    console.error(`❌ Failed to lazy load ${moduleName}:`, error);
                }
            },
            
            preloadModule: (moduleName) => {
                // Force load a module before its trigger
                return this.lazyLoader.loadModule(moduleName);
            }
        };
        
        // Register common lazy-loaded modules
        this.registerLazyModules();
    }

    registerLazyModules() {
        // Terminal and File Manager - load on first use
        this.lazyLoader.register('TerminalFileManager', async () => {
            const { TerminalFileManager } = await import('./TerminalFileManager.js');
            window.app.terminalFileManager = new TerminalFileManager();
        }, 'interaction');
        
        // 3D Rendering - load when needed
        this.lazyLoader.register('Rendering3D', async () => {
            const { Rendering3D } = await import('./Rendering3D.js');
            window.app.rendering3D = new Rendering3D();
        }, 'idle');
        
        // Gaming Media - load on user interaction
        this.lazyLoader.register('GamingMedia', async () => {
            const { GamingMedia } = await import('./GamingMedia.js');
            window.app.gamingMedia = new GamingMedia();
        }, 'interaction');
        
        // Testing Suite - load when developer tools are opened
        this.lazyLoader.register('TestingSuite', async () => {
            const { TestingSuite } = await import('./TestingSuite.js');
            window.app.testingSuite = new TestingSuite();
        }, 'timer');
    }

    initializePreloader() {
        this.preloader = {
            criticalResources: [
                '/ui/styles/main.css',
                '/ui/styles/components.css',
                '/ui/scripts/main.js'
            ],
            
            preloadedResources: new Set(),
            
            preloadCritical: () => {
                this.preloader.criticalResources.forEach(resource => {
                    this.preloader.preloadResource(resource, 'high');
                });
            },
            
            preloadResource: (url, priority = 'low') => {
                if (this.preloader.preloadedResources.has(url)) return;
                
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = url;
                
                // Determine resource type
                if (url.endsWith('.css')) {
                    link.as = 'style';
                } else if (url.endsWith('.js')) {
                    link.as = 'script';
                } else if (url.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
                    link.as = 'image';
                } else if (url.match(/\.(woff|woff2|ttf|otf)$/)) {
                    link.as = 'font';
                    link.crossOrigin = 'anonymous';
                }
                
                // Set priority
                if (priority === 'high') {
                    link.fetchPriority = 'high';
                }
                
                document.head.appendChild(link);
                this.preloader.preloadedResources.add(url);
                
                console.log(`🔗 Preloading ${url} with ${priority} priority`);
            },
            
            preloadFonts: () => {
                const fonts = [
                    '/ui/fonts/inter-regular.woff2',
                    '/ui/fonts/inter-medium.woff2',
                    '/ui/fonts/fira-code.woff2'
                ];
                
                fonts.forEach(font => {
                    this.preloader.preloadResource(font, 'high');
                });
            },
            
            preloadImages: () => {
                const images = document.querySelectorAll('img[data-preload]');
                images.forEach(img => {
                    this.preloader.preloadResource(img.dataset.src || img.src);
                });
            }
        };
        
        // Start preloading critical resources
        this.preloader.preloadCritical();
        this.preloader.preloadFonts();
    }

    optimizeCriticalPath() {
        this.criticalPath = {
            // Inline critical CSS
            inlineCriticalCSS: () => {
                const criticalCSS = `
                    /* Critical rendering path CSS */
                    body { 
                        margin: 0; 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: var(--bg-primary, #ffffff);
                        color: var(--text-primary, #333333);
                    }
                    .loading-screen {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                    }
                    .loading-spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid rgba(255,255,255,0.3);
                        border-top: 4px solid white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                
                const style = document.createElement('style');
                style.textContent = criticalCSS;
                document.head.insertBefore(style, document.head.firstChild);
            },
            
            // Defer non-critical JavaScript
            deferNonCriticalJS: () => {
                const scripts = document.querySelectorAll('script[src]');
                scripts.forEach(script => {
                    if (!script.hasAttribute('data-critical')) {
                        script.defer = true;
                    }
                });
            },
            
            // Optimize resource hints
            addResourceHints: () => {
                // DNS prefetch for external resources
                const dnsPrefetch = [
                    'https://fonts.googleapis.com',
                    'https://api.gemini.google.com'
                ];
                
                dnsPrefetch.forEach(domain => {
                    const link = document.createElement('link');
                    link.rel = 'dns-prefetch';
                    link.href = domain;
                    document.head.appendChild(link);
                });
                
                // Preconnect to critical origins
                const preconnect = [
                    'https://fonts.gstatic.com'
                ];
                
                preconnect.forEach(origin => {
                    const link = document.createElement('link');
                    link.rel = 'preconnect';
                    link.href = origin;
                    link.crossOrigin = 'anonymous';
                    document.head.appendChild(link);
                });
            },
            
            // Show loading screen immediately
            showLoadingScreen: () => {
                const loadingScreen = document.createElement('div');
                loadingScreen.className = 'loading-screen';
                loadingScreen.innerHTML = `
                    <div style="text-align: center; color: white;">
                        <div class="loading-spinner"></div>
                        <h2 style="margin-top: 20px; font-weight: 300;">Vishwakarma Express</h2>
                        <p style="opacity: 0.8;">Loading revolutionary browser experience...</p>
                    </div>
                `;
                
                document.body.appendChild(loadingScreen);
                
                return loadingScreen;
            },
            
            hideLoadingScreen: (loadingScreen) => {
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    loadingScreen.style.transition = 'opacity 0.5s ease';
                    
                    setTimeout(() => {
                        if (loadingScreen.parentNode) {
                            loadingScreen.parentNode.removeChild(loadingScreen);
                        }
                    }, 500);
                }
            }
        };
        
        // Apply critical path optimizations
        this.criticalPath.inlineCriticalCSS();
        this.criticalPath.deferNonCriticalJS();
        this.criticalPath.addResourceHints();
    }

    measureStartupPerformance() {
        // Measure key startup metrics
        const measurePerformance = () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            if (navigation) {
                const metrics = {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    firstPaint: 0,
                    firstContentfulPaint: 0,
                    largestContentfulPaint: 0
                };
                
                // Get paint metrics
                const paintEntries = performance.getEntriesByType('paint');
                paintEntries.forEach(entry => {
                    if (entry.name === 'first-paint') {
                        metrics.firstPaint = entry.startTime;
                    } else if (entry.name === 'first-contentful-paint') {
                        metrics.firstContentfulPaint = entry.startTime;
                    }
                });
                
                // Get LCP if available
                if ('PerformanceObserver' in window) {
                    const observer = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        metrics.largestContentfulPaint = lastEntry.startTime;
                    });
                    
                    observer.observe({ entryTypes: ['largest-contentful-paint'] });
                }
                
                this.startupMetrics.webVitals = metrics;
                console.log('📊 Startup Performance Metrics:', metrics);
            }
        };
        
        // Measure when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', measurePerformance);
        } else {
            measurePerformance();
        }
    }

    // Public API
    async startBoot() {
        const loadingScreen = this.criticalPath.showLoadingScreen();
        
        try {
            const bootTime = await this.bootSequence.start();
            
            // Hide loading screen after successful boot
            setTimeout(() => {
                this.criticalPath.hideLoadingScreen(loadingScreen);
            }, 500);
            
            return bootTime;
        } catch (error) {
            console.error('Boot sequence failed:', error);
            
            // Show error screen
            loadingScreen.innerHTML = `
                <div style="text-align: center; color: white;">
                    <h2>⚠️ Startup Error</h2>
                    <p>Failed to initialize Vishwakarma Express</p>
                    <button onclick="location.reload()" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Retry</button>
                </div>
            `;
            
            throw error;
        }
    }

    preloadModule(moduleName) {
        return this.lazyLoader.preloadModule(moduleName);
    }

    getStartupMetrics() {
        return {
            ...this.startupMetrics,
            loadedModules: Array.from(this.bootSequence.loadedModules),
            lazyModules: Array.from(this.lazyLoader.loadedModules)
        };
    }

    optimizeForE6440() {
        // Dell E6440 specific startup optimizations
        console.log('🔧 Applying Dell E6440 startup optimizations...');
        
        // Reduce initial memory footprint
        this.bootSequence.phases = this.bootSequence.phases.map(phase => ({
            ...phase,
            required: phase.name === 'core' || phase.name === 'ui'
        }));
        
        // Increase lazy loading delays for slower hardware
        this.lazyLoader.scheduleTimerLoad = (moduleName, delay) => {
            setTimeout(() => {
                this.lazyLoader.loadModule(moduleName);
            }, delay * 1.5); // 50% longer delays
        };
        
        console.log('✅ E6440 optimizations applied');
    }
}
