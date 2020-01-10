import { Injectable } from '@angular/core';
import { isUndefined } from 'util';
import { DataService } from "./data.service";
import { GameData, GameDataRaw, LabelsSpecial } from "./interfaces.service";

@Injectable()
export class LogicService {

  // Accumulation of all players that occur in the current data state
  registeredPlayers: string[];

  // acc
  punkte: Map<string, number>;
  teilgenommen: Map<string, number>;
  gewonnen: Map<string, number>;
  gespielt: Map<string, number>;
  
  gewonnenGegenspiel: Map<string, number>;
  gespieltGegenspiel: Map<string, number>;

  // derived acc
  ratioGegen: Map<string, number>;
  ratioAllein: Map<string, number>;
  ratioGespielt: Map<string, number>;
  ronaldFaktor: Map<string, number>;
  ronaldGedeckelt: Map<string, number>;
  ronaldPunkte: Map<string, number>;
  verGegen: Map<string, number>;
  ver: Map<string, number>;
  turnierPunkte: Map<string, number>;
  turnierRonaldPunkte: Map<string, number>;
  turnierPPT: Map<string, number>;
  ratioPPT: Map<string, number>;

  // Labels
  labels: Map<string, string>;
  labelsSpecial: LabelsSpecial[];

  // Colors
  colors: Map<string, string>;
  borders: Map<string, string>;

  // series
  spieltagSeries: Map<number, number>;
  punkteSeries: Map<string, Map<number, number>>;

  // counters
  currentDay: number;
  currentTotalGame: number;

  constructor(public ds: DataService) {
    this.initLabels();
    this.initColors();
    this.initBorders();
    this.initLabelsSpecial();
    this.reset();
  }

  initColors(): void {
    this.colors = new Map([
      ["A", "rgba(255,0,0,0.2)"],
      ["F", "rgba(0,255,0,0.2)"],
      ["R", "rgba(0,0,255,0.2)"],
      ["Ro", "rgba(255,0,255,0.2)"],
      ["Od", "rgba(255,128,128,0.2)"],
      ["T", "rgba(0,255,255,0.2)"],
      ["S", "rgba(128,0,0,0.2)"],
      ["M", "rgba(0,128,0,0.2)"],
      ["C", "rgba(0,0,128,0.2)"],
      ["J", "rgba(128,128,0,0.2)"],
      ["Ra", "rgba(128,0,128,0.2)"],
      ["P", "rgba(0,128,128,0.2)"]
    ]);
  }

  initBorders(): void {
    this.borders = new Map([
      ["A", "rgba(255,0,0,1)"],
      ["F", "rgba(0,255,0,1)"],
      ["R", "rgba(0,0,255,1)"],
      ["Ro", "rgba(255,0,255,1)"],
      ["Od", "rgba(255,128,128,1)"],
      ["T", "rgba(0,255,255,1)"],
      ["S", "rgba(128,0,0,1)"],
      ["M", "rgba(0,128,0,1)"],
      ["C", "rgba(0,0,128,1)"],
      ["J", "rgba(128,128,0,1)"],
      ["Ra", "rgba(128,0,128,1)"],
      ["P", "rgba(0,128,128,1)"]
    ]);
  }

  initLabels(): void {
    this.labels = new Map(
      [
        ["Punkte", "ronaldPunkte"],
        ["Punkte-Pro-Teilgenommen", "ratioPPT"],        
        ["Ronald-Faktor", "ronaldFaktor"],
        ["% Gewonnene Alleinspiele", "ratioAllein"],
        ["% Anteil Alleinspiele an Teilgenommenen", "ratioGespielt"],        
        ["Turnier-Punkte", "turnierRonaldPunkte"],
        ["Punkte-Pro-Teilgenommen Turnier", "turnierPPT"],
        ["Echte Punkte", "punkte"],
        ["Echte Turnier-Punkte", "turnierPunkte"],
        ["Teilgenommene Spiele", "teilgenommen"],
        ["Spiele", "gespielt"],
        ["Gewonnene Spiele", "gewonnen"],
        ["Verlorene Spiele", "ver"],        
        ["% Gewonnene Gegenspiele", "ratioGegen"],        
        ["Spiele als Gegenspieler", "gespieltGegenspiel"],
        ["Gewonnene Spiele als Gegenspieler", "gewonnenGegenspiel"],
        ["Verlorene Spiele als Gegenspieler", "verGegen"],
        ["Ronald-Faktor mit Deckelung", "ronaldGedeckelt"]
      ]
    );
  }

  initLabelsSpecial(): void {
    this.labelsSpecial = [
      "Punkte (Verlauf)",
      "Performanz"
    ];
  }

  reset(): void {
    this.registeredPlayers = ["E"];
    this.punkte = new Map();
    this.teilgenommen = new Map();
    this.gewonnen = new Map();
    this.gespielt = new Map([["E", 0]]);
    this.gewonnenGegenspiel = new Map();
    this.gespieltGegenspiel = new Map();

    this.punkteSeries = new Map();
    this.spieltagSeries = new Map();
    this.currentDay = 0;
    this.currentTotalGame = 0;

    this.ratioGegen = new Map();
    this.ratioAllein = new Map();
    this.ratioGespielt = new Map();
    this.ronaldFaktor = new Map();
    this.ronaldGedeckelt = new Map();
    this.ronaldPunkte = new Map();
    this.verGegen = new Map();
    this.ver = new Map();
    this.turnierPunkte = new Map();
    this.turnierRonaldPunkte = new Map();
    this.turnierPPT = new Map();
    this.ratioPPT = new Map();
  }

  accumulateSeason(data: any) {

    // Old Season Barrier
    if (this.ds.selectedSeason < 10) {
      this.accumulateSeasonOld(data);
      return;
    }

    let i: number = 1;
    while (!isUndefined(data[this.ds.day(i)])) {
      this.currentDay = i;
      this.accumulateDay(data[this.ds.day(i)]);
      i++;
    }
  }

  accumulateSeasonOld(data: any) {

    let i: number = 1;
    while (!isUndefined(data[this.ds.dayOld(i)])) {
      this.currentDay = i;
      this.accumulateDayOld(data[this.ds.dayOld(i)]);
      i++;
    }

    this.calculateDerivedQuantitiesOld();

  }

  accumulateDayOld(data:any) {

    this.addNewPlayers(Object.getOwnPropertyNames(data.val));
    this.addNewPlayers(Object.getOwnPropertyNames(data.teil));
    this.addNewPlayers(Object.getOwnPropertyNames(data.ges));
    this.addNewPlayers(Object.getOwnPropertyNames(data.gew));

    for (let ply of Object.keys(data.val)) {
      this.add(this.punkte, ply, this.convertStringToNumberOld(data.val[ply]));
    }

    for (let ply of Object.keys(data.teil)) {      
      this.add(this.teilgenommen, ply, this.convertStringToNumberOld(data.teil[ply]));
    }

    for (let ply of Object.keys(data.ges)) {
      this.add(this.gespielt, ply, this.convertStringToNumberOld(data.ges[ply]));
    }

    for (let ply of Object.keys(data.gew)) {
      this.add(this.gewonnen, ply, this.convertStringToNumberOld(data.gew[ply]));
    }

  }

  convertStringToNumberOld(str: string): number {
    return +(str.replace(",","."));
  }


  accumulateDay(data: any) {

    let i: number = 1;
    while (!isUndefined(data[this.ds.game(i)])) {
      let gamedata: GameData = this.transformResponseToGameData(data[this.ds.game(i)]);
      this.accumulate(gamedata);
      i++;    
    }

  }

  accumulate(data: GameData): void {

    this.addNewPlayers(data.activeThree);
    this.currentTotalGame++;

    for (let ply of data.activeThree) {
      this.inc(this.teilgenommen, ply);
    }
    this.inc(this.gespielt, data.declarer);

    // Eingemischt-Barriere:
    if (data.declarer != 'E') {

      // Reguläres Spiel:
      this.add(this.punkte, data.declarer, data.points);
      this.incWithCondition(this.gewonnen, data.declarer, data.points > 0);

      // Nur für Gegenspiel-Statistik:
      for (let ply of data.activeThree) {
        if (ply != data.declarer) {
          this.inc(this.gespieltGegenspiel, ply);
          this.incWithCondition(this.gewonnenGegenspiel, ply, data.points < 0);
        }
      }

    }

    // Add data to series quantities
    this.calculateDerivedQuantities();
    
    // If skat data is wrongly formatted, permit continuation anyways...
    for (let ply of this.registeredPlayers) {      
      if (ply != 'E') {
        let qty:number = this.ronaldPunkte.get(ply);
        this.punkteSeries.get(ply).set(this.currentTotalGame,qty);
      }
    }  

    if (this.currentDay > 0) {
      this.spieltagSeries.set(this.currentDay, this.currentTotalGame);
    }

    // Fehlerüberprüfung aus "all Five", "mod" und "activeThree" möglich
    // ...
  }

  calculateDerivedQuantitiesOld() {

     // Calculate reference number of games for ronald faktor
     let maxgames = 0.;
     for (let i in this.registeredPlayers) {
       let ply: string = this.registeredPlayers[i];
       if (ply == 'E') continue;
 
       let Nply = this.teilgenommen.get(ply);
       if (Nply > maxgames) maxgames = Nply;
     }
 
     // define cap
     let deckel = 3.;
 
     // Derive quantities:
     for (let i in this.registeredPlayers) {
 
       let ply: string = this.registeredPlayers[i];
 
       if (ply == 'E') continue;
 
       this.ratioAllein
         .set(ply, this.gewonnen.get(ply) / this.gespielt.get(ply) * 100.);
 
       this.ratioGespielt
         .set(ply, this.gespielt.get(ply) / this.teilgenommen.get(ply) * 100.);
 
       this.ronaldFaktor
         .set(ply, maxgames / this.teilgenommen.get(ply));
 
       this.ronaldGedeckelt
         .set(ply, this.ronaldFaktor.get(ply) > deckel ? deckel : this.ronaldFaktor.get(ply));
 
       this.ronaldPunkte
         .set(ply, this.ronaldGedeckelt.get(ply) * this.punkte.get(ply));
 
       this.ver
         .set(ply, this.gespielt.get(ply) - this.gewonnen.get(ply));
 
       this.ratioPPT
         .set(ply, this.punkte.get(ply) / this.teilgenommen.get(ply));
 
     }

  }

  calculateDerivedQuantities() {

    // Calculate reference number of games for ronald faktor
    let maxgames = 0.;
    for (let i in this.registeredPlayers) {
      let ply: string = this.registeredPlayers[i];
      if (ply == 'E') continue;

      let Nply = this.teilgenommen.get(ply);
      if (Nply > maxgames) maxgames = Nply;
    }

    // define cap
    let deckel = 3.;

    // Derive quantities:
    for (let i in this.registeredPlayers) {

      let ply: string = this.registeredPlayers[i];

      if (ply == 'E') continue;

      this.ratioGegen
        .set(ply, this.gewonnenGegenspiel.get(ply) / this.gespieltGegenspiel.get(ply) * 100.);

      this.ratioAllein
        .set(ply, this.gewonnen.get(ply) / this.gespielt.get(ply) * 100.);

      this.ratioGespielt
        .set(ply, this.gespielt.get(ply) / this.teilgenommen.get(ply) * 100.);

      this.ronaldFaktor
        .set(ply, maxgames / this.teilgenommen.get(ply));

      this.ronaldGedeckelt
        .set(ply, this.ronaldFaktor.get(ply) > deckel ? deckel : this.ronaldFaktor.get(ply));

      this.ronaldPunkte
        .set(ply, this.ronaldGedeckelt.get(ply) * this.punkte.get(ply));

      this.verGegen
        .set(ply, this.gespieltGegenspiel.get(ply) - this.gewonnenGegenspiel.get(ply));

      this.ver
        .set(ply, this.gespielt.get(ply) - this.gewonnen.get(ply));

      this.turnierPunkte
        .set(ply, this.punkte.get(ply) + 50 * (this.gewonnen.get(ply) - this.ver.get(ply)) + 40 * this.gewonnenGegenspiel.get(ply));

      this.turnierRonaldPunkte
        .set(ply, this.turnierPunkte.get(ply) * this.ronaldGedeckelt.get(ply));

      this.turnierPPT
        .set(ply, this.turnierPunkte.get(ply) / this.teilgenommen.get(ply));

      this.ratioPPT
        .set(ply, this.punkte.get(ply) / this.teilgenommen.get(ply));

    }
  }

  maxRoundFromDayData(data: any): number {
    let N: number = this.ds.totalgame(data);
    let max: number = 0;
    for (let i = 1; i <= N; i++) {
      let cnt: number = data[this.ds.game(i)].allPlayers.split(" ").length;
      if (cnt > max) max = cnt;
    }
    return max;
  }

  private add(map: Map<string, number>, key: string, x: number) {
    map.set(key, map.get(key) + x);
  }

  private inc(map: Map<string, number>, key: string) {
    map.set(key, map.get(key) + 1);
  }

  private incWithCondition(map: Map<string, number>, key: string, condition: boolean) {
    if (condition) {
      this.inc(map, key);
    }
  }

  private addNewPlayers(players: string[]) {

    for (let ply of players) {
      if (!this.registeredPlayers.includes(ply)) {
        this.registeredPlayers.push(ply);

        this.punkte.set(ply, 0);
        this.teilgenommen.set(ply, 0);
        this.gewonnen.set(ply, 0);
        this.gespielt.set(ply, 0);
        this.gewonnenGegenspiel.set(ply, 0);
        this.gespieltGegenspiel.set(ply, 0);
        this.punkteSeries.set(ply, new Map());
      }
    }

  }

  transformResponseToGameData(response: any): GameData {

    let data: GameData = {} as GameData;

    let activeThree: string = response.activeThree as string;
    let allPlayers: string = response.allPlayers as string;

    data.activeThree = activeThree.split(" ");
    data.allPlayers = allPlayers.split(" ");
    data.declarer = response.declarer as string;
    data.kontra = response.kontra as string;
    data.mod = Number(response.mod);
    data.nrPlayers = Number(response.nrPlayers);
    data.points = Number(response.points);

    return data;
  }

  sortMap(map: Map<string, number>): Map<string, number> {
    let invMap: Map<number, string[]>;
    invMap = new Map();

    let pnts: number[];
    pnts = [];

    for (let ky of Array.from(map.keys())) {
      let arr: string[] = invMap.get(map.get(ky));
      if (isUndefined(arr)) {
        invMap.set(map.get(ky), [ky]);
      } else {
        arr.push(ky);
      }
      pnts.push(map.get(ky));
    }

    // sort points
    pnts = pnts.sort((n1, n2) => n2 - n1);

    // return according names
    let newmap: Map<string, number>;
    newmap = new Map();

    for (let x of pnts) {
      let arr: string[] = invMap.get(x);
      for (let str of arr) {
        newmap.set(str, x);
      }
    }

    return newmap;
  }

}