app.component('addestra-rete', {
    template: 
    /*html*/`
    <div id="addestra-rete">
    <!-- ---------------- Dialog Addestramento ------------------------------------------ -->
        <dialog id="dialog">
            <form method="dialog" @submit.prevent="onNuovoSet" >
                <div class="divTable">
                    <div class="divTableHeading">
                        <div class="divTableRow">
                            <div class="divTableHead">INPUT [ {{nr_input}} ]</div>
                            <div class="divTableHead">OUTPUT [ {{nr_output}} ]</div>
                        </div>
                    </div>
                    <div v-for="index in max_row" class="divTableBody">
                        <div class="divTableRow">
                            <div class="divTableCell">
                                <input
                                    v-if="index <= nr_input"  
                                    id=" 'input_'  + index " 
                                    type="number" step="0.001" 
                                    min="0" max="1" 
                                    :tabindex="index + 1" 
                                    v-model.number="current_set.input[index-1]"
                                    required/> 
                                <span class="validity"></span> 
                            </div> 
                            <div class="divTableCell">
                                <input 
                                    v-if="index <= nr_output" 
                                    id=" 'output_' + index " 
                                    type="number" step="0.001"
                                    min="0" max="1" 
                                    :tabindex="nr_input + index + 1" 
                                    v-model.number="current_set.output[index-1]"
                                    required/> 
                                <span class="validity"></span> 
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <input 
                        v-if="current_set.id === undefined" 
                        type="button" 
                        @click="chiudiDialog()" 
                        value="Chiudi" />
                    <input 
                        type="submit" 
                        :value=" (current_set.id === undefined ? 'Crea' : 'Modifica') + ' Set' " />
                </div>
            </form>
        </dialog>

        <!-- ---------------- Dialog File System ------------------------------------------ -->
   
        <dialog id="dialogSalvaSet">
            <form id="formSave" method="dialog" @submit.prevent="onSalvaFile" >
                <div class="title"> Esporta CSV 📄 </div>
                       
                <div class="divTable">
                    <div class="divTableBody">
                        <div class="divTableRow">
                            <div class="divTableCellMin">
                            <button @click="cercaCartella()" >Cerca 🔍 </button>
                            </div> 
                            <div class="divTableCellMax">
                                <input 
                                    id="path" 
                                    v-model="file.path"
                                    placeholder="percorso ..."
                                    required/> 
                                <span class="validity"></span> 
                            </div>
                        </div>
                    </div>
                    <div class="divTableBody">
                        <div class="divTableRow">
                            <div class="divTableCellMin">
                                
                            </div> 
                            <div class="divTableCellMax">
                                <input 
                                    id="file" 
                                    placeholder="nome file ..."
                                    v-model="file.name"
                                    required/> 
                                <span class="validity"></span> 
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <input 
                        type="button" 
                        @click="chiudiDialogSalva()" 
                        value="Chiudi" />
                    <input 
                        type="submit" 
                        value="Salva" />
                </div>
            </form>
        </dialog>
        <!-- schermo principale -->
        <div id="info-rete">
            <p>
                <b>Funzione attivazione: </b> 
                <span class="label"> {{info.funzione_attivazione}}</span>
            </p>
            <p>
                <b>Tasso di apprendimento: </b>
                <span class="label"> {{info.tasso_apprendimento}}</span>
            </p>
            <p v-if="funzione_attivazione ==  'LeakyReLU' ">
                <b>Coff. pendenza minima: </b>
                <span class="label"> {{info.coeff_alfa}}</span>
            </p>
            <p>
                <b>Info Sistema: </b> 
                <span class="label"> {{system}}</span>
            </p>
        </div>
        
        <div class="diagramma-rete">
            <rete-neurale  :strati="strati" :pesi="pesi" :attivazione="info.funzione_attivazione"></rete-neurale>
        </div>
        <div id="tabella-set">
            <table id="tab-set">
                <thead>
                    <tr>
                        <th scope="col">Input</th>
                        <th scope="col">Output</th>
                        <th class="button" scope="col"> 
                            <button class="tooltip" @click="openDialogNew()"> 
                                <b>📝</b> 
                                <span class="tooltiptext"> Crea Set </span>
                            </button>
                        </th>
                        <th class="button" scope="col"> 
                            <button class="tooltip" @click=""> 
                                <b>📥</b> 
                                <span class="tooltiptext"> Importa File CSV </span>
                            </button>
                        </th>
                        <th class="button" scope="col"> 
                            <button class="tooltip" @click="esportaDati"> 
                                <b>📤</b> 
                                <span class="tooltiptext"> Esporta File CSV </span>
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in list_set" >
                    
                        <td>{{item.input}}</td>
                        <td>{{item.output}}</td>
                        <td><button :id="'button_' + item.id"     class="tooltip" @click="selezionaSet" > 🔍 <span class="tooltiptext"> vedi/modifica </span> </button> </td>
                        <td><button :id="'button_rm_' + item.id"  class="tooltip" @click="" > 🗑 <span class="tooltiptext"> elimina </span> </button> </td>
                        <td></td>
                    </tr>
                    
                </tbody>
            </table>
        </div>
        <template v-if="list_set.length > 0">
            <div>
                <button @click="onSalva()" >
                    <embed width="70" height="30" src="assets/upload-icon.svg"/>Carica Set
                </button>
            </div>
            <div>
                <input
                    width="12rem"
                    v-if="iter > 0"
                    type="number" 
                    inputmode="numeric"
                    step="1" 
                    min="1" 
                    v-model.number="iter"
                    placeholder="cicli di apprendimento"
                    required/> 
                <span class="validity"></span> 
            </div>
            <div>
                <button @click="onAddestra()" v-if="iter > 0" required>
                    <embed width="70" height="30" src="assets/teach-icon.svg"/>Addestra
                </button>
            </div>
        <template>
        
    </div>
    `,
    props: {

        /* [+] rete-neurale [+] */
        strati: {
            type: Array,
            required: true
        },
        pesi: {
            type: Array,
            required: false,
            default: () => [] 
        },
        info: {
            type: Object,
            required: false,
            default: () => {}
        },
        list_set: {
            type: Array,
            required: false,
            default: () => [] 
        },
        system: {
            type: String,
            required: false,
            default: () => ""
        },
        /* [-] rete-neurale [-] */


    },
    data() {
        return {
          nr_input: 0,
          nr_output: 0,
          max_row: 0,
          //list_set : [],// [ ... {id: 23, input: [1,0,1,1], output: [1,2]} ...]
          current_set : {
            input: [],
            output : []
          },
          iter: NaN,
          file : {
            name: '',
            path: ''
          },
        };
      },
      mounted() {
        this.init();
      },
      methods: {
        init(){
            this.strati;
            if(this.strati && this.strati.length > 1){
                this.nr_input = this.strati[0];
                this.nr_output = this.strati[this.strati.length-1];
                this.max_row = this.nr_input > this.nr_output ? this.nr_input : this.nr_output;
                const fnInit = (list,nr) => {
                    list = []
                    for(let i=0; i < nr; i++)
                        list.push(NaN)
                } 
                fnInit(this.current_set.input, this.nr_input)
                fnInit(this.current_set.output,this.nr_output)
            }
        },
        openDialogNew(){
            // resetta
            delete this.current_set.id;
            this.current_set =  { // sostituisci l'oggetto (evita la cancellazione dei dati presedenti)
                input: [],
                output : []
            }
            document.getElementById("dialog").showModal();
        },
        onNuovoSet(){
            if(this.current_set.id === undefined){// se è un nuovo lo aggiunga alla lista (altrimenti lo modifica soltanto)
                if(this.current_set.input && this.current_set.output)
                    this.list_set.push({
                        id: this.list_set.length,
                        input : [...this.current_set.input],
                        output: [...this.current_set.output],
                    })
                // resetta
                delete this.current_set.id;
                this.current_set.input = []
                this.current_set.output= []
            }

            document.getElementById("dialog").close();
        },
        chiudiDialog(){
            // resetta
            delete this.current_set.id;
            this.current_set.input = []
            this.current_set.output= []
            
            document.getElementById("dialog").close();
        },
        selezionaSet( {type, target }){
            const sId = target.id;
            const index = +sId.split('_')[1];
            const item = this.list_set.find(item => item.id == index);
            if(item){
                this.current_set = item;
                document.getElementById("dialog").showModal();
            }
        },
        onSalva(){
            this.$emit('set-addestramento', this.list_set);
            this.iter = 100000;
        },
        onAddestra(){
            this.$emit('addestra', this.iter);
            this.$emit('set', this.list_set);
        },

        _requiredForm(){
            this.file = {
                name: '',
                path: ''
            };
        },
        async cercaCartella() {
            try {
                const dialog  = window.__TAURI__.dialog;

                // Usa Tauri per aprire una finestra di dialogo per selezionare la cartella
                const selectedFolderPath = await dialog.open({
                    directory: true, // Permette la selezione delle cartelle
                });

                if (selectedFolderPath) {
                    this.file.path = selectedFolderPath; // Imposta il percorso della cartella
                }
            } catch (error) {
                this._requiredForm();
            }
        },
        async onSalvaFile() {
            try {
                if (this.file.path && this.file.name) {
                    // Crea il percorso completo per salvare il file
                    const saveFilePath = `${this.file.path}/${this.file.name.split('.csv')[0]}.csv`;
                    if(saveFilePath){
                        this._esportaDati(saveFilePath);
                        document.getElementById("dialogSalvaSet").close();
                    }
                }
            } catch (error) {
                this._requiredForm();
            }
        },
        esportaDati(){
            document.getElementById("dialogSalvaSet").showModal();
            this.file = {
                name: '',
                path: ''
            };
        },

        chiudiDialogSalva(){
            document.getElementById("dialogSalvaSet").close();
        },

        async  _esportaDati(filePath) {
            const fs   = window.__TAURI__.fs;
            const path = window.__TAURI__.path;

            const rows = [];
            rows.push("SET,INPUT,OUTPUT"); // Intestazione
            for (let id=0; id < this.list_set.length; id++){
                let current_set = this.list_set[id];
                const maxLength = Math.max(current_set.output.length, current_set.input.length);
                
                // Creiamo le righe del CSV
                for (let i = 0; i < maxLength; i++) {
                    const outValue = current_set.output[i] !== undefined ? current_set.output[i] : "";
                    const inValue  = current_set.input[i]  !== undefined ? current_set.input[i]  : "";
                    rows.push(`${id},${inValue},${outValue}`);
                }
            }
            // Converti l'array di righe in una stringa CSV
            const csvContent = rows.join("\n");
            await fs.writeTextFile(filePath, csvContent);
            console.log(`Dati esportati con successo in ${filePath}`);
        }

    }
});