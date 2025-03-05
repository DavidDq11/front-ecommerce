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
    this.category = type; // Usamos type como base para el filtrado
    this.productService.getRelated(type).subscribe(data => {
      this.products = data as Product[]; // Asegúrate de que data sea del tipo Product[]
      this.cloneOfProducts = data as Product[];
      const types = [...new Set(this.cloneOfProducts.map(item => item.type))];
      const typeMap = {
        'Alimento': 1, 'Accesorio': 4, 'Higiene': 3, 'Juguete': 2,
        'Snack': 5, 'Habitat': 6, 'Equipo': 7, 'Suplemento': 8
      };
      types.forEach((typeValue) => {
        const id = typeMap[typeValue as keyof typeof typeMap] || 1;
        prodTypes.push({
          label: typeValue,
          value: typeValue,
          checked: false,
          id: id
        });
      });
      this.filterList.next(prodTypes);
      console.log('Filtered types for type', type, ':', prodTypes); // Depuración
    }, error => console.error('Error fetching product types:', error));
  }

  handlePriceFilter(min:number,max:number){
    const products=this.cloneOfProducts.filter(item=>item.price>=min&&item.price<=max);
    this.filterProduct(products);
  }
  handleCatFilter(checkedItems:CategoryFilter[]):Product[]{
    this.productService.getByCategory(this.category).subscribe(data=>this.products=data);
    this.filterProduct(this.products);
    let checked=checkedItems.filter(item=>item.checked).map(item=>item.value);
    if(checked.length){
      this.filteredProducts.subscribe((data:Product[])=>{
        this.products=data.filter(item=>checked.includes(item.type));
      })
    } 
    return this.products;

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
