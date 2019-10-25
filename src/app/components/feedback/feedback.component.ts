import { Component, OnInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { DataloaderService } from '../../services/dataloader.service';
import { addToViewTree } from '@angular/core/src/render3/instructions';

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
  public success_result = false;
  
  @Output() closefeedback = new EventEmitter<boolean>();
  @Input('show')
  set show(show: boolean) {
     this._show = show;
     this.initFeedback();
  }
  @Input() card_descriptor: string = '';

  ngOnInit() {

  }

  	public feedback = {
        like: 0,
        dislike: 0,
        category: 'no',
        message: '',
        card_descriptor: ''
    }

    //  Init clean feedback object
    initFeedback(){
        this.feedback = {
            like: 0,
            dislike: 0,
            category: 'no',
            message: '',
            card_descriptor: ''
        }
        this.success_result = false;
    }

    //  Perform some actions before close
	close(){
		this._show = false;
		this.feedback_shown = false;
		this.closefeedback.emit();
	}

	submitFeedback() {
    console.log('Save feedback.');
    if(this.feedback.like === 0 && this.feedback.dislike === 0 && this.feedback.message === ''){
      console.log('Empty feedback!');
      alert('Please fill in form before saving!');
      return;
    }
    console.log(this.feedback);
    this.feedback.card_descriptor = this.card_descriptor;
        let that = this;
        this.dl.saveFeedback(this.feedback).subscribe(
		        data => { that.save_feedback_started = false; that.success_result = true; },
		        error => {
		          console.log(error);
                  that.save_feedback_started = false;
                  alert('Error during save your feedback, please contact administrator! Look at console for more details.');
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
