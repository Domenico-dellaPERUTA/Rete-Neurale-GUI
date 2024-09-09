const { invoke } = window.__TAURI__.tauri;

let oInputStrati;
let oSelectFunzAttivazione;
let oMessage;
/*
async function creaRete() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  oMessage.textContent = await invoke("crea_rete", { strati: +oInputStrati.value, attivazione: oSelectFunzAttivazione.value });
}
*/

/*
window.addEventListener("DOMContentLoaded", () => {
  oInputStrati = document.querySelector("#nr_strati");
  oSelectFunzAttivazione = document.querySelector("#tipo_funz_attivazione");

  oMessage = document.querySelector("#messaggio-creazione");
  document.querySelector("#create-form").addEventListener("submit", (e) => {
    e.preventDefault();
    creaRete();
  });
});
*/


/* ----------------------------- [ App ] ------------------------------ */
const app =Vue.createApp({
  data() {
    return {
      titolo: "Rete Neurale",
      messaggio : ''
    }
  },
  methods:{
    async creaRete(infoRete){
      // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
      this.messaggio = await invoke("crea_rete", { 
        strati: infoRete.nr_strati, 
        attivazione: infoRete.tipo_funz_attivazione,
        neuroni: infoRete.neuroni.map( item => item.neuroni )
      });
    }
  }
})




