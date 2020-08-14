import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-game-remove',
  templateUrl: 'app-game-remove.html',
})
export class AppGameRemoveComponent {
  constructor(public dialogRef: MatDialogRef<AppGameRemoveComponent>) { }
}
