// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod rete_neurale_mlp;
use std::sync::{Arc, RwLock};
use std::thread;
use tauri::Manager; // Importa Manager per usare emit_to
use chrono::Local;
use serde_json::json;
use lazy_static::lazy_static;

use crate::rete_neurale_mlp::rete_neurale::*;

use sysinfo::{System, SystemExt, CpuExt};

#[tauri::command]
fn get_system_info() -> String {
    let mut system = System::new_all();
    system.refresh_all();

    let os = system.name().unwrap_or_else(|| "Unknown".to_string());
    let os_version = system.os_version().unwrap_or_else(|| "Unknown".to_string());
    let cpu = system.global_cpu_info().brand().to_string();
    let total_memory:f64 = system.total_memory() as f64  / 1_073_741_824.0; // In gigabyte
    let available_memory:f64 = system.available_memory() as f64 / 1_073_741_824.0; // In gigabyte

    format!(
        "\nOS: {} {}\nCPU: {}\nTotal Memory: {} GB\nAvailable Memory: {:.2} GB",
        os, os_version, cpu, total_memory, available_memory
    )
}


// Uso di Arc<RwLock> per rendere il puntatore thread-safe
lazy_static! {
    static ref RETE: Arc<RwLock<Option<ReteNeurale>>> = Arc::new(RwLock::new(None));
    static ref INPUT_ADDESTRAMENTO: Arc<RwLock<Vec<InputAddestramento>>> = Arc::new(RwLock::new(vec![]));
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn crea_rete(apprendimento: f64, attivazione: Vec<String>, neuroni: Vec<usize>, alfa: f64) -> (String, Vec<Vec<Vec<f64>>>) {
    let mut strati = Vec::new();
    let mut i = 0;
    for dim_strato in neuroni.clone().into_iter() {
        let strato = Strato {
            neuroni: dim_strato,
            funzione_attivazione: match attivazione[i].as_str() {
                "Sigmoide"  => Arc::new(Sigmoide),
                "ReLU"      => Arc::new(ReLU),
                "LeakyReLU" => Arc::new(LeakyReLU { alpha: alfa }),
                "Tanh"      => Arc::new(Tanh),
                "Softplus"  => Arc::new(Softplus),
                "Swish"     => Arc::new(Swish),
                _           => Arc::new(Nessuna),
            }
        };
        strati.push(strato);
        if i > (neuroni.len() - 1) {
            i = 0;
        } else {
            i += 1;
        }
    }
    let rete = ReteNeurale::nuova(strati, apprendimento);

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
fn iter(app_handle: tauri::AppHandle, window: tauri::Window, nr: usize) {
    let rete_arc = Arc::clone(&RETE); // Clona il puntatore Arc di RETE
    let input_addestramento = Arc::clone(&INPUT_ADDESTRAMENTO); // Clona il puntatore Arc di INPUT_ADDESTRAMENTO

    thread::spawn(move || {
        let mut rete_option = rete_arc.write().unwrap();
        let input_addestramento = input_addestramento.read().unwrap().clone();
        let mut test = Vec::new();
        if let Some(rete) = rete_option.as_mut() {
            let inizio = Local::now();
            for i in 0..nr {
                let adesso = Local::now();
                let durata = (adesso.clone() - inizio.clone()).num_seconds();
                if durata >= 10 {
                    window.emit(
                        "log_training", 
                        format!("[{}] -> ciclo {i}/{nr}  {}s  {}%", 
                            adesso.clone().format("%d/%m/%Y - %H:%M:%S").to_string(),
                            durata,
                            ((i as f32)/(nr as f32))*100.0
                    )).unwrap();
                }
                
                for set in &input_addestramento {
                    rete.addestra(set.input.clone(), set.output.clone());
                }
            }

            for set in &input_addestramento {
                let uscita = rete.elabora(set.input.clone());
                test.push( vec![set.input.clone(), set.output.clone(), uscita] );
            }
            
            // Chiama la notifica della fine del ciclo con la somma
            notifica_fine_ciclo(&app_handle, format!("{}",rete), rete.pesi_connessioni(), (Local::now() - inizio.clone()).num_seconds(), test );
        }
    });
}

fn notifica_fine_ciclo(app_handle: &tauri::AppHandle, rete: String, pesi: Vec<Vec<Vec<f64>>>, durata:i64, test:Vec<Vec<Vec<f64>>> ) {
    let payload = json!([rete, pesi,durata,test]);
    app_handle.emit_all("training_completed", payload).unwrap();
}

#[tauri::command]
fn run(input: Vec<f64>) -> (String, Vec<f64>) {
    let rete_option = RETE.read().unwrap(); // Cambiato in read qui
    if let Some(rete) = rete_option.as_ref() {
        let output = rete.elabora(input);
        (format!("Output rete: {:?}\nrete\n{}", output.clone(), rete), output)
    } else {
        ("Errore: rete neurale non inizializzata".to_string(), vec![])
    }
}

#[tauri::command]
fn carica_rete(nome: String, file: String) -> (String, Vec<Vec<Vec<f64>>>, Vec<usize>, Vec<String>, f64) {
    let rete = ReteNeurale::carica(nome.as_str());

    let mut rete_guard = RETE.write().unwrap();
    *rete_guard = Some(rete);

    if let Some(rete) = rete_guard.as_ref() {
        (
            format!("{file:?}").to_string(),
            rete.pesi_connessioni(),
            rete.strati(),
            rete.lista_funzioni_attivazioni(),
            rete.tasso_apprendimento()
        )
    } else {
        ("Errore: rete neurale non creata".to_string(), vec![vec![vec![]]], vec![], vec![], 0.0)
    }
}

#[tauri::command]
fn save(file: String) -> String {
    let rete_option = RETE.write().unwrap();
    if let Some(rete) = rete_option.as_ref() {
        if let Ok(_status) = rete.salva_pesi_txt(file.as_str()) {
            format!("Salvataggio file: '{file}'")
        } else {
            format!("Errore salvataggio file: '{file}'")
        }
    } else {
        "Errore: rete neurale non inizializzata".to_string()
    }
}

#[cfg(not(feature = "test-rust"))]
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![crea_rete, addestra, iter, run, carica_rete, save, get_system_info])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

//------------------------------------------------------------------------------------------------
//                              TEST BACK-END 
//
//$ cargo tauri dev --features "test-rust"

#[cfg(feature = "test-rust")]
fn main() {
    const TEST_ADDESTRA_NUOVA_RETE: bool = !true; 
    let mut rete: ReteNeurale;
    if TEST_ADDESTRA_NUOVA_RETE {
        println!("[*]  -- TEST ADDESTRA NUOVA RETE -- ");
        let tasso_apprendimento = 0.01;

        let strati: Vec<Strato> = vec![
            Strato {
                neuroni: 2,
                funzione_attivazione: Arc::new(Nessuna)
            },
            Strato {
                neuroni: 16,
                funzione_attivazione: Arc::new(Sigmoide)
            },
            Strato {
                neuroni: 1,
                funzione_attivazione: Arc::new(Sigmoide)//Arc::new(LeakyReLU { alpha: 0.05 }),
            },
        ];

        rete = ReteNeurale::nuova(strati, tasso_apprendimento);
    } else {
        println!("[*]-- TEST CARICA RETE ESISTENTE ----------- ");
        rete = ReteNeurale::carica("rete_neurale.txt");
    }

    let dati_addestramento = [
        InputAddestramento { input: vec![0.0, 1.0], output: vec![0.0] },
        InputAddestramento { input: vec![1.0, 0.0], output: vec![0.0] },
        InputAddestramento { input: vec![1.0, 1.0], output: vec![1.0] },
        InputAddestramento { input: vec![0.0, 0.0], output: vec![1.0] },
    ];

    if TEST_ADDESTRA_NUOVA_RETE {
        println!("[+] Prima dell'addestramento ----------");
        println!("{}", rete);

        for _ in 0..1000000 {
            for set in dati_addestramento.iter() {
                rete.addestra(set.input.clone(), set.output.clone());
            }
        }
        println!("[-] Dopo addestramento ----------------");
    } else {
        println!("[-] Rete  Caricata ----------------");
    }

    println!("{}", rete);

    println!("[!] test apprendimento ------------------");
    for set in dati_addestramento.iter() {
        let uscita = rete.elabora(set.input.clone());
        println!("Input: {:?}, Previsto: {:?}, Uscita: {:?}", set.input, set.output, uscita);
    }

    if TEST_ADDESTRA_NUOVA_RETE {
        let _risultato = rete.salva_pesi_txt("rete_neurale.txt");
        if let Err(e) = _risultato {
            println!("{:?}", e);
        }
    }

    println!("[*]-- FINE TEST --------------------------");
}
