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
            <div>
                <select 
                    id="tipo_funz_attivazione" 
                    v-model="funz_attivazione"
                    tabindex="3" 
                    required
                    >
                    <option value="">-- Funzione di attivazione --</option>
                    <option value="Sigmoide">Sigmoide</option>
                    <option value="ReLU">Rectified Linear Unit</option>
                    <option value="LeakyReLU">ReLU (piccola pendenza)</option>
                    <option value="Tanh">Tanh</option>
                    <option value="Softplus">Softplus</option>
                    <option value="Swish">Swish</option>
                </select>
                <span class="validity"></span>
            </div>
            <div v-if="funz_attivazione === 'LeakyReLU'" >
                <input 
                    id="alfa" 
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
            <img v-if="funz_attivazione !== '' " :src=" 'assets/'+ funz_attivazione + '.png' " alt="" width="auto" height="50" />
        </div>
        <div class="container-col">
            <table  class="colonna">
                <thead>
                <tr>
                    <th scope="col">Strato</th>
                    <th scope="col">N° Neuroni</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in connessioni">
                    <th scope="row">strato {{ index }}</th>
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
                </tr>
                </tbody>
            </table>
            <div class="colonna">
                <rete-neurale  :strati="getRete()"></rete-neurale>
            </div>
        </div>
        <button  required type="submit">
            <embed width="30" height="30" src="assets/create-icon.svg" />Crea
        </button>
    </form>
      `,
      data(){
        return {
            strati: NaN,
            apprendimento: NaN,
            funz_attivazione:'',
            connessioni: [],
            alfa: 0.01
        }
      },
      methods:{
        setStrati({ type, target }){
            const value = target.value;
            if(value){
                this.connessioni = []
                for(let i =0; i < value; i++){
                    this.connessioni.push({neuroni: 0})
                }
            }
        },
        onSubmit(){
            this.$emit(
                'nuova-rete',
                {
                    tasso_apprendimento : this.apprendimento,
                    tipo_funz_attivazione: this.funz_attivazione,
                    neuroni: this.connessioni,
                    alfa: this.alfa
                }
            )
            // [todo] fare qualcosa dopo l'invio....
        },
        getRete(){
            return this.connessioni.map(strato=>strato.neuroni)
        }
      }
  })