import { Injectable } from '@angular/core';

@Injectable()
export class InterfacesService {

  constructor() { }

}

export interface GameData {
  activeThree: string[];
  allPlayers: string[];
  declarer: string;
  kontra: string;
  mod: number;
  nrPlayers: number;
  points: number;
  time: string;
  spieltag?: number;
  runde: number;
}

export interface GameDataRaw {
  activeThree: string;
  allPlayers: string;
  declarer: string;
  kontra: string;
  mod: string;
  nrPlayers: string;
  points: number;
  time: string;
  runde: number;
}

export interface GameView {
  nr: string,
  nrInRound: string,
  spieler: string,
  punkte: string,
  ply1: string,
  ply2: string,
  ply3: string,
  ply4: string,
  ply5: string,
  mod: number
}

export type LabelsSpecial = "Punkte (Verlauf)" | "Performanz";

export interface MeisterStruct {
  name: string,
  spielzeiten: string[]
}