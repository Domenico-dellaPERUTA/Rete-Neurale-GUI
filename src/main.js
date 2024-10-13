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
      },
      output: []

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
    async caricaRete(file){
      const risposta = await invoke("carica_rete", { 
        nome: file.name, 
        file: file.content
      });
      this.messaggio = 'FILE :'+
                      '\n=======================================================================\n'+
                        risposta[0].replaceAll("\\n","\n").replaceAll("\"","")+
                      "\n=======================================================================\n";
      this.rete.pesi = risposta[1];
      this.rete.strati = risposta[2];
      this.info.funzione_attivazione = risposta[3];
      this.info.tasso_apprendimento = risposta[4];

      this.step = 3;
    },

    async start(go){
      if(go)this.step++;
    },
    next(){
      this.step++;
    },
    

    async caricaSet(infoSet){
      let index =0;
      for (const set of infoSet) {
        set.start=set.end=false;

        if(index == 0){
          set.start=true;
        }
        if(index == infoSet.length -1 ){
          set.end=true;
        }
        const risposta = await invoke("addestra", set);
        this.messaggio += '\n' + risposta;
        index++;
      }
      //this.next();
    },

    async addestraRete(cicli){
      const risposta = await invoke("iter", {nr: cicli});
      this.messaggio  = risposta[0];
      this.rete.pesi = risposta[1];
      this.next();
    },

    async runTest(input){
      const response = await invoke("run", {input: input});
      this.output = response[1];
      this.messaggio = response[0];
    },

    async saveNetwork(filename){
      const response = await invoke("save", {file: filename});
      this.messaggio = response;
    }
  }
})




