// src/app/constant.ts
export const breadcrumbsMenu = [
  {
    label: 'Categories',
    path: '/categories',
    children: [
      { path: ':category' },
      { path: '/product/:id' }
    ]
  }
];

export const MENU: { title: string; path: string }[] = [
  {
    title: 'Alimentos Secos',
    path: '/categories/Alimentos Secos'
  },
  {
    title: 'Alimentos Húmedos',
    path: '/categories/Alimentos Húmedos'
  },
  {
    title: 'Snacks',
    path: '/categories/Snacks'
  },
  {
    title: 'Arena para Gatos',
    path: '/categories/Arena para Gatos'
  },
  {
    title: 'Accesorios',
    path: '/categories/Accesorios'
  },
  {
    title: 'Productos Veterinarios',
    path: '/categories/Productos Veterinarios'
  }
];