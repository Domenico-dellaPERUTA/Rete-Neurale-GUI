// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn crea_rete(strati: u8, attivazione: &str, neuroni: Vec<u8>) -> String {
    format!("strati: {} - attivazione: {}  -  {:?}",strati,attivazione,neuroni)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![crea_rete])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
