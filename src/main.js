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
      rete: {
        strati: [],
        pesi: []
      },
      info :{
        funzione_attivazione: "",
        tasso_apprendimento: 0,
        coeff_alfa: 0
      }

    }
  },
  methods:{
    async creaRete(infoRete){
      // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
      
      this.rete.strati = infoRete.neuroni.map( item => item.neuroni );
      this.info.funzione_attivazione = infoRete.tipo_funz_attivazione;
      this.info.tasso_apprendimento = infoRete.tasso_apprendimento;
      this.info.coeff_alfa = infoRete.alfa;
      const risposta = await invoke("crea_rete", { 
        apprendimento: this.info.tasso_apprendimento, 
        attivazione:   this.info.funzione_attivazione,
        neuroni:       this.rete.strati,
        alfa:          this.info.coeff_alfa
      });
      this.messaggio = risposta[0];
      this.rete.pesi = risposta[1];

      this.next();
    },
    async start(go){
      if(go)this.step++;
    },
    next(){
      this.step++;
    }
  }
})




