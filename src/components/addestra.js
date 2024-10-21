app.component('addestra-rete', {
    template: 
    /*html*/`
    <div id="addestra-rete">
        
        <dialog id="dialog">
            <form method="dialog" @submit.prevent="onNuovoSet" >
                <div class="divTable">
                    <div class="divTableHeading">
                        <div class="divTableRow">
                            <div class="divTableHead">INPUT [#]</div>
                            <div class="divTableHead">OUTPUT [#]</div>
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
        </div>
        <div id="diagramma-rete">
            <rete-neurale  :strati="strati" :pesi="pesi" :attivazione="info.funzione_attivazione"></rete-neurale>
        </div>
        <div id="tabella-set">
            <table id="tab-set">
                <thead>
                    <tr>
                        <th scope="col">Input</th>
                        <th scope="col">Output</th>
                        <th class="button" scope="col"> <button @click="openDialogNew()"> <b>+</b> </button></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in list_set" >
                    
                        <td>{{item.input}}</td>
                        <td>{{item.output}}</td>
                        <td><button :id="'button_' + item.id" @click="selezionaSet" > 🔍 </button></td>
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
                    type="number" step="1000" 
                    min="1" 
                    v-model.number="iter"
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
        }
        /* [-] rete-neurale [-] */


    },
    data() {
        return {
          nr_input: 0,
          nr_output: 0,
          max_row: 0,
          list_set : [],// [ ... {id: 23, input: [1,0,1,1], output: [1,2]} ...]
          current_set : {
            input: [],
            output : []
          },
          iter:100000,
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
        },
        onAddestra(){
            this.$emit('addestra', this.iter);
            //this.list_set = [];
        }

      }
});