/* --------------------- [ Component Crea Rete ] ---------------------- */

app.component('crea-rete', {
    template: 
    /*html*/
    `<form class="row-box" id="create-form" @submit.prevent="onSubmit" >
        <div class="row">
            <div>
                <input 
                    id="nr_strati" 
                    type="number" 
                    tabindex="1" 
                    inputmode="numeric"
                    step="1"
                    min="2"
                    placeholder="n° strati"
                    v-model.number="strati"
                    @change="setStrati"
                    required
                />
                <span class="validity"></span>
            </div>
            <div>
                <input 
                    id="apprendimento" 
                    type="number" 
                    tabindex="2" 
                    inputmode="numeric"
                    step="0.01"
                    min="0.01"
                    placeholder="tasso appr."
                    v-model.number="apprendimento"
                    required
                />
                <span class="validity"></span>
            </div>
   
        </div>
       
        <div class="container-col">
            <table  class="colonna">
                <thead>
                <tr>
                    <th scope="col">Strato</th>
                    <th scope="col">N° Neuroni</th>
                    <th scope="col">Funz. Attivazione</th>
                    <th scope="col"> </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in connessioni">
                    <th scope="row">strato {{ index }} 
                        <span v-if="index == 0" style="color:green;" > [input]</span> 
                        <span v-if="index == connessioni.length -1" style="color:red;" > [output]</span> 
                    </th>
                    <td>
                        <input 
                            type="number" 
                            step="1"
                            min="1" 
                            v-model.number="item.neuroni"
                            required
                            />
                        <span class="validity"></span>
                    </td>
                    <td>
                        <template v-if="index > 0">
                            <select 
                                v-model="item.funz_attivazione"
                                tabindex="3" 
                                required
                                >
                                <option value=""         > -- Funzione di attivazione -- </option>
                                <option value="Sigmoide" > Sigmoide                      </option>
                                <option value="ReLU"     > Rectified Linear Unit         </option>
                                <option value="LeakyReLU"> ReLU (piccola pendenza)       </option>
                                <option value="Tanh"     > Tanh     </option>
                                <option value="Softplus" > Softplus </option>
                                <option value="Swish"    > Swish    </option>
                                <option value="Lineare"  > Lineare  </option>
                            </select>
                            <span class="validity"></span>
                        </template>
                    </td>
                    <td>
                        <div v-if="item.funz_attivazione === 'LeakyReLU'" >
                            <input 
                                type="number" 
                                tabindex="4" 
                                inputmode="numeric"
                                step="0.01"
                                min="0.01"
                                placeholder="pendenza"
                                v-model.number="alfa"
                                required
                            />
                            <span class="validity"></span>
                        </div>
                        <img v-if="item.funz_attivazione !== '' " :src=" 'assets/'+ item.funz_attivazione + '.png' " alt="" width="auto" height="50" />
                    </td>
                </tr>
                </tbody>
            </table>
            <div class="colonna">
                <rete-neurale  :strati="getRete()" :attivazione="getFunzioneAttivazione()"></rete-neurale>
            </div>
        </div>
        
        <button  required type="submit">
        🛠 Crea
        </button>
    </form>
      `,
    props: {
        tasso_apprendimento: {
            typeof: Number,
            required: false
        },
        funz_attivazione: {
            type: Array,
            required: false
        },

        /* [+] rete-neurale [+] */
        lista_strati: {
            type: Array,
            required: false
        },
    },
    data(){
        return {
            strati: NaN,
            apprendimento: NaN,
            connessioni: [],
            alfa: 0.01
        }
    },

    mounted() {
        this.init(this.lista_strati, this.funz_attivazione);
    },
    methods:{
        init(lista_strati, funz_attivazione){
            if(lista_strati && funz_attivazione && funz_attivazione.length && lista_strati.length){
                this.strati = lista_strati.length;
                if(this.tasso_apprendimento)
                    this.apprendimento = this.tasso_apprendimento;
                
                lista_strati.forEach((neuroniStrato, idStrato) => {
                    this.connessioni.push({
                        neuroni: neuroniStrato,
                        funz_attivazione: funz_attivazione[idStrato]?? ''
                    })
                });
            }
        },
        setStrati({ type, target }){
            const value = target.value;
            if(value){
                this.connessioni = []
                for(let i =0; i < value; i++){
                    this.connessioni.push({neuroni: 0,funz_attivazione:''})
                }
            }
        },
        onSubmit(){
            this.$emit(
                'nuova-rete',
                {
                    tasso_apprendimento : this.apprendimento,
                    neuroni: this.connessioni,
                    alfa: this.alfa
                }
            )
            // [todo] fare qualcosa dopo l'invio....
        },
        getRete(){
            return this.connessioni.map(strato=>strato.neuroni)
        },
        getFunzioneAttivazione(){
            return this.connessioni.map(strato=>strato.funz_attivazione)
        }
      }
  })