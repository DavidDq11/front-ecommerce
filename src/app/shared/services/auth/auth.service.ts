import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs'; // Importa BehaviorSubject
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.baseAPIURL;
  private tokenKey = 'authToken'; // Clave para almacenar el token en localStorage
  private userKey = 'authUser';   // Clave para almacenar los datos del usuario en localStorage

  // BehaviorSubject para emitir los datos del usuario
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable(); // Observable público para que los componentes se suscriban

  constructor(private http: HttpClient, private router: Router) {
    // Cargar los datos iniciales del usuario desde localStorage al iniciar el servicio
    const storedUser = this.getUserData();
    if (storedUser) {
      this.userSubject.next(storedUser);
    }
  }

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

  // Guardar los datos del usuario y emitirlos
  setUserData(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user); // Emite los nuevos datos del usuario
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Obtener los datos del usuario desde localStorage
  getUserData(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null; // Devuelve los datos del usuario o null si no hay datos
  }

  // Eliminar el token y los datos del usuario (logout)
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null); // Emite null para indicar que no hay usuario
    this.router.navigate(['/login']); // Redirige al login
  }

  // Verificar si el usuario está autenticado
  isLoggedIn(): boolean {
    return !!this.getToken(); // Devuelve true si hay un token
  }

  // Método para Google Sign-In (a implementar más adelante)
  googleSignIn(): Observable<any> {
    throw new Error('Google Sign-In no implementado aún');
  }
}