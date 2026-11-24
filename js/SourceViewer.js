// SourceViewer.js – tabbed, syntax-highlighted source for each demo
const SourceViewer = {
  name: 'SourceViewer',
  props: { files: { type: Array, required: true } },
  setup(props) {
    const { ref, watch, nextTick, onMounted } = Vue;
    const active = ref(0);
    const code = ref(null);

    const highlight = async () => {
      await nextTick();
      if (window.Prism && code.value) Prism.highlightElement(code.value);
    };

    // Arrow keys move between tabs, as in the ARIA tabs pattern
    const onKey = (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      active.value = (active.value + step + props.files.length) % props.files.length;
      nextTick(() => event.currentTarget.parentElement.children[active.value].focus());
    };

    watch(active, highlight);
    onMounted(highlight);
    return { active, code, onKey };
  },
  template: `
    <div>
      <div class="source__tabs" role="tablist" aria-label="Source files">
        <button v-for="(f, i) in files" :key="f.name" type="button" role="tab"
                class="source__tab" :aria-selected="i === active" :tabindex="i === active ? 0 : -1"
                @click="active = i" @keydown="onKey">{{ f.name }}</button>
      </div>
      <pre role="tabpanel" tabindex="0"><code ref="code" :key="active"
        :class="'language-' + files[active].lang">{{ files[active].code }}</code></pre>
    </div>
  `,
};
