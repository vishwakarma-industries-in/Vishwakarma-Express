// Vishwakarma Express Browser - Main Library
mod browser;

use browser::{TabManager, SharedTabManager};
use log::info;
use std::sync::Mutex;

// Application state
pub struct AppState {
    tab_manager: SharedTabManager,
}

// Tauri commands
#[tauri::command]
async fn create_new_tab(
    state: tauri::State<'_, AppState>,
    url: Option<String>,
) -> Result<String, String> {
    let mut tab_manager = state.tab_manager.lock().unwrap();
    let tab_id = tab_manager.create_tab(url, None).map_err(|e| e.to_string())?;
    Ok(tab_id)
}

#[tauri::command]
async fn close_tab(
    state: tauri::State<'_, AppState>,
    tab_id: String,
) -> Result<(), String> {
    let mut tab_manager = state.tab_manager.lock().unwrap();
    tab_manager.close_tab(&tab_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn navigate_to_url(
    state: tauri::State<'_, AppState>,
    tab_id: String,
    url: String,
) -> Result<(), String> {
    let mut tab_manager = state.tab_manager.lock().unwrap();
    if let Some(tab) = tab_manager.get_tab(&tab_id) {
        tab.navigate(&url).map_err(|e| e.to_string())
    } else {
        Err("Tab not found".to_string())
    }
}

#[tauri::command]
async fn reload_tab(
    state: tauri::State<'_, AppState>,
    tab_id: String,
) -> Result<(), String> {
    let mut tab_manager = state.tab_manager.lock().unwrap();
    if let Some(tab) = tab_manager.get_tab(&tab_id) {
        tab.reload().map_err(|e| e.to_string())
    } else {
        Err("Tab not found".to_string())
    }
}

#[tauri::command]
async fn go_back(
    state: tauri::State<'_, AppState>,
    tab_id: String,
) -> Result<(), String> {
    let mut tab_manager = state.tab_manager.lock().unwrap();
    if let Some(tab) = tab_manager.get_tab(&tab_id) {
        tab.go_back().map(|_| ()).map_err(|e| e.to_string())
    } else {
        Err("Tab not found".to_string())
    }
}

#[tauri::command]
async fn go_forward(
    state: tauri::State<'_, AppState>,
    tab_id: String,
) -> Result<(), String> {
    let mut tab_manager = state.tab_manager.lock().unwrap();
    if let Some(tab) = tab_manager.get_tab(&tab_id) {
        tab.go_forward().map(|_| ()).map_err(|e| e.to_string())
    } else {
        Err("Tab not found".to_string())
    }
}

#[tauri::command]
async fn get_all_tabs(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<serde_json::Value>, String> {
    let tab_manager = state.tab_manager.lock().unwrap();
    let tabs = tab_manager.get_all_tab_info()
        .iter()
        .map(|tab_info| serde_json::json!({
            "id": tab_info.id,
            "url": tab_info.url,
            "title": tab_info.title,
            "is_loading": tab_info.is_loading,
            "can_go_back": false,
            "can_go_forward": false,
            "is_active": tab_info.is_active,
            "favicon_url": tab_info.favicon_url,
            "is_pinned": false,
        }))
        .collect();
    Ok(tabs)
}

#[tauri::command]
async fn get_active_tab_id(
    state: tauri::State<'_, AppState>,
) -> Result<Option<String>, String> {
    let tab_manager = state.tab_manager.lock().unwrap();
    Ok(tab_manager.get_active_tab_id().map(|s| s.to_string()))
}

#[tauri::command]
async fn set_active_tab(
    state: tauri::State<'_, AppState>,
    tab_id: String,
) -> Result<(), String> {
    let mut tab_manager = state.tab_manager.lock().unwrap();
    tab_manager.set_active_tab(&tab_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_tab_info(
    state: tauri::State<'_, AppState>,
    tab_id: String,
) -> Result<serde_json::Value, String> {
    let tab_manager = state.tab_manager.lock().unwrap();
    let tab_info = tab_manager.get_tab_info(&tab_id).ok_or("Tab not found")?;
    
    Ok(serde_json::json!({
        "id": tab_info.id,
        "url": tab_info.url,
        "title": tab_info.title,
        "is_loading": tab_info.is_loading,
        "can_go_back": false,
        "can_go_forward": false,
        "is_active": tab_info.is_active,
        "favicon_url": tab_info.favicon_url,
        "is_pinned": false,
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Setup logging
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            info!("Vishwakarma Express browser starting up...");
            Ok(())
        })
        .manage(AppState {
            tab_manager: SharedTabManager::new(Mutex::new(TabManager::new())),
        })
        .invoke_handler(tauri::generate_handler![
            create_new_tab,
            close_tab,
            navigate_to_url,
            reload_tab,
            go_back,
            go_forward,
            get_all_tabs,
            get_active_tab_id,
            set_active_tab,
            get_tab_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
