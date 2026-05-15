import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private baseUrl = 'https://budget-production-e72e.up.railway.app/auth';
   private baseUrl = 'http://localhost:8080/auth';
  
  private tokenKey = 'access_token';
  private isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('✅ Login successful, token:', response.accessToken.substring(0, 20) + '...');
        this.setToken(response.accessToken);
        this.isAuthenticated$.next(true);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData).pipe(
      tap(response => {
        console.log('✅ Register successful, token:', response.accessToken.substring(0, 20) + '...');
        this.setToken(response.accessToken);
        this.isAuthenticated$.next(true);
      })
    );
  }

  logout(): void {
    console.log('🔓 Logout - clearing token');
    this.clearToken();
    this.isAuthenticated$.next(false);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token;
  }

  private getAuthHeaders() {
    const token = this.getToken();
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  setToken(token: string): void {
    console.log('💾 Storing token:', token.substring(0, 20) + '...');
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }


}
