import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

interface User {
  id?: number;
  name?: string;
  email?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.baseAPIURL;
  private tokenKey = 'authToken';
  private userKey = 'authUser';
  private inactivityTimeout = 300 * 60 * 1000; // 5 hours in milliseconds

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  private inactivityTimer: any; // Timer for inactivity tracking

  constructor(private http: HttpClient, private router: Router) {
    this.initializeInactivityTracking();
    const storedUser = this.getUserData();
    if (storedUser && typeof storedUser === 'object') {
      this.userSubject.next(storedUser);
    }
  }

  // Initialize inactivity tracking
  private initializeInactivityTracking(): void {
    this.resetInactivityTimer();
    this.setupActivityListeners();
  }

  // Reset the inactivity timer on user activity
  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      this.logoutDueToInactivity();
    }, this.inactivityTimeout);
  }

  // Set up event listeners for user activity
  private setupActivityListeners(): void {
    ['click', 'keypress', 'mousemove'].forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer());
    });
  }

  // Logout due to inactivity
  private logoutDueToInactivity(): void {
    console.log('Logging out due to 5 hours of inactivity');
    this.logout();
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register`, userData).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login`, userData).pipe(
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.resetInactivityTimer(); // Reset timer on login
  }

  setUserData(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
    this.resetInactivityTimer(); // Reset timer on user data update
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserData(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
    this.router.navigate(['/login']).catch(err => console.error('Navigation error:', err));
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  googleSignIn(): Observable<any> {
    window.location.href = `${this.apiUrl}auth/google`;
    return new Observable(); // Handle callback separately if needed
  }
}