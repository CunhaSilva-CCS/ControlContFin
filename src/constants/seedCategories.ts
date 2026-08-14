import type { NewCategoryInput } from '@/db/repositories/categories';

export const defaultCategories: NewCategoryInput[] = [
  { name: 'Salário', type: 'income', icon: 'cash', color: '#2E7D32' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#388E3C' },
  { name: 'Investimentos', type: 'income', icon: 'chart-line', color: '#43A047' },
  { name: 'Outras receitas', type: 'income', icon: 'plus-circle', color: '#66BB6A' },
  { name: 'Alimentação', type: 'expense', icon: 'food', color: '#C62828' },
  { name: 'Moradia', type: 'expense', icon: 'home', color: '#AD1457' },
  { name: 'Transporte', type: 'expense', icon: 'car', color: '#6A1B9A' },
  { name: 'Saúde', type: 'expense', icon: 'medical-bag', color: '#0277BD' },
  { name: 'Educação', type: 'expense', icon: 'school', color: '#00838F' },
  { name: 'Lazer', type: 'expense', icon: 'movie', color: '#EF6C00' },
  { name: 'Compras', type: 'expense', icon: 'shopping', color: '#D84315' },
  { name: 'Assinaturas', type: 'expense', icon: 'sync', color: '#4527A0' },
  { name: 'Outras despesas', type: 'expense', icon: 'dots-horizontal', color: '#5D4037' },
];
