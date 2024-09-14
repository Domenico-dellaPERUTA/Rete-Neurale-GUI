const { invoke } = window.__TAURI__.tauri;

let oInputStrati;
let oSelectFunzAttivazione;
let oMessage;


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




