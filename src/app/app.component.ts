import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';

import { LogicService } from "./services/logic.service";
import { PlotService } from './services/plot.service';
import { DataService } from "./services/data.service";
import { AuthenticationService } from './services/authentication.service';
import { GlobalService } from "./services/global.service";

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { isUndefined } from 'util';

@Component({
  selector: 'app-root',

  providers: [
    LogicService,
    PlotService,
    DataService,
    AuthenticationService,
    GlobalService
  ],

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  seasons: number[];

  ngOnInit(): void {
    this.generateSeasonArray();
    console.log(this.auth);
  }

  title = 'gutblatt.de';

  constructor(
    private logic: LogicService,
    public dataService: DataService,
    public dialog: MatDialog,
    private router: Router,
    public global: GlobalService,
    public auth: AuthenticationService) { }

  goUpState() {

    console.log(this.router.url);

    if (this.router.url.startsWith("/edit/spieltag")) {
      this.router.navigate(['/edit']);
    } else if (this.router.url.startsWith("/edit_game")) {
      this.router.navigate(['/edit/spieltag', this.global.spieltag]);
    } else if (this.router.url.startsWith("/edit")) {
      this.router.navigate(['/read']);
    } else if (this.router.url.startsWith("/add_game")) {
      this.router.navigate(['/edit/spieltag', this.global.spieltag]);
    } else if (this.router.url.startsWith("/galerie")) {
      this.router.navigate(['/read']);
    }

  }

  shouldShowBackButton() {
    if (this.router.url == "/read" || this.router.url == "/") {
      return false;
    }

    return true;
  }

  computedTitle() {
    return this.dataService.alternativeTitle == null || this.dataService.alternativeTitle.length == 0 ?
      this.title : this.dataService.alternativeTitle;
  }

  generateSeasonArray(): void {
    this.seasons = [];

    let i: number;
    for (i = this.dataService.currentSeason; i >= 10; i--) {
      this.seasons.push(i);
    }
  }

  generateItemString(i: number): string {
    return "Saison " + i;
  }

  loadSeason(i: number) {
    this.dataService.selectedSeason = i;
    this.logic.reset();
    this.dataService.setSeason();
  }

  addSeason() {
    let dialogRef = this.dialog.open(AppSeasonAdd, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isUndefined(result)) {
        this.dataService.addSeason(result);
      }
    });
  }

  removeSeason() {
    let dialogRef = this.dialog.open(AppSeasonRemove, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isUndefined(result)) {
        this.dataService.removeSeason(result);
      }
    });
  }

  selectedSeasonTitle() {
    if (this.dataService.selectedSeason > 0) return this.dataService.selectedSeason;
    if (this.dataService.selectedSeason == -1) return "I1";
    if (this.dataService.selectedSeason == -2) return "I2";
  }

}

@Component({
  selector: 'app-season-add',
  templateUrl: './dialogs/app-add-season.html',
})
export class AppSeasonAdd {

  constructor(
    public dialogRef: MatDialogRef<AppSeasonAdd>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-season-remove',
  templateUrl: './dialogs/app-remove-season.html',
})
export class AppSeasonRemove {

  constructor(
    public dialogRef: MatDialogRef<AppSeasonRemove>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}