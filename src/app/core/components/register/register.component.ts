import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Create this service later

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: []
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validator: this.passwordMatchValidator });

    this.registerForm.get('confirmPassword')?.addValidators(this.passwordMatchValidator());
  }

  // Custom validator to check if passwords match
  passwordMatchValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;
      
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const userData = this.registerForm.value;
      this.authService.register(userData).subscribe(
        response => {
          console.log('Registration successful', response);
          // Redirect to login or home page
        },
        error => {
          console.error('Registration failed', error);
        }
      );
    }
  }

  googleSignIn(): void {
    this.authService.googleSignIn().subscribe(
      response => {
        console.log('Google sign-in successful', response);
        // Handle successful Google login (e.g., redirect)
      },
      error => {
        console.error('Google sign-in failed', error);
      }
    );
  }
}