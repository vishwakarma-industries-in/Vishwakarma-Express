// Download Manager
use anyhow::Result;
use log::{info, error};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DownloadStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled,
    Paused,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadItem {
    pub id: String,
    pub url: String,
    pub filename: String,
    pub file_path: PathBuf,
    pub total_bytes: Option<u64>,
    pub downloaded_bytes: u64,
    pub status: DownloadStatus,
    pub mime_type: Option<String>,
    pub start_time: u64,
    pub end_time: Option<u64>,
    pub error_message: Option<String>,
}

impl DownloadItem {
    pub fn new(url: String, filename: String, file_path: PathBuf) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            url,
            filename,
            file_path,
            total_bytes: None,
            downloaded_bytes: 0,
            status: DownloadStatus::Pending,
            mime_type: None,
            start_time: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            end_time: None,
            error_message: None,
        }
    }

    pub fn progress_percentage(&self) -> f64 {
        if let Some(total) = self.total_bytes {
            if total > 0 {
                (self.downloaded_bytes as f64 / total as f64) * 100.0
            } else {
                0.0
            }
        } else {
            0.0
        }
    }

    pub fn is_complete(&self) -> bool {
        matches!(self.status, DownloadStatus::Completed)
    }

    pub fn is_active(&self) -> bool {
        matches!(self.status, DownloadStatus::InProgress | DownloadStatus::Pending)
    }
}

pub struct DownloadManager {
    downloads: HashMap<String, DownloadItem>,
    download_directory: PathBuf,
    max_concurrent_downloads: usize,
    active_downloads: usize,
}

impl DownloadManager {
    pub fn new(download_directory: PathBuf) -> Self {
        Self {
            downloads: HashMap::new(),
            download_directory,
            max_concurrent_downloads: 3,
            active_downloads: 0,
        }
    }

    pub fn start_download(&mut self, url: String, filename: Option<String>) -> Result<String> {
        info!("Starting download: {}", url);

        // Generate filename if not provided
        let filename = filename.unwrap_or_else(|| {
            url.split('/')
                .last()
                .unwrap_or("download")
                .to_string()
        });

        // Create file path
        let file_path = self.download_directory.join(&filename);

        // Create download item
        let mut download = DownloadItem::new(url, filename, file_path);
        let download_id = download.id.clone();

        // Check if we can start immediately or need to queue
        if self.active_downloads < self.max_concurrent_downloads {
            download.status = DownloadStatus::InProgress;
            self.active_downloads += 1;
            
            // TODO: Start actual download process
            info!("Download {} started immediately", download_id);
        } else {
            download.status = DownloadStatus::Pending;
            info!("Download {} queued", download_id);
        }

        self.downloads.insert(download_id.clone(), download);
        Ok(download_id)
    }

    pub fn pause_download(&mut self, download_id: &str) -> Result<()> {
        if let Some(download) = self.downloads.get_mut(download_id) {
            if matches!(download.status, DownloadStatus::InProgress) {
                download.status = DownloadStatus::Paused;
                self.active_downloads = self.active_downloads.saturating_sub(1);
                info!("Download {} paused", download_id);
                
                // Start next queued download if any
                self.start_next_queued_download();
            }
        }
        Ok(())
    }

    pub fn resume_download(&mut self, download_id: &str) -> Result<()> {
        if let Some(download) = self.downloads.get_mut(download_id) {
            if matches!(download.status, DownloadStatus::Paused) {
                if self.active_downloads < self.max_concurrent_downloads {
                    download.status = DownloadStatus::InProgress;
                    self.active_downloads += 1;
                    info!("Download {} resumed", download_id);
                    
                    // TODO: Resume actual download process
                } else {
                    download.status = DownloadStatus::Pending;
                    info!("Download {} queued for resume", download_id);
                }
            }
        }
        Ok(())
    }

    pub fn cancel_download(&mut self, download_id: &str) -> Result<()> {
        if let Some(download) = self.downloads.get_mut(download_id) {
            if download.is_active() {
                self.active_downloads = self.active_downloads.saturating_sub(1);
            }
            
            download.status = DownloadStatus::Cancelled;
            download.end_time = Some(
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
            );
            
            info!("Download {} cancelled", download_id);
            
            // Start next queued download if any
            self.start_next_queued_download();
        }
        Ok(())
    }

    pub fn remove_download(&mut self, download_id: &str) -> Result<()> {
        if let Some(download) = self.downloads.remove(download_id) {
            if download.is_active() {
                self.active_downloads = self.active_downloads.saturating_sub(1);
                // Start next queued download if any
                self.start_next_queued_download();
            }
            
            info!("Download {} removed", download_id);
        }
        Ok(())
    }

    pub fn get_download(&self, download_id: &str) -> Option<&DownloadItem> {
        self.downloads.get(download_id)
    }

    pub fn get_all_downloads(&self) -> Vec<&DownloadItem> {
        self.downloads.values().collect()
    }

    pub fn get_active_downloads(&self) -> Vec<&DownloadItem> {
        self.downloads
            .values()
            .filter(|download| download.is_active())
            .collect()
    }

    pub fn get_completed_downloads(&self) -> Vec<&DownloadItem> {
        self.downloads
            .values()
            .filter(|download| download.is_complete())
            .collect()
    }

    pub fn clear_completed(&mut self) {
        self.downloads.retain(|_, download| !download.is_complete());
        info!("Cleared completed downloads");
    }

    pub fn set_download_directory(&mut self, path: PathBuf) -> Result<()> {
        if !path.exists() {
            std::fs::create_dir_all(&path)?;
        }
        
        self.download_directory = path;
        info!("Download directory updated to: {:?}", self.download_directory);
        Ok(())
    }

    pub fn get_download_directory(&self) -> &PathBuf {
        &self.download_directory
    }

    fn start_next_queued_download(&mut self) {
        if self.active_downloads >= self.max_concurrent_downloads {
            return;
        }

        // Find next pending download
        let next_download_id = self.downloads
            .iter()
            .find(|(_, download)| matches!(download.status, DownloadStatus::Pending))
            .map(|(id, _)| id.clone());

        if let Some(download_id) = next_download_id {
            if let Some(download) = self.downloads.get_mut(&download_id) {
                download.status = DownloadStatus::InProgress;
                self.active_downloads += 1;
                info!("Started queued download: {}", download_id);
                
                // TODO: Start actual download process
            }
        }
    }

    pub fn update_download_progress(&mut self, download_id: &str, downloaded_bytes: u64, total_bytes: Option<u64>) {
        if let Some(download) = self.downloads.get_mut(download_id) {
            download.downloaded_bytes = downloaded_bytes;
            if let Some(total) = total_bytes {
                download.total_bytes = Some(total);
            }
        }
    }

    pub fn complete_download(&mut self, download_id: &str) {
        if let Some(download) = self.downloads.get_mut(download_id) {
            download.status = DownloadStatus::Completed;
            download.end_time = Some(
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
            );
            
            self.active_downloads = self.active_downloads.saturating_sub(1);
            info!("Download {} completed", download_id);
            
            // Start next queued download if any
            self.start_next_queued_download();
        }
    }

    pub fn fail_download(&mut self, download_id: &str, error_message: String) {
        if let Some(download) = self.downloads.get_mut(download_id) {
            download.status = DownloadStatus::Failed;
            download.error_message = Some(error_message);
            download.end_time = Some(
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
            );
            
            self.active_downloads = self.active_downloads.saturating_sub(1);
            error!("Download {} failed", download_id);
            
            // Start next queued download if any
            self.start_next_queued_download();
        }
    }
}

impl Default for DownloadManager {
    fn default() -> Self {
        let download_dir = dirs::download_dir()
            .unwrap_or_else(|| std::env::current_dir().unwrap_or_default());
        Self::new(download_dir)
    }
}
