import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

    constructor(private http: HttpClient, private Token: TokenService) { 
		this.base_url = Token.getApiUrl();
	 }

    public card_id = 0;
	public begin = 0;
	public lid = 0;
	public lesson_begin = 0;
	public single_types = ['AL1', 'GSC', 'GWM', 'OR1', 'OR3', 'OR4', 'SYP', 'SET', 'SIW', 'CAR'];
	private base_url = 'https://api.ltk.cards/api';
	private current_lesson = 0;

	public on_leave_lesson = new EventEmitter<any>();

	setCurrentLesson(l) {
		this.current_lesson = l;
	}

	//	Logging begin lesson
	lessonBegin(l){
		
		return this.http.get(`${this.base_url}/u/logging/lesson/begin/${l}`, {
	      headers: this.Token.getAuthHeader()
	    }).pipe(share());

	}
	
	//	Logging end lesson
	lessonEnd(l){
		
		return this.http.get(`${this.base_url}/u/logging/lesson/end/${l}`, {
	      headers: this.Token.getAuthHeader()
	    }).pipe(share());

	}
	
	//	Logging time on
	lessonTimeon(l){
		
		return this.http.get(`${this.base_url}/u/logging/lesson/timeon/${l}`, {
	      headers: this.Token.getAuthHeader()
	    }).pipe(share());

	}

	//	Logging command begin
	commandBegin(instance, position, l?) {
		
		let data = {
			'instance': instance, 
			'position': position,
			'lesson': this.current_lesson
		}
		
        return this.http.post(`${this.base_url}/u/logging/command/begin`, data, {
	      headers: this.Token.getAuthHeader()
	    }).pipe(share());

	}

	//	Logging command end
	commandEnd(instance, position, errlog, presented, l, complete) {
		
		let data = {
			'instance': instance,
			'position': position,
			'errors': errlog.length,
			'presented': presented,
			'performance': this.perfCalc(instance, presented, errlog.length),
			'log': errlog,
			'lesson': l,
			'complete': complete
		}

        return this.http.post(`${this.base_url}/u/logging/command/end`, data, {
	      headers: this.Token.getAuthHeader()
	    }).pipe(share());

	}

	//	Performance calculation
	perfCalc(inst, pres, err){
		let perf = 0;
		//	If it is a single type
		if(this.single_types.indexOf(inst) >= 0){
			perf = 1 - (err/(3*pres));
		} else {
			perf = 1 - (err/(4*pres));
		}
		if(perf < 0.1) perf = 0.1;
		return Math.round(perf * 100) / 100;
	}

	//	Logging command end
	testEnd(instance, position, errlog, presented, l, complete) {
		
		let data = {
			'instance': instance,
			'position': position,
			'log': errlog,
			'lesson': l,
			'complete': complete
		}

		return this.http.post(`${this.base_url}/u/logging/test/end`, data, {
			headers: this.Token.getAuthHeader()
		}).pipe(share());

	}

	//	Logging command end
	placementEnd(result, logid, level, brk, lsn) {
		
		//return this.http.post(`${this.base_url}/placement/end`, {email: this.Token.getEmail(), result: result, logid: logid, level: level, break: brk, lesson: lsn}).toPromise();
		if(this.Token.loggedIn()){
			return this.http.post(`${this.base_url}/placement/end`, {email: this.Token.getEmail(), result: result, logid: logid, level: level, break: brk, lesson: lsn}, {
				headers: this.Token.getAuthHeader()
			}).toPromise();
		} else {
			return this.http.post(`${this.base_url}/placement/end`, {email: this.Token.getEmail(), result: result, logid: logid, level: level, break: brk, lesson: lsn}).toPromise();
		}

	}






}
