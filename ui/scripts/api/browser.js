// Vishwakarma Express - Browser API
const { invoke } = window.__TAURI__.tauri;

export class BrowserAPI {
    // Tab Management
    static async createNewTab(url = null) {
        try {
            const tabId = await invoke('create_new_tab', { url });
            console.log('New tab created:', tabId);
            return tabId;
        } catch (error) {
            console.error('Failed to create new tab:', error);
            throw error;
        }
    }

    static async closeTab(tabId) {
        try {
            await invoke('close_tab', { tabId });
            console.log('Tab closed:', tabId);
            return true;
        } catch (error) {
            console.error('Failed to close tab:', error);
            throw error;
        }
    }

    static async navigateToUrl(tabId, url) {
        try {
            return await invoke('navigate_to_url', { tabId, url });
        } catch (error) {
            console.error('Failed to navigate:', error);
            throw error;
        }
    }

    static async reloadTab(tabId) {
        try {
            return await invoke('reload_tab', { tabId });
        } catch (error) {
            console.error('Failed to reload tab:', error);
            throw error;
        }
    }

    static async goBack(tabId) {
        try {
            return await invoke('go_back', { tabId });
        } catch (error) {
            console.error('Failed to go back:', error);
            throw error;
        }
    }

    static async goForward(tabId) {
        try {
            return await invoke('go_forward', { tabId });
        } catch (error) {
            console.error('Failed to go forward:', error);
            throw error;
        }
    }

    static async getTabInfo(tabId) {
        try {
            return await invoke('get_tab_info', { tabId });
        } catch (error) {
            console.error('Failed to get tab info:', error);
            throw error;
        }
    }

    static async getAllTabs() {
        try {
            return await invoke('get_all_tabs');
        } catch (error) {
            console.error('Failed to get all tabs:', error);
            throw error;
        }
    }

    static async setActiveTab(tabId) {
        try {
            return await invoke('set_active_tab', { tabId });
        } catch (error) {
            console.error('Failed to set active tab:', error);
            throw error;
        }
    }

    static async getActiveTabId() {
        try {
            return await invoke('get_active_tab_id');
        } catch (error) {
            console.error('Failed to get active tab ID:', error);
            throw error;
        }
    }

    // Utility functions
    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    static formatUrl(input) {
        if (!input) return '';
        
        // Check if it's already a valid URL
        if (this.isValidUrl(input)) {
            return input;
        }
        
        // Check if it looks like a domain
        if (input.includes('.') && !input.includes(' ')) {
            return `https://${input}`;
        }
        
        // Otherwise, treat as search query
        return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
    }

    static extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return '';
        }
    }

    // Toast notifications
    static showToast(message, type = 'info') {
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
};
