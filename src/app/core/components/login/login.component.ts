import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // Usar SCSS si lo prefieres
})
export class LoginComponent {
  isLoading = false;
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
        this.isLoading = true;
        const userData = this.loginForm.value;
        this.authService.login(userData).subscribe(
            (response) => {
                this.isLoading = false;
                // console.log('Respuesta de la API:', response); // Depura la respuesta

                // Verifica la estructura de la respuesta
                let token = response.token; // Intenta obtener el token directamente
                if (typeof token === 'object' && token.token) {
                    token = token.token; // Si está anidado, usa token.token
                }

                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido(a) de vuelta!',
                    text: 'Estamos felices de verte otra vez en DOMIPETS.',
                    confirmButtonColor: '#6B46C1',
                    confirmButtonText: '¡A explorar!'
                }).then(() => {
                    if (token) {
                        this.authService.setToken(token);
                        const fullName = `${response.user.first_name || ''} ${response.user.last_name || ''}`.trim() || 'Usuario';
                        this.authService.setUserData({
                            name: fullName,
                            email: response.user.email
                        });
                        this.router.navigate(['/']).then(() => {
                        }).catch(err => {
                            console.error('Error en redirección:', err);
                        });
                    } else {
                        console.warn('No se encontró un token válido en la respuesta');
                    }
                });
            },
            (error) => {
                this.isLoading = false;
                console.error('Error en login:', error);
                Swal.fire({
                    icon: 'error',
                    title: '¡Ups!',
                    text: 'No pudimos iniciar sesión: ' + (error.error?.message || 'Error desconocido'),
                    confirmButtonColor: '#6B46C1'
                });
            }
        );
    } else {
        Swal.fire({
            icon: 'warning',
            title: '¡Faltan datos!',
            text: 'Por favor, completa todos los campos correctamente.',
            confirmButtonColor: '#6B46C1'
        });
    }
}
}