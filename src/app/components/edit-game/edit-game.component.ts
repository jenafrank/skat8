import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { GlobalService } from '../../services/global.service';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';
import { isUndefined } from 'util';
import { GameDataRaw, GameData } from '../../services/interfaces.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppGameRemoveComponent } from '../edit-spieltag/app-game-remove';


@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.component.html',
  styleUrls: ['./edit-game.component.css']
})
export class EditGameComponent implements OnInit, OnDestroy {

  points: number[];
  selectedPoints: number;
  editMode: number;

  menuhelper: number;

  game: number;
  gameData: GameDataRaw;

  availablePlayers: string[];

  playersInView: string[];
  players: string[];
  activeThree: string[];
  declarer: string;
  runde: number;

  subscription: Subscription;
  kontra: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthenticationService,
    private glob: GlobalService,
    private dataService: DataService,
    public dialog: MatDialog) {

  }

  ngOnInit() {
    this.points = [18, 20, 22, 24, 48, 72, 96, 120];
    this.menuhelper = -1;

    // Set global and local vars
    this.dataService.selectedSeason = this.route.snapshot.queryParams.season;
    this.glob.spieltag = this.route.snapshot.queryParams.spieltag;
    this.game = this.route.snapshot.queryParams.game;

    this.dataService.alternativeTitle = 'Spieltag ' + this.glob.spieltag + ' Nr. ' + this.game;

    this.availablePlayers = this.glob.availablePlayers;
    this.selectedPoints = null;
    this.players = [];
    this.playersInView = this.glob.emptyRoundPlayers();
    this.activeThree = [];

    this.subscription = this.dataService.data.subscribe( (seasonData: any) => {

      if (seasonData == null) { return; }
      const spieltagData: any = seasonData[this.dataService.day(this.glob.spieltag)];

      this.gameData = spieltagData[this.dataService.game(this.game)];

      console.log(this.gameData);

      this.kontra = this.gameData.kontra;

      this.runde = this.gameData.runde || 1;

      this.players = this.gameData.allPlayers.split(' ');

      for (let i = 0; i < this.players.length; i++) {
        this.playersInView[i] = this.players[i];
      }

      this.activeThree = this.gameData.activeThree.split(' ');
      this.declarer = this.gameData.declarer;

      this.selectedPoints = this.gameData.points;

    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onOkClick(): void {

    const now = new Date();

    const gamedata: GameData = {
      activeThree: this.activeThree,
      allPlayers: this.players,
      declarer: this.declarer,
      points: this.selectedPoints,
      spieltag: this.glob.spieltag,
      mod: +this.gameData.mod,
      kontra: this.kontra,
      nrPlayers: this.players.length,
      time: this.gameData.time,
      runde: this.runde
    };

    if (this.editMode === 2) {
      this.dataService.addGameWithNr(gamedata, this.glob.spieltag, this.game);
    } else {
      this.dataService.editGame(gamedata, this.game);
    }

    this.router.navigate(['/edit/spieltag', this.glob.spieltag]);
  }

  remove(): void {

    const dialogRef = this.dialog.open(AppGameRemoveComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        this.dataService.removeGameWithNr(this.glob.spieltag, this.game);
        this.router.navigate(['/edit/spieltag', this.glob.spieltag]);
      }
    });

  }

  toggle(ply): void {
    const isActive: boolean = this.activeThree.indexOf(ply) !== -1;
    if (isActive) {
      this.activeThree.splice(this.activeThree.indexOf(ply), 1);
    } else {
      this.activeThree.push(ply);
    }
  }

  togglePly(ply): void {
    this.declarer = (this.declarer !== ply) ? ply : 'E';
    if (this.declarer === 'E') { this.selectedPoints = 0; }
  }

  selectPlayer(el: string) {
    this.playersInView[this.menuhelper] = el;
    this.players = this.glob.getFilteredRoundPlayers(this.playersInView);
  }

  meaningfulPlayers(): string[] {
    const ret: string[] = [];

    for (const ply of this.availablePlayers) {
      if (this.players.indexOf(ply) === -1) {
        ret.push(ply);
      }
    }

    return ret;
  }

  validate() {
    return this.activeThree.length === 3 &&
    this.declarer != null &&
    this.declarer.length > 0 &&
    this.selectedPoints != null;
  }

  kontraPlys(): string[] {
    const ret: string[] = [];

    // Barrier:
    if (isUndefined(this.activeThree) || this.activeThree == null ) { return []; }

    for (const ply of this.activeThree) {
      if (ply !== this.declarer) {
        ret.push(ply);
      }
    }

    return ret;
  }

}
