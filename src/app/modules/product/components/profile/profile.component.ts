// src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import Sweetalert2 from 'sweetalert2';
import { User } from '../../model/User.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: [''],
      city: [''],
      state: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    this.isLoading = true;
    this.authService.getUserDetails().subscribe({
      next: (user: User) => {
        this.user = user;
        this.profileForm.patchValue(user);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.isLoading = false;
        Sweetalert2.fire('Error', 'No se pudo cargar la información del usuario.', 'error');
      },
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const updatedData = this.profileForm.getRawValue();
      delete updatedData.email; // El email no se modifica
      this.authService.updateUserDetails(updatedData).subscribe({
        next: (updatedUser: User) => {
          this.user = updatedUser;
          this.profileForm.patchValue(updatedUser);
          this.isLoading = false;
          Sweetalert2.fire('Éxito', 'Tu información ha sido actualizada.', 'success');
        },
        error: (error) => {
          console.error('Error updating user data:', error);
          this.isLoading = false;
          Sweetalert2.fire('Error', 'No se pudo actualizar la información.', 'error');
        },
      });
    } else {
      this.profileForm.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar errores
      Sweetalert2.fire('Advertencia', 'Completa todos los campos requeridos.', 'warning');
    }
  }

  resetForm() {
    if (this.user) {
      this.profileForm.patchValue(this.user);
      this.profileForm.markAsPristine();
      this.profileForm.markAsUntouched();
    }
  }
}