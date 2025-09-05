// Navigation Controls and History Management
use anyhow::Result;
use log::{info, warn};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub url: String,
    pub title: String,
    pub timestamp: u64,
    pub favicon_url: Option<String>,
}

impl HistoryEntry {
    pub fn new(url: String, title: String) -> Self {
        Self {
            url,
            title,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            favicon_url: None,
        }
    }
}

#[derive(Debug)]
pub struct NavigationHistory {
    entries: VecDeque<HistoryEntry>,
    current_index: Option<usize>,
    max_entries: usize,
}

impl NavigationHistory {
    pub fn new() -> Self {
        Self {
            entries: VecDeque::new(),
            current_index: None,
            max_entries: 100, // Limit history to prevent memory issues
        }
    }

    pub fn add_entry(&mut self, url: String, title: String) {
        let entry = HistoryEntry::new(url, title);
        
        // If we're not at the end of history, remove forward entries
        if let Some(current) = self.current_index {
            if current + 1 < self.entries.len() {
                self.entries.truncate(current + 1);
            }
        }

        // Add new entry
        self.entries.push_back(entry);
        self.current_index = Some(self.entries.len() - 1);

        // Maintain max entries limit
        if self.entries.len() > self.max_entries {
            self.entries.pop_front();
            if let Some(ref mut index) = self.current_index {
                *index = index.saturating_sub(1);
            }
        }

        info!("Added navigation entry: {} entries total", self.entries.len());
    }

    pub fn can_go_back(&self) -> bool {
        self.current_index.map_or(false, |index| index > 0)
    }

    pub fn can_go_forward(&self) -> bool {
        self.current_index.map_or(false, |index| index + 1 < self.entries.len())
    }

    pub fn go_back(&mut self) -> Option<&HistoryEntry> {
        if self.can_go_back() {
            if let Some(ref mut index) = self.current_index {
                *index -= 1;
                return self.entries.get(*index);
            }
        }
        None
    }

    pub fn go_forward(&mut self) -> Option<&HistoryEntry> {
        if self.can_go_forward() {
            if let Some(ref mut index) = self.current_index {
                *index += 1;
                return self.entries.get(*index);
            }
        }
        None
    }

    pub fn current_entry(&self) -> Option<&HistoryEntry> {
        self.current_index
            .and_then(|index| self.entries.get(index))
    }

    pub fn get_recent_entries(&self, limit: usize) -> Vec<&HistoryEntry> {
        self.entries
            .iter()
            .rev()
            .take(limit)
            .collect()
    }

    pub fn clear(&mut self) {
        self.entries.clear();
        self.current_index = None;
        info!("Navigation history cleared");
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

impl Default for NavigationHistory {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationRequest {
    pub url: String,
    pub replace_current: bool,
    pub user_initiated: bool,
}

impl NavigationRequest {
    pub fn new(url: String) -> Self {
        Self {
            url,
            replace_current: false,
            user_initiated: true,
        }
    }

    pub fn replace(url: String) -> Self {
        Self {
            url,
            replace_current: true,
            user_initiated: true,
        }
    }
}

pub struct NavigationController {
    history: NavigationHistory,
}

impl NavigationController {
    pub fn new() -> Self {
        Self {
            history: NavigationHistory::new(),
        }
    }

    pub fn navigate(&mut self, request: NavigationRequest) -> Result<()> {
        info!("Navigation request: {}", request.url);

        // Validate URL
        if request.url.is_empty() {
            return Err(anyhow::anyhow!("Empty URL provided"));
        }

        // Add to history if not replacing current entry
        if !request.replace_current {
            self.history.add_entry(request.url.clone(), "Loading...".to_string());
        }

        Ok(())
    }

    pub fn go_back(&mut self) -> Option<String> {
        if let Some(entry) = self.history.go_back() {
            info!("Going back to: {}", entry.url);
            Some(entry.url.clone())
        } else {
            warn!("Cannot go back: no previous entries");
            None
        }
    }

    pub fn go_forward(&mut self) -> Option<String> {
        if let Some(entry) = self.history.go_forward() {
            info!("Going forward to: {}", entry.url);
            Some(entry.url.clone())
        } else {
            warn!("Cannot go forward: no forward entries");
            None
        }
    }

    pub fn can_go_back(&self) -> bool {
        self.history.can_go_back()
    }

    pub fn can_go_forward(&self) -> bool {
        self.history.can_go_forward()
    }

    pub fn current_url(&self) -> Option<String> {
        self.history.current_entry().map(|entry| entry.url.clone())
    }

    pub fn update_title(&mut self, title: String) {
        if let Some(current_index) = self.history.current_index {
            if let Some(entry) = self.history.entries.get_mut(current_index) {
                entry.title = title;
            }
        }
    }

    pub fn get_history(&self) -> Vec<&HistoryEntry> {
        self.history.get_recent_entries(50) // Return last 50 entries
    }

    pub fn clear_history(&mut self) {
        self.history.clear();
    }
}

impl Default for NavigationController {
    fn default() -> Self {
        Self::new()
    }
}
