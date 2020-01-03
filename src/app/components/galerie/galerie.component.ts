import { Component, OnInit } from '@angular/core';
import { MeisterStruct } from "../../services/interfaces.service";

@Component({
  selector: 'app-galerie',
  templateUrl: './galerie.component.html',
  styleUrls: ['./galerie.component.css']
})
export class GalerieComponent implements OnInit {

  meisters: MeisterStruct[];

  constructor() { }

  ngOnInit() {
    this.meisters = [      
      {
        name: "Stefan",
        spielzeiten: ["2","4","I2","7","8","9"]        
      },
      {
        name: "Frank",
        spielzeiten: ["11", "13", "14", "21", "24", "25"]
      },
      {
        name: "Robert",
        spielzeiten: ["1","12","18","19","22"]
      },            
      {
        name: "Philipp",
        spielzeiten: ["16", "17", "20"]
      },
      {
        name: "Ronald",
        spielzeiten: ["I1", "5","6"]
      },      
      {
        name: "Albert",
        spielzeiten: ["10", "23"]
      },      
      {
        name: "Tristan",
        spielzeiten: ["15"]
      },
      {
        name: "Ralf",
        spielzeiten: ["3"]
      },
      {
        name: "Thomas",
        spielzeiten: ["26"]
      },
    ];
  }

}


