import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import { CategoryFilter, Product } from '../model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  public filteredProducts=new BehaviorSubject<Product[]>([]);
  filterList=new BehaviorSubject<CategoryFilter[]>([]);
  products!:Product[];
  category='';
  selectedCategoryId = new BehaviorSubject<number | null>(null);
  cloneOfProducts!:Product[];
  constructor(private productService:ProductService) { }

  filterProduct(products:Product[]){
    return this.filteredProducts.next(products);
  }

  getProductTypeFilter(type: string) {
    let prodTypes: CategoryFilter[] = [];
    this.category = type;
    this.productService.getRelated(type).subscribe(
      (data: { products: Product[]; total: number; page: number; totalPages: number }) => {
        // Extract the products array from the response
        this.products = data.products;
        this.cloneOfProducts = data.products;
        const types = [...new Set(this.cloneOfProducts.map(item => item.type))];
        const typeMap = {
          'Alimento': 1, 'Juguete': 2, 'Higiene': 3, 'Accesorio': 4,
          'Snack': 5, 'Habitat': 6, 'Equipo': 7, 'Suplemento': 8
        };

        types.forEach((typeValue) => {
          const id = typeMap[typeValue as keyof typeof typeMap] || 1;
          prodTypes.push({
            label: typeValue,
            value: typeValue,
            checked: id === this.selectedCategoryId.getValue(),
            id: id
          });
        });
        this.filterList.next(prodTypes);

        // Aplicar el filtro inicial si hay una categoría seleccionada
        const selectedId = this.selectedCategoryId.getValue();
        if (selectedId) {
          const checkedItems = prodTypes.map(item => ({
            ...item,
            checked: item.id === selectedId
          }));
          this.handleCatFilter(checkedItems);
        } else {
          this.filterProduct(this.cloneOfProducts); // Si no hay selección, mostrar todos
        }
      },
      error => console.error('Error fetching product types:', error)
    );
  }

  handlePriceFilter(min:number,max:number){
    const products=this.cloneOfProducts.filter(item=>item.price>=min&&item.price<=max);
    this.filterProduct(products);
  }
  
  handleCatFilter(checkedItems: CategoryFilter[]): Product[] {
    // Usar cloneOfProducts como base, que ya está inicializado en getProductTypeFilter
    let filteredProducts = [...this.cloneOfProducts];
    const checkedValues = checkedItems.filter(item => item.checked).map(item => item.value);
  
    // Aplicar el filtro solo si hay categorías marcadas
    if (checkedValues.length > 0) {
      filteredProducts = filteredProducts.filter(product => checkedValues.includes(product.type));
    }
  
    // Emitir los productos filtrados
    this.filterProduct(filteredProducts);
    return filteredProducts;
  }

  handleRateFilter(rating:number):Product[]{
    this.productService.getByCategory(this.category).subscribe(data=>this.products=data);
    this.filterProduct(this.products);
    this.filteredProducts.subscribe((data:Product[])=>{
     this.products= data.filter(item=>rating<=Math.trunc(item.rating.rate));
    })
    return this.products;
  }

  setSelectedCategory(categoryId: number | null) {
    this.selectedCategoryId.next(categoryId);
  }

}
