import { Component, OnInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { DataloaderService } from '../../services/dataloader.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  constructor(private el: ElementRef, 
  			  private dl: DataloaderService,) { }


  public _show: boolean = false;
  public feedback_shown: boolean = false;
  public save_feedback_started: boolean = false;
  
  @Output() closefeedback = new EventEmitter<boolean>();
  @Input('show')
  set show(show: boolean) {
     this._show = show;
     this.initFeedback();
  }

  ngOnInit() {

  }

  	public feedback = {
        like: 0,
        dislike: 0,
        category: 'no',
        message: ''
    }

    //  Init clean feedback object
    initFeedback(){
        this.feedback = {
            like: 0,
            dislike: 0,
            category: 'no',
            message: ''
        }
    }

    //  Perform some actions before close
	close(){
		this._show = false;
		this.feedback_shown = false;
		this.closefeedback.emit();
	}

	submitFeedback() {
		console.log('Save feedback.');
		console.log(this.feedback);
        let that = this;
        this.dl.saveFeedback(this.feedback).subscribe(
		        data => { that.save_feedback_started = false; that.close(); },
		        error => {
		          console.log(error);
		          that.save_feedback_started = false;
              that.close();
		          //this.notify.error('Student info load status: ' + error.status + ' ' + error.statusText, {timeout: 5000});
		        }
		    );

	}

	setLike(){
		this.feedback.like = 1;
	}

	setDislike(){
		this.feedback.dislike = 1;
	}

	setCategory(cat){
		this.feedback.category = cat;
	}


}
