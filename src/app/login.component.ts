import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-tabs">
          <button
            class="tab-btn"
            [class.active]="mode() === 'login'"
            (click)="mode.set('login')">
            Σύνδεση
          </button>
          <button
            class="tab-btn"
            [class.active]="mode() === 'register'"
            (click)="mode.set('register')">
            Εγγραφή
          </button>
        </div>

        <form *ngIf="mode() === 'login'" (ngSubmit)="handleLogin()" class="auth-form">
          <h2>Σύνδεση</h2>
          
          <div class="form-group">
            <label>Όνομα χρήστη</label>
            <input
              type="text"
              [(ngModel)]="loginForm.username"
              name="login-username"
              placeholder="Εισάγετε όνομα χρήστη"
              required />
          </div>

          <div class="form-group">
            <label>Κωδικός</label>
            <input
              type="password"
              [(ngModel)]="loginForm.password"
              name="login-password"
              placeholder="Εισάγετε κωδικό"
              required />
          </div>

          <button type="submit" class="auth-btn" [disabled]="isLoading()">
            {{ isLoading() ? 'Γίνεται σύνδεση...' : 'Σύνδεση' }}
          </button>

          <div *ngIf="error()" class="error-message">
            {{ error() }}
          </div>
        </form>

        <form *ngIf="mode() === 'register'" (ngSubmit)="handleRegister()" class="auth-form">
          <h2>Εγγραφή</h2>
          
          <div class="form-group">
            <label>Όνομα χρήστη</label>
            <input
              type="text"
              [(ngModel)]="registerForm.username"
              name="register-username"
              placeholder="Επιλέξτε όνομα χρήστη"
              required />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              [(ngModel)]="registerForm.email"
              name="register-email"
              placeholder="Εισάγετε email"
              required />
          </div>

          <div class="form-group">
            <label>Κωδικός</label>
            <input
              type="password"
              [(ngModel)]="registerForm.password"
              name="register-password"
              placeholder="Επιλέξτε κωδικό"
              required />
          </div>

          <button type="submit" class="auth-btn" [disabled]="isLoading()">
            {{ isLoading() ? 'Γίνεται εγγραφή...' : 'Εγγραφή' }}
          </button>

          <div *ngIf="error()" class="error-message">
            {{ error() }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: radial-gradient(circle at top, rgba(94, 92, 230, 0.14) 0%, transparent 35%),
        linear-gradient(180deg, #0a1420 0%, #0f1d34 55%, #0f1f3a 100%);
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(16px);
      border-radius: 28px;
      padding: 32px;
      box-shadow: 0 24px 80px rgba(8, 19, 40, 0.22);
    }

    .auth-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .tab-btn {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.08);
      color: #f8fbff;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.25s ease;
      font-weight: 500;
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #67f6d7, #4f6fad);
      border-color: #67f6d7;
      color: white;
      box-shadow: 0 16px 32px rgba(79, 111, 173, 0.24);
    }

    .tab-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.12);
    }

    .auth-form {
      display: grid;
      gap: 18px;
    }

    .auth-form h2 {
      margin: 0 0 12px 0;
      color: #f8fbff;
      font-size: 1.5rem;
    }

    .form-group {
      display: grid;
      gap: 8px;
    }

    .form-group label {
      color: #cbd5e1;
      font-size: 0.92rem;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.14);
      color: #f8fbff;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      font-size: 1rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: #67f6d7;
      box-shadow: 0 0 0 4px rgba(103, 246, 215, 0.18);
      background: rgba(255, 255, 255, 0.2);
    }

    .form-group input::placeholder {
      color: rgba(248, 251, 255, 0.5);
    }

    .auth-btn {
      padding: 14px 16px;
      border: none;
      border-radius: 16px;
      background: linear-gradient(135deg, #67f6d7, #4f6fad);
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 14px 30px rgba(103, 246, 215, 0.18);
    }

    .auth-btn:hover:not(:disabled) {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(220, 38, 38, 0.15);
      color: #fca5a5;
      font-size: 0.92rem;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 24px 16px;
      }

      .form-group input {
        font-size: 16px;
        -webkit-appearance: none;
      }
    }
  `]
})
export class LoginComponent {
  mode = signal<'login' | 'register'>('login');
  isLoading = signal(false);
  error = signal('');

  loginForm: LoginRequest = {
    username: '',
    password: ''
  };

  registerForm: RegisterRequest = {
    username: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  handleLogin(): void {
    if (!this.loginForm.username || !this.loginForm.password) {
      this.error.set('Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Σφάλμα σύνδεσης. Προσπαθήστε ξανά.');
      }
    });
  }

  handleRegister(): void {
    if (!this.registerForm.username || !this.registerForm.email || !this.registerForm.password) {
      this.error.set('Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.register(this.registerForm).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Σφάλμα εγγραφής. Προσπαθήστε ξανά.');
      }
    });
  }
}
