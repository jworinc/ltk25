import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorschemeService {

  constructor() { }

    public current_set = 0;
	public schemes = [
		{card: '#FFFFFF'},
		{card: '#5961F9'},
		{card: '#076FB6'},
		{card: '#39B1BC'},
		{card: '#FF91F0'},
		{card: '#7CFFC2'},
		{card: '#D3C57C'},
		{card: '#FFA5A5'},
		{card: '#DFFF91'},
		{card: '#BABABA'},
		{card: '#FFDE9E'}
	];
	public scheme_change = new EventEmitter<boolean>();

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
			//this.scheme_change = new EventEmitter<boolean>();
			return this.scheme_change;
		}
	}

}
