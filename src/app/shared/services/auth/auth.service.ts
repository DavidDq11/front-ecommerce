import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.baseAPIURL;
  private tokenKey = 'authToken'; // Clave para almacenar el token en localStorage
  private userKey = 'authUser';   // Clave para almacenar los datos del usuario en localStorage

  constructor(private http: HttpClient, private router: Router) {}

  // Registro de usuario
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register`, userData);
  }

  // Inicio de sesión
  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login`, userData);
  }

  // Guardar el token recibido
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Guardar los datos del usuario
  setUserData(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Obtener los datos del usuario
  getUserData(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null; // Devuelve los datos del usuario o null si no hay datos
  }

  // Eliminar el token y los datos del usuario (logout)
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey); // También elimina los datos del usuario
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