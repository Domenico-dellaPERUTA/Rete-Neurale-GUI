app.component('esegui-rete', {
    template: 
    /*html*/`
    <div id="esegui-rete">
        <div class="diagramma-rete">
            <rete-neurale  :strati="strati" :pesi="pesi" :attivazione="funz_attivazione"></rete-neurale>
        </div>
        <div id="input-rete">
            <div class="divTable">
                <div class="divTableHeading">
                    <div class="divTableRow">
                        <div class="divTableHead"> INPUT [{{nr_input}}]</div>
                        <div class="divTableHead"> </div>
                        <div class="divTableHead"> OUTPUT [{{nr_output}}]</div>
                    </div>
                </div>
                <div v-for="index in max_row" class="divTableBody">
                    <div class="divTableRow">
                        <div class="divTableCell">
                            <input
                                v-if="index <= nr_input"  
                                id=" 'input_'  + index " 
                                type="number" step="0.001" 
                                :min="range.min" :max="range.max" 
                                :placeholder="range.info"
                                :tabindex="index + 1" 
                                v-model.number="input[index-1]"
                                required/> 
                            <span class="validity"></span> 
                        </div> 
                        <div class="divTableCell">
                            <button style="margin-left: 2rem;" @click="onClick"  v-if="index == 1"   id="run" required>GO!</button>
                        </div>
                        <div class="divTableCell">
                            <input 
                                v-if="index <= nr_output" 
                                id=" 'output_' + index " 
                                type="number" step="0.001"
                                min="0" max="1" 
                                :tabindex="nr_input + index + 1" 
                                v-model.number="output[index-1]"
                                readonly="true"
                                /> 
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
        <div>
            <button id="download" @click="apriDialogSalva">Salva Rete</button>
            <dialog id="dialogSalva">
                <form id="formSave" method="dialog" @submit.prevent="onSalvaFile" >
                <div class="title"> Salvataggio </div>
                       
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
        </div>
    </div>
    `,
    props: {
        funz_attivazione: {
            type: Array,
            required: true
        },

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
        /* [-] rete-neurale [-] */
        result: {
            type: Array
        },
    },
    data() {
        return {
          nr_input: 0,
          nr_output: 0,
          max_row: 0,
          input: [],
          output: [],
          file : {
            name: '',
            path: ''
          },
          range: {
            max: 0,
            min: 0,
            info: ''
          }
        };
    },
    mounted() {
        this.init();
    },
    watch: {
        result: {
            deep: true, // Aggiorna il grafico quando cambiano i pesi
            handler() {
                this.setOutput();
            }
        },
    },
    methods: {
        init(){
            const funzAttOutput = this.funz_attivazione[this.funz_attivazione.length-1];
            switch (funzAttOutput) {
                case 'Lineare':
                case 'Null':
                case 'Swish':
                case 'Leaky ReLU':
                    this.range.max = Infinity;
                    this.range.min = -Infinity;
                    this.range.info = '(−∞, +∞)';
                    break;
                case 'ReLU':
                    this.range.max =  Infinity;
                    this.range.min =  0;
                    this.range.info = '[0, +∞)';
                    break;
                case 'Sigmoide':
                    this.range.max =  1;
                    this.range.min =  0;
                    this.range.info = '[0, 1]';
                    break;
                case 'Tanh':
                    this.range.max =  1;
                    this.range.min = -1;
                    this.range.info = '[-1, 1]';
                    break;
                default:
                    this.range.max =  0;
                    this.range.min =  0;
                    this.range.info = '?';
                    break;
            }
            
            const fnInitArray = (n,array) => {
                for (let i = 0; i < n; i++) {
                    array.push(NaN);
                }
            }
            this.nr_input = this.strati[0];
            this.nr_output = this.strati[this.strati.length-1];
            fnInitArray(this.nr_input,this.input);
            fnInitArray(this.nr_output,this.output);
            this.max_row = this.nr_input > this.nr_output ? this.nr_input : this.nr_output;
        },
        onClick(){
            this.$emit('run',this.input);
        },
        setOutput(){
            let i=0;
            const dim = this.output?.length ?? 0;
            if(dim === this.result?.length)
                for (let i = 0; i < dim; i++) {
                    this.output[i] = this.result[i];
                    
                }
        },

        apriDialogSalva(){
            document.getElementById("dialogSalva").showModal();
            this.file = {
                name: '',
                path: ''
            };
        },

        chiudiDialogSalva(){
            document.getElementById("dialogSalva").close();
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
                    const saveFilePath = `${this.file.path}/${this.file.name.split('.txt')[0]}.txt`;
                    if(saveFilePath){
                        // Scrive il contenuto modificato nel file nella nuova cartella
                        this.$emit('save',  saveFilePath);
                        this. chiudiDialogSalva();
                    }
                }
            } catch (error) {
                this._requiredForm();
            }
        }
    }
});