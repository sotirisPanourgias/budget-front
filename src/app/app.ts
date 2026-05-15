import { Component, signal } from '@angular/core';
import { CommonModule, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, Transaction, NewTransaction, SearchDto } from './api';
import { AuthService } from './auth.service';

type TabType = 'create' | 'search' | 'profile' | 'totals';
type SearchMode = 'monthly' | 'custom';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgFor, DatePipe, FormsModule],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <h1>{{ title() }}</h1>
        <div class="header-actions">
          <button class="profile-btn" type="button" (click)="switchTab('profile')" [class.active]="activeTab() === 'profile'">
            👤 Προφίλ
          </button>
          <button class="logout-btn" (click)="logout()">Αποσύνδεση</button>
        </div>
      </header>
     <!--
      <header class="hero">
        <div class="hero-card">
          <strong class="hero-card-value" aria-label="Current tab">
            {{ activeTab() === 'create' ? '✚' : activeTab() === 'search' ? '🔍' : '📊' }}
          </strong>
        </div>
      </header>
      -->
      <div class="tabs">
        <button
          type="button"
          aria-label="Create"
          [class.active]="activeTab() === 'create'"
          (click)="switchTab('create')">
          ✚
        </button>

        <button
          type="button"
          aria-label="Search"
          [class.active]="activeTab() === 'search'"
          (click)="switchTab('search')">
          🔍
        </button>

        <button
          type="button"
          aria-label="Totals"
          [class.active]="activeTab() === 'totals'"
          (click)="switchTab('totals'); loadTotals()">
          📊
        </button>
      </div>

      <div class="tab-content" *ngIf="activeTab() === 'create'">
        <section class="panel">
          <div class="create-form">
            <label>
              <span class="sr-only">Description</span>
              <input [(ngModel)]="newTx.description" placeholder="Περιγραφή" aria-label="Description" />
            </label>

            <div class="input-row">
              <label>
                <span class="sr-only">Amount</span>
                <input type="number" [(ngModel)]="newTx.ammount" placeholder="0.00" aria-label="Amount" />
              </label>

              <label>
                <span class="sr-only">Date</span>
                <input type="date" [(ngModel)]="newTx.transactionDate" aria-label="Date" />
              </label>
            </div>

            <label>
              <span class="sr-only">Type</span>
              <select [(ngModel)]="newTx.type" aria-label="Type">
                <option value="EXPENSE">EXPENSE</option>
                <option value="INCOME">INCOME</option>
              </select>
            </label>

            <button class="primary" (click)="submitTransaction()">✚</button>
          </div>
        </section>
      </div>

      <div class="tab-content" *ngIf="activeTab() === 'search'">
        <section class="panel">
          <div class="search-form">
            <div class="mode-selector">
              <label class="mode-chip" [class.active]="searchMode === 'monthly'">
                <input
                  type="radio"
                  name="mode"
                  value="monthly"
                  [(ngModel)]="searchMode" />
                <span class="mode-icon">⏱</span>
                <span>ΜΗΝΙΑΙΑ</span>
              </label>

              <label class="mode-chip" [class.active]="searchMode === 'custom'">
                <input
                  type="radio"
                  name="mode"
                  value="custom"
                  [(ngModel)]="searchMode" />
                <span class="mode-icon">📅</span>
                <span>ΑΠΟ - ΕΩΣ</span>
              </label>
            </div>

            <div class="search-actions">
              <div class="description-input">
                <label>
                  <span class="sr-only">Description filter</span>
                  <input
                    type="text"
                    [(ngModel)]="descriptionFilter"
                    placeholder="Φίλτρο περιγραφής"
                    aria-label="Description filter" />
                </label>
              </div>

              <button class="primary" (click)="runSearch()">🔎</button>
            </div>

            <div *ngIf="searchMode === 'custom'" class="custom-dates">
              <label>
                <span class="sr-only">Start Date</span>
                <input type="date" [(ngModel)]="searchStartDate" aria-label="Start Date" />
              </label>

              <label>
                <span class="sr-only">End Date</span>
                <input type="date" [(ngModel)]="searchEndDate" aria-label="End Date" />
              </label>
            </div>
          </div>

          <div class="results">
            <ul>
              <li *ngFor="let t of transactions" class="transaction-item">
                <div class="transaction-meta">
                  <div>
                    <strong>{{ t.description }}</strong>
                    <div class="transaction-date">{{ t.transactionDate | date:'mediumDate' }}</div>
                  </div>
                  <div class="transaction-value" [class.expense]="t.type === 'EXPENSE'" [class.income]="t.type === 'INCOME'">
                    {{ t.type === 'EXPENSE' ? '-' : '+' }}{{ t.ammount | number:'1.2-2' }}
                  </div>
                </div>

                <div class="transaction-actions">
                  <span class="type-badge" [class.expense-badge]="t.type === 'EXPENSE'" [class.income-badge]="t.type === 'INCOME'">
                    {{ t.type === 'EXPENSE' ? ' ΕΞΟΔΑ' : ' ΕΣΟΔΑ' }}
                  </span>
                  <button class="delete-btn" (click)="deleteTransaction(t.id!)">Χ</button>
                </div>
              </li>
            </ul>
          </div>
          <div class="pagination">
            <button (click)="previousPage()" [disabled]="currentPage === 0">
              Prev
            </button>
            <span>
              Page {{currentPage + 1}} / {{totalPages}}
            </span>
            <button (click)="nextPage()" [disabled]="currentPage >= totalPages - 1">
              Next
            </button>
            <select (change)="onPageSizeChange($event)" [value]="pageSize">
              <option *ngFor="let size of pageSizeOptions" [value]="size">
                {{ size }}
              </option>
            </select>
          </div>
        </section>
      </div>

      <div class="tab-content" *ngIf="activeTab() === 'profile'">
        <section class="panel">
          <div class="profile-form">
            <h2>Αλλαγή Κωδικού</h2>

            <label>
              <span class="sr-only">Current password</span>
              <input
                type="password"
                [(ngModel)]="currentPassword"
                placeholder="Τρέχων κωδικός" />
            </label>

            <label>
              <span class="sr-only">New password</span>
              <input
                type="password"
                [(ngModel)]="newPassword"
                placeholder="Νέος κωδικός" />
            </label>

            <label>
              <span class="sr-only">Confirm password</span>
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                placeholder="Επανάληψη νέου κωδικού" />
            </label>

            <button class="primary" (click)="changePassword()">Αλλαγή</button>

            <div *ngIf="profileMessage" class="profile-message">
              {{ profileMessage }}
            </div>
          </div>
        </section>
      </div>

      <div class="tab-content" *ngIf="activeTab() === 'totals'">
        <section class="panel totals-panel">
          <ul class="totals-list">
            <li>
              <span class="icon-only" aria-hidden="true">💰</span>
              <span class="sr-only">Total</span>
              <strong
                [style.color]="
                  totalAll < 0
                    ? '#ff4d4f'
                    : totalAll > 0
                    ? '#52c41a'
                    : 'inherit'
                ">
                {{ totalAll | number:'1.2-2' }}
              </strong>
            </li>
            <li>
              <span class="icon-only" aria-hidden="true">📉</span>
              <span class="sr-only">Expenses</span>
              <strong
                [style.color]="'#ff4d4f'">
                {{ totalExpenses | number:'1.2-2' }}
              </strong>
            </li>
            <li>
              <span class="icon-only" aria-hidden="true">📈</span>
              <span class="sr-only">Income</span>
              <strong
                [style.color]="'#52c41a'">
                {{ totalIncome | number:'1.2-2' }}
              </strong>
            </li>
          </ul>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class App {
  title = signal('My Budget Studio');
  activeTab = signal<TabType>('create');
  today = new Date().toISOString().slice(0, 10);

  transactions: Transaction[] = [];
  currentPage = 0;
  pageSize = 10;

  totalPages = 0;
  totalElements = 0;

  pageSizeOptions = [5,10,20,50,100];
  searchMode: SearchMode = 'monthly';
  searchStartDate = this.today;
  searchEndDate = this.today;
  descriptionFilter = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  profileMessage = '';

  totalAll = 0;
  totalExpenses = 0;
  totalIncome = 0;

  newTx: NewTransaction = {
    description: '',
    ammount: 0,
    transactionDate: this.today,
    type: 'EXPENSE'
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  switchTab(tab: TabType) {
    this.activeTab.set(tab);
  }
  

  submitTransaction() {
    this.apiService.createTransaction(this.newTx).subscribe({
      next: () => {
        alert('Transaction created!');
        this.newTx = {
          description: '',
          ammount: 0,
          transactionDate: this.today,
          type: 'EXPENSE'
        };
      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        alert('Create failed – δες console');
      }
    });
  }
  deleteTransaction(id: number) {

    const confirmed = confirm('Delete this transaction?');

    if (!confirmed) {
      return;
    }

    this.apiService.deleteTransaction(id).subscribe({
      next: () => {
        this.transactions = this.transactions.filter(t => t.id !== id);

        this.cdr.detectChanges();

        alert('Transaction deleted');
      },

      error: (err) => {
        console.error('Delete error:', err);
        alert('Delete failed');
      }
    });
  }

  changePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      alert('Συμπλήρωσε όλα τα πεδία');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Οι κωδικοί δεν ταιριάζουν');
      return;
    }

    this.apiService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: () => {
        alert('Κωδικός αλλάχθηκε με επιτυχία. Θα γίνει αποσύνδεση.');
        this.logout();
        this.cdr.detectChanges();
        
      },
      error: (err) => {
        console.error('Change password error:', err);
        this.profileMessage = 'Σφάλμα στην αλλαγή κωδικού. Δοκίμασε ξανά.';
      }
    });
  }
  
  runSearch() {
    this.transactions = [];
    const description = this.descriptionFilter.trim() || undefined;

    if (this.searchMode === 'monthly') {
      this.apiService.getMonthlyTransactionsByUserId(description, this.currentPage, this.pageSize).subscribe({
        next: (data) => {
          this.transactions = data.content;
          this.totalPages = data.totalPages;
          this.totalElements = data.totalElements;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Monthly search error:', err);
          alert('Search failed – δες console');
        }
      });
      return;
    }

    if (!this.searchStartDate || !this.searchEndDate) {
      alert('Συμπλήρωσε Start & End Date');
      return;
    }

    const payload: SearchDto = {
      startDate: this.searchStartDate,
      endDate: this.searchEndDate,
      description
    };

    this.apiService.searchTransactionsCustom(payload).subscribe({
      next: (data) => {
        this.transactions = data.content;

        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Custom search error:', err);
        alert('Search failed – δες console');
      }
    });
  }

  loadTotals() {
    this.apiService.getTransactionSum().subscribe({
      next: (sum) =>{ this.totalAll = Number(sum ?? 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading total sum:', err)
    });

    this.apiService.getTransactionSumExpenses().subscribe({
      next: (sum) => {
        this.totalExpenses = Number(sum ?? 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading total expenses:', err)
    });

    this.apiService.getTransactionSumIncome().subscribe({
      next: (sum) => {
        this.totalIncome = Number(sum ?? 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading total income:', err)
    });
  }
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.runSearch();
    }
  }
  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.runSearch();
    }
  }
  onPageSizeChange(event: any) {
    this.pageSize = Number(event.target.value);
    this.currentPage = 0;
    this.runSearch();
  }
}
