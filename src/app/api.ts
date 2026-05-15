import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
  description?: string;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
   private baseUrl = 'https://budget-production-e72e.up.railway.app/'; // άλλαξέ το αν χρειάζεται
   

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  // ➕ Δημιουργία συναλλαγής
  createTransaction(tx: NewTransaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions`, tx, this.getAuthHeaders());
  }

  // 📅 Φόρτωση ΜΗΝΙΑΙΩΝ συναλλαγών ανά user
  getMonthlyTransactionsByUserId(
    description?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Transaction>> {

    return this.http.post<PageResponse<Transaction>>(
      `${this.baseUrl}/transactions/monthly/user?page=${page}&size=${size}`,
      description ?? null,
      this.getAuthHeaders()
    );
  }

  // 🔍 Custom search με date range
  searchTransactionsCustom(
    search: SearchDto,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Transaction>> {

    return this.http.post<PageResponse<Transaction>>(
      `${this.baseUrl}/transactions/custom/user?page=${page}&size=${size}`,
      search,
      this.getAuthHeaders()
    );
  }

  deleteTransaction(id: number) {
    return this.http.delete(`${this.baseUrl}/transactions/by-id/${id}`, this.getAuthHeaders());
  }

  // ✅ Totals
  getTransactionSum(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/transactions/sum`, this.getAuthHeaders());
  }

  getTransactionSumExpenses(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/transactions/sum/expenses`, this.getAuthHeaders());
  }

  getTransactionSumIncome(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/transactions/sum/income`, this.getAuthHeaders());
  }
  changePassword(payload: ChangePasswordRequest): Observable<void> {
      return this.http.post<void>(`${this.baseUrl}/users/change-password`, payload, this.getAuthHeaders());
    }

}
