import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SocketIoModule } from 'ngx-socket-io';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { NgMasonryGridModule } from 'ng-masonry-grid';

import { FlexLayoutModule } from '@angular/flex-layout';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { PhotoFeedService } from './photo-feed.service';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ExportService } from './export.service';

import { environment } from '../environments/environment';
import { PhotoDialogComponent } from './photo-dialog.component';

@NgModule({
  declarations: [AppComponent, PhotoDialogComponent],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot({ url: environment.apiUrl }),
    BrowserAnimationsModule,
    MatCardModule,
    MatToolbarModule,
    ScrollingModule,
    MatSliderModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    InfiniteScrollModule,
    MatSnackBarModule,
    MatSelectModule,
    MatButtonModule,
    HttpClientModule,
    NgMasonryGridModule,
    MatDialogModule,
    FlexLayoutModule,
    DeviceDetectorModule.forRoot(),
  ],
  providers: [PhotoFeedService, ExportService],
  bootstrap: [AppComponent, PhotoDialogComponent],
})
export class AppModule {}
