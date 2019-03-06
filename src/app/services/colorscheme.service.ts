import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorschemeService {

  constructor() { }

    public current_set = 0;
	public schemes = [
		{card: '#FFFFFF'},
		{card: '#2E328E'},
		{card: '#076FB6'},
		{card: '#39B1BC'}
	];
	public scheme_change: any;

	getBackgroundImage(){

	}

	getCardBgColor(){
		return this.schemes[this.current_set].card;
	}

	setScheme(scheme){
		console.log('Change color scheme to: '+scheme);
		if(scheme >= this.schemes.length){
			console.log('No scheme with index '+scheme+'. Will be set scheme number '+(this.schemes.length - 1));
			this.current_set = this.schemes.length - 1;
		} else {
			this.current_set = scheme;
		}
		//$rootScope.$broadcast('rootScope:colorchanged', {});
		this.scheme_change.emit();
	}

	onChange() {
		if(typeof this.scheme_change !== 'undefined') return this.scheme_change;
		else{
			this.scheme_change = new EventEmitter<boolean>();
			return this.scheme_change;
		}
	}

}
