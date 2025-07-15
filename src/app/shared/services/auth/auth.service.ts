// src/app/shared/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/modules/product/model/User.model';

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.baseAPIURL;
  private tokenKey = 'authToken';
  private userKey = 'authUser';
  private inactivityTimeout = 300 * 60 * 1000; // 5 horas en milisegundos

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  private inactivityTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    this.initializeInactivityTracking();
    const storedUser = this.getUserData();
    if (storedUser && typeof storedUser === 'object') {
      this.userSubject.next(storedUser);
    }
  }

  private initializeInactivityTracking(): void {
    this.resetInactivityTimer();
    this.setupActivityListeners();
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      this.logoutDueToInactivity();
    }, this.inactivityTimeout);
  }

  private setupActivityListeners(): void {
    ['click', 'keypress', 'mousemove'].forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer());
    });
  }

  private logoutDueToInactivity(): void {
    this.logout();
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register`, userData).pipe(
      catchError(error => {
        console.error('Error de registro:', error);
        return throwError(() => error);
      })
    );
  }

  login(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}login`, userData).pipe(
      tap(response => {
        const { token, user } = response;
        if (token && user) {
          this.setToken(token);
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuario';
          this.setUserData({
            id: user.id,
            name: fullName, // Incluimos name
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            city: user.city,
            state: user.state,
            address: user.address
          });
        }
      }),
      catchError(error => {
        console.error('Error de login:', error);
        return throwError(() => error);
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('isLogged', 'true');
    this.resetInactivityTimer();
  }

  setUserData(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
    this.resetInactivityTimer();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserData(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getUserDetails(): Observable<User> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('No token available'));
    return this.http.get<User>(`${this.apiUrl}me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(user => {
        // Agregar name al usuario devuelto por el endpoint
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuario';
        this.setUserData({ ...user, name: fullName });
      }),
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => error);
      })
    );
  }

  updateUserDetails(userData: Partial<User>): Observable<User> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('No token available'));
    return this.http.put<User>(`${this.apiUrl}me`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(updatedUser => {
        const currentUser = this.getUserData();
        const fullName = `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim() || 'Usuario';
        const mergedUser = { ...currentUser, ...updatedUser, name: fullName };
        this.setUserData(mergedUser);
      }),
      catchError(error => {
        console.error('Error updating user details:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('isLogged');
    this.userSubject.next(null);
    this.router.navigate(['/login']).catch(err => console.error('Error de navegación:', err));
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  googleSignIn(): Observable<any> {
    window.location.href = `${this.apiUrl}auth/google`;
    return new Observable();
  }
}