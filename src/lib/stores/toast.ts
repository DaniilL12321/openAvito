import { writable } from 'svelte/store';

type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  type: ToastType;
  message: string;
  id: number;
}

function createToastStore() {
  const { subscribe, set, update } = writable<ToastData[]>([]);
  let nextId = 1;

  function show(message: string, type: ToastType = 'success') {
    const id = nextId++;
    update(toasts => [...toasts, { type, message, id }]);
    
    setTimeout(() => {
      update(toasts => toasts.filter(t => t.id !== id));
    }, 3000);
  }

  function clear() {
    set([]);
  }

  return {
    subscribe,
    show,
    clear
  };
}

export const toasts = createToastStore(); 