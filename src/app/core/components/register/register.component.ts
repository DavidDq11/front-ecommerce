import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });

    this.registerForm.get('confirmPassword')?.setValidators([
      Validators.required,
      this.passwordMatchValidator()
    ]);
    this.registerForm.get('confirmPassword')?.updateValueAndValidity();
  }

  passwordMatchValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = this.registerForm?.get('password')?.value;
      const confirmPassword = control.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const userData = {
        first_name: this.registerForm.value.firstName,
        last_name: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      this.authService.register(userData).subscribe(
        (response) => {
          this.isLoading = false;
          // console.log('Respuesta de la API al registrar:', response); // Depura la respuesta
          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido(a), ' + this.registerForm.value.firstName + '!',
            text: '¡Prepárate para disfrutar junto a tus mascotas con DOMIPETS!',
            confirmButtonColor: '#6B46C1',
            confirmButtonText: '¡Vamos allá!'
          }).then(() => {
            this.router.navigate(['/']).then(() => {
              // console.log('Redirección a / ejecutada');
            }).catch(err => {
              console.error('Error en redirección:', err);
            });
          });
        },
        (error) => {
          this.isLoading = false;
          console.error('Registration failed', error);
          Swal.fire({
            icon: 'error',
            title: '¡Ups!',
            text: 'No pudimos registrarte: ' + (error.error?.message || 'Error desconocido'),
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

  googleSignIn(): void {
    this.authService.googleSignIn().subscribe(
      (response) => {
        console.log('Google sign-in successful', response);
      },
      (error) => {
        console.error('Google sign-in failed', error);
      }
    );
  }
}