const { invoke } = window.__TAURI__.tauri;

let oInputStrati;
let oSelectFunzAttivazione;
let oMessage;


/* ----------------------------- [ App ] ------------------------------ */
const app =Vue.createApp({
  data() {
    return {
      titolo: "Rete Neurale",
      messaggio : '',
      step: 0,
    }
  },
  methods:{
    async creaRete(infoRete){
      // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
      this.next();
      this.messaggio = await invoke("crea_rete", { 
        apprendimento: infoRete.tasso_apprendimento, 
        attivazione:   infoRete.tipo_funz_attivazione,
        neuroni:       infoRete.neuroni.map( item => item.neuroni ),
        alfa:          infoRete.alfa
      });
    },
    async start(go){
      if(go)this.step++;
    },
    next(){
      this.step++;
    }
  }
})




