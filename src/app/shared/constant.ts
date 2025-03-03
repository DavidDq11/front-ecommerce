

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
        path:'/categories/Food'
    },{
        title: 'Juguetes y Accesorios',
        path:'/categories/Toys'
    },
    {
        title: 'Higiene y Cuidado',
        path:'/categories/Hygiene'
    },
    {
        title: 'Productos Variados',
        path:'/categories/Accessories'
    },
    {
        title: 'Snacks',
        path:'/categories/Snacks'
    }
]

