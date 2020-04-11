import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'photo-dialog',
  templateUrl: './photo-dialog.component.html',
})
export class PhotoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PhotoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
