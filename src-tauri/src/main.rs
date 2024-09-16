// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod rete_neurale_mlp;
use std::sync::{Arc, RwLock};

use crate::rete_neurale_mlp::rete_neurale::*;

// Uso di RETE come un Arc per rendere il puntatore thread-safe
static RETE: RwLock<Option<ReteNeurale>> = RwLock::new(None);


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn crea_rete(strati: usize, attivazione: &str, neuroni: Vec<usize>) -> String {
    // Scegli la funzione di attivazione basata sulla stringa 'attivazione'
    let funzione_attivazione: Arc<dyn FunzioneAttivazione + Send + Sync> = match attivazione {
   
        "Sigmoide"  => Arc::new(Sigmoide),
        "ReLU"      => Arc::new(ReLU),
        "LeakyReLU" => Arc::new(LeakyReLU { alpha: 0.5 }),
        "Tanh"      => Arc::new(Tanh),
        "Softplus"  => Arc::new(Softplus),
        "Swish"     => Arc::new(Swish),
        _           => return "Errore: funzione di attivazione non valida".to_string()
    };

    // Crea una nuova rete neurale usando Arc per la funzione di attivazione
    let rete = ReteNeurale::nuova(neuroni,0.1, funzione_attivazione.into());

    // Scrivi la nuova rete neurale all'interno di RETE
    let mut rete_guard = RETE.write().unwrap();
    *rete_guard = Some(rete);

    // Formatta e restituisci una stringa descrittiva
    format!( "{} ",rete_guard.clone().unwrap().clone())
}



    
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![crea_rete])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
    