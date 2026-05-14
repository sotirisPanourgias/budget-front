import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  username?: string;
  email?: string;
}

export interface Transaction {
  id?: number;
  description: string;
  ammount: number;
  transactionDate: string;
  type: string;
}

export interface NewTransaction {
  description: string;
  ammount: number;
  transactionDate: string;
  type: string;
}
export interface SearchDto {
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
   private baseUrl = 'https://budget-production-e72e.up.railway.app/transactions'; // άλλαξέ το αν χρειάζεται
  // private baseUrl = 'http://localhost:8080/transactions'

  constructor(private http: HttpClient) {}

  // ➕ Δημιουργία συναλλαγής
  createTransaction(tx: NewTransaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}`, tx);
  }

  // 📅 Φόρτωση ΜΗΝΙΑΙΩΝ συναλλαγών ανά user
  getMonthlyTransactionsByUserId(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      `${this.baseUrl}/monthly/user`
    );
  }
  // 🔍 Custom search με date range
  searchTransactionsCustom(search: SearchDto): Observable<Transaction[]> {
    return this.http.post<Transaction[]>(
      `${this.baseUrl}/custom/user`,
      search
    );
  }
  deleteTransaction(id: number) {
    return this.http.delete(`${this.baseUrl}/by-id/${id}`);
  }
  // ✅ Totals
  getTransactionSum(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/sum`);
  }

  getTransactionSumExpenses(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/sum/expenses`);
  }

  getTransactionSumIncome(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/sum/income`);
  }

}
