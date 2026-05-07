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
    <h1>{{ title() }}</h1>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        [class.active]="activeTab() === 'create'" 
        (click)="switchTab('create')">
        Create Transaction
      </button>

      <button 
        [class.active]="activeTab() === 'search'" 
        (click)="switchTab('search')">
        Search Transactions
      </button>

      <button 
        [class.active]="activeTab() === 'totals'" 
        (click)="switchTab('totals'); loadTotals()">
        Totals
      </button>
    </div>

    <!-- CREATE TAB -->
    <div class="tab-content" *ngIf="activeTab() === 'create'">
      <h2>Create Transaction</h2>

      <div class="create-form">
        <label>
          Description:
          <input [(ngModel)]="newTx.description" />
        </label>

        <label>
          Amount:
          <input type="number" [(ngModel)]="newTx.ammount" />
        </label>

        <label>
          Date:
          <input type="date" [(ngModel)]="newTx.transactionDate" />
        </label>

        <label>
          Type:
          <select [(ngModel)]="newTx.type">
            <option value="EXPENSE">EXPENSE</option>
            <option value="INCOME">INCOME</option>
          </select>
        </label>

        <button (click)="submitTransaction()">Create</button>
      </div>
    </div>

    <!-- SEARCH TAB -->
    <div class="tab-content" *ngIf="activeTab() === 'search'">
      <h2>Search Transactions</h2>

      <div class="search-form">

        <!-- Mode selector -->
        <div class="mode-selector">
          <label>
            <input 
              type="radio" 
              name="mode"
              value="monthly"
              [(ngModel)]="searchMode" />
            This Month
          </label>

          <label>
            <input 
              type="radio" 
              name="mode"
              value="custom"
              [(ngModel)]="searchMode" />
            Custom Range
          </label>
        </div>

        <!-- Custom dates (only if custom) -->
        <div *ngIf="searchMode === 'custom'" class="custom-dates">
          <label>
            Start Date:
            <input type="date" [(ngModel)]="searchStartDate" />
          </label>

          <label>
            End Date:
            <input type="date" [(ngModel)]="searchEndDate" />
          </label>
        </div>

        <button (click)="runSearch()">Search</button>
      </div>

      <ul>
        <li *ngFor="let t of transactions">
          <strong>{{ t.description }}</strong> -
          {{ t.type }} -
          Amount: {{ t.ammount }} -
          Date: {{ t.transactionDate  }}
        </li>
      </ul>
    </div>

    <!-- TOTALS TAB -->
    <div class="tab-content" *ngIf="activeTab() === 'totals'">
      <h2>Transaction Totals</h2>
      <ul>
        <li>Total: {{ totalAll | number:'1.2-2' }}</li>
        <li>Total Expenses: {{ totalExpenses | number:'1.2-2' }}</li>
        <li>Total Income: {{ totalIncome | number:'1.2-2' }}</li>
      </ul>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class App {
  title = signal(' ');
  activeTab = signal<TabType>('create');

  // Transactions & Search
  transactions: Transaction[] = [];

  searchMode: SearchMode = 'monthly';
  searchStartDate = '';
  searchEndDate = '';

  // Totals
  totalAll = 0;
  totalExpenses = 0;
  totalIncome = 0;

  // Create form
  newTx: NewTransaction = {
    description: '',
    ammount: 0,
    transactionDate: '',
    type: 'EXPENSE'
  };

  constructor(private apiService: ApiService,private cdr: ChangeDetectorRef) {}

  switchTab(tab: TabType) {
    this.activeTab.set(tab);
  }

  // ➕ Create Transaction
  submitTransaction() {
    this.apiService.createTransaction(this.newTx).subscribe({
      next: () => {
        alert('Transaction created!');
        this.newTx = {
          description: '',
          ammount: 0,
          transactionDate: '',
          type: 'EXPENSE'
        };
      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        alert('Create failed – δες console');
      }
    });
  }

  // 🔎 Unified Search
  runSearch() {
    this.transactions = []; // Clear previous results
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

    // Custom mode
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

  // 📊 Load Totals
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
