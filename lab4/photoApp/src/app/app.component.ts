import { Observable, Subscription, BehaviorSubject } from 'rxjs';

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  HostListener,
} from '@angular/core';
// import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';

import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

import { NgxMasonryOptions, NgxMasonryComponent } from 'ngx-masonry';

import { Socket } from 'ngx-socket-io';

import { PhotoFeedService } from './photo-feed.service';

import { ExportService } from './export.service';

import * as fileSaver from 'file-saver';

export type ErrorMsg = {
  queryUpdate: {
    query: string;
    add: boolean;
  };
  err: {
    errors: string[];
    code: number;
    message: string;
  };
};

export type Photo = any | undefined;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  _subs = new Subscription();
  photos: Photo[] = [];

  paginationAmount = 10;
  ratelimit = 0;

  queries: string[] = [];
  separatorKeyCodes: number[] = [ENTER, COMMA];
  queryFormControl = new FormControl();

  errorObs = this.socket.fromEvent<ErrorMsg>('errorMsg');

  masonryOptions: NgxMasonryOptions = {
    itemSelector: '.grid-item',
    gutter: 10,
    fitWidth: true,
  };

  exportFormat = 'json';

  @ViewChild(NgxMasonryComponent, { static: false })
  masonry: NgxMasonryComponent;

  constructor(
    private photoFeed: PhotoFeedService,
    private exportService: ExportService,
    private _snackBar: MatSnackBar,
    private socket: Socket
  ) {}

  addQuery({ input, value }: MatChipInputEvent): void {
    console.log(`adding query ${input} and ${value}`);
    if ((value || '').trim()) {
      this.queries.push(value.trim());
      this.photoFeed.query(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }

  removeQuery(query): void {
    console.log(`removing query ${query}`);
    const index = this.queries.indexOf(query);

    if (index >= 0) {
      this.queries.splice(index, 1);
      this.photoFeed.query(query, false);
    }
  }

  submitWindow(): void {
    console.log(`submitting window ${this.paginationAmount}`);
    this.photoFeed.window(this.paginationAmount);
  }

  getPagination(): number {
    return this.paginationAmount;
  }

  onScroll() {
    console.log('scrolldown');
    this.photoFeed.next(this.paginationAmount);
  }

  export() {
    this.exportService.export(this.exportFormat).subscribe(
      (blob) => {
        fileSaver.saveAs(blob, `wuj16-lab5.${this.exportFormat}`);
      },
      (error) => console.error(error)
    );
  }

  reset() {
    this.photoFeed.reset();

    this.photos.splice(0, this.photos.length);

    this.photoFeed.next(this.paginationAmount);
  }

  ngOnInit(): void {
    this._subs.add(
      this.photoFeed.feed.subscribe(
        ({ data, ratelimit }: { data: any[]; ratelimit: number }) => {
          this.ratelimit = ratelimit;
          this.photos.push(...data);
          console.log(`added ${data.length} new photos and ${ratelimit} limit`);
          setTimeout(() => {
            this.masonry._msnry.reloadItems();
            this.masonry._msnry.layout();
            console.log('layout reloaded');
          }, 1000);
        }
      )
    );
    this._subs.add(
      this.errorObs.subscribe(
        ({ queryUpdate: { query }, err: { errors } }: ErrorMsg) => {
          this._snackBar
            .open(
              `Failed to add query '${query}': ${errors.join(' ')}`,
              'close',
              {
                verticalPosition: 'top',
              }
            )
            .afterDismissed()
            .subscribe(() => {
              this.removeQuery(query);
            });
        }
      )
    );
    console.log('initialized');
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
    console.log('destroyed');
  }
}
