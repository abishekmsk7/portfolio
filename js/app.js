// app.js – mounts each demo as its own small Vue app
const programme = [
  { id: 1, title: 'The Winter’s Tale', genre: 'theatre', venue: 'Main House', date: '2026-12-04', soldOut: false },
  { id: 2, title: 'Late-Night Jazz Session', genre: 'music', venue: 'Studio', date: '2026-12-11', soldOut: true },
  { id: 3, title: 'The Snow Queen', genre: 'family', venue: 'Main House', date: '2026-12-18', soldOut: false },
  { id: 4, title: 'Contemporary Dance Double Bill', genre: 'dance', venue: 'Studio', date: '2027-01-15', soldOut: false },
  { id: 5, title: 'New Year Strauss Gala', genre: 'music', venue: 'Concert Hall', date: '2027-01-01', soldOut: true },
  { id: 6, title: 'A Doll’s House', genre: 'theatre', venue: 'Main House', date: '2027-01-22', soldOut: false },
  { id: 7, title: 'Puppet Workshop', genre: 'family', venue: 'Learning Space', date: '2027-02-06', soldOut: false },
  { id: 8, title: 'Symphony No. 9', genre: 'music', venue: 'Concert Hall', date: '2027-02-13', soldOut: false },
  { id: 9, title: 'Ballet Gala', genre: 'dance', venue: 'Main House', date: '2027-02-20', soldOut: true },
];

Vue.createApp(SeatMap).mount('#seat-app');
Vue.createApp(WhatsOn, { events: programme }).mount('#whats-on-app');

// Files shown in each "View the source" panel
const sources = {
  seat: ['js/SeatMap.js', 'scss/_seat-map.scss', 'scss/_mixins.scss'],
  whatson: ['js/WhatsOn.js', 'scss/_ticket.scss', 'scss/_tokens.scss'],
  site: ['scss/main.scss', 'scss/_base.scss', 'scss/_layout.scss', 'js/app.js', 'js/SourceViewer.js'],
};

const loadFiles = (paths) => Promise.all(paths.map(async (path) => ({
  name: path.split('/').pop(),
  lang: path.endsWith('.scss') ? 'scss' : 'javascript',
  code: await fetch(path).then((res) => res.text()),
})));

// Fetch and mount a source viewer the first time its panel is opened
document.querySelectorAll('[data-source]').forEach((el) => {
  el.closest('details').addEventListener('toggle', async function onOpen() {
    this.removeEventListener('toggle', onOpen);
    const files = await loadFiles(sources[el.dataset.source]);
    Vue.createApp(SourceViewer, { files }).mount(el);
  });
});
