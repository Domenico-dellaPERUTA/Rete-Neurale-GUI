// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod rete_neurale_mlp;
use std::sync::{Arc, RwLock};

use crate::rete_neurale_mlp::rete_neurale::*;

// Uso di RETE come un Arc per rendere il puntatore thread-safe
static RETE: RwLock<Option<ReteNeurale>> = RwLock::new(None);
static INPUT_ADDESTRAMENTO: RwLock<Vec<InputAddestramento>> = RwLock::new(vec![]);


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn crea_rete(apprendimento: f64, attivazione: &str, neuroni: Vec<usize>, alfa: f64) -> (String, Vec<Vec<Vec<f64>>>) {
    // Scegli la funzione di attivazione basata sulla stringa 'attivazione'
    let funzione_attivazione: Arc<dyn FunzioneAttivazione + Send + Sync> = match attivazione {
        "Sigmoide"  => Arc::new(Sigmoide),
        "ReLU"      => Arc::new(ReLU),
        "LeakyReLU" => Arc::new(LeakyReLU { alpha: alfa }),
        "Tanh"      => Arc::new(Tanh),
        "Softplus"  => Arc::new(Softplus),
        "Swish"     => Arc::new(Swish),
        _           => return ("Errore: funzione di attivazione non valida".to_string(), vec![vec![vec![]]]),
    };

    // Crea una nuova rete neurale usando Arc per la funzione di attivazione
    let rete = ReteNeurale::nuova(neuroni, apprendimento, funzione_attivazione.into());

    // Scrivi la nuova rete neurale all'interno di RETE
    let mut rete_guard = RETE.write().unwrap();
    *rete_guard = Some(rete);

    // Restituisci una stringa descrittiva e i pesi della rete
    if let Some(rete) = rete_guard.as_ref() {
        (format!("Rete neurale creata: {}", rete), rete.pesi_connessioni())
    } else {
        ("Errore: rete neurale non creata".to_string(), vec![vec![vec![]]])
    }
}

#[tauri::command]
fn addestra(id: usize, input: Vec<f64>, output: Vec<f64>, start: bool, end: bool) -> String {
    let mut input_addestramento = INPUT_ADDESTRAMENTO.write().unwrap();
    let mut title = "".to_string();
    

    if start {
        title += "\nSet di addestramento [Input / Output]\n";
        input_addestramento.clear();
    }

    input_addestramento.push(InputAddestramento { input: input.clone(), output: output.clone() });

    format!("{}{} - {:?} {:?}", title, id, input, output)
}

#[tauri::command]
fn iter(nr: usize) -> (String, Vec<Vec<Vec<f64>>>) {

    // Controllo sicuro sulla rete
    let rete_option = RETE.write().unwrap().as_ref().cloned();

    let  input_addestramento = INPUT_ADDESTRAMENTO.write().unwrap();
    
    if let Some(mut rete) = rete_option {
        
        // Addestramento della rete neurale
        for _ in 0..nr {
            for set in input_addestramento.iter() {
                rete.addestra(set.input.clone(), set.output.clone());
            }
        }
        return  (format!("Rete neurale addestrata: {}", rete), rete.pesi_connessioni());
    } else {
        ("Errore: rete neurale non inizializzata".to_string(), vec![vec![vec![]]])
    }
    
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![crea_rete, addestra, iter])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
