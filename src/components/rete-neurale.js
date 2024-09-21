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
      },
      pesi: {
          type: Array,
          required: false,
          default: () => [] // Pesi opzionali
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
      },
      pesi: {
        deep: true, // Aggiorna il grafico quando cambiano i pesi
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

      // Calcolo dello spazio orizzontale dinamico in base al numero di strati
      const spazioOrizzontale = this.larghezzaTela / (this.strati.length + 1);
      const margineVerticale = this.raggioNeurone;

      // Ciclo per ogni strato
      this.strati.forEach((neuroni, indiceStrato) => {
        const x = (indiceStrato + 1) * spazioOrizzontale;
        const altezzaStrato = neuroni * 2 * this.raggioNeurone + (neuroni - 1) * spazioVerticale;
        const yOffset = (this.altezzaTela - altezzaStrato) / 2 + margineVerticale;

        for (let i = 0; i < neuroni; i++) {
          const y = yOffset + i * (2 * this.raggioNeurone + spazioVerticale);
          this.disegnaNeurone(ctx, x, y);

          // Disegna le connessioni con lo strato successivo
          if (indiceStrato < this.strati.length - 1) {
            const neuroniStratoSuccessivo = this.strati[indiceStrato + 1];
            const altezzaStratoSuccessivo = neuroniStratoSuccessivo * 2 * this.raggioNeurone + (neuroniStratoSuccessivo - 1) * spazioVerticale;
            const yOffsetSuccessivo = (this.altezzaTela - altezzaStratoSuccessivo) / 2 + margineVerticale;

            for (let j = 0; j < neuroniStratoSuccessivo; j++) {
              const ySuccessivo = yOffsetSuccessivo + j * (2 * this.raggioNeurone + spazioVerticale);

              // Recupera il peso se è stato fornito, altrimenti colore grigio
              const peso = this.pesi[indiceStrato]?.[j]?.[i];
              const coloreConnessione = peso !== undefined ? this.getColorePeso(peso) : 'gray';

              this.disegnaConnessione(ctx, x, y, x + spazioOrizzontale, ySuccessivo, coloreConnessione);
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
    disegnaConnessione(ctx, x1, y1, x2, y2, colore) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = colore;
      ctx.stroke();
    },
    getColorePeso(peso) {
      
      // Se il valore è vicino a 0, tendi al verde
       // Converti il peso in un valore compreso tra -1.0 (rosso) e +1.0 (blu)
       const valoreNorm = (peso + 1) / 2; // Da [-1, 1] a [0, 1]
       const r = Math.floor(255 * (1 - valoreNorm)); // Rosso per valori negativi
       const g = Math.floor(255 * valoreNorm); // Verde per valori positivi
       return `rgb(${r}, ${g}, 0)`; // Colore dal rosso al verde

    }
  }
});

