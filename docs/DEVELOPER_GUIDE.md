# Vishwakarma Express - Developer Guide

## 🛠️ Development Overview

Vishwakarma Express is built with modern web technologies and follows a modular architecture designed for extensibility, performance, and maintainability. This guide covers the technical aspects of the browser's implementation.

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- **JavaScript ES6+**: Modern JavaScript with modules and classes
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **HTML5**: Semantic markup with Web Components
- **WebGL/WebGPU**: Hardware-accelerated graphics
- **Web APIs**: Extensive use of modern browser APIs

**Backend (Tauri):**
- **Rust**: System-level operations and security
- **Tauri Framework**: Cross-platform desktop application
- **WebView**: Native web rendering engine

**AI Integration:**
- **Gemini 2.0 Flash API**: Primary AI model
- **Local AI Models**: Privacy-focused inference
- **Open Router**: Multi-model access

### Project Structure

```
Vishwakarma Express/
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── main.rs           # Application entry point
│   │   ├── lib.rs            # Library exports
│   │   ├── browser/          # Browser engine integration
│   │   ├── ai/               # AI service integration
│   │   └── security/         # Security implementations
│   └── Cargo.toml           # Rust dependencies
├── ui/                       # Frontend application
│   ├── index.html           # Main HTML entry
│   ├── scripts/             # JavaScript modules
│   │   ├── main.js          # Application bootstrap
│   │   ├── api/             # Tauri API wrappers
│   │   └── components/      # Feature modules
│   ├── styles/              # CSS stylesheets
│   └── pages/               # Additional HTML pages
├── docs/                    # Documentation
└── resources/               # Static assets
```

### Component Architecture

Each major feature is implemented as an ES6 class with a consistent interface:

```javascript
export class ComponentName {
    constructor() {
        this.initialized = false;
        this.config = {};
    }

    async init() {
        // Initialize component
        console.log('Initializing ComponentName...');
        this.setupUI();
        this.bindEvents();
        this.initialized = true;
    }

    setupUI() {
        // Create and configure UI elements
    }

    bindEvents() {
        // Set up event listeners
    }

    // Public API methods
    showUI() { /* ... */ }
    hideUI() { /* ... */ }
    
    // Cleanup
    destroy() {
        // Remove event listeners and cleanup
    }
}
```

## 🚀 Core Components

### 1. Application Bootstrap (main.js)

The main application class coordinates all components:

```javascript
class VishwakarmaExpress {
    constructor() {
        this.components = new Map();
        this.initialized = false;
    }

    async init() {
        // Initialize core components first
        await this.initializeCore();
        
        // Initialize feature components
        await this.initializeFeatures();
        
        // Set up global event handlers
        this.setupGlobalEvents();
        
        this.initialized = true;
    }

    async initializeCore() {
        // Essential components for basic functionality
        const coreComponents = [
            'TabManager',
            'NavigationManager', 
            'SecurityManager'
        ];
        
        for (const component of coreComponents) {
            await this.loadComponent(component);
        }
    }
}
```

### 2. Tab Management System

**File:** `src-tauri/src/browser/tabs.rs`

```rust
pub struct TabManager {
    tabs: HashMap<String, BrowserTab>,
    active_tab: Option<String>,
    next_id: AtomicU64,
}

impl TabManager {
    pub fn create_tab(&mut self, url: Option<String>, config: Option<EngineConfig>) -> Result<String> {
        let url = url.unwrap_or_else(|| "about:blank".to_string());
        let tab = BrowserTab::new(url, config)?;
        let tab_id = tab.info.id.clone();
        
        self.tabs.insert(tab_id.clone(), tab);
        self.active_tab = Some(tab_id.clone());
        
        Ok(tab_id)
    }
}
```

**JavaScript API:** `ui/scripts/api/browser.js`

```javascript
export class BrowserAPI {
    static async createTab(url = null) {
        return await invoke('create_tab', { url });
    }

    static async navigateTab(tabId, url) {
        return await invoke('navigate_tab', { tabId, url });
    }
}
```

### 3. Performance Engine (QuantumPerformance.js)

Advanced performance optimization system:

```javascript
export class QuantumPerformance {
    constructor() {
        this.taskScheduler = new TaskScheduler();
        this.memoryManager = new MemoryManager();
        this.renderOptimizer = new RenderOptimizer();
    }

    async init() {
        this.setupPerformanceMonitoring();
        this.optimizeForHardware();
        this.startAutoOptimization();
    }

    setupPerformanceMonitoring() {
        // Real-time performance metrics
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            this.analyzePerformance(entries);
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
}
```

### 4. AI Integration (MultiModelAI.js)

Multi-model AI system with fallback support:

```javascript
export class MultiModelAI {
    constructor() {
        this.models = {
            gemini: new GeminiModel(),
            local: new LocalModel(),
            openrouter: new OpenRouterModel()
        };
        this.primaryModel = 'gemini';
    }

    async query(prompt, options = {}) {
        const model = this.models[this.primaryModel];
        
        try {
            return await model.generate(prompt, options);
        } catch (error) {
            console.warn(`Primary model failed, trying fallback`);
            return await this.tryFallback(prompt, options);
        }
    }
}
```

## 🔧 Development Setup

### Prerequisites

1. **Rust** (latest stable)
2. **Node.js** (16+ recommended)
3. **Tauri CLI**: `cargo install tauri-cli`
4. **Git** for version control

### Installation

```bash
# Clone repository
git clone https://github.com/vishwakarma/express.git
cd vishwakarma-express

# Install Rust dependencies
cd src-tauri
cargo build

# Install frontend dependencies (if using npm)
cd ../ui
npm install

# Run in development mode
cd ..
cargo tauri dev
```

### Development Commands

```bash
# Development server
cargo tauri dev

# Build for production
cargo tauri build

# Run tests
cargo test
npm test

# Lint code
cargo clippy
npm run lint

# Format code
cargo fmt
npm run format
```

### Environment Configuration

Create `.env` file in project root:

```env
# AI API Keys
GEMINI_API_KEY=your_gemini_key_here
OPENROUTER_API_KEY=your_openrouter_key_here

# Development settings
RUST_LOG=debug
TAURI_DEBUG=true

# Performance settings
TARGET_MEMORY_MB=512
ENABLE_HARDWARE_ACCELERATION=true
```

## 🧪 Testing

### Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # Component tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
│   ├── browser/           # Browser functionality
│   └── ai/                # AI integration
├── performance/           # Performance benchmarks
└── e2e/                   # End-to-end tests
```

### Running Tests

**JavaScript Tests:**
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "TabManager"

# Run with coverage
npm run test:coverage
```

**Rust Tests:**
```bash
# Run all Rust tests
cargo test

# Run specific test
cargo test tab_manager

# Run with output
cargo test -- --nocapture
```

**Performance Tests:**
```bash
# Run performance benchmarks
npm run test:performance

# Profile memory usage
npm run profile:memory

# Analyze startup time
npm run profile:startup
```

### Test Examples

**Component Test:**
```javascript
describe('TabManager', () => {
    let tabManager;
    
    beforeEach(() => {
        tabManager = new TabManager();
    });
    
    it('should create new tab', async () => {
        const tabId = await tabManager.createTab('https://example.com');
        expect(tabId).toBeDefined();
        expect(tabManager.getTab(tabId)).toBeDefined();
    });
    
    it('should handle tab navigation', async () => {
        const tabId = await tabManager.createTab();
        await tabManager.navigateTab(tabId, 'https://example.com');
        
        const tab = tabManager.getTab(tabId);
        expect(tab.url).toBe('https://example.com');
    });
});
```

**Performance Test:**
```javascript
describe('Performance', () => {
    it('should start up within target time', async () => {
        const startTime = performance.now();
        
        const app = new VishwakarmaExpress();
        await app.init();
        
        const startupTime = performance.now() - startTime;
        expect(startupTime).toBeLessThan(500); // 500ms target
    });
});
```

## 📦 Building Components

### Creating New Components

1. **Create Component File:**
```javascript
// ui/scripts/components/NewComponent.js
export class NewComponent {
    constructor() {
        this.initialized = false;
    }

    async init() {
        console.log('Initializing NewComponent...');
        this.setupUI();
        this.bindEvents();
        this.initialized = true;
    }

    setupUI() {
        // Create UI elements
    }

    bindEvents() {
        // Set up event listeners
    }

    showUI() {
        // Show component UI
    }

    hideUI() {
        // Hide component UI
    }
}
```

2. **Add Styles:**
```css
/* ui/styles/components.css */
.new-component {
    /* Component styles */
}
```

3. **Register Component:**
```javascript
// ui/scripts/main.js
import { NewComponent } from './components/NewComponent.js';

class VishwakarmaExpress {
    async initializeFeatures() {
        this.newComponent = new NewComponent();
        await this.newComponent.init();
    }
}
```

### Component Best Practices

**Performance:**
- Use lazy loading for non-critical components
- Implement proper cleanup in `destroy()` method
- Avoid memory leaks with event listeners
- Use efficient DOM manipulation

**Accessibility:**
- Include ARIA labels and roles
- Support keyboard navigation
- Provide screen reader compatibility
- Test with accessibility tools

**Security:**
- Sanitize user input
- Use Content Security Policy
- Validate API responses
- Implement proper error handling

## 🔌 Extension Development

### Extension API

Vishwakarma Express supports multiple extension formats:

**Chrome Extension Manifest V3:**
```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0",
  "permissions": ["activeTab", "storage"],
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}
```

**Vishwakarma Native Extension:**
```javascript
// extension.js
export class MyExtension {
    constructor() {
        this.name = 'My Extension';
        this.version = '1.0.0';
    }

    async activate(browser) {
        // Extension activation logic
        browser.onTabCreated.addListener(this.handleTabCreated);
    }

    handleTabCreated(tab) {
        // Handle tab creation
    }

    deactivate() {
        // Cleanup when extension is disabled
    }
}
```

### Extension APIs Available

**Browser API:**
```javascript
// Tab management
browser.tabs.create({ url: 'https://example.com' });
browser.tabs.query({ active: true });

// Storage
browser.storage.local.set({ key: 'value' });
browser.storage.local.get('key');

// Messaging
browser.runtime.sendMessage({ action: 'getData' });

// Web requests
browser.webRequest.onBeforeRequest.addListener(callback);
```

## 🚀 Performance Optimization

### Hardware-Specific Optimizations

**Dell Latitude E6440 Optimizations:**
```javascript
class E6440Optimizer {
    static apply() {
        // Reduce animation complexity
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        
        // Optimize memory usage
        this.enableAggressiveGC();
        
        // Reduce render complexity
        this.simplifyRendering();
    }

    static enableAggressiveGC() {
        setInterval(() => {
            if (performance.memory.usedJSHeapSize > 500 * 1024 * 1024) {
                // Trigger garbage collection
                this.forceGC();
            }
        }, 10000);
    }
}
```

### Memory Management

**Object Pooling:**
```javascript
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    acquire() {
        return this.pool.length > 0 ? this.pool.pop() : this.createFn();
    }

    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}
```

### Rendering Optimization

**Batch DOM Updates:**
```javascript
class DOMBatcher {
    constructor() {
        this.updates = [];
        this.scheduled = false;
    }

    schedule(updateFn) {
        this.updates.push(updateFn);
        
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => this.flush());
        }
    }

    flush() {
        const fragment = document.createDocumentFragment();
        
        this.updates.forEach(update => update(fragment));
        this.updates.length = 0;
        this.scheduled = false;
        
        return fragment;
    }
}
```

## 🔒 Security Implementation

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://api.gemini.google.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.gemini.google.com wss://localhost:*;
    font-src 'self' data:;
">
```

### Input Sanitization

```javascript
class SecurityUtils {
    static sanitizeHTML(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    static validateURL(url) {
        try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    }

    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
```

## 📊 Monitoring and Analytics

### Performance Monitoring

```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
    }

    startMonitoring() {
        // Monitor long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (entry.duration > 50) {
                    console.warn(`Long task detected: ${entry.duration}ms`);
                }
            });
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
    }

    measureFunction(name, fn) {
        return async (...args) => {
            const start = performance.now();
            const result = await fn(...args);
            const duration = performance.now() - start;
            
            this.recordMetric(name, duration);
            return result;
        };
    }
}
```

## 🚢 Deployment

### Build Configuration

**Tauri Configuration:**
```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:3000",
    "distDir": "../ui"
  },
  "tauri": {
    "bundle": {
      "identifier": "dev.vishwakarma.express",
      "targets": ["deb", "appimage", "msi", "dmg"]
    }
  }
}
```

### Release Process

1. **Version Bump:**
```bash
# Update version in Cargo.toml and package.json
npm version patch
git tag v1.0.1
```

2. **Build Release:**
```bash
# Build for all platforms
cargo tauri build --target x86_64-unknown-linux-gnu
cargo tauri build --target x86_64-pc-windows-msvc
cargo tauri build --target x86_64-apple-darwin
```

3. **Distribution:**
```bash
# Create release packages
./scripts/package-release.sh
```

## 📚 API Reference

### Core APIs

**Tab Management:**
```javascript
// Create tab
const tabId = await browser.tabs.create({ url: 'https://example.com' });

// Navigate tab
await browser.tabs.navigate(tabId, 'https://newurl.com');

// Close tab
await browser.tabs.close(tabId);

// Get tab info
const tab = await browser.tabs.get(tabId);
```

**AI Integration:**
```javascript
// Query AI model
const response = await ai.query('Explain this code', {
    model: 'gemini',
    context: 'javascript'
});

// Generate code
const code = await ai.generateCode('Create a React component', {
    language: 'javascript',
    framework: 'react'
});
```

**Performance:**
```javascript
// Get performance metrics
const metrics = performance.getMetrics();

// Force optimization
performance.optimize();

// Set performance mode
performance.setMode('balanced');
```

## 🤝 Contributing

### Development Workflow

1. **Fork Repository**
2. **Create Feature Branch:** `git checkout -b feature/new-feature`
3. **Make Changes**
4. **Add Tests**
5. **Run Tests:** `npm test && cargo test`
6. **Commit Changes:** `git commit -m "Add new feature"`
7. **Push Branch:** `git push origin feature/new-feature`
8. **Create Pull Request**

### Code Standards

**JavaScript:**
- Use ES6+ features
- Follow ESLint configuration
- Add JSDoc comments
- Write unit tests

**Rust:**
- Follow Rust conventions
- Use `cargo fmt` for formatting
- Add documentation comments
- Write integration tests

**CSS:**
- Use CSS custom properties
- Follow BEM methodology
- Ensure responsive design
- Test accessibility

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:** feat, fix, docs, style, refactor, test, chore

**Examples:**
- `feat(tabs): add tab grouping functionality`
- `fix(performance): resolve memory leak in renderer`
- `docs(api): update extension development guide`

---

**For questions or support, contact the development team at dev@vishwakarma.dev**
