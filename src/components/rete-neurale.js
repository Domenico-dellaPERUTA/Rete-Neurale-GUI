app.component('rete-neurale', {
    template: 
    /*html*/
    `   <div>
            <canvas ref="tela" :width="larghezzaTela" :height="altezzaTela"></canvas>
        </div>`,
    props: {
        strati: {
            type: Array,
            required: true
        }
    },
    data() {
      return {
        larghezzaTela: 600, // Larghezza fissa, possiamo anche renderla dinamica se necessario
        altezzaTela: 400,   // Altezza fissa, anche questa può essere dinamica
        raggioNeurone: 10   // Raggio dei neuroni
      };
    },
    mounted() {
      this.disegnaRete();
    },
    watch: {
        strati: {
            deep: true, // Osserva cambiamenti profondi all'interno dell'array
            handler() {
              this.disegnaRete();
            }
        }
    },
    methods: {
      disegnaRete() {
        const tela = this.$refs.tela;
        const ctx = tela.getContext("2d");
        ctx.clearRect(0, 0, this.larghezzaTela, this.altezzaTela);
        
        const maxNeuroni = Math.max(...this.strati); // Trova il numero massimo di neuroni
        const spazioVerticale = (this.altezzaTela - (maxNeuroni * 2 * this.raggioNeurone)) / (maxNeuroni - 1);

        // **Aggiunta**: Calcolo dello spazio orizzontale dinamico in base al numero di strati
        const spazioOrizzontale = this.larghezzaTela / (this.strati.length + 1);

        // **Aggiunta**: Margine di traslazione verticale per evitare che i neuroni superiori escano dal bordo
        const margineVerticale = this.raggioNeurone;

        // Ciclo per ogni strato
        this.strati.forEach((neuroni, indiceStrato) => {
          const x = (indiceStrato + 1) * spazioOrizzontale;

          // Calcolo la posizione Y per ogni neurone nello strato
          const altezzaStrato = neuroni * 2 * this.raggioNeurone + (neuroni - 1) * spazioVerticale;
          const yOffset = (this.altezzaTela - altezzaStrato) / 2 + margineVerticale; // Traslato verso il basso

          for (let i = 0; i < neuroni; i++) {
            const y = yOffset + i * (2 * this.raggioNeurone + spazioVerticale);

            // Disegna il neurone
            this.disegnaNeurone(ctx, x, y);

            // Disegna le connessioni con lo strato successivo
            if (indiceStrato < this.strati.length - 1) {
              const neuroniStratoSuccessivo = this.strati[indiceStrato + 1];
              const altezzaStratoSuccessivo = neuroniStratoSuccessivo * 2 * this.raggioNeurone + (neuroniStratoSuccessivo - 1) * spazioVerticale;
              const yOffsetSuccessivo = (this.altezzaTela - altezzaStratoSuccessivo) / 2 + margineVerticale;

              for (let j = 0; j < neuroniStratoSuccessivo; j++) {
                const ySuccessivo = yOffsetSuccessivo + j * (2 * this.raggioNeurone + spazioVerticale);
                this.disegnaConnessione(ctx, x, y, x + spazioOrizzontale, ySuccessivo);
              }
            }
          }
        });
      },
      disegnaNeurone(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, this.raggioNeurone, 0, Math.PI * 2);
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
      },
      disegnaConnessione(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "gray";
        ctx.stroke();
      }
    }
});
