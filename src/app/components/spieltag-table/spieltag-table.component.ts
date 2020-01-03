import { Component, OnInit, Input, Injector } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router"

import { AuthenticationService } from "../../services/authentication.service";
import { GameView } from "../../services/interfaces.service";
import { GlobalService } from "../../services/global.service";
import { DataService } from "../../services/data.service";

@Component({
  selector: 'app-spieltag-table',
  templateUrl: './spieltag-table.component.html',
  styleUrls: ['./spieltag-table.component.css']
})

export class SpieltagTableComponent implements OnInit {

  @Input() dataSource: any;
  @Input() displayedColumns: string[];

  constructor(
    private auth: AuthenticationService,
    private router: Router,    
    private global: GlobalService,
    private dataService: DataService) { }

  ngOnInit() { }

  rowMargin(row: GameView): boolean {
    return row.mod == 1;
  }

  boldNames(element: GameView): boolean {
    return element.punkte == "";
  }

  selectRow(row) {
    if (this.auth.user() === null) return;    
    if ( Number(row.nr) < 1 ) return;
    this.openEdit(row.nr);        
  }

  openEdit(gamenr: number): void {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        season: this.dataService.selectedSeason,
        spieltag: this.global.spieltag,
        game: gamenr
      }
    };

    this.router.navigate(["/edit_game"], navigationExtras);

  }
}

