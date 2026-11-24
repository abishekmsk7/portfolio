// WhatsOn.js – Vue 3 component (Composition API)
// Filter a programme by keyword, genre and month, hide sold-out events, and sort.
const WhatsOn = {
  name: 'WhatsOn',
  props: {
    events: { type: Array, required: true },
  },
  setup(props) {
    const { ref, computed } = Vue;

    const genres = ['theatre', 'music', 'dance', 'family'];
    const query = ref('');
    const activeGenres = ref([]);
    const month = ref('all');
    const hideSoldOut = ref(false);

    const formatMonth = (iso) =>
      new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    // Build the month dropdown from the events themselves
    const months = computed(() => [...new Set(props.events.map((e) => e.date.slice(0, 7)))]
      .sort()
      .map((value) => ({ value, label: formatMonth(value + '-01') })));

    const toggleGenre = (genre) => {
      const list = activeGenres.value;
      activeGenres.value = list.includes(genre)
        ? list.filter((g) => g !== genre)
        : [...list, genre];
    };

    const results = computed(() => {
      const q = query.value.trim().toLowerCase();
      return props.events
        .filter((e) => !q || `${e.title} ${e.venue}`.toLowerCase().includes(q))
        .filter((e) => !activeGenres.value.length || activeGenres.value.includes(e.genre))
        .filter((e) => month.value === 'all' || e.date.startsWith(month.value))
        .filter((e) => !hideSoldOut.value || !e.soldOut)
        .sort((a, b) => a.date.localeCompare(b.date));
    });

    const day = (iso) => new Date(iso).getDate();
    const shortMonth = (iso) => new Date(iso).toLocaleDateString('en-GB', { month: 'short' });
    const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    const reset = () => {
      query.value = ''; activeGenres.value = []; month.value = 'all'; hideSoldOut.value = false;
    };

    return { genres, query, activeGenres, month, months, hideSoldOut,
             toggleGenre, results, day, shortMonth, capitalise, reset };
  },
  template: `
    <div class="whats-on">
      <div class="whats-on__filters">
        <div class="whats-on__field">
          <label for="wo-search">Search</label>
          <input id="wo-search" v-model="query" class="whats-on__input" type="search"
                 placeholder="Show or venue" autocomplete="off">
        </div>
        <div class="whats-on__field">
          <label for="wo-month">Month</label>
          <select id="wo-month" v-model="month" class="whats-on__select">
            <option value="all">All dates</option>
            <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
        <label class="whats-on__toggle">
          <input v-model="hideSoldOut" type="checkbox"> Hide sold out
        </label>
      </div>

      <fieldset class="whats-on__genres">
        <legend class="visually-hidden">Genres</legend>
        <button v-for="g in genres" :key="g" type="button"
                class="genre-chip" :class="'genre-chip--' + g"
                :aria-pressed="activeGenres.includes(g)" @click="toggleGenre(g)">
          {{ capitalise(g) }}
        </button>
      </fieldset>

      <p class="whats-on__count" aria-live="polite">
        {{ results.length }} {{ results.length === 1 ? 'event' : 'events' }}
      </p>

      <TransitionGroup v-if="results.length" name="ticket" tag="ul" class="whats-on__grid">
        <li v-for="e in results" :key="e.id"
            class="ticket" :class="['ticket--' + e.genre, { 'ticket--sold-out': e.soldOut }]">
          <div class="ticket__body">
            <span class="ticket__genre">{{ capitalise(e.genre) }}</span>
            <h3 class="ticket__title">{{ e.title }}</h3>
            <p class="ticket__venue">{{ e.venue }}</p>
            <p class="ticket__status">{{ e.soldOut ? 'Sold out' : 'Tickets available' }}</p>
          </div>
          <div class="ticket__stub">
            <span class="ticket__day">{{ day(e.date) }}</span>
            <small>{{ shortMonth(e.date) }}</small>
          </div>
        </li>
      </TransitionGroup>

      <div v-else class="whats-on__empty">
        <p>No events match these filters.</p>
        <button type="button" class="btn btn--ghost" @click="reset">Clear filters</button>
      </div>
    </div>
  `,
};
