import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Subscription } from "rxjs";
import { BehaviorSubject } from "rxjs";

import { AngularFireDatabase } from "@angular/fire/database";
import { AuthenticationService } from "./authentication.service";

import { isUndefined } from 'util';

@Injectable()
export class DataService {

  // Which data set is currently loaded? What is the maximumum season?
  currentSeason:number;
  selectedSeason:number;
  alternativeTitle:string;
  seasonDateSpan: string;

  // Fetched data object from Google Firebase
  dataObservable:Observable<any>;
  data:BehaviorSubject<any>;
  currentData:any;
  subscription: Subscription;

  constructor(private db: AngularFireDatabase, private auth:AuthenticationService) {
    this.data = new BehaviorSubject(null);
    this.alternativeTitle = "";
    this.currentSeason = 32; 
    this.selectedSeason = 32;
    this.setSeason();
  }

  setSeason() {
    if ( ! isUndefined(this.subscription) ) this.subscription.unsubscribe();
    this.dataObservable = this.db.object(this.season(this.selectedSeason)).valueChanges(); 
    this.subscription = this.dataObservable.subscribe( (data) => { 
      if ( data == null ) {
        console.log("Season not available...");
        return;
      }
      // Propagate to subscribers:
      this.data.next(data);

      // Own service instance should hold a real value
      this.currentData = data;

      // calculate season date span
      this.calculateSeasonDateSpan();
    });    
  }

  season(i:number):string {

    if (i == -1) return "season_4_5";
    if (i == -2) return "season_5_5";

    return "season_"+i;
  }

  addSeason(i:number) {
    let seasonkey:string = this.season(i);
    let query:Observable<any> = this.db.object(seasonkey).valueChanges();
    query.subscribe( (res) => {
      if ( res == null) {
        console.log("Adding season...");
        const ref = this.db.object(seasonkey);
        ref.set(this.createdObject());
      } else {
        console.log("Not adding season... Exists already...");
      }
    });    
  }

  createdObject():Object {    
    let obj : Object = {
      created: {
        username: this.auth.username(), 
        time: (new Date()).toLocaleString()
      }
    };
    return obj;
  }

  removeSeason(i:number) {
    let seasonkey:string = this.season(i);
    let query:Observable<any> = this.db.object(seasonkey).valueChanges();
    query.subscribe( (res) => {
      if ( res == null) {
        console.log("Season not removed... Does not exist.");        
      } else if ( this.totalday(res) != 0 ) {
        console.log("Season not removed... Not empty...");
        console.log(res);
      } else {
        console.log("Would remove now...");
        const ref = this.db.object(seasonkey);
        ref.remove();
      }
    });
  }

  addSpieltag() {
    let i:number = this.totalday(this.currentData);
    i++;

    let seasonStr:string = this.season(this.selectedSeason);
    let spieltagStr:string = this.day(i);
    
    console.log("Adding Spieltag...");

    const ref = this.db.object(seasonStr+"/"+spieltagStr);
    ref.set(this.createdObject());

  }

  removeSpieltag() {
    let i:number = this.totalday(this.currentData);

    if (i == 0) {
      console.log("Spieltag can not be removed... No Spieltag exists...");
      return;
    }

    let seasonStr:string = this.season(this.selectedSeason);
    let spieltagStr:string = this.day(i);

    if ( this.totalgame(this.currentData[spieltagStr]) != 0) {
      console.log("Spieltag can not be removed... Not empty...");
      return;
    }

    console.log("Removing...");
    const ref = this.db.object(seasonStr+"/"+spieltagStr);
    ref.remove();
  }

  addGame(data:any) {
    let now:Date = new Date();

    data["time"] = now.toLocaleString(); 
    data.activeThree = data.activeThree.join(" ");
    data.allPlayers = data.allPlayers.join(" ");
    
    let seasonStr:string = this.season(this.selectedSeason);
    let spieltagStr:string = this.day(data.spieltag);
    let gameStr:string = this.game(this.totalgame(this.currentData[spieltagStr])+1);

    let objStr: string = seasonStr+"/"+spieltagStr+"/"+gameStr;

    console.log(objStr);
    console.log(data);

    const ref = this.db.object(objStr);
    ref.set(data);
  }

  editGame(data:any, game:number) {
    let now:Date = new Date();

    data.activeThree = data.activeThree.join(" ");
    data.allPlayers = data.allPlayers.join(" ");

    let seasonStr:string = this.season(this.selectedSeason);
    let spieltagStr:string = this.day(data.spieltag);
    let gameStr:string = this.game(game);

    let objStr: string = seasonStr+"/"+spieltagStr+"/"+gameStr;

    console.log(objStr);
    console.log(data);

    const ref = this.db.object(objStr);
    ref.set(data);
  }

  removeGame(spieltag: number) {

    let seasonStr:string = this.season(this.selectedSeason);
    let spieltagStr:string = this.day(spieltag);
    let gameStr:string = this.game(this.totalgame(this.currentData[spieltagStr]));
    
    let objStr: string = seasonStr+"/"+spieltagStr+"/"+gameStr;

    const ref = this.db.object(objStr);
    ref.remove();
    
  }

  removeGameWithNr(spieltag: number, nr: number) {

    let spieltagData: any = this.currentData[this.day(spieltag)];
    let totalnr: number = this.totalgame(spieltagData);

    console.log("Here");

    if (nr == totalnr) {
      this.removeGame(spieltag);
    }

    console.log("... and beyond");

    let seasonStr: string = this.season(this.selectedSeason);
    let spieltagStr: string = this.day(spieltag);
    let gameStr: string = this.game(nr);

    let objStr: string = seasonStr + "/" + spieltagStr;

    let nc: Object = { ...spieltagData };

    let i:number = 1;
    let j:number = 1;
    
    while (!isUndefined(spieltagData[this.game(i)])) {
      delete nc[this.game(i)];
      if (i != nr) {
        nc[this.game(j)] = spieltagData[this.game(i)];
        j++;
      }      
      i++;
    }
   
    const ref = this.db.object(objStr);
    ref.set(nc);  
    
  }

  addGameWithNr(data:any, spieltag:number, nr:number) {

    data.activeThree = data.activeThree.join(" ");
    data.allPlayers = data.allPlayers.join(" ");

    let spieltagData: any = this.currentData[this.day(spieltag)];

    let seasonStr: string = this.season(this.selectedSeason);
    let spieltagStr: string = this.day(spieltag);
    let gameStr: string = this.game(nr);

    let objStr: string = seasonStr + "/" + spieltagStr;

    let nc: Object = { ...spieltagData };

    let i:number = 1;
    let j:number = 1;
    
    while ( ! isUndefined(spieltagData[this.game(i)]) || j-1 == nr) {
      if (j<=i) delete nc[this.game(j)];
      if (j-1 != nr) {
        nc[this.game(j)] = spieltagData[this.game(i)];
        i++;
      } else {
        // i == nr
        nc[this.game(j)] = data;
      }     
      j++;
    }
   
    const ref = this.db.object(objStr);
    ref.set(nc);  

  }

  day(i:number):string {
    return i > 10 ? "day_"+i : "day_0"+i;
  }

  dayOld(i:number):string {
    return "day_"+i;
  }

  daygeneric(i:number):string {
    return this.selectedSeason < 10 ? this.dayOld(i) : this.day(i);
  }

  game(i:number):string {
    return "game_"+i;
  }

  totalday(data: any):number {
    let i:number = 1;
    while ( ! isUndefined(data[this.daygeneric(i)]) ) i++;
    return i-1;
  }

  totalgame(data: any):number {
    let i:number = 1;
    while ( ! isUndefined(data[this.game(i)]) ) i++;
    return i-1;
  }

  calculateSeasonDateSpan(): string {
    
        if ( isUndefined(this.currentData)) return "";
    
        let N:number = this.totalday(this.currentData);
    
        let firstdaydata:any = this.currentData[this.daygeneric(1)];
        let lastdaydata:any = this.currentData[this.daygeneric(N)];
    
        if ( isUndefined (firstdaydata) ) firstdaydata = {date: ''};
        if ( isUndefined (lastdaydata) ) lastdaydata = {date: ''};
    
        let startDate:string = firstdaydata.date || '';
        let endDate:string = lastdaydata.date || '';
        
        this.seasonDateSpan = `${startDate} - ${endDate}`;
        if (this.seasonDateSpan.length == 3) this.seasonDateSpan = null;
      }

}
