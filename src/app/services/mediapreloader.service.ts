import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OptionService } from './option.service';
import { Howl, Howler } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class MediapreloaderService {

    constructor(@Inject(DOCUMENT) private document: Document, private options: OptionService) { }

    public data: any;

	public cardsmedia = [];

	public cardsimages = [];

	public buffer = [];

	public preload_number = 3;

	public _loaded = [];

	setData(data){
		this.data = data;

		//	Parse each card and collect media files
		for(let i in data){

			//	Card content
			let content = data[i].content;

			//	Card type
			let card_type = data[i].type;

			//	Container for current card media
			let cmedia = [];
			let cimages = [];

			//	check for static activities content
			if(typeof data[i].activity !== 'undefined' && data[i].activity === 'AL1'){
				this.addAL1Alphabet(cmedia);
			}

			//	Check for text cards, filter unique words in text and add it to preload
			if(card_type === 'or3' || card_type === 'or4'){
				let tx = content[0].parts.body;
				this.addWordsFromText(tx, cmedia);
			}
			if(card_type === 'gwf'){
				for(let g in content[0].parts){
					let p = content[0].parts[g];
					if(typeof p.title !== 'undefined' && p.title !== ''){
						this.addWordsFromText(p.title, cmedia);
					}
				}
				
			}

			//	Check each content instance
			for(let c in content){

				let cn = content[c];

				//	* Part *
				//	Check if parts is set in content
				if(typeof cn.parts !== 'undefined' && cn.parts.length > 0){
					let wrd = '';
					//	Check each part of content
					for(let p in cn.parts){

						let part = cn.parts[p];

						if(typeof part === 'string'){
							wrd+=part.replace(/\-/ig, '').replace(/\|/ig, '');

							// For some type of cards it is needed to preload not only whole word that stored in parts array
							// Parts elements also has be preloaded
							if(card_type === 'ar5' || card_type === 'ar6'){
								cmedia.push(part.replace(/\-/ig, '').replace(/\|/ig, ''));
								cmedia.push('_s' + part.replace(/\-/ig, '').replace(/\|/ig, ''));
							}

							continue;
						}

						//	On a part level object has audio property which containe media identifire
						for(let k in part){

							//	Check audio property
							if(k === 'wave' || k === 'WaveName' || k === 'wavename'){
								cmedia.push(part[k]);
								continue;
							}

							//	In GWM card part containes array with words
							if((card_type === 'gwm' || card_type === 'gqw') && typeof part[k].wavename !== 'undefined' && part[k].wavename !== ""){
								
								cmedia.push(part[k].wavename);
								continue;
								
							}

						}

					}

					//	Check if in parts was letters, so wrd is not empty and we need to add it to preload list
					cmedia.push(wrd);

				}

				//	* Word *
				//	Check if word is set in content
				if(typeof cn.word !== 'undefined' && cn.word.length > 0){

					let whole_word = ''
					let sr = /\|/i;
					for(let w in cn.word){
						//	Get sound from word
						if(sr.test(cn.word[w])){
							//	Add separate letters
							let ltrs = cn.word[w].replace(/\|/ig, '').split('');
							for(let lt in ltrs){
								cmedia.push(ltrs[lt]);
							}
							//	Add sound of marked letters
							cmedia.push('_s' + cn.word[w].replace(/\|/ig, ''));
						}
						// Get whole word
						whole_word += cn.word[w].replace(/\|/ig, '');
					}
					cmedia.push(whole_word);
				}

				//	* Dictate sentence *
				//	Check DIS cards, in a parts array it has field title with a dictate sentence
				if(card_type === 'dis' && typeof cn.parts !== 'undefined' && typeof cn.parts.title !== 'undefined'){
					this.addWordsFromText(cn.parts.title, cmedia);
				}



				//	Parse rest of content sections
				for(let l in cn){
					//	Skip parts, we already processed it
					if(l === 'parts' || l === 'word') continue;

					//	Get current content property
					let cp = cn[l];


					//	Some cards has WaveName param
					if(l === 'WaveName') {
						cmedia.push(cp);
						continue;
					}

					//	Add pronuncuation sounds
					if(l === 'pronounce' && typeof cp === 'object'){
						for(let q in cp){
							cmedia.push('_s'+cp[q].replace(/\-/ig, ''));
						}
						continue;
					}

					//	Sometimes pronounce field is represented as string
					if(l === 'pronounce' && typeof cp === 'string'){
						let prnc = cp.split(',');
						for(let q in prnc){
							cmedia.push('_s'+prnc[q].replace(/\-/ig, ''));
						}
						continue;
					}

					//	Check breakdown field and add it word
					if(l === 'breakdown' && typeof cp === 'string'){
						
						cmedia.push(cp.replace(/\-/ig, '').replace(/\,/ig, ''));
						continue;
					}

					//	Instructions
					if(typeof cp === 'object' && cp !== null && typeof cp.length !== 'undefined' && cp.length > 0){

						//	Iterate over each content instance
						for(let m in cp){

							let ci = cp[m];

							for(let t in ci){

								if(t === 'audio'){
									cmedia.push(ci[t]);
								}
								else if(t === 'picture' || t === 'animation'){
									let pic = ci[t];
									if(typeof ci['format'] !== 'undefined' && ci['format'].toLowerCase() !== 'wmf'){
										pic += '.'+ci['format'].toLowerCase();
									} else {
										pic += '.png';
									}
									cimages.push(pic);
								}

							}

						}

					}


				}

			}

			//	Add additional data for cards with static content predefined in directive code
			if(card_type === 'gsc') this.addAlphabetSounds(cmedia);

			//	Save parsed audio data
			this.cardsmedia.push({position: data[i].pos, media: cmedia, images: cimages});

		}

	}

	addAL1Alphabet(cmedia){
		cmedia.push('A');
		cmedia.push('B');
		cmedia.push('C');
		cmedia.push('D');
		cmedia.push('E');
		cmedia.push('F');
		cmedia.push('G');
		cmedia.push('H');
		cmedia.push('I');
		cmedia.push('J');
		cmedia.push('K');
		cmedia.push('L');
		cmedia.push('M');
		cmedia.push('N');
		cmedia.push('O');
		cmedia.push('P');
		cmedia.push('Q');
		cmedia.push('R');
		cmedia.push('S');
		cmedia.push('T');
		cmedia.push('U');
		cmedia.push('V');
		cmedia.push('W');
		cmedia.push('X');
		cmedia.push('Y');
		cmedia.push('Z');
	}

	addAlphabetSounds(cmedia){
		cmedia.push('_sa');
		cmedia.push('_sb');
		cmedia.push('_sc');
		cmedia.push('_sd');
		cmedia.push('_se');
		cmedia.push('_sf');
		cmedia.push('_sg');
		cmedia.push('_sh');
		cmedia.push('_si');
		cmedia.push('_sj');
		cmedia.push('_sk');
		cmedia.push('_sl');
		cmedia.push('_sm');
		cmedia.push('_sn');
		cmedia.push('_so');
		cmedia.push('_sp');
		cmedia.push('_sq');
		cmedia.push('_sr');
		cmedia.push('_ss');
		cmedia.push('_st');
		cmedia.push('_su');
		cmedia.push('_sv');
		cmedia.push('_sw');
		cmedia.push('_sx');
		cmedia.push('_sy');
		cmedia.push('_sz');
	}

	addWordsFromText(text, cmedia){
		//	RegExp for seaching HTML tags in text
		let html = /<[\w\s\d=\"\;\:\-\.\/]*>/ig;
		//	RegExp find extra spaces
		let space_to_one = /[\s]+/g;
		//	RegExp to find punctuation characters
		let punctuation = /[\(\)\,\:\;\"\!\?\'\u2000-\u2060]/g;
		//	RegExp to find dots
		let dots = /\./g;

		//	Filter markup to leave only words with spaces as delimiter
		let innerText = text.replace(html, '').replace(space_to_one, ' ').replace(punctuation, '').replace(dots, ' ');
		//	Convert plain words string to array
		let words_arr = innerText.split(' ');
		//	Prepare buffer for filtering unique words
		let unique_words = [];
		//	Find unique words in all words array
		for(let i in words_arr)	{
			let w = words_arr[i];
			if(unique_words.indexOf(w) >= 0 || w === ' ' || w === '') continue;
			unique_words.push(w);
			cmedia.push(w);
		}
	}

	loadCard(pos){
		let n = parseInt(pos);
		//	Check which cards is not preloaded
		for(let i = n; i <= n+this.preload_number; i++){
			//	If card is already loaded
			if(this._loaded.indexOf(i) > 0) continue;
			else{
				//	Check if we have mediaset for card
				if((i-1) < this.cardsmedia.length){
					this.preloadCard(i);
					this._loaded.push(i);
				}
			}	
		}

	}

	preloadCard(n){
		//return;
		let media = null;
		let images = null;
		for(let c in this.cardsmedia){
			if(parseInt(n) === parseInt(this.cardsmedia[c].position)){
				media = this.cardsmedia[c];
				images = media.images;
				console.log('Preload media for card '+n);
				console.log(media);
				break;
			}
		}
		if(media === null) return;

		for(let i in media.media){

			let m = media.media[i];

			//	Check if empty
			if(m === "" || m === " ") continue;

			let url = this.options.getMediaStorage();

			//	Check first letter to define is media sound or word
			let fl = m.substring(0, 1);
			let sl = m.substring(2, 3).toUpperCase();;
			if(fl === '_'){
				url += '/storage/app/public/audio/ltkmedia/_' + sl + '/'+m.toUpperCase()+'.mp3';
			} else {
				url += '/storage/app/public/audio/ltkmedia/'+fl.toUpperCase()+'/'+m.toUpperCase()+'.mp3';
			}

			//let a = new Audio();
			//a.src = url;
			let a = new Howl({
				src: url,
				autoplay: false,
				preload: true
			});
			this.buffer.push(a);

		}

		//	Preload images
		for(let g in images){
			let img = images[g];
			if(typeof document !== 'undefined'){
				let el = document.getElementById('main-app-container');
				let imel = document.createElement('img');
				imel.setAttribute('style', 'display: none;');
				imel.src = this.options.getMediaStorage() + '/storage/app/public/pic_png/' + img;
				el.appendChild(imel)
			}
		}
	}
	preloadActionSounds(){
		
		let actions = ['CHIMES', 'CHONG', 'CHORD', 'DING', 'MOUSEDN', 'MOUSEDNH', 'MOUSEDNL', 'MOUSEUP', 'MOUSEUPH', 'MOUSEUPL'];

		for(let i in actions){

			let action = actions[i];

			let url = this.options.getMediaStorage();

			let path = url+'/storage/app/public/audio/ltkmedia/'+action+'.mp3';

			let a = new Howl({
				src: path,
				autoplay: false,
				preload: true
			});
			this.buffer.push(a);

		}

	}



}
