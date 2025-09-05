// Integrated Terminal and File Manager - Phase 5 Revolutionary Component
export class TerminalFileManager {
    constructor() {
        this.terminal = null;
        this.fileSystem = null;
        this.currentDirectory = '/';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.processes = new Map();
        this.fileWatchers = new Map();
        
        this.init();
    }

    async init() {
        console.log('Initializing Terminal and File Manager...');
        
        this.initializeFileSystem();
        this.createTerminalInterface();
        this.setupFileManager();
        this.registerCommands();
        
        console.log('Terminal and File Manager ready - Full system access enabled');
    }

    initializeFileSystem() {
        this.fileSystem = {
            root: {
                type: 'directory',
                name: '/',
                children: {
                    'home': {
                        type: 'directory',
                        name: 'home',
                        children: {
                            'user': {
                                type: 'directory',
                                name: 'user',
                                children: {
                                    'documents': { type: 'directory', name: 'documents', children: {} },
                                    'downloads': { type: 'directory', name: 'downloads', children: {} },
                                    'projects': { type: 'directory', name: 'projects', children: {} }
                                }
                            }
                        }
                    },
                    'tmp': { type: 'directory', name: 'tmp', children: {} },
                    'var': { type: 'directory', name: 'var', children: {} }
                }
            },
            
            resolvePath: (path) => {
                if (path.startsWith('/')) {
                    path = path.substring(1);
                }
                
                const parts = path.split('/').filter(p => p);
                let current = this.fileSystem.root;
                
                for (const part of parts) {
                    if (part === '..') {
                        // Handle parent directory
                        continue;
                    }
                    
                    if (current.children && current.children[part]) {
                        current = current.children[part];
                    } else {
                        return null;
                    }
                }
                
                return current;
            },
            
            createFile: (path, content = '') => {
                const parts = path.split('/');
                const fileName = parts.pop();
                const dirPath = parts.join('/') || '/';
                
                const dir = this.fileSystem.resolvePath(dirPath);
                if (dir && dir.type === 'directory') {
                    dir.children[fileName] = {
                        type: 'file',
                        name: fileName,
                        content: content,
                        size: content.length,
                        modified: new Date()
                    };
                    return true;
                }
                return false;
            },
            
            createDirectory: (path) => {
                const parts = path.split('/');
                const dirName = parts.pop();
                const parentPath = parts.join('/') || '/';
                
                const parent = this.fileSystem.resolvePath(parentPath);
                if (parent && parent.type === 'directory') {
                    parent.children[dirName] = {
                        type: 'directory',
                        name: dirName,
                        children: {}
                    };
                    return true;
                }
                return false;
            },
            
            deleteItem: (path) => {
                const parts = path.split('/');
                const itemName = parts.pop();
                const parentPath = parts.join('/') || '/';
                
                const parent = this.fileSystem.resolvePath(parentPath);
                if (parent && parent.children && parent.children[itemName]) {
                    delete parent.children[itemName];
                    return true;
                }
                return false;
            },
            
            listDirectory: (path) => {
                const dir = this.fileSystem.resolvePath(path);
                if (dir && dir.type === 'directory') {
                    return Object.values(dir.children);
                }
                return [];
            }
        };
    }

    createTerminalInterface() {
        const ui = document.createElement('div');
        ui.id = 'terminal-filemanager-ui';
        ui.className = 'terminal-filemanager-ui';
        
        ui.innerHTML = `
            <div class="terminal-header">
                <h3>💻 Terminal & File Manager</h3>
                <div class="terminal-controls">
                    <button id="new-tab">New Tab</button>
                    <button id="split-view">Split View</button>
                    <button class="terminal-close">×</button>
                </div>
            </div>
            
            <div class="terminal-content">
                <div class="terminal-sidebar">
                    <div class="file-explorer">
                        <h4>File Explorer</h4>
                        <div class="file-tree" id="file-tree"></div>
                    </div>
                    
                    <div class="quick-actions">
                        <h4>Quick Actions</h4>
                        <button class="action-btn" onclick="window.app.terminalFileManager.createNewFile()">📄 New File</button>
                        <button class="action-btn" onclick="window.app.terminalFileManager.createNewFolder()">📁 New Folder</button>
                        <button class="action-btn" onclick="window.app.terminalFileManager.openFileDialog()">📂 Open</button>
                        <button class="action-btn" onclick="window.app.terminalFileManager.refreshFileTree()">🔄 Refresh</button>
                    </div>
                </div>
                
                <div class="terminal-main">
                    <div class="terminal-tabs">
                        <div class="terminal-tab active" data-tab="terminal1">Terminal 1</div>
                        <button class="add-terminal-tab">+</button>
                    </div>
                    
                    <div class="terminal-sessions">
                        <div class="terminal-session active" id="terminal1">
                            <div class="terminal-output" id="terminal-output"></div>
                            <div class="terminal-input-line">
                                <span class="terminal-prompt" id="terminal-prompt">user@vishwakarma:~$ </span>
                                <input type="text" class="terminal-input" id="terminal-input" autocomplete="off">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(ui);
        this.uiElement = ui;
        this.setupTerminalEvents();
        this.updateFileTree();
        this.focusTerminal();
    }

    setupTerminalEvents() {
        const terminalInput = document.getElementById('terminal-input');
        
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(terminalInput.value);
                terminalInput.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autoComplete(terminalInput.value);
            }
        });

        // Close button
        document.querySelector('.terminal-close').addEventListener('click', () => {
            this.hideUI();
        });
    }

    registerCommands() {
        this.commands = {
            'ls': {
                description: 'List directory contents',
                execute: (args) => {
                    const path = args[0] || this.currentDirectory;
                    const items = this.fileSystem.listDirectory(path);
                    
                    if (items.length === 0) {
                        return 'Directory is empty';
                    }
                    
                    return items.map(item => {
                        const type = item.type === 'directory' ? 'd' : '-';
                        const size = item.size || 0;
                        const name = item.name;
                        return `${type}rwxr-xr-x 1 user user ${size.toString().padStart(8)} ${name}`;
                    }).join('\n');
                }
            },
            
            'cd': {
                description: 'Change directory',
                execute: (args) => {
                    const path = args[0] || '/home/user';
                    const resolved = this.fileSystem.resolvePath(path);
                    
                    if (resolved && resolved.type === 'directory') {
                        this.currentDirectory = path;
                        this.updatePrompt();
                        return '';
                    } else {
                        return `cd: ${path}: No such file or directory`;
                    }
                }
            },
            
            'pwd': {
                description: 'Print working directory',
                execute: () => this.currentDirectory
            },
            
            'mkdir': {
                description: 'Create directory',
                execute: (args) => {
                    if (!args[0]) {
                        return 'mkdir: missing operand';
                    }
                    
                    const success = this.fileSystem.createDirectory(args[0]);
                    if (success) {
                        this.updateFileTree();
                        return '';
                    } else {
                        return `mkdir: cannot create directory '${args[0]}': No such file or directory`;
                    }
                }
            },
            
            'touch': {
                description: 'Create file',
                execute: (args) => {
                    if (!args[0]) {
                        return 'touch: missing file operand';
                    }
                    
                    const success = this.fileSystem.createFile(args[0]);
                    if (success) {
                        this.updateFileTree();
                        return '';
                    } else {
                        return `touch: cannot touch '${args[0]}': No such file or directory`;
                    }
                }
            },
            
            'rm': {
                description: 'Remove files and directories',
                execute: (args) => {
                    if (!args[0]) {
                        return 'rm: missing operand';
                    }
                    
                    const success = this.fileSystem.deleteItem(args[0]);
                    if (success) {
                        this.updateFileTree();
                        return '';
                    } else {
                        return `rm: cannot remove '${args[0]}': No such file or directory`;
                    }
                }
            },
            
            'cat': {
                description: 'Display file contents',
                execute: (args) => {
                    if (!args[0]) {
                        return 'cat: missing file operand';
                    }
                    
                    const file = this.fileSystem.resolvePath(args[0]);
                    if (file && file.type === 'file') {
                        return file.content || '';
                    } else {
                        return `cat: ${args[0]}: No such file or directory`;
                    }
                }
            },
            
            'echo': {
                description: 'Display text',
                execute: (args) => args.join(' ')
            },
            
            'clear': {
                description: 'Clear terminal',
                execute: () => {
                    document.getElementById('terminal-output').innerHTML = '';
                    return '';
                }
            },
            
            'help': {
                description: 'Show available commands',
                execute: () => {
                    return Object.entries(this.commands)
                        .map(([cmd, info]) => `${cmd.padEnd(10)} - ${info.description}`)
                        .join('\n');
                }
            },
            
            'ps': {
                description: 'Show running processes',
                execute: () => {
                    if (this.processes.size === 0) {
                        return 'No running processes';
                    }
                    
                    let output = 'PID    COMMAND\n';
                    for (const [pid, process] of this.processes) {
                        output += `${pid.toString().padEnd(6)} ${process.command}\n`;
                    }
                    return output;
                }
            },
            
            'kill': {
                description: 'Terminate process',
                execute: (args) => {
                    const pid = parseInt(args[0]);
                    if (this.processes.has(pid)) {
                        this.processes.delete(pid);
                        return `Process ${pid} terminated`;
                    } else {
                        return `kill: ${pid}: No such process`;
                    }
                }
            },
            
            'nano': {
                description: 'Text editor',
                execute: (args) => {
                    if (!args[0]) {
                        return 'nano: missing file operand';
                    }
                    
                    this.openFileEditor(args[0]);
                    return `Opening ${args[0]} in editor...`;
                }
            }
        };
    }

    executeCommand(input) {
        if (!input.trim()) return;
        
        this.commandHistory.push(input);
        this.historyIndex = this.commandHistory.length;
        
        const parts = input.trim().split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);
        
        this.addToOutput(`${this.getPrompt()}${input}`);
        
        if (this.commands[command]) {
            const result = this.commands[command].execute(args);
            if (result) {
                this.addToOutput(result);
            }
        } else {
            this.addToOutput(`${command}: command not found`);
        }
    }

    addToOutput(text) {
        const output = document.getElementById('terminal-output');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        this.historyIndex = Math.max(0, Math.min(this.historyIndex, this.commandHistory.length));
        
        const input = document.getElementById('terminal-input');
        if (this.historyIndex < this.commandHistory.length) {
            input.value = this.commandHistory[this.historyIndex];
        } else {
            input.value = '';
        }
    }

    autoComplete(input) {
        const commands = Object.keys(this.commands);
        const matches = commands.filter(cmd => cmd.startsWith(input));
        
        if (matches.length === 1) {
            document.getElementById('terminal-input').value = matches[0];
        } else if (matches.length > 1) {
            this.addToOutput(matches.join('  '));
        }
    }

    getPrompt() {
        return `user@vishwakarma:${this.currentDirectory}$ `;
    }

    updatePrompt() {
        document.getElementById('terminal-prompt').textContent = this.getPrompt();
    }

    setupFileManager() {
        // File manager functionality
        this.fileManager = {
            selectedItems: new Set(),
            clipboard: null,
            
            selectItem: (path) => {
                this.fileManager.selectedItems.add(path);
                this.updateFileTree();
            },
            
            copyItems: () => {
                this.fileManager.clipboard = {
                    operation: 'copy',
                    items: Array.from(this.fileManager.selectedItems)
                };
            },
            
            cutItems: () => {
                this.fileManager.clipboard = {
                    operation: 'cut',
                    items: Array.from(this.fileManager.selectedItems)
                };
            },
            
            pasteItems: (targetPath) => {
                if (!this.fileManager.clipboard) return;
                
                // Implementation would handle actual file operations
                console.log('Paste operation:', this.fileManager.clipboard, 'to', targetPath);
                this.fileManager.clipboard = null;
                this.fileManager.selectedItems.clear();
                this.updateFileTree();
            }
        };
    }

    updateFileTree() {
        const treeElement = document.getElementById('file-tree');
        if (!treeElement) return;
        
        treeElement.innerHTML = this.renderFileTree(this.fileSystem.root, '');
    }

    renderFileTree(node, path) {
        if (node.type === 'file') {
            return `<div class="file-item" onclick="window.app.terminalFileManager.selectFile('${path}')">
                📄 ${node.name}
            </div>`;
        } else {
            const children = Object.values(node.children || {});
            const childrenHtml = children.map(child => 
                this.renderFileTree(child, `${path}/${child.name}`)
            ).join('');
            
            return `<div class="folder-item">
                <div class="folder-header" onclick="window.app.terminalFileManager.toggleFolder(this)">
                    📁 ${node.name}
                </div>
                <div class="folder-children">${childrenHtml}</div>
            </div>`;
        }
    }

    selectFile(path) {
        console.log('Selected file:', path);
        this.fileManager.selectItem(path);
    }

    toggleFolder(element) {
        const children = element.nextElementSibling;
        children.style.display = children.style.display === 'none' ? 'block' : 'none';
    }

    createNewFile() {
        const name = prompt('Enter file name:');
        if (name) {
            const path = `${this.currentDirectory}/${name}`;
            this.fileSystem.createFile(path);
            this.updateFileTree();
        }
    }

    createNewFolder() {
        const name = prompt('Enter folder name:');
        if (name) {
            const path = `${this.currentDirectory}/${name}`;
            this.fileSystem.createDirectory(path);
            this.updateFileTree();
        }
    }

    openFileDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const path = `${this.currentDirectory}/${file.name}`;
                    this.fileSystem.createFile(path, event.target.result);
                    this.updateFileTree();
                };
                reader.readAsText(file);
            });
        };
        input.click();
    }

    refreshFileTree() {
        this.updateFileTree();
    }

    openFileEditor(filename) {
        // Simple file editor implementation
        const content = this.fileSystem.resolvePath(filename)?.content || '';
        const newContent = prompt(`Editing ${filename}:`, content);
        
        if (newContent !== null) {
            this.fileSystem.createFile(filename, newContent);
            this.updateFileTree();
        }
    }

    focusTerminal() {
        setTimeout(() => {
            const input = document.getElementById('terminal-input');
            if (input) input.focus();
        }, 100);
    }

    showUI() {
        this.uiElement.classList.add('show');
        this.focusTerminal();
    }

    hideUI() {
        this.uiElement.classList.remove('show');
    }

    // Public API
    executeTerminalCommand(command) {
        this.executeCommand(command);
    }

    getCurrentDirectory() {
        return this.currentDirectory;
    }

    getFileSystem() {
        return this.fileSystem;
    }
}
