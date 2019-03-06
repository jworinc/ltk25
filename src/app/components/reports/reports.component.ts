import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OptionService } from '../../services/option.service';
import { DataloaderService } from '../../services/dataloader.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  constructor(private translate: TranslateService,
    private Option: OptionService, private dataloader: DataloaderService) { 
  		// this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(Option.getFallbackLocale());

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use(Option.getLocale());
  	}

    ngOnInit() {

    	//  Init studetn information
	    this.dataloader.getStudentInfo().subscribe(
	        data => this.handleStudentInfo(data),
	        error => { console.log(error); }
	    );

    	this.updateReports();

	    this.Option.change_language_event.subscribe(()=>{
	      console.log('Change language event.');
	      this.translate.use(this.Option.getLocale());
	    })
    }

    //angular.element($window).bind('resize', function(){ mainAppScreenHeight(); });

	public show_tool_pages_list: boolean = true;

	// Sidetrip mode flag
	public sidetripmode: boolean = false;

	//	Setting modal 
	public show_setting_modal: boolean = false;
	public show_feedback_modal: boolean = false;

	public volume = 0;
	public mic = 0;

	//	Last uncomplete lesson
	public lu = 0;
	public current_lesson_title = '000';

	//	Reports show flags
	public showme_report: boolean = true;
	public progress_report: boolean = false;
	public detail_report: boolean = false;
	public summary_report: boolean = false;
	public placement_report: boolean = false;

	//	Reports update flags
	public showme_update: boolean = false;
	public progress_update: boolean = false;
	public detail_update: boolean = false;
	public summary_update: boolean = false;
	public placement_update: boolean = false;

	//	Reports show actions

	//	Hide all
	hideAllReports() {
		this.showme_report = false;
		this.progress_report = false;
		this.detail_report = false;
		this.summary_report = false;
		this.placement_report = false;
	}

	//	Show Me
	showShowme() {
		this.hideAllReports();
		this.showme_report = true;
		this.updateReports();
		
	}

	//	Progress
	showProgress() {
		this.hideAllReports();
		this.progress_report = true;
		this.updateReports();
		
	}

	//	Detail
	showDetail() {
		this.hideAllReports();
		this.detail_report = true;
		this.updateReports();
		
	}

	//	Summary
	showSummary() {
		this.hideAllReports();
		this.summary_report = true;
		this.updateReports();
		
	}

	//	Placement
	showPlacement() {
		this.hideAllReports();
		this.placement_report = true;
		this.updateReports();
		
	}

	updateReports() {
		if(this.showme_report) this.showme_update = true;
		if(this.progress_report) this.progress_update = true;
		if(this.detail_report) this.detail_update = true;
		if(this.summary_report) this.summary_update = true;
	}

	getCurrentLessonTitle(lu){
    
        let n:string = String(lu);
        n = n.length === 3 ? n : n.length === 2 ? '0' + n : n.length === 1 ? '00' + n : n;
        return n;
     
  	}

	//  Handle loaded student info
	handleStudentInfo(data){
	    console.log('Student Info:');
	    console.log(data);

	    this.Option.setLanguage(data.options.language);
	    
      	this.current_lesson_title = this.getCurrentLessonTitle(data.last_uncomplete);
	    
	    
	}

	
	//	Settings modal dialog box
	onShowSettings() {
	    this.show_setting_modal = true;
	}

	onCloseSettings() {
	    this.show_setting_modal = false;
	}

	onShowFeedback() {
	    this.show_feedback_modal = true;
	}

	onCloseFeedback() {
	    this.show_feedback_modal = false;
	}

}
