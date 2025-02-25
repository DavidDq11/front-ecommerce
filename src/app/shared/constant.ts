

export const breadcrumbsMenu=[
    {
        label:'Categories',
        path:'/categories',
        children:[
            {
                path:':category'
            },
            {
                path:'/product/:id'
            }
        ]
    }
];

export const MENU:{
    title:string;
    path:string;
}[]
=[
    {
        title: 'Alimentos para Mascotas',
        path:'/categories/Men'
    },
    {
        title: 'Medicamentos y Suplementos',
        path:'/categories/Women'
    },
    {
        title: 'Juguetes y Accesorios',
        path:'/categories/Groceries'
    },
    {
        title: 'Higiene y Cuidado',
        path:'/categories/Packaged Foods'
    },
    {
        title: 'Productos Veterinarios',
        path:'/categories/Beverages'
    },
    {
        title: 'Otros',
        path:'/categories/Electronics'
    }
]

