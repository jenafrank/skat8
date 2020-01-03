import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogRef } from "@angular/material";

import { DataService } from "../../services/data.service";
import { LogicService } from "../../services/logic.service";
import { GlobalService } from "../../services/global.service";
import { GameDataRaw, GameView } from "../../services/interfaces.service";
import { AuthenticationService } from "../../services/authentication.service";

import { NavigationExtras } from '@angular/router';
import { isUndefined } from 'util';

@Component({
  selector: 'app-edit-spieltag',
  templateUrl: './edit-spieltag.component.html',
  styleUrls: ['./edit-spieltag.component.css']
})

export class EditSpieltagComponent implements OnInit {

  dataSource: any;
  dataSource2: any;
  dataSource3: any;

  displayedColumns: string[];
  displayedColumns2: string[];
  displayedColumns3: string[];
  
  spieltagData: any;      
  selected: string;
  ascendingSort: boolean;
  spieltagAcc: [string,number][];

  subscription: Subscription;

  constructor(
    public global: GlobalService,
    private route:ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private logic: LogicService,
    public dialog: MatDialog,
    public auth: AuthenticationService) { }

  ngOnInit() {    
    this.ascendingSort = true;
    this.selected = "ADD";           
    this.global.spieltag = +this.route.snapshot.paramMap.get('id');
    this.dataService.alternativeTitle = "Spieltag " + this.global.spieltag;
    this.subscription = this.dataService.data.subscribe( (seasonData) => {
      if (seasonData == null) return;
      this.spieltagData = seasonData[this.dataService.day(this.global.spieltag)];
      this.updateView();    
    })    
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.dataService.alternativeTitle = null;
  }

  updateView() {
    this.buildHeader();
    this.buildGameArray(0);
    this.buildGameArray(1);
    this.buildGameArray(2);
    this.buildGameArray(3);
  }

  buildHeader(): void {
    let maxround:number = this.logic.maxRoundFromDayData(this.spieltagData);
    this.displayedColumns = ["nrInRound","ply1","ply2","ply3","ply4","ply5","points","declarer"];
    
    if (maxround < 5 ) {
      this.displayedColumns.splice(this.displayedColumns.indexOf("ply5"),1);
    }
    if (maxround < 4 ) {
      this.displayedColumns.splice(this.displayedColumns.indexOf("ply4"),1);
    }
  }

  buildGameArray(runde:number):void {
    let total:number = this.dataService.totalgame(this.spieltagData);

    let games: GameView[] = [];    

    let game: GameDataRaw;
    let view: GameView;
    let pnts: Map<string, number> = new Map();
    let currentPlayers: string = "";
    let currentMod: number = 0;

    let i:number = 0; // total game nr
    let j:number = 0; // round game nr
    let splittedPlayers: string[];
    let noheaderCnt: number = 0;

    while (i < total) {
            
      game = this.spieltagData[this.dataService.game(i+1)];

      if ( ! ( 
        runde == game.runde || 
        runde == 1 && isUndefined(game.runde) ||
        runde == 0
      ) ) {
        if (game.declarer != 'E') {
          pnts.set(game.declarer, (pnts.get(game.declarer) || 0) + +game.points);
        }
        i++;
        continue;
      }

      view = this.getEmptyView();      

      let allPlayersSignature:string = game.allPlayers;      
      if (currentPlayers != allPlayersSignature) {
        
        // Header mode
        
        currentMod = 0;
        noheaderCnt = 0;
        currentPlayers = allPlayersSignature;

        splittedPlayers = game.allPlayers.split(" ");
        view.ply1 = splittedPlayers[0];
        view.ply2 = splittedPlayers[1];
        view.ply3 = splittedPlayers[2];
        view.ply4 = splittedPlayers.length > 3 ? splittedPlayers[3] : " ";
        view.ply5 = splittedPlayers.length > 4 ? splittedPlayers[4] : " ";

        for (let ply of splittedPlayers) {
          if (isUndefined(pnts.get(ply))) {
            pnts.set(ply,0);
          }
        }

      } else {

        noheaderCnt++;        

        // normal mode
        view.punkte = game.points.toString();
        view.nr = (i + 1).toString();
        view.nrInRound = (j + 1).toString();
        view.spieler = game.declarer;
        view.mod = (currentMod % splittedPlayers.length) + 1;

        if (game.declarer != 'E') {
          pnts.set(game.declarer, pnts.get(game.declarer) + +game.points);
        }

        let splittedActive = game.activeThree.split(" ");
        
        for (let ply of splittedActive) {          
          if (splittedPlayers[0] == ply) view.ply1 = "⏤";
          if (splittedPlayers[1] == ply) view.ply2 = "⏤";
          if (splittedPlayers[2] == ply) view.ply3 = "⏤";
          if (splittedPlayers[3] == ply) view.ply4 = "⏤";
          if (splittedPlayers[4] == ply) view.ply5 = "⏤";
        }

        if (splittedPlayers[0] == game.declarer) view.ply1 = pnts.get(game.declarer).toString();
        if (splittedPlayers[1] == game.declarer) view.ply2 = pnts.get(game.declarer).toString();
        if (splittedPlayers[2] == game.declarer) view.ply3 = pnts.get(game.declarer).toString();
        if (splittedPlayers[3] == game.declarer) view.ply4 = pnts.get(game.declarer).toString();
        if (splittedPlayers[4] == game.declarer) view.ply5 = pnts.get(game.declarer).toString();

        if (splittedPlayers.length < 5) view.ply5 = " ";
        if (splittedPlayers.length < 4) view.ply4 = " ";

        i++; 
        j++;
        currentMod++;
      }      

      games.push(view);
    }
    
    if (!this.ascendingSort) {
      games = games.reverse();
    }

    this.spieltagAcc = Array.from(this.logic.sortMap(pnts));
    if (runde == 1) this.dataSource = new MatTableDataSource(games);
    if (runde == 2) this.dataSource2 = new MatTableDataSource(games);        
    if (runde == 3) this.dataSource3 = new MatTableDataSource(games);        
  }

  toggleSort():void {
    this.ascendingSort = !this.ascendingSort;
    this.updateView();
  }

  getEmptyView():GameView {
    let ret: GameView = {} as GameView;

    ret.nr="";
    ret.spieler="";
    ret.punkte="";
    ret.ply1="✶";
    ret.ply2="✶";
    ret.ply3="✶";
    ret.ply4="✶";
    ret.ply5="✶";
    ret.mod=0;

    return ret;
  }

  addGame(): void {

    if (this.global.selectedIndexTabGroup == 0) return;

    let navigationExtras: NavigationExtras = {
      queryParams: { 
        spieltag: this.global.spieltag,
        season: this.dataService.selectedSeason,
        runde: this.global.selectedIndexTabGroup        
      }
    };

    this.router.navigate(["/add_game"],navigationExtras);
  }

  removeLastGame():void {

    if (this.global.selectedIndexTabGroup == 0) return;
    
    let dialogRef = this.dialog.open(AppGameRemove, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( result ) { 
        let data:any[] = this.getCurrentDataSource().filteredData;

        console.log(data);

        if ( isUndefined(data) || data.length == 0 ) return;

        let nr:number = data[data.length-1].nr;

        console.log(nr);

        this.dataService.removeGameWithNr(this.global.spieltag,nr);
      }
    });    
    
  }  

  getCurrentDataSource():any {
    if (this.global.selectedIndexTabGroup == 1) return this.dataSource;
    if (this.global.selectedIndexTabGroup == 2) return this.dataSource2;
    if (this.global.selectedIndexTabGroup == 3) return this.dataSource3;
  }

}

@Component({
  selector: 'app-game-remove',
  templateUrl: 'app-game-remove.html',
})
export class AppGameRemove {

  constructor(
    public dialogRef: MatDialogRef<AppGameRemove>) { }

}