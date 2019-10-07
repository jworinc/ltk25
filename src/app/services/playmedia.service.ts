import { Injectable, EventEmitter } from '@angular/core';
import { Howl, Howler } from 'howler';
import { OptionService } from './option.service';
import { DataloaderService } from './dataloader.service';

@Injectable({
  providedIn: 'root'
})
export class PlaymediaService {

   constructor(private opt: OptionService, private dl: DataloaderService) { 
		this.ltkmediaurl = opt.getMediaStorage();
		this.immidiate_stop_event = new EventEmitter<boolean>();
   }

  public play_sequence = [];
	public play_sound = null;
	public play_disable_flag = false;
	public play_reset_disable_timer = null;
	public play_pause_flag = false;
	public cb = null;
	public disable_callback_flag = false;
	public start_play_delay_timer = null;
	public volume = 0.9;
	public rate = 1;
	public sounds_buffer = [];
	public ltkmediaurl = '';
	public immidiate_stop_event: any;

	setDisable() {
		clearTimeout(this.play_reset_disable_timer);
		this.play_disable_flag = true;
		let that = this; 
		this.play_reset_disable_timer = setTimeout(function(){
			that.clearDisable();
			console.log('Unload sound by timeout: ' + that.play_sound._src);
			that.play_sound.unload();
			if(typeof that.cb !== 'undefined' && !this.disable_callback_flag) that.cb();
		}, 13000);
	}

	clearDisable() {
		clearTimeout(this.play_reset_disable_timer);
		
		//	Check if pause was enabled
		if(this.play_pause_flag) return;

		this.play_disable_flag = false;

		//	Check if there are audios in sequence and play first of them
		if(this.play_sequence.length > 0){
			let a = this.play_sequence.shift();
			this.play(a.path, a.cb, a.del);
		}
	};

	play(path, cb, del=1) {

		del = del || 1;

		if(this.play_disable_flag || this.play_pause_flag){
			this.play_sequence.push({path: path, cb: cb, del: del});
			return;
		}

		//	Check if pause was enabled
		if(this.play_pause_flag) return;

		this.setDisable();
		this.cb = cb;

		console.log('Playmedia service, request to play audio from path: ' + path + '.');

		let that = this;

		let props = {
			src: this.ltkmediaurl + path,
			autoplay: false,
			loop: false,
			volume: this.volume,
			rate: this.rate,
			html5: false,
		}

		//	Init word sound
		let sound = this.play_sound = new Howl(props);

		this.sounds_buffer.push(sound);

		if(typeof Howler !== 'undefined' && typeof Howler.ctx !== 'undefined' && Howler.ctx.state === 'suspended'){
			//Howler.ctx.resume();
			//alert('Context suspended');
		}

		//	Play sound if it already loaded
		if(sound.state() === 'loaded') this.start_play_delay_timer = setTimeout(function(){ that.disable_callback_flag = false; sound.play(); }, del);
		else{
			//	If sound is not loaded yet, play it when ready
			sound.on('load', function(){
				that.start_play_delay_timer = setTimeout(function(){ that.disable_callback_flag = false; sound.play(); }, del);
			});
		}
		sound.on('end', function(){
			that.clearDisable();
			if(typeof cb !== 'undefined' && !that.disable_callback_flag) cb();
			
		});
		sound.on('loaderror', function(){
			console.log('Error to load audio: ' + this._src);
			that.logMissingAudio(this._src);
			setTimeout(function(){
				that.clearDisable();
			}, 300);
			
			if(typeof cb !== 'undefined') cb();
		});

	}

	pause() {
		this.play_pause_flag = true;
		//if(this.play_sound) this.play_sound.pause();
	}

	resume() {
		if(this.play_pause_flag){
			this.play_pause_flag = false;
			if(!this.play_disable_flag) this.clearDisable();
		}
	}

	stop() {
		this.disable_callback_flag = true;
		clearTimeout(this.start_play_delay_timer);
		if(this.play_sound !== null) this.play_sound.stop();
		this.play_sequence = [];
		for(let i in this.sounds_buffer){
			let sb = this.sounds_buffer[i];
			if(typeof sb !== 'undefined' && typeof sb.stop !== 'undefined'){
				sb.stop();
			}
		}
		this.sounds_buffer = [];
		this.clearDisable();
	}

	word(word, cb, del=1) {
		del = del || 1;
		if(word === ''){
			console.log('Try to play empty word!');
			return;
		}
		let first_letter = word.substr(0, 1).toUpperCase();
		let path = '/storage/app/public/audio/ltkmedia/'+first_letter+'/'+word.toUpperCase().replace(/[\,\:\;\!\.]/g, '')+'.mp3';
		this.play(path, cb, del);
	}

	sound(sound, cb, del=1) {
		del = del || 1;
		if(sound.length < 3){
			console.log('Try to play empty sound!');
			return;
		}
		let sl = sound.toUpperCase();
		let fl = sl.slice(2, 3);
		let path = '/storage/app/public/audio/ltkmedia/_'+fl+'/'+sl+'.mp3';
		this.play(path, cb, del);
	}

	help(help, cb, del=1) {
		del = del || 1;
		if(help.length < 3){
			console.log('Try to play empty help!');
			return;
		}
		let path = '/storage/app/public/audio/help/'+help+'.mp3';
		this.play(path, cb, del);
	}

	cdeck(file, cb, del=1) {
		del = del || 1;
		let path = '/storage/app/public/audio/cdeck/'+file+'.mp3';
		this.play(path, cb, del);
	}

	action(action, cb, del=1) {
		del = del || 1;
		//	Available action sounds CHIMES, CHONG, CHORD, DING, MOUSEDN, MOUSEDNH, MOUSEDNL, MOUSEUP, MOUSEUPH, MOUSEUPL
		let path = '/storage/app/public/audio/ltkmedia/'+action+'.mp3';
		this.play(path, cb, del);
	}

	logMissingAudio(m) {
		/*
		let x = document.getElementsByName("csrf-token")[0].getAttribute("content");
		$http.post('/media/log/missing/audio', {'url': m}, {headers: {'X-CSRF-TOKEN': x, 'Content-Type': 'application/json'} })
        .then(function (response) {
            console.log(response);
        });
        */
	    this.dl.logMissingAudio(m).subscribe(()=>{});
	}

	setVolume(vol) {
		this.volume = vol;
		//alert('Volume: ' + vol);
		if(this.play_sound !== 'undefined' && this.play_sound !== null){
			this.play_sound.volume(vol);
		}
	}

	setRate(rate) {
		this.rate = rate;
		if(this.play_sound !== 'undefined' && this.play_sound !== null){
			this.play_sound.rate(rate);
		}
	}

	getMediaStorage() {
		return this.opt.getMediaStorage();
	}

	pauseOnInstruction() {
		return this.opt.pauseOnInstruction();
	}

	immidiateClickSound() {
		let props = {
			src: this.ltkmediaurl + '/storage/app/public/audio/ltkmedia/MOUSEUP.mp3',
			autoplay: false,
			loop: false,
			volume: this.volume,
			rate: this.rate,
			html5: false,
		}

		//	Init word sound
		let sound = new Howl(props);

		//	Play sound if it already loaded
		if(sound.state() === 'loaded') sound.play();
		else{
			//	If sound is not loaded yet, play it when ready
			sound.on('load', function(){
				sound.play();
			});
		}

	}



}
