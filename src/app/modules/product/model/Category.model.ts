
export interface Category {
    id:number;
    title:string;
    products:string[];
}

export interface CategoryFilter {
  id: number;
  label: string;
  value: string; // Cambiado de `string | number` a `string`
  checked: boolean;
}
