import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor(private http: HttpClient) {}

  export(format: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/export`, {
      params: new HttpParams().set('format', format),
      responseType: 'blob',
    });
  }
}
