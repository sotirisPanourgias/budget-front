import { Component, signal } from '@angular/core';
import { CommonModule, NgFor, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ApiService, Transaction, NewTransaction, SearchDto } from './api';

type TabType = 'create' | 'search' | 'totals';
type SearchMode = 'monthly' | 'custom';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgFor, DatePipe, FormsModule],
  template: `
    <div class="app-shell">
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
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="monthly"
                  [(ngModel)]="searchMode" />
                <span class="icon-only">⏱</span>
                <span class="sr-only">This Month</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="mode"
                  value="custom"
                  [(ngModel)]="searchMode" />
                <span class="icon-only">📅</span>
                <span class="sr-only">Custom Range</span>
              </label>
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

            <button class="primary" (click)="runSearch()">🔎</button>
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
                  <button class="delete-btn" (click)="deleteTransaction(t.id!)">Delete</button>
                </div>
              </li>
            </ul>
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
  title = signal('Budget Tracker');
  activeTab = signal<TabType>('create');
  today = new Date().toISOString().slice(0, 10);

  transactions: Transaction[] = [];

  searchMode: SearchMode = 'monthly';
  searchStartDate = this.today;
  searchEndDate = this.today;

  totalAll = 0;
  totalExpenses = 0;
  totalIncome = 0;

  newTx: NewTransaction = {
    description: '',
    ammount: 0,
    transactionDate: this.today,
    type: 'EXPENSE'
  };

  constructor(private apiService: ApiService,private cdr: ChangeDetectorRef) {}

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
  runSearch() {
    this.transactions = [];
    if (this.searchMode === 'monthly') {
      this.apiService.getMonthlyTransactionsByUserId().subscribe({
        next: (data) => {this.transactions = data; this.cdr.detectChanges();},
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
      endDate: this.searchEndDate
    };

    this.apiService.searchTransactionsCustom(payload).subscribe({
      next: (data) => {this.transactions = data; this.cdr.detectChanges();},
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
}
