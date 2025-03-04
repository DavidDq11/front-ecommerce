import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { Router } from '@angular/router';

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
          console.log('Login successful', response);
          if (response.token) {
            this.authService.setToken(response.token);
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.isLoading = false;
          console.error('Login failed', error);
          alert('Login failed: ' + (error.error?.message || 'Unknown error'));
        }
      );
    } else {
      alert('Please fill all fields correctly');
    }
  }
}