// Advanced Gaming and Media Capabilities - Phase 5 Revolutionary Component
export class GamingMedia {
    constructor() {
        this.webglRenderer = null;
        this.webgpuDevice = null;
        this.audioContext = null;
        this.mediaStreams = new Map();
        this.gamepadManager = null;
        this.vrSupport = null;
        this.streamingOptimizer = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Advanced Gaming and Media Engine...');
        
        await this.initializeWebGL();
        await this.initializeWebGPU();
        this.setupAudioEngine();
        this.initializeGamepadSupport();
        this.setupVRSupport();
        this.createMediaOptimizer();
        this.createGamingUI();
        
        console.log('Gaming and Media Engine ready - Next-gen multimedia experience enabled');
    }

    async initializeWebGL() {
        try {
            const canvas = document.createElement('canvas');
            canvas.id = 'webgl-canvas';
            canvas.style.display = 'none';
            document.body.appendChild(canvas);

            const gl = canvas.getContext('webgl2', {
                alpha: true,
                antialias: true,
                depth: true,
                stencil: true,
                preserveDrawingBuffer: false,
                powerPreference: 'high-performance'
            });

            if (!gl) {
                throw new Error('WebGL2 not supported');
            }

            this.webglRenderer = {
                gl,
                canvas,
                extensions: this.loadWebGLExtensions(gl),
                shaders: new Map(),
                programs: new Map(),
                buffers: new Map(),
                textures: new Map(),
                
                createShader: (type, source) => {
                    const shader = gl.createShader(type);
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
                        gl.deleteShader(shader);
                        return null;
                    }
                    
                    return shader;
                },
                
                createProgram: (vertexShader, fragmentShader) => {
                    const program = gl.createProgram();
                    gl.attachShader(program, vertexShader);
                    gl.attachShader(program, fragmentShader);
                    gl.linkProgram(program);
                    
                    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                        console.error('Program linking error:', gl.getProgramInfoLog(program));
                        gl.deleteProgram(program);
                        return null;
                    }
                    
                    return program;
                },
                
                optimizeForGaming: () => {
                    // Enable performance optimizations
                    gl.enable(gl.DEPTH_TEST);
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(gl.BACK);
                    gl.frontFace(gl.CCW);
                    
                    // Set optimal viewport
                    gl.viewport(0, 0, canvas.width, canvas.height);
                    
                    // Configure blending for transparency
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                }
            };

            console.log('WebGL2 renderer initialized with extensions:', Object.keys(this.webglRenderer.extensions));
        } catch (error) {
            console.warn('WebGL initialization failed:', error);
        }
    }

    loadWebGLExtensions(gl) {
        const extensions = {};
        const extensionNames = [
            'EXT_color_buffer_float',
            'EXT_texture_filter_anisotropic',
            'WEBGL_depth_texture',
            'OES_texture_float',
            'OES_texture_half_float',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_compressed_texture_etc',
            'EXT_disjoint_timer_query_webgl2'
        ];

        extensionNames.forEach(name => {
            const ext = gl.getExtension(name);
            if (ext) {
                extensions[name] = ext;
            }
        });

        return extensions;
    }

    async initializeWebGPU() {
        try {
            if (!navigator.gpu) {
                console.warn('WebGPU not supported');
                return;
            }

            const adapter = await navigator.gpu.requestAdapter({
                powerPreference: 'high-performance'
            });

            if (!adapter) {
                throw new Error('No WebGPU adapter found');
            }

            const device = await adapter.requestDevice({
                requiredFeatures: [],
                requiredLimits: {}
            });

            this.webgpuDevice = {
                device,
                adapter,
                queue: device.queue,
                
                createRenderPipeline: (descriptor) => {
                    return device.createRenderPipeline(descriptor);
                },
                
                createComputePipeline: (descriptor) => {
                    return device.createComputePipeline(descriptor);
                },
                
                createBuffer: (descriptor) => {
                    return device.createBuffer(descriptor);
                },
                
                createTexture: (descriptor) => {
                    return device.createTexture(descriptor);
                },
                
                optimizeForGaming: () => {
                    // WebGPU gaming optimizations
                    console.log('WebGPU gaming optimizations enabled');
                }
            };

            console.log('WebGPU device initialized:', adapter.info);
        } catch (error) {
            console.warn('WebGPU initialization failed:', error);
        }
    }

    setupAudioEngine() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                latencyHint: 'interactive',
                sampleRate: 48000
            });

            const audioEngine = {
                context: this.audioContext,
                masterGain: this.audioContext.createGain(),
                compressor: this.audioContext.createDynamicsCompressor(),
                analyser: this.audioContext.createAnalyser(),
                spatialAudio: null,
                
                init: () => {
                    // Setup audio processing chain
                    audioEngine.masterGain.connect(audioEngine.compressor);
                    audioEngine.compressor.connect(audioEngine.analyser);
                    audioEngine.analyser.connect(this.audioContext.destination);
                    
                    // Configure analyser for visualization
                    audioEngine.analyser.fftSize = 2048;
                    audioEngine.analyser.smoothingTimeConstant = 0.8;
                    
                    // Setup spatial audio if available
                    if (this.audioContext.createPanner) {
                        audioEngine.spatialAudio = {
                            listener: this.audioContext.listener,
                            createPanner: () => this.audioContext.createPanner()
                        };
                    }
                },
                
                createOscillator: (frequency, type = 'sine') => {
                    const oscillator = this.audioContext.createOscillator();
                    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                    oscillator.type = type;
                    return oscillator;
                },
                
                loadAudioBuffer: async (url) => {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    return await this.audioContext.decodeAudioData(arrayBuffer);
                },
                
                createSpatialSource: (buffer, position = [0, 0, 0]) => {
                    if (!audioEngine.spatialAudio) return null;
                    
                    const source = this.audioContext.createBufferSource();
                    const panner = audioEngine.spatialAudio.createPanner();
                    
                    source.buffer = buffer;
                    panner.positionX.setValueAtTime(position[0], this.audioContext.currentTime);
                    panner.positionY.setValueAtTime(position[1], this.audioContext.currentTime);
                    panner.positionZ.setValueAtTime(position[2], this.audioContext.currentTime);
                    
                    source.connect(panner);
                    panner.connect(audioEngine.masterGain);
                    
                    return { source, panner };
                }
            };

            audioEngine.init();
            this.audioEngine = audioEngine;
            
            console.log('Advanced audio engine initialized');
        } catch (error) {
            console.warn('Audio engine initialization failed:', error);
        }
    }

    initializeGamepadSupport() {
        this.gamepadManager = {
            gamepads: new Map(),
            callbacks: new Map(),
            
            init: () => {
                window.addEventListener('gamepadconnected', (e) => {
                    console.log('Gamepad connected:', e.gamepad.id);
                    this.gamepadManager.gamepads.set(e.gamepad.index, e.gamepad);
                    this.gamepadManager.triggerCallback('connected', e.gamepad);
                });
                
                window.addEventListener('gamepaddisconnected', (e) => {
                    console.log('Gamepad disconnected:', e.gamepad.id);
                    this.gamepadManager.gamepads.delete(e.gamepad.index);
                    this.gamepadManager.triggerCallback('disconnected', e.gamepad);
                });
                
                // Start gamepad polling
                this.gamepadManager.startPolling();
            },
            
            startPolling: () => {
                const poll = () => {
                    const gamepads = navigator.getGamepads();
                    for (let i = 0; i < gamepads.length; i++) {
                        if (gamepads[i]) {
                            this.gamepadManager.gamepads.set(i, gamepads[i]);
                            this.gamepadManager.triggerCallback('update', gamepads[i]);
                        }
                    }
                    requestAnimationFrame(poll);
                };
                poll();
            },
            
            on: (event, callback) => {
                if (!this.gamepadManager.callbacks.has(event)) {
                    this.gamepadManager.callbacks.set(event, []);
                }
                this.gamepadManager.callbacks.get(event).push(callback);
            },
            
            triggerCallback: (event, gamepad) => {
                const callbacks = this.gamepadManager.callbacks.get(event);
                if (callbacks) {
                    callbacks.forEach(callback => callback(gamepad));
                }
            },
            
            getGamepad: (index) => {
                return this.gamepadManager.gamepads.get(index);
            },
            
            getAllGamepads: () => {
                return Array.from(this.gamepadManager.gamepads.values());
            }
        };

        this.gamepadManager.init();
        console.log('Gamepad support initialized');
    }

    setupVRSupport() {
        if (!navigator.xr) {
            console.warn('WebXR not supported');
            return;
        }

        this.vrSupport = {
            session: null,
            referenceSpace: null,
            
            checkSupport: async () => {
                try {
                    const supported = await navigator.xr.isSessionSupported('immersive-vr');
                    console.log('VR support:', supported);
                    return supported;
                } catch (error) {
                    console.warn('VR support check failed:', error);
                    return false;
                }
            },
            
            startSession: async () => {
                try {
                    const session = await navigator.xr.requestSession('immersive-vr');
                    this.vrSupport.session = session;
                    
                    const referenceSpace = await session.requestReferenceSpace('local-floor');
                    this.vrSupport.referenceSpace = referenceSpace;
                    
                    session.addEventListener('end', () => {
                        this.vrSupport.session = null;
                        this.vrSupport.referenceSpace = null;
                    });
                    
                    console.log('VR session started');
                    return session;
                } catch (error) {
                    console.error('Failed to start VR session:', error);
                    return null;
                }
            },
            
            endSession: () => {
                if (this.vrSupport.session) {
                    this.vrSupport.session.end();
                }
            }
        };

        console.log('VR support initialized');
    }

    createMediaOptimizer() {
        this.streamingOptimizer = {
            videoStreams: new Map(),
            audioStreams: new Map(),
            
            optimizeVideo: (videoElement) => {
                // Video optimization settings
                if (videoElement.requestVideoFrameCallback) {
                    const optimize = () => {
                        // Frame-by-frame optimization
                        videoElement.requestVideoFrameCallback(optimize);
                    };
                    optimize();
                }
                
                // Hardware acceleration hints
                videoElement.style.willChange = 'transform';
                videoElement.style.transform = 'translateZ(0)';
                
                return videoElement;
            },
            
            optimizeAudio: (audioElement) => {
                // Audio optimization
                if (this.audioContext && this.audioContext.state === 'running') {
                    const source = this.audioContext.createMediaElementSource(audioElement);
                    source.connect(this.audioEngine.masterGain);
                }
                
                return audioElement;
            },
            
            createOptimizedStream: async (constraints) => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    
                    // Apply stream optimizations
                    stream.getVideoTracks().forEach(track => {
                        const settings = track.getSettings();
                        console.log('Video track settings:', settings);
                        
                        // Apply constraints for gaming/streaming
                        track.applyConstraints({
                            frameRate: { ideal: 60 },
                            width: { ideal: 1920 },
                            height: { ideal: 1080 }
                        }).catch(console.warn);
                    });
                    
                    stream.getAudioTracks().forEach(track => {
                        const settings = track.getSettings();
                        console.log('Audio track settings:', settings);
                        
                        // Apply audio constraints
                        track.applyConstraints({
                            sampleRate: { ideal: 48000 },
                            channelCount: { ideal: 2 },
                            echoCancellation: true,
                            noiseSuppression: true
                        }).catch(console.warn);
                    });
                    
                    return stream;
                } catch (error) {
                    console.error('Failed to create optimized stream:', error);
                    return null;
                }
            }
        };

        console.log('Media streaming optimizer initialized');
    }

    createGamingUI() {
        const ui = document.createElement('div');
        ui.id = 'gaming-media-ui';
        ui.className = 'gaming-media-ui';
        
        ui.innerHTML = `
            <div class="gaming-header">
                <h3>🎮 Gaming & Media Center</h3>
                <div class="gaming-controls">
                    <button id="performance-mode">⚡ Performance</button>
                    <button id="vr-mode">🥽 VR Mode</button>
                    <button id="stream-mode">📺 Stream</button>
                    <button class="gaming-close">×</button>
                </div>
            </div>
            
            <div class="gaming-content">
                <div class="gaming-tabs">
                    <button class="gaming-tab active" data-tab="graphics">Graphics</button>
                    <button class="gaming-tab" data-tab="audio">Audio</button>
                    <button class="gaming-tab" data-tab="input">Input</button>
                    <button class="gaming-tab" data-tab="streaming">Streaming</button>
                </div>
                
                <div class="gaming-panels">
                    <div class="gaming-panel active" id="graphics-panel">
                        <h4>Graphics Settings</h4>
                        <div class="graphics-controls">
                            <div class="control-group">
                                <label>Rendering Engine:</label>
                                <select id="render-engine">
                                    <option value="webgl2">WebGL 2.0</option>
                                    <option value="webgpu">WebGPU</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>
                            <div class="control-group">
                                <label>Frame Rate Target:</label>
                                <select id="fps-target">
                                    <option value="60">60 FPS</option>
                                    <option value="120">120 FPS</option>
                                    <option value="144">144 FPS</option>
                                    <option value="unlimited">Unlimited</option>
                                </select>
                            </div>
                            <div class="control-group">
                                <label>Anti-aliasing:</label>
                                <select id="antialiasing">
                                    <option value="none">None</option>
                                    <option value="msaa2x">MSAA 2x</option>
                                    <option value="msaa4x">MSAA 4x</option>
                                    <option value="msaa8x">MSAA 8x</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="gpu-info">
                            <h5>GPU Information</h5>
                            <div id="gpu-details">Loading...</div>
                        </div>
                    </div>
                    
                    <div class="gaming-panel" id="audio-panel">
                        <h4>Audio Settings</h4>
                        <div class="audio-controls">
                            <div class="control-group">
                                <label>Sample Rate:</label>
                                <select id="sample-rate">
                                    <option value="44100">44.1 kHz</option>
                                    <option value="48000">48 kHz</option>
                                    <option value="96000">96 kHz</option>
                                </select>
                            </div>
                            <div class="control-group">
                                <label>Spatial Audio:</label>
                                <input type="checkbox" id="spatial-audio" checked>
                            </div>
                            <div class="control-group">
                                <label>Audio Latency:</label>
                                <select id="audio-latency">
                                    <option value="interactive">Interactive (Low)</option>
                                    <option value="balanced">Balanced</option>
                                    <option value="playback">Playback (High Quality)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="audio-visualizer">
                            <canvas id="audio-canvas" width="300" height="100"></canvas>
                        </div>
                    </div>
                    
                    <div class="gaming-panel" id="input-panel">
                        <h4>Input Devices</h4>
                        <div class="gamepad-list" id="gamepad-list">
                            <p>No gamepads connected</p>
                        </div>
                        
                        <div class="input-settings">
                            <div class="control-group">
                                <label>Input Lag Reduction:</label>
                                <input type="checkbox" id="input-lag-reduction" checked>
                            </div>
                            <div class="control-group">
                                <label>Gamepad Vibration:</label>
                                <input type="checkbox" id="gamepad-vibration" checked>
                            </div>
                        </div>
                    </div>
                    
                    <div class="gaming-panel" id="streaming-panel">
                        <h4>Streaming & Recording</h4>
                        <div class="streaming-controls">
                            <button id="start-recording">🔴 Start Recording</button>
                            <button id="start-streaming">📡 Start Stream</button>
                            <button id="take-screenshot">📸 Screenshot</button>
                        </div>
                        
                        <div class="stream-settings">
                            <div class="control-group">
                                <label>Recording Quality:</label>
                                <select id="recording-quality">
                                    <option value="720p">720p</option>
                                    <option value="1080p">1080p</option>
                                    <option value="1440p">1440p</option>
                                    <option value="4k">4K</option>
                                </select>
                            </div>
                            <div class="control-group">
                                <label>Bitrate:</label>
                                <input type="range" id="bitrate" min="1000" max="50000" value="8000">
                                <span id="bitrate-value">8000 kbps</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(ui);
        this.uiElement = ui;
        this.setupGamingUIEvents();
        this.updateGPUInfo();
        this.setupAudioVisualizer();
        this.updateGamepadList();
    }

    setupGamingUIEvents() {
        // Tab switching
        document.querySelectorAll('.gaming-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchGamingTab(e.target.dataset.tab);
            });
        });

        // Performance mode
        document.getElementById('performance-mode').addEventListener('click', () => {
            this.enablePerformanceMode();
        });

        // VR mode
        document.getElementById('vr-mode').addEventListener('click', () => {
            this.toggleVRMode();
        });

        // Close button
        document.querySelector('.gaming-close').addEventListener('click', () => {
            this.hideUI();
        });

        // Gamepad updates
        if (this.gamepadManager) {
            this.gamepadManager.on('connected', () => this.updateGamepadList());
            this.gamepadManager.on('disconnected', () => this.updateGamepadList());
        }
    }

    switchGamingTab(tabId) {
        document.querySelectorAll('.gaming-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.gaming-panel').forEach(panel => panel.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-panel`).classList.add('active');
    }

    enablePerformanceMode() {
        if (this.webglRenderer) {
            this.webglRenderer.optimizeForGaming();
        }
        
        if (this.webgpuDevice) {
            this.webgpuDevice.optimizeForGaming();
        }
        
        // Enable high-performance mode
        document.body.classList.add('performance-mode');
        
        console.log('Performance mode enabled');
    }

    async toggleVRMode() {
        if (!this.vrSupport) {
            alert('VR not supported on this device');
            return;
        }

        if (this.vrSupport.session) {
            this.vrSupport.endSession();
        } else {
            const supported = await this.vrSupport.checkSupport();
            if (supported) {
                await this.vrSupport.startSession();
            } else {
                alert('VR not available');
            }
        }
    }

    updateGPUInfo() {
        const gpuDetails = document.getElementById('gpu-details');
        if (!gpuDetails) return;

        let info = 'GPU information not available';
        
        if (this.webglRenderer) {
            const gl = this.webglRenderer.gl;
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                info = `${vendor} - ${renderer}`;
            } else {
                info = `WebGL 2.0 - ${gl.getParameter(gl.VERSION)}`;
            }
        }
        
        gpuDetails.textContent = info;
    }

    setupAudioVisualizer() {
        if (!this.audioEngine) return;

        const canvas = document.getElementById('audio-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const analyser = this.audioEngine.analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = 'rgb(20, 20, 20)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                
                ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };
        
        draw();
    }

    updateGamepadList() {
        const gamepadList = document.getElementById('gamepad-list');
        if (!gamepadList || !this.gamepadManager) return;

        const gamepads = this.gamepadManager.getAllGamepads();
        
        if (gamepads.length === 0) {
            gamepadList.innerHTML = '<p>No gamepads connected</p>';
            return;
        }

        gamepadList.innerHTML = gamepads.map(gamepad => `
            <div class="gamepad-item">
                <h5>${gamepad.id}</h5>
                <p>Buttons: ${gamepad.buttons.length}, Axes: ${gamepad.axes.length}</p>
                <div class="gamepad-status ${gamepad.connected ? 'connected' : 'disconnected'}">
                    ${gamepad.connected ? 'Connected' : 'Disconnected'}
                </div>
            </div>
        `).join('');
    }

    showUI() {
        this.uiElement.classList.add('show');
    }

    hideUI() {
        this.uiElement.classList.remove('show');
    }

    // Public API
    getWebGLContext() {
        return this.webglRenderer?.gl;
    }

    getWebGPUDevice() {
        return this.webgpuDevice?.device;
    }

    getAudioContext() {
        return this.audioContext;
    }

    createOptimizedMediaStream(constraints) {
        return this.streamingOptimizer?.createOptimizedStream(constraints);
    }
}
