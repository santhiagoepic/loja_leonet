'use client';

const STORAGE_KEY = 'leoneth.whatsapp.views';
const MAX_ITEMS = 10;

function safeParse(json) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadRaw() {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return safeParse(stored);
}

function persist(list) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
}

export function recordWhatsAppView(product) {
  if (typeof window === 'undefined' || !product?.id) return;
  const history = loadRaw();
  const entry = {
    id: product.id,
    slug: product.slug || null,
    name: product.nome || product.name || 'Produto',
    image: product.imagem || product.image || null,
    viewedAt: Date.now(),
  };
  const filtered = history.filter((item) => item.id !== entry.id);
  const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
  persist(updated);
}

export function loadViewHistory() {
  return loadRaw();
}
