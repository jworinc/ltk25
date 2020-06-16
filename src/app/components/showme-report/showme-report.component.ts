import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DataloaderService } from '../../services/dataloader.service';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-showme-report',
  templateUrl: './showme-report.component.html',
  styleUrls: ['./showme-report.component.scss']
})
export class ShowmeReportComponent implements OnInit {

    constructor(
        private dataloader: DataloaderService,
        private el: ElementRef,
        private translation: TranslateService,
    ) { }

  	public _update: boolean;

    @Input('update')
    set update(update: boolean) {
    	this._update = update;
      this.updateReport();
    }

    ngOnInit() {
      let that = this;
      this.dataloader.activities().subscribe( 
        data => { console.log(data); that.activities = data; },
        error => { console.log(error); }
      );

      let color = Chart.helpers.color;
      this.barChartData = {
            labels: [],
            datasets: [{
                label: '',
                backgroundColor: color(this.chartColors.green).alpha(0.5).rgbString(),
                borderColor: this.chartColors.red,
                borderWidth: 1,
                data: []
            }]

      };

      // Define a plugin to provide data labels
      Chart.plugins.register({
          afterDatasetsDraw: function(chart, easing) {
              // To only draw at the end of animation, check for easing === 1
              let ctx = chart.ctx;

              chart.data.datasets.forEach(function (dataset, i) {
                  let meta = chart.getDatasetMeta(i);
                  if (!meta.hidden) {
                      meta.data.forEach(function(element, index) {
                          // Draw the text in black, with the specified font
                          ctx.fillStyle = 'rgb(0, 0, 0)';

                          let fontSize = 16;
                          let fontStyle = 'normal';
                          let fontFamily = 'Helvetica Neue';
                          ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

                          // Just naively convert to string for now
                          let dataString = dataset.data[index].toString()+'%';

                          // Make sure alignment settings are correct
                          ctx.textAlign = 'center';
                          ctx.textBaseline = 'middle';

                          let padding = 5;
                          let position = element.tooltipPosition();
                          ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
                      });
                  }
              });
          }
      });


      //  Tooltips for activities with last errors list
      function customTooltip(tooltip) {
        // Tooltip Element
        let tooltipEl = document.getElementById('chartjs-tooltip');

        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.id = 'chartjs-tooltip';
          tooltipEl.innerHTML = '<table></table>';
          this._chart.canvas.parentNode.appendChild(tooltipEl);
        }

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
          tooltipEl.style.opacity = '0';
          return;
        }

        // Set caret Position
        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltip.yAlign) {
          tooltipEl.classList.add(tooltip.yAlign);
        } else {
          tooltipEl.classList.add('no-transform');
        }

        function getBody(bodyItem) {
          return bodyItem.lines;
        }

        // Set Text
        if (tooltip.body) {
          let titleLines = tooltip.title || [];
          let bodyLines = tooltip.body.map(getBody);

          let innerHtml = '<thead>';
          titleLines.forEach(function(title) {
            innerHtml += '<tr><th>' + title + ' ('+ that.getCommandDescription(title) +')</th></tr>';
          });
          
          innerHtml += that.translation.instant('last_mistakes')+':</br>' + that.getErrorsList(titleLines[0]);

          let tableRoot = tooltipEl.querySelector('table');
          tableRoot.innerHTML = innerHtml;
        }

        let positionY = this._chart.canvas.offsetTop;
        let positionX = this._chart.canvas.offsetLeft;

        // Display, position, and set styles for font
        tooltipEl.style.opacity = '1';
        let pleft = positionX + tooltip.caretX;
        if(pleft < tooltipEl.clientWidth / 2) pleft = tooltipEl.clientWidth / 2;
        if(pleft > this._chart.canvas.clientWidth - (tooltipEl.clientWidth / 2)) pleft = this._chart.canvas.clientWidth - (tooltipEl.clientWidth / 2);
        tooltipEl.style.left = pleft + 'px';
        tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
        tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
        tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
        tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
      }


      let ctx = this.el.nativeElement.querySelector("canvas").getContext("2d");
      this.showMeBar = new Chart(ctx, {
            type: 'bar',
            data: this.barChartData,
            options: {
                responsive: true,
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                    text: 'Show Me Report'
                },
                scales: {
              yAxes: [{
                  ticks: {
                    min: 0,
                    max: 100,
                    callback: function(value, index, values) {
                          return value+'%';
                      }
                  }
              }]
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 30,
                    bottom: 0
                }
            },
            tooltips: {
              enabled: false,
              mode: 'index',
              position: 'average',
              custom: customTooltip
                
            }
              }
          });


      //setTimeout(function(){
      //  this.update = true;
      //}, 10);


    }

    public current_lesson = 0;
    public _lu = -1;
    @Input('lu')
    set lu(lu: any) {
    	this._lu = lu;
      this.updateReport();
    }
    public lessons: any;
    public errors = [];

    public activities: any;
    

    public chartColors = {
      red: 'rgb(255, 99, 132)',
      orange: 'rgb(255, 159, 64)',
      yellow: 'rgb(255, 205, 86)',
      green: 'rgb(75, 192, 192)',
      blue: 'rgb(54, 162, 235)',
      purple: 'rgb(153, 102, 255)',
      grey: 'rgb(201, 203, 207)'
    }

    public barChartData: any;
    public showMeBar: any;
    public _chart: any;
    public noinfo_available: boolean = false;
    

    //  Get command description
    getCommandDescription(com) {
      for(let i in this.activities){
        let l = this.activities[i];
        if(l.title === com) return l.desc;
      }
      return this.translation.instant('no_description');
    }

    //  Get markup for errors list according to current activity
    getErrorsList(com) {
      for(let i in this.errors){
        let l = this.errors[i];
        if(l.command === com){
          if(l.errors.length > 0){

            let out = '';
            for(let k in l.errors){

              let e = l.errors[k];
              if(e.Tag === 'actual input'){
                out += this.translation.instant('your_input')+': '+e.Value+'; '
              }
              else if(e.Tag === 'Expected'){
                out += this.translation.instant('expected_input')+': '+e.Value+';</br>'
              }

              //  limit last 10 errors (max index 20)
              if(parseInt(k) > 20) break;

            }
            return out;

          } else {
            return this.translation.instant('no_mistakes');
          }
        }
      }
      return 'No mistakes';
    }

    //  Get errors quantity for particular command from lesson state dataset
    getCommandErrors(com, ls) {
      let out = 0;
      for(let i in ls){
        let l = ls[i];
        //if(l.command === com) return parseInt(l.error_quantity);
        if(l.command === com) out += l.errors.length / 2;
      }
      return out;
    }

    //  Get errors quantity for particular command from lesson state dataset
    getCommandComplete(com, ls) {
      for(let i in ls){
        let l = ls[i];
        if(l.command === com) return parseInt(l.complete);
      }
    }

    //  Get presented quantity for particular command from lesson state dataset
    getCommandPresented(com, ls) {
      let out = 0;
      for(let i in ls){
        let l = ls[i];
        if(l.command === com) out += parseInt(l.presented);
      }
      return out;
    }

    showmeUpdateCallback(data) {
      if(typeof data.result === 'object'){
        console.log(data);
        this.errors = data.lesson_state;
        this.barChartData.labels = [];
        this.barChartData.datasets[0].data = [];
        this.barChartData.datasets[0].backgroundColor = [];
        for(let i in data.result){

          //  Push command label
          this.barChartData.labels.push(i);

          //  Calc percent of successfully completed activities ((total - errors) / total) + 5
          //  where 5 is a minimum from which starts chart for particular activity
          //let total = parseInt(data.result[i]);
          
          //  Error weight in report
          let error_weight = 0.7;

          let total = this.getCommandPresented(i, data.lesson_state);
          let errors = this.getCommandErrors(i, data.lesson_state);
          let complete = this.getCommandComplete(i, data.lesson_state);
          let d = 5;
          if(errors > 0 && complete > 90){
            d = Math.floor(((total - (errors*error_weight)) / total)*100);
            if(d < 5) d = 5;
          }
          else if(errors > 0 && complete < 90){
            d = Math.floor(((total - (errors*error_weight)) / total)*80);
            if(d < 5) d = 5;
          }
          else if(errors === 0 && complete === 0 && total <= 1){
            d = 5;
          }
          else if(errors === 0 && complete === 0 && total > 1){
            d = 5 + total*5;
          } else {
            d = 100;
          }
          

          //  Push command data
          this.barChartData.datasets[0].data.push(d);
          let color = Chart.helpers.color;
          if(d < 80){
            this.barChartData.datasets[0].backgroundColor.push(color(this.chartColors.red).alpha(0.5).rgbString());
          } else {
            this.barChartData.datasets[0].backgroundColor.push(color(this.chartColors.green).alpha(0.5).rgbString());
          }
        }
        if(typeof this.showMeBar !== 'undefined') this.showMeBar.update();
      }
    }

    getLessonsCallback(data) {
      this.lessons = data;
      if(this.lessons.length > 0) this.current_lesson = this.lessons[this.lessons.length - 1].number;
      if(this._lu === 0 && data.length > 0 && typeof data[0] === 'object'){
        this.current_lesson = data[0].number;
        this.updateLesson();
      }
      //  Set last complete lesson
      else if(this._lu > 0 && data.length > 0){
        for(let i in data){
          if(parseInt(data[i].number) === this._lu) this.current_lesson = data[i].number;
        }
        this.updateLesson();
      } else {
        //alert('Unable to find last lesson.');
        console.log('Unable to find last lesson.');
        this.noinfo_available = true;
        return;
      }
      
    }

    updateLesson() {
      let that = this;
      this.barChartData.labels = [];
			this.barChartData.datasets[0].data = [];
			this.barChartData.datasets[0].backgroundColor = [];
			if(typeof this.showMeBar !== 'undefined') this.showMeBar.update();
      this.dataloader.showme(this.current_lesson).subscribe(
          data => { that.showmeUpdateCallback(data); },
          error => { console.log(error); }
        );
    }

    updateReport() {
      let that = this;
      this.current_lesson = 0;
      //  Set current lesson according to last lesson in a list
      
      this.noinfo_available = false;
      this.dataloader.getStudentLessons().subscribe(
        data => { that.getLessonsCallback(data); },
        error => { console.log(error); }
      );
    }


}
