import type { NewCategoryInput } from '@/db/repositories/categories';

export const defaultCategories: NewCategoryInput[] = [
  { name: 'Salário', type: 'income', icon: 'cash', color: '#276A4C' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#3D8B67' },
  { name: 'Investimentos', type: 'income', icon: 'chart-line', color: '#5AA483' },
  { name: 'Outras receitas', type: 'income', icon: 'plus-circle', color: '#8FC4A8' },
  { name: 'Alimentação', type: 'expense', icon: 'food', color: '#8C3A3A' },
  { name: 'Moradia', type: 'expense', icon: 'home', color: '#6B4A57' },
  { name: 'Transporte', type: 'expense', icon: 'car', color: '#5B4B73' },
  { name: 'Saúde', type: 'expense', icon: 'medical-bag', color: '#3D5A73' },
  { name: 'Educação', type: 'expense', icon: 'school', color: '#2F6B63' },
  { name: 'Lazer', type: 'expense', icon: 'movie', color: '#A8703D' },
  { name: 'Compras', type: 'expense', icon: 'shopping', color: '#A85838' },
  { name: 'Assinaturas', type: 'expense', icon: 'sync', color: '#4A4573' },
  { name: 'Outras despesas', type: 'expense', icon: 'dots-horizontal', color: '#5D4E42' },
];
