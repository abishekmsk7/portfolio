// SeatMap.js – Vue 3 component (Composition API)
// Pick a seat, and the sightline SVG updates from that seat's position.
const SeatMap = {
  name: 'SeatMap',
  props: {
    rows: { type: Array, default: () => ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
    seatsPerRow: { type: Number, default: 10 },
    aisleAfter: { type: Number, default: 5 },
  },
  setup(props) {
    const { ref, computed } = Vue;
    const selected = ref({ row: 3, seat: 5 });

    // Outer seats in the first two rows have an angled view
    const isRestricted = (row, seat) =>
      row <= 1 && (seat === 1 || seat === props.seatsPerRow);

    const isSelected = (row, seat) =>
      selected.value.row === row && selected.value.seat === seat;

    const select = (row, seat) => { selected.value = { row, seat }; };

    // 0 = front row … 1 = back row; -1 = far left … 1 = far right
    const position = computed(() => {
      const { row, seat } = selected.value;
      const mid = (props.seatsPerRow + 1) / 2;
      return {
        depth: row / (props.rows.length - 1),
        offset: (seat - mid) / (mid - 1),
      };
    });

    const label = computed(() =>
      `Row ${props.rows[selected.value.row]}, Seat ${selected.value.seat}`);

    const note = computed(() => {
      const { depth, offset } = position.value;
      const side = Math.abs(offset) < 0.25 ? 'Centre'
        : Math.abs(offset) > 0.75 ? (offset < 0 ? 'Far left' : 'Far right')
        : (offset < 0 ? 'Left of centre' : 'Right of centre');
      const distance = depth < 0.3 ? 'close to the stage, you’ll look up slightly at the action'
        : depth > 0.7 ? 'further back, you see the whole stage picture at once'
        : 'mid-stalls, a well-balanced view';
      const angle = isRestricted(selected.value.row, selected.value.seat)
        ? ' Restricted view: part of the stage is at a sharp angle.' : '';
      return `${side}, ${distance}.${angle}`;
    });

    // Geometry for the sightline SVG, recalculated whenever the seat changes
    const view = computed(() => {
      const { depth, offset } = position.value;
      const scale = 0.92 - depth * 0.42;
      const w = 300 * scale, h = 120 * scale;
      const cx = 200 - offset * 45 * (1 - depth * 0.3);
      const y = 100 - (1 - depth) * 12 - h / 2;
      const x = cx - w / 2;
      const skew = offset * 26 * scale;
      const pt = (px, py) => `${px.toFixed(1)},${py.toFixed(1)}`;
      return {
        scale, cx, x, y, w, h,
        stage: [
          pt(x + Math.max(0, skew), y + Math.max(0, -skew) * 0.25),
          pt(x + w + Math.min(0, skew), y + Math.max(0, skew) * 0.25),
          pt(x + w + Math.min(0, skew), y + h - Math.max(0, skew) * 0.25),
          pt(x + Math.max(0, skew), y + h - Math.max(0, -skew) * 0.25),
        ].join(' '),
        floor: [
          pt(x - 20 * scale, y + h + 22 * scale), pt(x + w + 20 * scale, y + h + 22 * scale),
          pt(x + w, y + h), pt(x, y + h),
        ].join(' '),
        // One row of heads in front of you, unless you're in row A
        heads: selected.value.row === 0 ? [] : Array.from({ length: 7 }, (_, i) => ({
          x: (i + 0.5) * (400 / 7) - offset * 18 + (selected.value.row % 2 ? 14 : 0),
          r: 20 + (1 - depth) * 4,
        })),
      };
    });

    return { selected, select, isSelected, isRestricted, label, note, view };
  },
  template: `
    <div class="seat-demo">
      <div class="panel">
        <p class="seat-map__stage" aria-hidden="true">Stage</p>
        <div class="seat-map__rows" role="group" aria-label="Seat map. Choose a seat to see its view.">
          <div v-for="(row, r) in rows" :key="row" class="seat-map__row">
            <span class="seat-map__label" aria-hidden="true">{{ row }}</span>
            <template v-for="s in seatsPerRow" :key="row + s">
              <span v-if="s === aisleAfter + 1" class="seat-map__aisle"></span>
              <button
                type="button"
                class="seat"
                :class="{ 'seat--selected': isSelected(r, s), 'seat--restricted': isRestricted(r, s) && !isSelected(r, s) }"
                :aria-pressed="isSelected(r, s)"
                :aria-label="'Row ' + row + ', seat ' + s + (isRestricted(r, s) ? ', restricted view' : '')"
                @click="select(r, s)"
              >{{ s }}</button>
            </template>
            <span class="seat-map__label" aria-hidden="true">{{ row }}</span>
          </div>
        </div>
        <ul class="seat-legend">
          <li><span class="seat seat--selected" aria-hidden="true"></span>Your seat</li>
          <li><span class="seat seat--restricted" aria-hidden="true"></span>Restricted view</li>
        </ul>
        <p class="seat-map__hint">Row A is nearest the stage.</p>
      </div>

      <div class="panel sightline" aria-live="polite">
        <h3 class="sightline__title">{{ label }}</h3>
        <p class="sightline__note">{{ note }}</p>
        <svg viewBox="0 0 400 250" role="img" :aria-label="'View from ' + label">
          <polygon :points="view.floor" fill="#3B2A22" />
          <polygon :points="view.stage" fill="#26303B" stroke="#8C96A3" stroke-width="2" />
          <rect :x="view.x - 14 * view.scale" :y="view.y - 14 * view.scale"
                :width="view.w + 28 * view.scale" :height="14 * view.scale" fill="#C8102E" />
          <ellipse :cx="view.cx" :cy="view.y + 6" :rx="70 * view.scale" :ry="view.h * 0.9"
                   fill="#FFF6D8" opacity=".08" />
          <circle :cx="view.cx" :cy="view.y + view.h * 0.35" :r="9 * view.scale" fill="#F2C9A0" />
          <rect :x="view.cx - 10 * view.scale" :y="view.y + view.h * 0.35 + 9 * view.scale"
                :width="20 * view.scale" :height="view.h * 0.5" :rx="6 * view.scale" fill="#E8EAED" />
          <g v-for="(head, i) in view.heads" :key="i" fill="#000" opacity=".55">
            <circle :cx="head.x" cy="232" :r="head.r" />
            <rect :x="head.x - head.r * 1.4" y="240" :width="head.r * 2.8" height="30" rx="12" />
          </g>
        </svg>
      </div>
    </div>
  `,
};
