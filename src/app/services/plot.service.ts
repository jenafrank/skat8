import { Injectable } from '@angular/core';
import { LogicService } from "./logic.service";
import { LabelsSpecial } from './interfaces.service';

import { isUndefined } from 'util';

import "chartjs-plugin-annotation";
declare var Chart: any;

@Injectable()
export class PlotService {
  
  myChart: any;
  ctx: HTMLElement; 

  constructor(private logic:LogicService) {    
  }

  // specific fill colors for each player
  colorsFromNames(names:string[]):string[] {
    let ret:string[] = [];
    for(let name of names) {
      ret.push(this.logic.colors.get(name));
    }
    return ret;
  }

  // specific border colors for each player
  bordersFromNames(names:string[]):string[] {
    let ret:string[] = [];
    for(let name of names) {
      ret.push(this.logic.borders.get(name));
    }
    return ret;
  }

  // round the floats accordingly, no 100 digits or so!
  postProcessNumbers(key:string, values:number[]):number[] {
    let val: string = this.logic.labels.get(key);

    let newvalues: number[] = [];
    for (let el of values) {
      if (el < 100) {
        newvalues.push(+el.toFixed(2));
      } else if (el < 1000) {
        newvalues.push(+el.toFixed(1));
      } else {
        newvalues.push(+el.toFixed(0));
      }
    }
    return newvalues;    
  }

  // sort the logic data to show the best leftmost, the worst righmost (bar plot)
  getSortedMapForBarPlot(mapkey:string):Map<string, number> {
    return this.logic.sortMap(this.logic[this.logic.labels.get(mapkey)]);    
  }

  plot(key:string): void {
    let keyspecial: LabelsSpecial = key as LabelsSpecial;
    if (this.logic.labels.has(key)) {
      this.barplot(key);
    } else if ( keyspecial == "Punkte (Verlauf)") {
      this.timeSeriesPlot(this.logic.punkteSeries);
    } else if ( keyspecial == "Performanz") {
      this.performancePlot();
    }
  }

  // time series plot

  timeSeriesPlot(seriesdata: Map<string, Map<number, number>>) {

    let allPlayers: string[] = Array.from(seriesdata.keys());
    let data: Object ={}

    for (let ply of allPlayers) {
      let dataset = Array.from(seriesdata.get(ply));
      let pointObjArray: Object[] = [];
      for (let point of dataset) {
        let pointObj: Object = {
          x: point[0],
          y: point[1]
        };
        pointObjArray.push(pointObj);
      }
      data[ply] = pointObjArray;
    }

    let datasets: Object[] = [];
    for (let ply of allPlayers) {
      datasets.push({
        label: ply,
        data: data[ply],
        showLine: true,
        lineTension: 0,        
        borderColor: this.logic.borders.get(ply),
        backgroundColor: this.logic.colors.get(ply),
        pointRadius: 0,
        fill:false        
      }); 
    }

    if ( ! isUndefined(this.myChart)) this.myChart.destroy();

    var spieltage = this.logic.spieltagSeries;

    this.myChart = new Chart(this.ctx, {
      type: 'scatter',
      data: {
        datasets: datasets        
      },
      options: {
        scales: {
          xAxes: [{
            afterBuildTicks: function(scale) {
              scale.ticks = Array.from(spieltage.values());
              console.log("---");
              return;
            }
          }]
        }
      }
    });

  }

  // performance plot
  performancePlot() {

    let allPlayers: string[] = this.logic.registeredPlayers;
    let data: Object = {}
    let datasets: Object[] = [];

    var maxx, maxy, minx, miny: number;
    maxx=0;
    maxy=0;
    minx=100;
    miny=100;

    for (let ply of allPlayers) {
      if (ply != 'E') {
        let el: any = {
          x: this.logic.ratioAllein.get(ply),
          y: this.logic.ratioGespielt.get(ply)
        };        

        if (maxx < el.x) maxx=el.x;
        if (maxy < el.y) maxy=el.y;
        if (minx > el.x) minx=el.x;
        if (miny > el.y) miny=el.y;

        datasets.push({
          label: ply,
          data: [el],
          pointRadius: 20.,
          fill: false,
          showLine: false,
          pointBorderColor: this.logic.borders.get(ply),
          pointBackgroundColor: this.logic.colors.get(ply),
          borderColor: this.logic.borders.get(ply),
          backgroundColor: this.logic.colors.get(ply),
        });
      }
    }

    if (!isUndefined(this.myChart)) this.myChart.destroy();

    this.myChart = new Chart(this.ctx, {
      type: 'scatter',
      data: {
        datasets: datasets
      },
      options: {
        annotation: {
          annotations: [{
            borderColor: 'red',
            borderWidth: 2,
            mode: 'vertical',
            type: 'line',
            value: 5/6*100,
            scaleID: 'x-axis-0'
          }, {
            borderColor: 'red',            
            borderWidth: 2,
            mode: 'horizontal',
            type: 'line',
            value: 1/3*100,
            scaleID: 'y-axis-0'
          }]
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: '% Gewonnen'
            },
            id: 'x-axis-0',
            ticks: {
              max: 100,
              min: Math.max(Math.min(minx-5,66),0)
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: '% Gespielt'
            },
            id: 'y-axis-0',
            ticks: {
              max: Math.max(50,maxy),
              min: Math.max(miny-5,0)
            }
          }]
        }
      }
    });
    
  }

  // bar plot
  barplot(key:string):void {

    let smap: Map<string,number>;
    smap = this.getSortedMapForBarPlot(key);

    let labels:string[] = Array.from(smap.keys());
    let values:number[] = Array.from(smap.values());

    values = this.postProcessNumbers(key,values);

    if ( ! isUndefined(this.myChart)) this.myChart.destroy();
    this.myChart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{          
          data: values,
          backgroundColor: this.colorsFromNames(labels),
          borderColor: this.bordersFromNames(labels),
          borderWidth: 1
        }]
      },
      options: {

        title: {
          display: true,
          text: key,
          padding: 20,
          fontSize: 16
        },

        maintainAspectRatio: false,

        tooltips: {
          enabled: false
        },

        hover: {
          animationDuration: 0
        },

        animation: {
          onComplete: function () {

            var chartInstance = this.chart;            
            var ctx = chartInstance.ctx;
            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";

            this.data.datasets.forEach(function (dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];                            
                // TODO: If negative value: then add 5 and do not substract 5
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              });
            });

          }
        },

        legend: {
          display: false
        },

        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              fontSize: 16
            }
          }],
          xAxes: [{
            ticks: {
              fontSize: 20
            }
          }]
        }

      }
    });
  }
}
