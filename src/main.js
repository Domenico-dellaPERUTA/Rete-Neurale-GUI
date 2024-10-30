const { invoke } = window.__TAURI__.tauri;



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
        funzione_attivazione: [],
        tasso_apprendimento: 0,
        coeff_alfa: 0
      },
      output: [],
      addestra: {
        avvio : false,
        ascolto: false,
        fine: false,
      },
      listSet: [],
      system : '',
      attività: []

    }
  },

  mounted() {
      this.init();
  },
  methods:{

    async init(){
      // Recupera i dati da LocalStorage
      const savedSettings = localStorage.getItem("attività");
      if(savedSettings){
        this.attività = JSON.parse(savedSettings);
      }

    },

    async infoSystem(){
      this.system = await invoke("get_system_info");
    },

    async setAddestramento(aSetList){
      this.listSet = aSetList;
    },
    async creaRete(infoRete){
      this.infoSystem();
      this.listSet = [];
      // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
      
      this.rete.strati = infoRete.neuroni.map( item => item.neuroni );
      this.info.funzione_attivazione = infoRete.neuroni.map( item => item.funz_attivazione );
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
      this.listSet = [];
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
      this.infoSystem();
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
      const textarea = document.getElementById("terminal");
      textarea.scrollTop = textarea.scrollHeight;  
      //this.next();
    },

    async addestraRete(cicli){
      this.addestra.avvio = true;
      this.addestra.fine = false;
      const textarea = document.getElementById("terminal");
        
      // ascolta backend ...
      if(this.addestra.ascolto == false){
        // log
        window.__TAURI__.event.listen("log_training", (event) => {
          this.messaggio = event.payload+"\n";
          textarea.scrollTop = textarea.scrollHeight;  // Scorri verso il basso automaticamente
        });
        window.__TAURI__.event.listen("training_completed", (event) => {
          const rispostaFine = event.payload;
          this.messaggio += rispostaFine[0];
          this.rete.pesi  = rispostaFine[1];
          const durata = rispostaFine[2];
          const test = rispostaFine[3];
          this._updateSetList(test); // aggiunge la precisione al Set
          this.addestra.fine = true;
          this.next();
          textarea.scrollTop = textarea.scrollHeight;  
          
          this.attività.push({
            data: new Date().toLocaleString('it'),
            rete: this.strati,
            set: this.listSet,
            durata: durata,
            test_uscite: test,
            apprendimento: this.tasso_apprendimento,
            sistema : this.sistema
          });
          localStorage.setItem("attività", JSON.stringify(this.attività));
        });
        // fine 
        this.addestra.ascolto = true;
      }
      // avvio ...
       await invoke("iter", {nr: cicli});
      
    },

    _updateSetList(mTest){

      function formatScientificNotation(numero) {// Output: "-3,45 • 10⁻³" (HTML)
        const [mantissa, esponente] = numero.toExponential(2).split('e');
        const mantissaFormattata = mantissa.replace('.', ',');
        const apiceMap = {
          '-': '&#8315;',  // Codice Unicode per il segno meno in apice
          '0': '&#8304;',
          '1': '&#185;',
          '2': '&#178;',
          '3': '&#179;',
          '4': '&#8308;',
          '5': '&#8309;',
          '6': '&#8310;',
          '7': '&#8311;',
          '8': '&#8312;',
          '9': '&#8313;'
        };
        const esponenteFormattato = Array.from(esponente).map(digit => {
          return apiceMap[digit] || '';
        }).join('');
      
        return `${mantissaFormattata} &#183; 10 ${esponenteFormattato}; `;
      }

      const fnDifferenza = (vettoreReale, vettoreMisurato) => {
        if (vettoreReale.length !== vettoreMisurato.length) {
          return [];
        }
        return vettoreReale.map((valoreReale, indice) => {
          const valoreMisurato = vettoreMisurato[indice];
          const differenza = Math.abs(valoreReale - valoreMisurato); // Calcola la differenza assoluta
          return formatScientificNotation(differenza); 
        });
      }

      mTest.forEach(aSet => {
        if(aSet && aSet.length == 3){
          const aInputSet = aSet[0];
          const oSet = this.listSet.find(oSet => oSet.input.length && oSet.input.toString() == aInputSet.toString())
          oSet.delta = fnDifferenza(aSet[1],aSet[2]);
        }
      });
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




