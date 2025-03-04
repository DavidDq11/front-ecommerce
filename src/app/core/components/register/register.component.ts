import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'] // Usar SCSS si lo prefieres
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false; // Estado de carga

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
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
      console.log('Enviando al backend:', userData);
      this.authService.register(userData).subscribe(
        (response) => {
          console.log('Registration successful', response);
          this.isLoading = false;
          // Mensaje de felicitación personalizado
          alert('¡Felicidades! Tu nueva aventura con ' + this.registerForm.value.firstName + ' y tus mascotas ha comenzado en DOGMICAT.');
          if (response.token) {
            this.authService.setToken(response.token);
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.isLoading = false;
          console.error('Registration failed', error);
          alert('Registration failed: ' + (error.error?.message || 'Unknown error'));
        }
      );
    } else {
      console.log('Formulario inválido:', this.registerForm.value);
      alert('Please fill all fields correctly');
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