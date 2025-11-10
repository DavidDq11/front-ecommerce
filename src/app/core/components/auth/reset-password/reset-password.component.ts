import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  isLoading = false;
  submitted = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.router.navigate(['/login']);
    }
  }

  get f() { return this.resetForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const { password } = this.resetForm.value;

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '¡Contraseña cambiada con éxito! Redirigiendo...';
        Swal.fire({
          icon: 'success',
          title: '¡Listo!',
          text: 'Tu contraseña ha sido actualizada.',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Token inválido o expirado.',
          confirmButtonColor: '#f97316'
        });
      }
    });
  }
}