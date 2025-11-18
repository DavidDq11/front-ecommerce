import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/layout/components/header/header.component';
import { FooterComponent } from './core/layout/components/footer/footer.component';
import { LoginComponent } from './core/components/login/login.component';
import { RegisterComponent } from './core/components/register/register.component';
import { HomeComponent } from './core/components/home/home.component';
import { CarouselComponent } from './core/components/home/carousel/carousel.component';
import { CartComponent } from './core/components/cart/cart.component';
import { CartitemComponent } from './core/components/cart/cartitem/cartitem.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Page404Component } from './core/components/page404/page404.component';
import { SearchresultComponent } from './core/components/searchresult/searchresult.component';
import { SearchComponent } from './core/layout/components/header/search/search.component';
import { AuthinterceptorService } from './shared/services/auth/authinterceptor.service';
import { SharedModule } from './shared/shared.module';
import { TermsComponent } from './core/components/terms/terms.component';
import { PrivacyComponent } from './core/components/privacy/privacy.component';
import { CartModalComponent } from './core/components/cart-modal/cart-modal.component';
import { CommonModule } from '@angular/common';
import { OrderConfirmationComponent } from './modules/order-confirmation/order-confirmation.component';
import { AboutComponent } from './core/components/about/about.component';
import Swal from 'sweetalert2';
import { ProfileComponent } from './modules/product/components/profile/profile.component';
import { AdminOrdersComponent } from './modules/admin-orders/admin-orders.component';
import { AdminGuard } from './shared/services/auth/admin.guard';
import { ForgotPasswordComponent } from './core/components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './core/components/auth/reset-password/reset-password.component';
import { ProductModule } from './modules/product/product.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    CarouselComponent,
    CartComponent,
    CartitemComponent,
    Page404Component,
    SearchresultComponent,
    SearchComponent,
    TermsComponent,
    PrivacyComponent,
    OrderConfirmationComponent,
    CartModalComponent,
    AboutComponent,
    ProfileComponent,
    AdminOrdersComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AppRoutingModule,
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    ProductModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthinterceptorService,
      multi: true
    },
    AdminGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }