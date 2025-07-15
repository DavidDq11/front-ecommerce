import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './core/components/home/home.component';
import { LoginComponent } from './core/components/login/login.component';
import { RegisterComponent } from './core/components/register/register.component';
import { CartComponent } from './core/components/cart/cart.component';
import { Page404Component } from './core/components/page404/page404.component';
import { CheckoutComponent } from './modules/product/components/checkout/checkout.component';
import { OrderConfirmationComponent } from './modules/order-confirmation/order-confirmation.component';
import { canActivate } from './shared/services/auth/authguard.service';
import { SearchresultComponent } from './core/components/searchresult/searchresult.component';
import { TermsComponent } from './core/components/terms/terms.component';
import { PrivacyComponent } from './core/components/privacy/privacy.component';
import { ProductComponent } from './modules/product/components/product/product.component';
import { AboutComponent } from './core/components/about/about.component';
import { ProfileComponent } from './modules/product/components/profile/profile.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: SearchresultComponent },
  { path: 'categories', loadChildren: () => import('./modules/product/product.module').then(m => m.ProductModule) },
  { path: 'brands/:brand_id', component: ProductComponent },
  { path: 'shopping-cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [canActivate] },
  { path: 'order-confirmation', component: OrderConfirmationComponent, canActivate: [canActivate] },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'about', component: AboutComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [canActivate] },
  { path: '**', component: Page404Component, data: { message: 'Oops... This is a Bad request' } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }