// UI Enhancement System
export class UIEnhancer {
    constructor() {
        this.animations = new Map();
        this.themes = new Map();
        this.activeTheme = 'dark';
        this.reducedMotion = false;
        
        this.init();
    }

    async init() {
        console.log('Initializing UI Enhancer...');
        
        this.detectUserPreferences();
        this.setupThemes();
        this.createEnhancedStyles();
        this.addInteractionEffects();
        this.setupKeyboardShortcuts();
        
        console.log('UI Enhancer ready');
    }

    detectUserPreferences() {
        // Detect reduced motion preference
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Detect color scheme preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.activeTheme = prefersDark ? 'dark' : 'light';
        
        // Listen for changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.reducedMotion = e.matches;
            this.updateAnimations();
        });
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.activeTheme = e.matches ? 'dark' : 'light';
            this.applyTheme(this.activeTheme);
        });
    }

    setupThemes() {
        // Dark theme (default)
        this.themes.set('dark', {
            name: 'Dark',
            colors: {
                primary: '#ff6a00',
                primaryHover: '#e55a00',
                background: '#0f0f0f',
                surface: '#1a1a1a',
                surfaceVariant: '#262626',
                textPrimary: '#ffffff',
                textSecondary: '#b3b3b3',
                textTertiary: '#666666',
                border: '#333333',
                accent: '#00d4ff',
                success: '#00ff88',
                warning: '#ffaa00',
                error: '#ff4444',
                info: '#0099ff'
            }
        });

        // Light theme
        this.themes.set('light', {
            name: 'Light',
            colors: {
                primary: '#ff6a00',
                primaryHover: '#e55a00',
                background: '#ffffff',
                surface: '#f8f9fa',
                surfaceVariant: '#e9ecef',
                textPrimary: '#212529',
                textSecondary: '#6c757d',
                textTertiary: '#adb5bd',
                border: '#dee2e6',
                accent: '#0066cc',
                success: '#28a745',
                warning: '#ffc107',
                error: '#dc3545',
                info: '#17a2b8'
            }
        });

        // High contrast theme
        this.themes.set('high-contrast', {
            name: 'High Contrast',
            colors: {
                primary: '#ffff00',
                primaryHover: '#cccc00',
                background: '#000000',
                surface: '#000000',
                surfaceVariant: '#333333',
                textPrimary: '#ffffff',
                textSecondary: '#ffffff',
                textTertiary: '#cccccc',
                border: '#ffffff',
                accent: '#00ffff',
                success: '#00ff00',
                warning: '#ffff00',
                error: '#ff0000',
                info: '#00ffff'
            }
        });

        // Apply initial theme
        this.applyTheme(this.activeTheme);
    }

    applyTheme(themeName) {
        const theme = this.themes.get(themeName);
        if (!theme) return;

        const root = document.documentElement;
        
        // Apply color variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            root.style.setProperty(`--${cssVar}`, value);
        });

        this.activeTheme = themeName;
        
        // Notify other components
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeName, colors: theme.colors }
        }));
    }

    createEnhancedStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced UI Styles */
            .ui-enhanced {
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .glass-effect {
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .hover-lift {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .hover-lift:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .pulse-animation {
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }

            .fade-in {
                animation: fadeIn 0.3s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .slide-in-right {
                animation: slideInRight 0.3s ease-out;
            }

            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }

            .bounce-in {
                animation: bounceIn 0.5s ease-out;
            }

            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }

            /* Enhanced focus styles */
            .focus-ring:focus-visible {
                outline: 2px solid var(--accent);
                outline-offset: 2px;
                border-radius: 4px;
            }

            /* Smooth scrolling */
            .smooth-scroll {
                scroll-behavior: smooth;
            }

            /* Custom scrollbar */
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
                background: var(--surface-variant);
                border-radius: 4px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: var(--text-tertiary);
                border-radius: 4px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: var(--text-secondary);
            }

            /* Loading shimmer effect */
            .shimmer {
                background: linear-gradient(90deg, 
                    var(--surface) 25%, 
                    var(--surface-variant) 50%, 
                    var(--surface) 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }

            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            /* Glow effects */
            .glow-primary {
                box-shadow: 0 0 20px rgba(255, 106, 0, 0.3);
            }

            .glow-accent {
                box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
            }

            /* Micro-interactions */
            .micro-bounce:active {
                transform: scale(0.95);
            }

            .micro-rotate:hover {
                transform: rotate(5deg);
            }

            /* Gradient backgrounds */
            .gradient-primary {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
            }

            .gradient-accent {
                background: linear-gradient(135deg, var(--accent) 0%, var(--info) 100%);
            }

            /* Text effects */
            .text-gradient {
                background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            /* Reduced motion overrides */
            @media (prefers-reduced-motion: reduce) {
                .ui-enhanced,
                .hover-lift,
                .pulse-animation,
                .fade-in,
                .slide-in-right,
                .bounce-in,
                .shimmer {
                    animation: none !important;
                    transition: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    addInteractionEffects() {
        // Add hover effects to buttons
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('button, .btn')) {
                this.addHoverEffect(e.target);
            }
        });

        // Add click ripple effect
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, .nav-button')) {
                this.addRippleEffect(e.target, e);
            }
        });

        // Add focus effects
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('button, input, textarea, select')) {
                e.target.classList.add('focus-ring');
            }
        });

        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('focus-ring');
        });
    }

    addHoverEffect(element) {
        if (this.reducedMotion) return;
        
        element.classList.add('hover-lift');
    }

    addRippleEffect(element, event) {
        if (this.reducedMotion) return;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Theme switching shortcuts
            if (e.ctrlKey && e.shiftKey) {
                switch (e.key) {
                    case 'T':
                        e.preventDefault();
                        this.cycleTheme();
                        break;
                    case 'H':
                        e.preventDefault();
                        this.toggleHighContrast();
                        break;
                    case 'M':
                        e.preventDefault();
                        this.toggleReducedMotion();
                        break;
                }
            }
        });
    }

    cycleTheme() {
        const themes = Array.from(this.themes.keys());
        const currentIndex = themes.indexOf(this.activeTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.applyTheme(nextTheme);
        
        if (window.app?.notificationSystem) {
            window.app.notificationSystem.info(
                'Theme Changed',
                `Switched to ${this.themes.get(nextTheme).name} theme`
            );
        }
    }

    toggleHighContrast() {
        const newTheme = this.activeTheme === 'high-contrast' ? 'dark' : 'high-contrast';
        this.applyTheme(newTheme);
        
        if (window.app?.notificationSystem) {
            window.app.notificationSystem.info(
                'Accessibility',
                `${newTheme === 'high-contrast' ? 'Enabled' : 'Disabled'} high contrast mode`
            );
        }
    }

    toggleReducedMotion() {
        this.reducedMotion = !this.reducedMotion;
        this.updateAnimations();
        
        if (window.app?.notificationSystem) {
            window.app.notificationSystem.info(
                'Accessibility',
                `${this.reducedMotion ? 'Enabled' : 'Disabled'} reduced motion`
            );
        }
    }

    updateAnimations() {
        document.documentElement.style.setProperty(
            '--animation-duration',
            this.reducedMotion ? '0.01ms' : '0.2s'
        );
    }

    // Enhanced UI utilities
    enhanceElement(element, options = {}) {
        const {
            animation = 'fade-in',
            hover = true,
            focus = true,
            glass = false,
            glow = false
        } = options;

        element.classList.add('ui-enhanced');
        
        if (!this.reducedMotion && animation) {
            element.classList.add(animation);
        }
        
        if (hover) {
            element.classList.add('hover-lift');
        }
        
        if (focus) {
            element.classList.add('focus-ring');
        }
        
        if (glass) {
            element.classList.add('glass-effect');
        }
        
        if (glow) {
            element.classList.add(`glow-${glow}`);
        }
    }

    createLoadingState(element, text = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'loading-state';
        loader.innerHTML = `
            <div class="shimmer" style="height: 20px; margin-bottom: 10px;"></div>
            <div class="shimmer" style="height: 16px; width: 80%;"></div>
        `;
        
        element.innerHTML = '';
        element.appendChild(loader);
        
        return {
            remove: () => loader.remove()
        };
    }

    animateValue(element, start, end, duration = 1000, formatter = (v) => v) {
        if (this.reducedMotion) {
            element.textContent = formatter(end);
            return;
        }

        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            element.textContent = formatter(Math.round(current));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Public API
    getThemes() {
        return Array.from(this.themes.keys());
    }

    getCurrentTheme() {
        return this.activeTheme;
    }

    setTheme(themeName) {
        if (this.themes.has(themeName)) {
            this.applyTheme(themeName);
        }
    }

    addCustomTheme(name, colors) {
        this.themes.set(name, { name, colors });
    }
}
