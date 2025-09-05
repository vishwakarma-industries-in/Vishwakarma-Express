// Tab Management System
use super::engine::{EngineConfig, SharedEngine, create_engine};
use anyhow::Result;
use log::{info, warn, error};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabInfo {
    pub id: String,
    pub title: String,
    pub url: String,
    pub favicon_url: Option<String>,
    pub is_active: bool,
    pub is_loading: bool,
    pub is_pinned: bool,
    pub created_at: u64,
}

impl TabInfo {
    pub fn new(url: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            title: "New Tab".to_string(),
            url,
            favicon_url: None,
            is_active: false,
            is_loading: false,
            is_pinned: false,
            created_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        }
    }
}

pub struct BrowserTab {
    pub info: TabInfo,
    pub engine: SharedEngine,
}

impl BrowserTab {
    pub fn new(url: String, config: Option<EngineConfig>) -> Result<Self> {
        let info = TabInfo::new(url.clone());
        let engine = create_engine(config)?;
        
        // Navigate to initial URL if provided and not empty
        if !url.is_empty() && url != "about:blank" {
            if let Ok(mut engine_lock) = engine.lock() {
                if let Err(e) = engine_lock.navigate_to(&url) {
                    error!("Failed to navigate to initial URL {}: {}", url, e);
                }
            }
        }

        Ok(Self { info, engine })
    }

    pub fn navigate(&mut self, url: &str) -> Result<()> {
        info!("Tab {} navigating to: {}", self.info.id, url);
        
        self.info.is_loading = true;
        self.info.url = url.to_string();
        
        if let Ok(mut engine) = self.engine.lock() {
            engine.navigate_to(url)?;
            self.info.is_loading = engine.is_loading();
        }
        
        Ok(())
    }

    pub fn reload(&mut self) -> Result<()> {
        info!("Reloading tab {}", self.info.id);
        
        if let Ok(mut engine) = self.engine.lock() {
            engine.reload()?;
            self.info.is_loading = engine.is_loading();
        }
        
        Ok(())
    }

    pub fn stop(&mut self) {
        info!("Stopping tab {}", self.info.id);
        
        if let Ok(mut engine) = self.engine.lock() {
            engine.stop_loading();
            self.info.is_loading = false;
        }
    }

    pub fn go_back(&mut self) -> Result<bool> {
        if let Ok(mut engine) = self.engine.lock() {
            engine.go_back()
        } else {
            Ok(false)
        }
    }

    pub fn go_forward(&mut self) -> Result<bool> {
        if let Ok(mut engine) = self.engine.lock() {
            engine.go_forward()
        } else {
            Ok(false)
        }
    }

    pub fn can_go_back(&self) -> bool {
        if let Ok(engine) = self.engine.lock() {
            engine.can_go_back()
        } else {
            false
        }
    }

    pub fn can_go_forward(&self) -> bool {
        if let Ok(engine) = self.engine.lock() {
            engine.can_go_forward()
        } else {
            false
        }
    }

    pub fn update_title(&mut self, title: String) {
        self.info.title = title;
    }

    pub fn set_favicon(&mut self, favicon_url: String) {
        self.info.favicon_url = Some(favicon_url);
    }

    pub fn set_pinned(&mut self, pinned: bool) {
        self.info.is_pinned = pinned;
    }
}

pub struct TabManager {
    tabs: HashMap<String, BrowserTab>,
    tab_order: Vec<String>,
    active_tab_id: Option<String>,
    next_new_tab_index: usize,
}

impl TabManager {
    pub fn new() -> Self {
        Self {
            tabs: HashMap::new(),
            tab_order: Vec::new(),
            active_tab_id: None,
            next_new_tab_index: 1,
        }
    }

    pub fn create_tab(&mut self, url: Option<String>, config: Option<EngineConfig>) -> Result<String> {
        let url = url.unwrap_or_else(|| "about:blank".to_string());
        let tab = BrowserTab::new(url, config)?;
        let tab_id = tab.info.id.clone();
        
        info!("Creating new tab: {}", tab_id);
        
        self.tabs.insert(tab_id.clone(), tab);
        self.tab_order.push(tab_id.clone());
        
        // Set as active if it's the first tab
        if self.active_tab_id.is_none() {
            self.set_active_tab(&tab_id)?;
        }
        
        self.next_new_tab_index += 1;
        Ok(tab_id)
    }

    pub fn close_tab(&mut self, tab_id: &str) -> Result<()> {
        info!("Closing tab: {}", tab_id);
        
        if !self.tabs.contains_key(tab_id) {
            warn!("Attempted to close non-existent tab: {}", tab_id);
            return Ok(());
        }

        // Remove from tabs and order
        self.tabs.remove(tab_id);
        self.tab_order.retain(|id| id != tab_id);

        // Handle active tab change
        if self.active_tab_id.as_ref() == Some(&tab_id.to_string()) {
            self.active_tab_id = None;
            
            // Set new active tab (prefer next tab, fallback to previous)
            if !self.tab_order.is_empty() {
                let new_active_id = self.tab_order[0].clone();
                self.set_active_tab(&new_active_id)?;
            }
        }

        Ok(())
    }

    pub fn set_active_tab(&mut self, tab_id: &str) -> Result<()> {
        if !self.tabs.contains_key(tab_id) {
            return Err(anyhow::anyhow!("Tab not found: {}", tab_id));
        }

        // Deactivate current active tab
        if let Some(ref current_active_id) = self.active_tab_id {
            if let Some(current_tab) = self.tabs.get_mut(current_active_id) {
                current_tab.info.is_active = false;
            }
        }

        // Activate new tab
        if let Some(new_tab) = self.tabs.get_mut(tab_id) {
            new_tab.info.is_active = true;
            self.active_tab_id = Some(tab_id.to_string());
            info!("Set active tab: {}", tab_id);
        }

        Ok(())
    }

    pub fn get_active_tab(&mut self) -> Option<&mut BrowserTab> {
        if let Some(ref active_id) = self.active_tab_id {
            self.tabs.get_mut(active_id)
        } else {
            None
        }
    }

    pub fn get_tab(&mut self, tab_id: &str) -> Option<&mut BrowserTab> {
        self.tabs.get_mut(tab_id)
    }

    pub fn get_tab_info(&self, tab_id: &str) -> Option<&TabInfo> {
        self.tabs.get(tab_id).map(|tab| &tab.info)
    }

    pub fn get_all_tab_info(&self) -> Vec<TabInfo> {
        self.tab_order
            .iter()
            .filter_map(|id| self.tabs.get(id))
            .map(|tab| tab.info.clone())
            .collect()
    }

    pub fn get_active_tab_id(&self) -> Option<&str> {
        self.active_tab_id.as_deref()
    }

    pub fn tab_count(&self) -> usize {
        self.tabs.len()
    }

    pub fn move_tab(&mut self, tab_id: &str, new_index: usize) -> Result<()> {
        if !self.tabs.contains_key(tab_id) {
            return Err(anyhow::anyhow!("Tab not found: {}", tab_id));
        }

        // Remove from current position
        self.tab_order.retain(|id| id != tab_id);
        
        // Insert at new position
        let insert_index = new_index.min(self.tab_order.len());
        self.tab_order.insert(insert_index, tab_id.to_string());
        
        info!("Moved tab {} to position {}", tab_id, new_index);
        Ok(())
    }
}

impl Default for TabManager {
    fn default() -> Self {
        Self::new()
    }
}

// Thread-safe wrapper for the tab manager
pub type SharedTabManager = Arc<Mutex<TabManager>>;
