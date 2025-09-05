// UI Animations & Refinements - Phase 6 Polish Component
export class UIAnimations {
    constructor() {
        this.animationEngine = null;
        this.transitionManager = null;
        this.gestureHandler = null;
        this.microInteractions = null;
        this.performanceMode = 'smooth'; // smooth, balanced, performance
        
        this.init();
    }

    async init() {
        console.log('Initializing UI Animations & Refinements...');
        
        this.createAnimationEngine();
        this.setupTransitionManager();
        this.initializeGestureHandler();
        this.createMicroInteractions();
        this.applyGlassmorphismEffects();
        this.optimizeForHardware();
        
        console.log('UI Animations ready - Premium visual experience enabled');
    }

    createAnimationEngine() {
        this.animationEngine = {
            activeAnimations: new Map(),
            animationQueue: [],
            
            // Easing functions optimized for 60fps
            easing: {
                easeOutCubic: t => 1 - Math.pow(1 - t, 3),
                easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
                easeOutQuart: t => 1 - Math.pow(1 - t, 4),
                spring: (t, tension = 0.3, friction = 0.7) => {
                    return Math.pow(2, -10 * t) * Math.sin((t - tension / 4) * (2 * Math.PI) / tension) + 1;
                }
            },
            
            animate: (element, properties, options = {}) => {
                const animationId = Date.now() + Math.random();
                const duration = options.duration || 300;
                const easing = options.easing || 'easeOutCubic';
                const delay = options.delay || 0;
                
                const animation = {
                    id: animationId,
                    element,
                    properties,
                    duration,
                    easing,
                    delay,
                    startTime: null,
                    startValues: {},
                    endValues: properties,
                    onComplete: options.onComplete
                };
                
                // Store initial values
                for (const prop in properties) {
                    const computedStyle = getComputedStyle(element);
                    animation.startValues[prop] = this.parseValue(computedStyle.getPropertyValue(prop)) || 0;
                }
                
                this.animationEngine.activeAnimations.set(animationId, animation);
                
                if (delay > 0) {
                    setTimeout(() => this.animationEngine.startAnimation(animationId), delay);
                } else {
                    this.animationEngine.startAnimation(animationId);
                }
                
                return animationId;
            },
            
            startAnimation: (animationId) => {
                const animation = this.animationEngine.activeAnimations.get(animationId);
                if (!animation) return;
                
                animation.startTime = performance.now();
                this.animationEngine.runAnimation(animationId);
            },
            
            runAnimation: (animationId) => {
                const animation = this.animationEngine.activeAnimations.get(animationId);
                if (!animation) return;
                
                const currentTime = performance.now();
                const elapsed = currentTime - animation.startTime;
                const progress = Math.min(elapsed / animation.duration, 1);
                
                const easedProgress = this.animationEngine.easing[animation.easing](progress);
                
                // Apply interpolated values
                for (const prop in animation.properties) {
                    const startValue = animation.startValues[prop];
                    const endValue = animation.endValues[prop];
                    const currentValue = startValue + (endValue - startValue) * easedProgress;
                    
                    this.applyProperty(animation.element, prop, currentValue);
                }
                
                if (progress < 1) {
                    requestAnimationFrame(() => this.animationEngine.runAnimation(animationId));
                } else {
                    // Animation complete
                    this.animationEngine.activeAnimations.delete(animationId);
                    if (animation.onComplete) {
                        animation.onComplete();
                    }
                }
            },
            
            cancel: (animationId) => {
                this.animationEngine.activeAnimations.delete(animationId);
            },
            
            cancelAll: () => {
                this.animationEngine.activeAnimations.clear();
            }
        };
    }

    parseValue(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
        }
        return 0;
    }

    applyProperty(element, property, value) {
        switch (property) {
            case 'opacity':
                element.style.opacity = value;
                break;
            case 'translateX':
                element.style.transform = `translateX(${value}px)`;
                break;
            case 'translateY':
                element.style.transform = `translateY(${value}px)`;
                break;
            case 'scale':
                element.style.transform = `scale(${value})`;
                break;
            case 'rotate':
                element.style.transform = `rotate(${value}deg)`;
                break;
            case 'blur':
                element.style.filter = `blur(${value}px)`;
                break;
            default:
                element.style[property] = typeof value === 'number' ? `${value}px` : value;
        }
    }

    setupTransitionManager() {
        this.transitionManager = {
            // Page transitions
            pageTransition: (fromElement, toElement, type = 'slide') => {
                switch (type) {
                    case 'slide':
                        return this.transitionManager.slideTransition(fromElement, toElement);
                    case 'fade':
                        return this.transitionManager.fadeTransition(fromElement, toElement);
                    case 'zoom':
                        return this.transitionManager.zoomTransition(fromElement, toElement);
                    default:
                        return this.transitionManager.slideTransition(fromElement, toElement);
                }
            },
            
            slideTransition: async (fromElement, toElement) => {
                const containerWidth = fromElement.parentElement.offsetWidth;
                
                // Setup initial positions
                toElement.style.transform = `translateX(${containerWidth}px)`;
                toElement.style.opacity = '1';
                
                // Animate out current element
                this.animationEngine.animate(fromElement, {
                    translateX: -containerWidth,
                    opacity: 0.8
                }, { duration: 250, easing: 'easeInOutCubic' });
                
                // Animate in new element
                await new Promise(resolve => {
                    this.animationEngine.animate(toElement, {
                        translateX: 0,
                        opacity: 1
                    }, { 
                        duration: 250, 
                        easing: 'easeOutCubic',
                        delay: 50,
                        onComplete: resolve
                    });
                });
            },
            
            fadeTransition: async (fromElement, toElement) => {
                // Fade out current
                await new Promise(resolve => {
                    this.animationEngine.animate(fromElement, {
                        opacity: 0
                    }, { duration: 150, onComplete: resolve });
                });
                
                // Fade in new
                toElement.style.opacity = '0';
                this.animationEngine.animate(toElement, {
                    opacity: 1
                }, { duration: 200, easing: 'easeOutCubic' });
            },
            
            zoomTransition: async (fromElement, toElement) => {
                // Zoom out current
                this.animationEngine.animate(fromElement, {
                    scale: 0.95,
                    opacity: 0
                }, { duration: 200 });
                
                // Zoom in new
                toElement.style.transform = 'scale(1.05)';
                toElement.style.opacity = '0';
                
                await new Promise(resolve => {
                    this.animationEngine.animate(toElement, {
                        scale: 1,
                        opacity: 1
                    }, { 
                        duration: 250, 
                        easing: 'easeOutCubic',
                        delay: 100,
                        onComplete: resolve
                    });
                });
            },
            
            // Modal transitions
            showModal: (modalElement) => {
                const backdrop = modalElement.querySelector('.modal-backdrop');
                const content = modalElement.querySelector('.modal-content');
                
                modalElement.style.display = 'flex';
                backdrop.style.opacity = '0';
                content.style.transform = 'scale(0.9)';
                content.style.opacity = '0';
                
                // Animate backdrop
                this.animationEngine.animate(backdrop, {
                    opacity: 1
                }, { duration: 200 });
                
                // Animate content
                this.animationEngine.animate(content, {
                    scale: 1,
                    opacity: 1
                }, { duration: 250, easing: 'easeOutCubic', delay: 50 });
            },
            
            hideModal: (modalElement) => {
                const backdrop = modalElement.querySelector('.modal-backdrop');
                const content = modalElement.querySelector('.modal-content');
                
                // Animate content out
                this.animationEngine.animate(content, {
                    scale: 0.9,
                    opacity: 0
                }, { duration: 200 });
                
                // Animate backdrop out
                this.animationEngine.animate(backdrop, {
                    opacity: 0
                }, { 
                    duration: 250, 
                    delay: 50,
                    onComplete: () => {
                        modalElement.style.display = 'none';
                    }
                });
            }
        };
    }

    initializeGestureHandler() {
        this.gestureHandler = {
            touchStartX: 0,
            touchStartY: 0,
            touchEndX: 0,
            touchEndY: 0,
            
            init: () => {
                document.addEventListener('touchstart', this.gestureHandler.handleTouchStart, { passive: true });
                document.addEventListener('touchend', this.gestureHandler.handleTouchEnd, { passive: true });
                document.addEventListener('wheel', this.gestureHandler.handleWheel, { passive: false });
            },
            
            handleTouchStart: (e) => {
                this.gestureHandler.touchStartX = e.changedTouches[0].screenX;
                this.gestureHandler.touchStartY = e.changedTouches[0].screenY;
            },
            
            handleTouchEnd: (e) => {
                this.gestureHandler.touchEndX = e.changedTouches[0].screenX;
                this.gestureHandler.touchEndY = e.changedTouches[0].screenY;
                this.gestureHandler.handleGesture();
            },
            
            handleGesture: () => {
                const deltaX = this.gestureHandler.touchEndX - this.gestureHandler.touchStartX;
                const deltaY = this.gestureHandler.touchEndY - this.gestureHandler.touchStartY;
                const minSwipeDistance = 50;
                
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > minSwipeDistance) {
                        this.gestureHandler.onSwipeRight();
                    } else if (deltaX < -minSwipeDistance) {
                        this.gestureHandler.onSwipeLeft();
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > minSwipeDistance) {
                        this.gestureHandler.onSwipeDown();
                    } else if (deltaY < -minSwipeDistance) {
                        this.gestureHandler.onSwipeUp();
                    }
                }
            },
            
            onSwipeLeft: () => {
                // Navigate forward or switch to next tab
                if (window.app?.tabManager) {
                    window.app.tabManager.nextTab();
                }
            },
            
            onSwipeRight: () => {
                // Navigate back or switch to previous tab
                if (window.app?.tabManager) {
                    window.app.tabManager.previousTab();
                }
            },
            
            onSwipeUp: () => {
                // Show developer tools or command palette
                if (window.app?.nextGenDevTools) {
                    window.app.nextGenDevTools.showUI();
                }
            },
            
            onSwipeDown: () => {
                // Hide UI elements or show bookmarks
                if (window.app?.bookmarksManager) {
                    window.app.bookmarksManager.showUI();
                }
            },
            
            handleWheel: (e) => {
                // Smooth scrolling with momentum
                if (e.ctrlKey) {
                    e.preventDefault();
                    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
                    this.gestureHandler.handleZoom(zoomDelta);
                }
            },
            
            handleZoom: (delta) => {
                const currentZoom = parseFloat(document.body.style.zoom || '1');
                const newZoom = Math.max(0.5, Math.min(3, currentZoom + delta));
                
                this.animationEngine.animate(document.body, {
                    zoom: newZoom
                }, { duration: 150 });
            }
        };
        
        this.gestureHandler.init();
    }

    createMicroInteractions() {
        this.microInteractions = {
            // Button hover effects
            setupButtonEffects: () => {
                document.addEventListener('mouseover', (e) => {
                    if (e.target.matches('button, .btn')) {
                        this.microInteractions.buttonHover(e.target);
                    }
                });
                
                document.addEventListener('mouseout', (e) => {
                    if (e.target.matches('button, .btn')) {
                        this.microInteractions.buttonLeave(e.target);
                    }
                });
                
                document.addEventListener('mousedown', (e) => {
                    if (e.target.matches('button, .btn')) {
                        this.microInteractions.buttonPress(e.target);
                    }
                });
                
                document.addEventListener('mouseup', (e) => {
                    if (e.target.matches('button, .btn')) {
                        this.microInteractions.buttonRelease(e.target);
                    }
                });
            },
            
            buttonHover: (button) => {
                this.animationEngine.animate(button, {
                    scale: 1.02,
                    translateY: -1
                }, { duration: 150, easing: 'easeOutCubic' });
            },
            
            buttonLeave: (button) => {
                this.animationEngine.animate(button, {
                    scale: 1,
                    translateY: 0
                }, { duration: 150, easing: 'easeOutCubic' });
            },
            
            buttonPress: (button) => {
                this.animationEngine.animate(button, {
                    scale: 0.98
                }, { duration: 100 });
            },
            
            buttonRelease: (button) => {
                this.animationEngine.animate(button, {
                    scale: 1.02
                }, { duration: 100 });
            },
            
            // Loading animations
            showLoading: (element) => {
                const spinner = document.createElement('div');
                spinner.className = 'loading-spinner';
                spinner.innerHTML = `
                    <div class="spinner-ring"></div>
                `;
                
                element.appendChild(spinner);
                
                this.animationEngine.animate(spinner, {
                    opacity: 1
                }, { duration: 200 });
            },
            
            hideLoading: (element) => {
                const spinner = element.querySelector('.loading-spinner');
                if (spinner) {
                    this.animationEngine.animate(spinner, {
                        opacity: 0
                    }, { 
                        duration: 200,
                        onComplete: () => spinner.remove()
                    });
                }
            },
            
            // Tab switching animations
            switchTab: (fromTab, toTab) => {
                // Animate tab indicators
                this.animationEngine.animate(fromTab, {
                    opacity: 0.7,
                    scale: 0.95
                }, { duration: 150 });
                
                this.animationEngine.animate(toTab, {
                    opacity: 1,
                    scale: 1
                }, { duration: 200, easing: 'easeOutCubic' });
            },
            
            // Notification animations
            showNotification: (notification) => {
                notification.style.transform = 'translateX(100%)';
                notification.style.opacity = '0';
                
                this.animationEngine.animate(notification, {
                    translateX: 0,
                    opacity: 1
                }, { duration: 300, easing: 'easeOutCubic' });
                
                // Auto-hide after 3 seconds
                setTimeout(() => {
                    this.microInteractions.hideNotification(notification);
                }, 3000);
            },
            
            hideNotification: (notification) => {
                this.animationEngine.animate(notification, {
                    translateX: 100,
                    opacity: 0
                }, { 
                    duration: 250,
                    onComplete: () => notification.remove()
                });
            }
        };
        
        this.microInteractions.setupButtonEffects();
    }

    applyGlassmorphismEffects() {
        const style = document.createElement('style');
        style.textContent = `
            /* Glassmorphism Effects */
            .glass {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            .glass-dark {
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            /* Premium button styles */
            .btn-premium {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                color: var(--text-primary);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .btn-premium:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
                border-color: rgba(255, 255, 255, 0.4);
                transform: translateY(-2px);
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
            }
            
            /* Loading spinner */
            .loading-spinner {
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
            }
            
            .spinner-ring {
                width: 24px;
                height: 24px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid var(--accent-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Smooth transitions */
            .smooth-transition {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Hover effects */
            .hover-lift:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            }
            
            /* Focus effects */
            .focus-ring:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
            }
            
            /* Notification styles */
            .notification {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 12px;
                padding: 16px 20px;
                margin: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                border-left: 4px solid var(--accent-color);
            }
            
            /* Tab animations */
            .tab-content {
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .tab-content.active {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        
        document.head.appendChild(style);
    }

    optimizeForHardware() {
        // Detect hardware capabilities and adjust animation quality
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            // No WebGL support, reduce animations
            this.performanceMode = 'performance';
        } else {
            const renderer = gl.getParameter(gl.RENDERER);
            if (renderer.includes('Intel HD Graphics 4600')) {
                // Dell E6440 integrated graphics detected
                this.performanceMode = 'balanced';
            }
        }
        
        // Apply performance mode settings
        switch (this.performanceMode) {
            case 'performance':
                this.disableExpensiveAnimations();
                break;
            case 'balanced':
                this.optimizeForIntegratedGPU();
                break;
            case 'smooth':
                // Full animation quality
                break;
        }
        
        console.log(`Animation performance mode: ${this.performanceMode}`);
    }

    disableExpensiveAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            /* Performance mode - reduced animations */
            * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            
            .glass {
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }
            
            .blur-effect {
                filter: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    optimizeForIntegratedGPU() {
        const style = document.createElement('style');
        style.textContent = `
            /* Balanced mode - optimized for Intel HD Graphics 4600 */
            .glass {
                backdrop-filter: blur(5px) !important;
                -webkit-backdrop-filter: blur(5px) !important;
            }
            
            .animated {
                will-change: transform, opacity;
                transform: translateZ(0);
            }
            
            /* Reduce shadow complexity */
            .shadow {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Public API
    animate(element, properties, options) {
        return this.animationEngine.animate(element, properties, options);
    }

    showModal(modalElement) {
        this.transitionManager.showModal(modalElement);
    }

    hideModal(modalElement) {
        this.transitionManager.hideModal(modalElement);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        this.microInteractions.showNotification(notification);
        
        return notification;
    }

    setPerformanceMode(mode) {
        this.performanceMode = mode;
        this.optimizeForHardware();
    }
}
