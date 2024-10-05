app.component('esegui-rete', {
    template: 
    /*html*/`
    <div id="esegui-rete">
        <div id="diagramma-rete">
            <rete-neurale  :strati="strati" :pesi="pesi"></rete-neurale>
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
                                min="0" max="1" 
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
          output: []
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
        }

    }
});