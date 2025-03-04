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
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido(a) de vuelta!',
            text: 'Estamos felices de verte otra vez en DOGMICAT.',
            confirmButtonColor: '#6B46C1',
            confirmButtonText: '¡A explorar!'
          }).then(() => {
            if (response.token) {
              this.authService.setToken(response.token);
              // Guardar los datos del usuario (ajusta según la estructura de tu respuesta)
              this.authService.setUserData({
                name: response.user?.name || 'Usuario', // Ajusta según los datos que devuelva tu API
                email: response.user?.email // Opcional, si quieres guardar más datos
              });
              this.router.navigate(['/']);
              window.location.reload();
            }
          });
        },
        (error) => {
          this.isLoading = false;
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