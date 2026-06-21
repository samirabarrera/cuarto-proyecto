// IDs corresponden a los UUIDs reales generados en la tabla `categories` (PostgreSQL)
// Si se resetea la BD hay que actualizar estos valores con los nuevos UUIDs del seed
export const CATEGORIES = [
  // ── GASTOS ────────────────────────────────────────────────────────────────
  { id: '73137079-e36b-4594-aa83-9972b522df12', name: 'Alimentación',    icon: 'bi-basket',         color: '#f97316', type: 'expense' },
  { id: '49fbd8ac-49d2-4583-a781-00eed026a240', name: 'Transporte',      icon: 'bi-car-front',      color: '#3b82f6', type: 'expense' },
  { id: '3d506128-9cff-47ed-a7ac-ba7967f3fc4c', name: 'Entretenimiento', icon: 'bi-controller',     color: '#a855f7', type: 'expense' },
  { id: '1f6483b2-3eea-4eea-b7e7-7fea417419f8', name: 'Salud',           icon: 'bi-heart-pulse',    color: '#ef4444', type: 'expense' },
  { id: '05216bcc-12ba-43b8-831b-7b31cff7066b', name: 'Educación',       icon: 'bi-book',           color: '#06b6d4', type: 'expense' },
  { id: 'adee0624-d486-43b2-813f-120d04a910b8', name: 'Ropa',            icon: 'bi-bag',            color: '#ec4899', type: 'expense' },
  { id: 'dd4e2b32-25f5-4040-bc50-27aa86d7fe8f', name: 'Hogar',           icon: 'bi-house',          color: '#84cc16', type: 'expense' },
  { id: 'cbc56e75-e449-4175-bede-fe15da615575', name: 'Suscripciones',   icon: 'bi-collection-play',color: '#8b5cf6', type: 'expense' },
  { id: '1095ca7a-1319-4cd2-a075-e3430c415363', name: 'Restaurantes',    icon: 'bi-cup-hot',        color: '#f59e0b', type: 'expense' },
  { id: '08fa8e10-1ba8-49dc-9f32-e965eaf8717a', name: 'Viajes',          icon: 'bi-airplane',       color: '#14b8a6', type: 'expense' },
  { id: 'b44795ef-3777-4020-a47d-84d41190c6c5', name: 'Mascotas',        icon: 'bi-house-heart',    color: '#fb923c', type: 'expense' },
  { id: '98760dfb-cb80-4365-b2dc-186e294f144d', name: 'Otros gastos',    icon: 'bi-three-dots',     color: '#94a3b8', type: 'expense' },
  // ── INGRESOS ──────────────────────────────────────────────────────────────
  { id: '1801eb6c-61a1-4a06-a04b-c810f12bc79a', name: 'Salario',         icon: 'bi-briefcase',      color: '#22c55e', type: 'income' },
  { id: '3476cb67-05d0-4cc6-87be-83a599eb53fc', name: 'Freelance',       icon: 'bi-laptop',         color: '#10b981', type: 'income' },
  { id: 'bd334bf5-7f5e-4536-bb76-9043450a9666', name: 'Inversiones',     icon: 'bi-graph-up-arrow', color: '#6366f1', type: 'income' },
  { id: '52fcc40d-e24d-4d03-8778-d7f3d93123ce', name: 'Ventas',          icon: 'bi-shop',           color: '#f59e0b', type: 'income' },
  { id: 'a2e7a473-9d5f-4f40-94e0-2a9284d2b9ca', name: 'Regalos',        icon: 'bi-gift',           color: '#e879f9', type: 'income' },
  { id: '41a05ff9-cc06-481e-a6ff-56c175c67787', name: 'Otros ingresos',  icon: 'bi-plus-circle',    color: '#94a3b8', type: 'income' },
];

export const EMPTY_FORM = {
  description: '',
  amount: '',
  type: 'expense',
  category_id: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export const formatCurrency = (n) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n);
