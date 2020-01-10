import { Component } from '@angular/core';
import { MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-game-remove',
  templateUrl: 'app-game-remove.html',
})
export class AppGameRemove {
  constructor(public dialogRef: MatDialogRef<AppGameRemove>) { }
}
