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
            required
          />
          <span class="validity"></span>
        </div>
        <div>
          <select 
            id="tipo_funz_attivazione" 
            v-model="funz_attivazione"
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
  
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">Strato</th>
            <th scope="col">N° Neuroni</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">strato 1</th>
            <td><input type="number" value="0"/></td>
          </tr>
          <tr>
            <th scope="row">strato 2</th>
            <td><input type="number" value="0"/></td>
          </tr>
        </tbody>
      </table>
      <button  required type="submit">
        <embed width="30" height="30" src="assets/create-icon.svg" />Crea
      </button>
    </form>
      `,
      data(){
        return {
            strati: 0,
            funz_attivazione:''
        }
      },
      methods:{
        onSubmit(){
            this.$emit(
                'nuova-rete',
                {
                    nr_strati : this.strati,
                    tipo_funz_attivazione: this.funz_attivazione,
                }
            )
            // [todo] fare qualcosa dopo l'invio....
        }
      }
  })