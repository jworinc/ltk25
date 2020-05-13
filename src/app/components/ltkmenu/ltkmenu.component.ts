import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PickElementService } from '../../services/pick-element.service';
import { DataloaderService } from '../../services/dataloader.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ltkmenu',
  templateUrl: './ltkmenu.component.html',
  styleUrls: ['./ltkmenu.component.scss']
})
export class LtkmenuComponent implements OnInit {

  public _show: boolean = false;
  @Output() closeltkmenu = new EventEmitter<any>();
  @Input() student: any;

  public set_next_lesson_sbitem: boolean = false;
  public findtutor_sbitem: boolean = false;
  public change_username_sbitem: boolean = false;
  public tutor_email = "";

  public lessons = [];
  public lessons_load_event: any = null;
  public selected_next_lesson: any = null;

  constructor(private pe: PickElementService,
              private dl: DataloaderService,
              public tr: TranslateService,
              private router: Router) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if(this.lessons_load_event) this.lessons_load_event.unsubscribe();
  }

  @Input('show')
  set show(show: boolean) {
     this._show = show;
     
  }

	close(){
		//	If mouse event locked by feedback
		if(this.pe.mouseLock()) return;
		this._show = false;
    this.closeltkmenu.emit();
    this.closeAllOptions();
  }
  
  setNextLesson() {
    //  Load lessons list
    this.lessons_load_event = this.dl.getLessons().subscribe(
      data => this.handleLessons(data),
      error => {
        console.log(error);
      }
    );
    this.set_next_lesson_sbitem = true;
  }

  handleLessons(data) {
    console.log("Loaded lessons list");
    console.log(data);
    console.log(this.student);
    this.lessons = data;
  }

  findTutor() {
    this.findtutor_sbitem = true;
  }

  changeUsername() {
    this.change_username_sbitem = true;
  }

  saveStudentName() {
    let that = this;
    this.dl.setStudentName(this.student.name).then(()=>{
      console.log("New name saved!");
    }).catch((e)=>{
      console.log(e);
      alert(this.tr.instant('save_new_student_name_error'));
    }).finally(()=>{
      that.closeAllOptions();
    })
  }

  setStudentNextLesson() {
    let that = this;
    if(this.selected_next_lesson)
      this.router.navigateByUrl('/next/'+this.selected_next_lesson);

    that.closeAllOptions();
    /*
    this.dl.setStudentNextLesson(this.selected_next_lesson).then(()=>{
      console.log("Next Lesson setted!");
    }).catch((e)=>{
      console.log(e);
      alert(this.tr.instant('set_next_lesson_error'));
    }).finally(()=>{
      that.closeAllOptions();
    })
    */
  }

  closeAllOptions() {
    this.set_next_lesson_sbitem = false;
    this.findtutor_sbitem = false;
    this.change_username_sbitem = false;
  }

  sendRequestFindTutor() {
    //  Check if tutor email is not empty
    if(this.tutor_email !== "") {
      this.dl.sendStudentFindTutorRequest(this.tutor_email).then(()=>{
        alert(this.tr.instant('your_request_was_sent'));
      }).catch((e)=>{
        alert(this.tr.instant('find_tutor_request_error') + " (" + e.error.error + ")");
      });
    }
  }

}
