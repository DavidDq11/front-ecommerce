import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    const { email } = this.forgotForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = '¡Enlace enviado! Revisa tu correo (incluido spam).';
        Swal.fire({
          icon: 'success',
          title: 'Enlace enviado',
          text: 'Revisa tu bandeja de entrada y carpeta de spam.',
          confirmButtonColor: '#f97316'
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al enviar el enlace.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
          confirmButtonColor: '#f97316'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}