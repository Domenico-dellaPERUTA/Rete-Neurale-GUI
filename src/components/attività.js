// Definizione del componente TreeNode
const TreeNode = {
    props: {
      node: {
        type: [Object, Array, String, Number, Boolean, Null],
        required: true,
      },
      nodeKey: {
        type: [String, Number],
        required: true,
      },
      level: {
        type: Number,
        default: 0,
      },
      isRoot: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        expanded: false,
      };
    },
    computed: {
      isExpandable() {
        return typeof this.node === "object" && this.node !== null;
      },
    },
    methods: {
      toggleExpand() {
        this.expanded = !this.expanded;
      },
    },
    template: 
    /*html*/`
      <tr>
        <td :style="{ paddingLeft: level * 20 + 'px' }">
          <span v-if="isExpandable" @click="toggleExpand" class="toggle">
            {{ expanded ? "▼" : "▶" }}
          </span>
          <span>{{ nodeKey }}</span>
        </td>
        <td>
          <span v-if="!isExpandable">{{ node }}</span>
        </td>
      </tr>
      <template v-if="expanded">
        <template v-for="(value, key) in node" :key="key">
          <TreeNode :node="value" :nodeKey="key" :level="level + 1" :isRoot="false" />
        </template>
      </template>
    `
  };

  // Definizione del componente principale JsonTreeTable
  const JsonTreeTable = {
    components: { TreeNode },
    props: {
      jsonData: {
        type: Array,
        required: true,
      },
    },
    template: /*html*/ `
      <div class="json-tree-table">
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) in jsonData">
              <TreeNode :node="item" :nodeKey="index" :level="0" :isRoot="true" />
            </template>
          </tbody>
        </table>
      </div>
    `
  };

  // Inizializzazione dell'app Vue
  app.component('json-tree-table', JsonTreeTable);
