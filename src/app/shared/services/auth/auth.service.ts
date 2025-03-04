import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; // Base URL del backend
  private tokenKey = 'authToken'; // Clave para almacenar el token en localStorage

  constructor(private http: HttpClient, private router: Router) {}

  // Registro de usuario
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Inicio de sesión
  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, userData);
  }

  // Guardar el token recibido
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Eliminar el token (logout)
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']); // Redirige al login
  }

  // Verificar si el usuario está autenticado
  isLoggedIn(): boolean {
    return !!this.getToken(); // Devuelve true si hay un token
  }

  // Método para Google Sign-In (a implementar más adelante)
  googleSignIn(): Observable<any> {
    // Implementar lógica de Google Sign-In con backend si es necesario
    throw new Error('Google Sign-In no implementado aún');
  }
}