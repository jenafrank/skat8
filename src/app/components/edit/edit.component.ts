import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';

import { DataService } from "../../services/data.service";
import { LogicService } from "../../services/logic.service";
import { AuthenticationService } from "../../services/authentication.service";

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  totaldays: number;
  days: number[];

  subscription: Subscription;

  constructor(private dataService: DataService,
    private logic: LogicService,
    private router: Router,
    public auth: AuthenticationService
  ) { }

  ngOnInit() {
    this.dataService.selectedSeason = this.dataService.selectedSeason;
    this.dataService.setSeason();
    this.subscription = this.dataService.data.subscribe((seasonData: any) => {
      if (seasonData == null) return;
      this.totaldays = this.dataService.totalday(seasonData);
      this.days = (new Array(this.totaldays)).fill(1).map((val, idx) => {
        return idx + 1;
      })
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  goSpieltag(i: number) {
    this.router.navigate(['/edit/spieltag', i]);
  }

  addDay() {
    this.dataService.addSpieltag();
  }

  removeDay() {
    this.dataService.removeSpieltag();
  }
}
