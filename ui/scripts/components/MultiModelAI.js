// Multi-Model AI Engine - Phase 4 Core Component
export class MultiModelAI {
    constructor() {
        this.models = {
            gemini: {
                name: 'Gemini 2.0 Flash',
                apiKey: 'AIzaSyBb5PODqrabPjKD5_t_Vg7hoOqwabn_TxE',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
                capabilities: ['text', 'code', 'analysis', 'reasoning', 'multimodal'],
                maxTokens: 8192,
                available: true
            },
            openRouter: {
                name: 'Open Router Free Models',
                apiKey: null, // Will be set by user
                endpoint: 'https://openrouter.ai/api/v1/chat/completions',
                models: [
                    'meta-llama/llama-3.2-3b-instruct:free',
                    'microsoft/phi-3-mini-128k-instruct:free',
                    'google/gemma-2-9b-it:free'
                ],
                capabilities: ['text', 'code', 'reasoning'],
                maxTokens: 4096,
                available: false
            },
            local: {
                name: 'Local AI Models',
                endpoint: 'http://localhost:11434/api/generate', // Ollama default
                models: ['llama3.2:3b', 'codellama:7b', 'phi3:mini'],
                capabilities: ['text', 'code', 'privacy'],
                maxTokens: 2048,
                available: false
            }
        };
        
        this.activeModel = 'gemini';
        this.fallbackModel = 'openRouter';
        this.requestQueue = [];
        this.isProcessing = false;
        this.rateLimits = {
            gemini: { requests: 0, resetTime: Date.now() + 60000, maxPerMinute: 60 },
            openRouter: { requests: 0, resetTime: Date.now() + 60000, maxPerMinute: 20 },
            local: { requests: 0, resetTime: Date.now() + 60000, maxPerMinute: 100 }
        };
        
        this.init();
    }

    async init() {
        console.log('Initializing Multi-Model AI Engine...');
        
        // Check model availability
        await this.checkModelAvailability();
        
        // Load user preferences
        this.loadPreferences();
        
        // Setup request processing
        this.startRequestProcessor();
        
        console.log('Multi-Model AI Engine initialized');
    }

    async checkModelAvailability() {
        // Check Gemini availability
        try {
            await this.testModel('gemini', 'Test connection');
            this.models.gemini.available = true;
            console.log('✅ Gemini 2.0 Flash available');
        } catch (error) {
            console.warn('❌ Gemini 2.0 Flash unavailable:', error.message);
            this.models.gemini.available = false;
        }

        // Check Open Router availability
        const openRouterKey = localStorage.getItem('openrouter_api_key');
        if (openRouterKey) {
            this.models.openRouter.apiKey = openRouterKey;
            try {
                await this.testModel('openRouter', 'Test connection');
                this.models.openRouter.available = true;
                console.log('✅ Open Router models available');
            } catch (error) {
                console.warn('❌ Open Router unavailable:', error.message);
                this.models.openRouter.available = false;
            }
        }

        // Check local models availability
        try {
            await this.testModel('local', 'Test connection');
            this.models.local.available = true;
            console.log('✅ Local AI models available');
        } catch (error) {
            console.warn('❌ Local AI models unavailable:', error.message);
            this.models.local.available = false;
        }

        // Set active model based on availability
        this.selectBestAvailableModel();
    }

    async testModel(modelType, prompt) {
        const model = this.models[modelType];
        
        switch (modelType) {
            case 'gemini':
                const response = await fetch(`${model.endpoint}?key=${model.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { maxOutputTokens: 10 }
                    })
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                break;
                
            case 'openRouter':
                if (!model.apiKey) throw new Error('No API key');
                const orResponse = await fetch(model.endpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${model.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model.models[0],
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 10
                    })
                });
                if (!orResponse.ok) throw new Error(`HTTP ${orResponse.status}`);
                break;
                
            case 'local':
                const localResponse = await fetch(model.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: model.models[0],
                        prompt: prompt,
                        stream: false,
                        options: { num_predict: 10 }
                    })
                });
                if (!localResponse.ok) throw new Error(`HTTP ${localResponse.status}`);
                break;
        }
    }

    selectBestAvailableModel() {
        if (this.models.gemini.available) {
            this.activeModel = 'gemini';
        } else if (this.models.openRouter.available) {
            this.activeModel = 'openRouter';
        } else if (this.models.local.available) {
            this.activeModel = 'local';
        } else {
            console.error('No AI models available!');
            this.activeModel = null;
        }
        
        console.log(`Active AI model: ${this.activeModel}`);
    }

    async generateResponse(prompt, options = {}) {
        return new Promise((resolve, reject) => {
            const request = {
                id: Date.now() + Math.random(),
                prompt,
                options: {
                    model: options.model || this.activeModel,
                    maxTokens: options.maxTokens || 1024,
                    temperature: options.temperature || 0.7,
                    systemPrompt: options.systemPrompt || '',
                    context: options.context || '',
                    capabilities: options.capabilities || ['text'],
                    priority: options.priority || 'normal',
                    timeout: options.timeout || 30000
                },
                resolve,
                reject,
                timestamp: Date.now()
            };
            
            this.requestQueue.push(request);
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            // Sort by priority
            this.requestQueue.sort((a, b) => {
                const priorityOrder = { high: 3, normal: 2, low: 1 };
                return priorityOrder[b.options.priority] - priorityOrder[a.options.priority];
            });
            
            const request = this.requestQueue.shift();
            
            try {
                // Check rate limits
                if (!this.checkRateLimit(request.options.model)) {
                    // Try fallback model
                    const fallback = this.getFallbackModel(request.options.model);
                    if (fallback && this.checkRateLimit(fallback)) {
                        request.options.model = fallback;
                    } else {
                        // Requeue for later
                        setTimeout(() => {
                            this.requestQueue.unshift(request);
                        }, 5000);
                        continue;
                    }
                }
                
                const response = await this.executeRequest(request);
                request.resolve(response);
                
            } catch (error) {
                console.error('AI request failed:', error);
                
                // Try fallback model
                const fallback = this.getFallbackModel(request.options.model);
                if (fallback && fallback !== request.options.model) {
                    try {
                        request.options.model = fallback;
                        const response = await this.executeRequest(request);
                        request.resolve(response);
                    } catch (fallbackError) {
                        request.reject(fallbackError);
                    }
                } else {
                    request.reject(error);
                }
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.isProcessing = false;
    }

    async executeRequest(request) {
        const { prompt, options } = request;
        const model = this.models[options.model];
        
        if (!model || !model.available) {
            throw new Error(`Model ${options.model} not available`);
        }
        
        // Update rate limit
        this.updateRateLimit(options.model);
        
        // Build context-aware prompt
        const contextualPrompt = this.buildContextualPrompt(prompt, options);
        
        switch (options.model) {
            case 'gemini':
                return await this.executeGeminiRequest(contextualPrompt, options);
            case 'openRouter':
                return await this.executeOpenRouterRequest(contextualPrompt, options);
            case 'local':
                return await this.executeLocalRequest(contextualPrompt, options);
            default:
                throw new Error(`Unknown model: ${options.model}`);
        }
    }

    buildContextualPrompt(prompt, options) {
        let contextualPrompt = '';
        
        // Add system prompt
        if (options.systemPrompt) {
            contextualPrompt += `System: ${options.systemPrompt}\n\n`;
        }
        
        // Add context
        if (options.context) {
            contextualPrompt += `Context: ${options.context}\n\n`;
        }
        
        // Add capability-specific instructions
        if (options.capabilities.includes('code')) {
            contextualPrompt += 'Please provide code examples and technical details where appropriate.\n\n';
        }
        
        if (options.capabilities.includes('analysis')) {
            contextualPrompt += 'Please provide detailed analysis and insights.\n\n';
        }
        
        // Add main prompt
        contextualPrompt += `User: ${prompt}`;
        
        return contextualPrompt;
    }

    async executeGeminiRequest(prompt, options) {
        const model = this.models.gemini;
        
        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: options.maxTokens,
                temperature: options.temperature,
                topP: 0.8,
                topK: 40
            }
        };
        
        const response = await fetch(`${model.endpoint}?key=${model.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid Gemini response format');
        }
        
        return {
            text: data.candidates[0].content.parts[0].text,
            model: 'gemini',
            usage: data.usageMetadata || {},
            timestamp: Date.now()
        };
    }

    async executeOpenRouterRequest(prompt, options) {
        const model = this.models.openRouter;
        
        const requestBody = {
            model: model.models[0], // Use first available model
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens,
            temperature: options.temperature
        };
        
        const response = await fetch(model.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${model.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Open Router API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            text: data.choices[0].message.content,
            model: 'openRouter',
            usage: data.usage || {},
            timestamp: Date.now()
        };
    }

    async executeLocalRequest(prompt, options) {
        const model = this.models.local;
        
        const requestBody = {
            model: model.models[0],
            prompt: prompt,
            stream: false,
            options: {
                num_predict: options.maxTokens,
                temperature: options.temperature
            }
        };
        
        const response = await fetch(model.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Local AI error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            text: data.response,
            model: 'local',
            usage: { tokens: data.eval_count || 0 },
            timestamp: Date.now()
        };
    }

    checkRateLimit(modelType) {
        const limit = this.rateLimits[modelType];
        if (!limit) return true;
        
        if (Date.now() > limit.resetTime) {
            limit.requests = 0;
            limit.resetTime = Date.now() + 60000;
        }
        
        return limit.requests < limit.maxPerMinute;
    }

    updateRateLimit(modelType) {
        const limit = this.rateLimits[modelType];
        if (limit) {
            limit.requests++;
        }
    }

    getFallbackModel(currentModel) {
        const fallbackOrder = {
            gemini: ['openRouter', 'local'],
            openRouter: ['gemini', 'local'],
            local: ['gemini', 'openRouter']
        };
        
        const fallbacks = fallbackOrder[currentModel] || [];
        return fallbacks.find(model => this.models[model]?.available);
    }

    startRequestProcessor() {
        // Process queue every 500ms
        setInterval(() => {
            if (!this.isProcessing && this.requestQueue.length > 0) {
                this.processQueue();
            }
        }, 500);
    }

    loadPreferences() {
        try {
            const prefs = localStorage.getItem('multimodel_ai_preferences');
            if (prefs) {
                const preferences = JSON.parse(prefs);
                this.activeModel = preferences.activeModel || this.activeModel;
                this.fallbackModel = preferences.fallbackModel || this.fallbackModel;
                
                // Load API keys
                if (preferences.openRouterKey) {
                    this.models.openRouter.apiKey = preferences.openRouterKey;
                }
            }
        } catch (error) {
            console.error('Failed to load AI preferences:', error);
        }
    }

    savePreferences() {
        try {
            const preferences = {
                activeModel: this.activeModel,
                fallbackModel: this.fallbackModel,
                openRouterKey: this.models.openRouter.apiKey
            };
            localStorage.setItem('multimodel_ai_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save AI preferences:', error);
        }
    }

    // Public API methods
    async chat(message, options = {}) {
        return await this.generateResponse(message, {
            ...options,
            capabilities: ['text', 'reasoning'],
            systemPrompt: 'You are a helpful AI assistant integrated into the Vishwakarma Express browser.'
        });
    }

    async analyzeContent(content, analysisType = 'general', options = {}) {
        const systemPrompt = `You are an expert content analyzer. Analyze the following content for: ${analysisType}`;
        
        return await this.generateResponse(content, {
            ...options,
            capabilities: ['analysis', 'reasoning'],
            systemPrompt,
            maxTokens: 2048
        });
    }

    async generateCode(description, language = 'javascript', options = {}) {
        const systemPrompt = `You are an expert ${language} developer. Generate clean, efficient, and well-documented code.`;
        
        return await this.generateResponse(description, {
            ...options,
            capabilities: ['code', 'reasoning'],
            systemPrompt,
            maxTokens: 4096
        });
    }

    async summarizeText(text, options = {}) {
        const systemPrompt = 'You are an expert at creating concise, informative summaries.';
        
        return await this.generateResponse(`Please summarize this text: ${text}`, {
            ...options,
            capabilities: ['analysis', 'text'],
            systemPrompt,
            maxTokens: 1024
        });
    }

    // Model management
    setActiveModel(modelType) {
        if (this.models[modelType]?.available) {
            this.activeModel = modelType;
            this.savePreferences();
            console.log(`Switched to ${modelType} model`);
        } else {
            console.error(`Model ${modelType} not available`);
        }
    }

    getModelStatus() {
        return Object.entries(this.models).map(([key, model]) => ({
            type: key,
            name: model.name,
            available: model.available,
            active: key === this.activeModel,
            capabilities: model.capabilities,
            rateLimitStatus: this.rateLimits[key]
        }));
    }

    setOpenRouterKey(apiKey) {
        this.models.openRouter.apiKey = apiKey;
        this.savePreferences();
        this.checkModelAvailability();
    }

    // Cleanup
    destroy() {
        this.requestQueue = [];
        this.isProcessing = false;
        console.log('Multi-Model AI Engine destroyed');
    }
}
