app.component('info-attivita', {
    template: 
   /*html*/
    ` 
    <li>
        <div
          style="white-space: pre-wrap;"
          :class="{bold: isFolder}"
          @click="toggle"
          @dblclick="makeFolder">
          <span v-if="isFolder">{{ isOpen ? '📂' : '📁' }}</span>
          {{ item.type !== 'rete' ? ( item.type !== 'data' ? (item.type !== 'set' ? (item.type !== 'precisione' ? '' : '🔬' ) : '👩🏽‍🎓 Set ' )  : '⏱' ) : ' 🕸 Rete: ' }} 
          <span v-html="item.name" ></span>
        </div>
        <ul v-show="isOpen" v-if="isFolder">
          <info-attivita
            class="item"
            v-for="(child, index) in item.children"
            :key="index"
            :item="child"
            @make-folder="$emit('make-folder', $event)"
            @add-item="$emit('add-item', $event)"
          ></info-attivita>
        </ul>
    </li>
    ` ,
    props: {
        item: Object
    },
    data: function() {
        return {
            isOpen: false
        };
    },
    computed: {
        isFolder: function() {
            return this.item.children && this.item.children.length;
        }
    },
    methods: {
        toggle: function() {
            if (this.isFolder) {
            this.isOpen = !this.isOpen;
            }
        },
        makeFolder: function() {
            if (!this.isFolder) {
                this.$emit("make-folder", this.item);
                this.isOpen = true;
            }
        }
    }

});

const oTree = {
    name: "My Tree",
    children: [
    { name: "hello" },
    { name: "wat" },
    {
        name: "child folder",
        children: [
        {
            name: "child folder",
            children: [{ name: "hello" }, { name: "wat" }]
        },
        { name: "hello" },
        { name: "wat" },
        {
            name: "child folder",
            children: [{ name: "hello" }, { name: "wat" }]
        }
        ]
    }
    ]
};

app.component('report-attivita', {
    template: 
    /*html*/
    ` 
    <ul v-if="!!treeData.name">
        <info-attivita
            class="item"
            :item="treeData"
        ></info-attivita>
    </ul>
    `,
    data: function() {
        return {
            treeData: {},
        }
    },
    mounted() {
        this.init();
    },
    methods: {

        // Funzione per calcolare l'hash MD5
        md5(string) {
            function md5cycle(x, k) {
                let a = x[0], b = x[1], c = x[2], d = x[3];

                a = ff(a, b, c, d, k[0], 7, 0xd76aa478);  // 1
                d = ff(d, a, b, c, k[1], 12, 0xe8c7b756); // 2
                c = ff(c, d, a, b, k[2], 17, 0x242070db); // 3
                b = ff(b, c, d, a, k[3], 22, 0xc1bdceee); // 4
                a = ff(a, b, c, d, k[4], 7, 0xf57c0faf); // 5
                d = ff(d, a, b, c, k[5], 12, 0x4787c62a); // 6
                c = ff(c, d, a, b, k[6], 17, 0xa8304613); // 7
                b = ff(b, c, d, a, k[7], 22, 0xb00327c8); // 8
                a = ff(a, b, c, d, k[8], 7, 0x289b7ec6); // 9
                d = ff(d, a, b, c, k[9], 12, 0xeaa127fa); // 10
                c = ff(c, d, a, b, k[10], 17, 0x8badf00f); // 11
                b = ff(b, c, d, a, k[11], 22, 0x6ca6351a); // 12
                a = ff(a, b, c, d, k[12], 7, 0x1fa27cf8); // 13
                d = ff(d, a, b, c, k[13], 12, 0x431d67c4); // 14
                c = ff(c, d, a, b, k[14], 17, 0x1b0a96e4); // 15
                b = ff(b, c, d, a, k[15], 22, 0x3c6ef372); // 16

                a = gg(a, b, c, d, k[1], 5, 0xf61e2562); // 17
                d = gg(d, a, b, c, k[6], 9, 0x0befa196); // 18
                c = gg(c, d, a, b, k[11], 14, 0x1c6c616d); // 19
                b = gg(b, c, d, a, k[0], 20, 0x3f84d5b5); // 20
                a = gg(a, b, c, d, k[5], 5, 0x5b0a1242); // 21
                d = gg(d, a, b, c, k[10], 9, 0x4f2b61c5); // 22
                c = gg(c, d, a, b, k[15], 14, 0x9a2f2a4a); // 23
                b = gg(b, c, d, a, k[4], 20, 0x6ea9f0d9); // 24
                a = gg(a, b, c, d, k[9], 5, 0x7fcd3f25); // 25
                d = gg(d, a, b, c, k[14], 9, 0x1e88ccf0); // 26
                c = gg(c, d, a, b, k[3], 14, 0x89e12828); // 27
                b = gg(b, c, d, a, k[8], 20, 0x0f6d9d7e); // 28
                a = gg(a, b, c, d, k[13], 5, 0x1c1e96b1); // 29
                d = gg(d, a, b, c, k[2], 9, 0x8a24877a); // 30
                c = gg(c, d, a, b, k[7], 14, 0x3fae0f45); // 31
                b = gg(b, c, d, a, k[12], 20, 0x8309f9b6); // 32

                a = hh(a, b, c, d, k[5], 4, 0xffeff47d); // 33
                d = hh(d, a, b, c, k[8], 11, 0x85845dd1); // 34
                c = hh(c, d, a, b, k[11], 16, 0x6fa87e4f); // 35
                b = hh(b, c, d, a, k[14], 23, 0xfe2ce6e0); // 36
                a = hh(a, b, c, d, k[1], 4, 0xa3014314); // 37
                d = hh(d, a, b, c, k[4], 11, 0x4e0811a1); // 38
                c = hh(c, d, a, b, k[7], 16, 0xf7537e82); // 39
                b = hh(b, c, d, a, k[10], 23, 0xbd3af235); // 40
                a = hh(a, b, c, d, k[13], 4, 0x2ad7d2bb); // 41
                d = hh(d, a, b, c, k[0], 11, 0xeb86d391); // 42

                x[0] = (x[0] + a) | 0;
                x[1] = (x[1] + b) | 0;
                x[2] = (x[2] + c) | 0;
                x[3] = (x[3] + d) | 0;
            }

            function ff(a, b, c, d, x, s, t) {
                return ((a + ((b & c) | (~b & d)) + x + t) << s | (a + ((b & c) | (~b & d)) + x + t) >>> (32 - s)) | 0;
            }

            function gg(a, b, c, d, x, s, t) {
                return ((a + ((b & d) | (c & ~d)) + x + t) << s | (a + ((b & d) | (c & ~d)) + x + t) >>> (32 - s)) | 0;
            }

            function hh(a, b, c, d, x, s, t) {
                return ((a + (b ^ c ^ d) + x + t) << s | (a + (b ^ c ^ d) + x + t) >>> (32 - s)) | 0;
            }

            function ii(a, b, c, d, x, s, t) {
                return ((a + (c ^ (b | ~d)) + x + t) << s | (a + (c ^ (b | ~d)) + x + t) >>> (32 - s)) | 0;
            }

            function md5blk(str) {
                const md5blks = [];
                for (let i = 0; i < 64; i += 4) {
                    md5blks[i >> 2] = str.charCodeAt(i) +
                        (str.charCodeAt(i + 1) << 8) +
                        (str.charCodeAt(i + 2) << 16) +
                        (str.charCodeAt(i + 3) << 24);
                }
                return md5blks;
            }

            function rhex(n) {
                let s = "";
                for (let j = 0; j < 4; j++) {
                    s += ((n >> (j * 8 + 4)) & 0x0F).toString(16) + ((n >> (j * 8)) & 0x0F).toString(16);
                }
                return s;
            }

            const msg = string;
            const originalLength = msg.length * 8;
            const newLength = (originalLength + 64) >>> 9 << 4;
            const blocks = Array(newLength);
            for (let i = 0; i < newLength; i++) {
                blocks[i] = 0;
            }
            for (let i = 0; i < msg.length; i++) {
                blocks[i >> 2] |= msg.charCodeAt(i) << ((i % 4) * 8);
            }
            blocks[originalLength >> 5] |= 0x80 << (originalLength % 32);
            blocks[(newLength - 2) >> 5] = originalLength;

            for (let i = 0; i < blocks.length; i += 16) {
                md5cycle([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476], blocks.slice(i, i + 16));
            }

            return rhex(0x67452301) + rhex(0xefcdab89) + rhex(0x98badcfe) + rhex(0x10325476);
        },
        
        init(){
            const buildHierarchy = (data, properties) => {
                const createNode = (data, level) => {
                    if (level >= properties.length) return [];
            
                    const type = properties[level];
                    const grouped = {};
            
                    // Raggruppa i dati solo se il valore della proprietà corrente non è null o undefined
                    data.forEach(item => {
                        const value = item[type];
                        if (value != null) { // Ignora valori null o undefined
                            if (!grouped[value]) grouped[value] = [];
                            grouped[value].push(item);
                        }
                    });
            
                    // Crea nodi per ogni gruppo (escludendo quelli vuoti)
                    return Object.entries(grouped).map(([name, items]) => {
                        const node = { type, name };
                        const children = createNode(items, level + 1);
                        if (children.length) node.children = children;
                        return node;
                    });
                }
            
                // Inizializza la gerarchia a partire dal primo livello
                return createNode(data, 0);
            }
            // Recupera i dati da LocalStorage 
            const savedSettings = localStorage.getItem("attività");
            if(savedSettings){
                let attività = JSON.parse(savedSettings);
                if(Array.isArray(attività)){
                    attività = attività.map(oItem=>{
                        const aSet = oItem.set.map(oSet=>{
                            return {
                                input: `[${oSet.input+''}]`,
                                output: `[${oSet.output+''}]`,
                                delta: oSet.delta,
                                funzione_attivazione: oSet.funzione_attivazione?? '',
                                apprendimento: oSet.apprendimento??''
                            }
                        });
                        let sSet = '';
                        aSet.forEach(oSet=>{
                            sSet += `\t📥${oSet.input} 📤${oSet.output} \t\t 🎯 ${oSet.delta}\n`
                        })

                        return {
                            rete: oItem.rete ? JSON.stringify(oItem.rete)+' '+JSON.stringify(oItem.funzione_attivazione) : undefined,
                            set:  oItem.set  ? `: ${this.md5(JSON.stringify(oItem.set))}\n${sSet}`  : undefined,
                            info: `📆 ${oItem.data}\n ⏳ durata: ${oItem.durata}s\n 📈 tasso appr.: ${oItem.apprendimento}\n 🥊 cicli: ${oItem.cicli}`,
                        }
                    })
                }
                
                this.treeData = {
                    name : "Registro Attività",
                    children: buildHierarchy(attività,["rete","set","info"])
                };
            }
        }
    },
});