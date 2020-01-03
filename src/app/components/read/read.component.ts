import { Subscription } from 'rxjs';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";

import { LogicService } from "../../services/logic.service";
import { PlotService } from "../../services/plot.service";
import { DataService } from "../../services/data.service";
import { GlobalService } from "../../services/global.service";
import { AuthenticationService } from "../../services/authentication.service";
import { GameData } from "../../services/interfaces.service";

import { isUndefined } from 'util';

@Component({
  selector: 'app-read',
  providers: [],
  templateUrl: './read.component.html',
  styleUrls: ['./read.component.css']
})
export class ReadComponent implements OnInit, OnDestroy {

  currentPlotKey: string;
  currentPlotValue: string;
  labels: Map<string, string>;
  labelsSpecial: string[];
  labelkeys: string[];
  sideNavOpened: boolean;
  subscription: Subscription;

  ngOnInit(): void {
    this.sideNavOpened = false;
    this.global.toolbarMenufct = () => { this.sideNavOpened = !this.sideNavOpened };
    this.dataService.setSeason();
    this.labels = this.logic.labels;
    this.labelsSpecial = this.logic.labelsSpecial;
    this.labelkeys = Array.from(this.labels.keys());
    this.currentPlotKey = "Punkte";
    this.currentPlotValue = this.labels.get(this.currentPlotKey);
  }

  ngAfterViewInit() {
    this.subscription = this.dataService.data.subscribe(response => {
      if (response == null) return;
      this.logic.reset();
      this.logic.accumulateSeason(response);
      this.logic.calculateDerivedQuantities();
      this.plot.ctx = document.getElementById("myChart");
      this.plot.plot(this.currentPlotKey);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  title = 'www.gutblatt.de';

  constructor(
    private logic: LogicService,
    private router: Router,
    private plot: PlotService,
    public dataService: DataService,
    private auth: AuthenticationService,
    private global: GlobalService) { }

  goEdit(): void {
    this.router.navigate(['/edit']);
  }

  goGrossmeister(): void {
    this.router.navigate(['/galerie']);
  }

}
