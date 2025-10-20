import { writable } from 'svelte/store';

const { subscribe, set, update } = writable(0);

function normalize(value) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

export const pendingModerationStore = {
  subscribe,
  set(value) {
    set(normalize(value));
  },
  increment(amount = 1) {
    update(count => normalize(count + amount));
  },
  decrement(amount = 1) {
    update(count => {
      const next = count - amount;
      return next > 0 ? Math.round(next) : 0;
    });
  },
  reset() {
    set(0);
  }
};
