import { Directive, ElementRef, Input } from '@angular/core';
import { DataloaderService } from '../services/dataloader.service';
import { TranslateService } from '@ngx-translate/core';
import { PlaymediaService } from '../services/playmedia.service';
import { PickElementService } from '../services/pick-element.service';

@Directive({
  selector: '[appWordtranslate]'
})
export class WordtranslateDirective {

  constructor(private dl: DataloaderService, 
              private el: ElementRef, 
              private translation: TranslateService, 
              private pms: PlaymediaService,
              private pe: PickElementService) {
    let that = this;
    setTimeout(()=>{
      that.initTranslation();
    }, 500);
  }

  public innerText = '';
  public word_translation: any = null;
  public trelm: any = null;
  public in_translation: boolean = false;
  public current_word: string = '';
  public clear_show_timer: any = null;
  public dynamic_change: string = '';
  private position_class = '';
  public icon_hide: boolean = false;

  @Input() iconPosition: string;
  @Input()
  set iconHide(iconHide: boolean) {
    this.checkIfHide(iconHide);
    this.icon_hide = iconHide;
  }

  checkIfHide(iconHide){
    let t = this.el.nativeElement.querySelector("div");
    if(iconHide) {
      if(t) t.classList.add("translation-icon-hide");
    } else {
      if(t) t.classList.remove("translation-icon-hide");
    }
  }

  initTranslation() {
    let that = this;
    //this.innerText = this.el.nativeElement.innerHTML;

    if(typeof this.iconPosition !== 'undefined') this.position_class = "-"+this.iconPosition;

    this.el.nativeElement.classList.add("translainable-word"+this.position_class);
    
    this.dynamic_change = this.el.nativeElement.innerText;

    this.el.nativeElement.addEventListener('mouseleave', ()=>{
        //that.clearTranslationPopup();
    });

    this.el.nativeElement.addEventListener('touchend', ()=>{
      //that.clearTranslationPopup();
    });

    this.el.nativeElement.addEventListener('mouseover', ()=>{
      that.checkForDynamicChanges();
    });

    this.el.nativeElement.addEventListener('touchstart', ()=>{
      that.checkForDynamicChanges();
    });

    this.addTranslationIcon();

    //setTimeout(()=>{
		//	that.bindWordplayClickEvent();
		//}, 10);
  }

  addPointerSign() {
    
    let pointer = document.createElement("span");
    pointer.classList.add("translate-pointer");

    this.trelm.appendChild(pointer);
    setTimeout(()=>{ pointer.style.top = '60%'; }, 10);
  }

  addTranslationIcon() {
    let that = this;
    let parent = document.createElement("div");
    parent.innerText = "?";
    parent.setAttribute('title', this.translation.instant('click_to_see_translation'));

    this.el.nativeElement.appendChild(parent);

    parent.addEventListener('click', (e)=>{

      //	If mouse event locked by feedback
      if(that.pe.mouseLock()) return;
      that.clickToSeeTranslation.call(that, e);
    });
    parent.addEventListener('touchstart', (e)=>{
      //	If mouse event locked by feedback
      if(that.pe.mouseLock()) return;
      that.clickToSeeTranslation.call(that, e);
    });

    this.trelm = parent;
    /*
    this.trelm.addEventListener('mouseleave', ()=>{
      clearTimeout(that.clear_show_timer);
      that.clear_show_timer = setTimeout(()=>{
        that.clearTranslationPopup();
      }, 1000);
    });

    this.trelm.addEventListener('touchend', ()=>{
      clearTimeout(that.clear_show_timer);
      that.clear_show_timer = setTimeout(()=>{
        that.clearTranslationPopup();
      }, 1000);
    });
    */
  }

  checkForDynamicChanges() {
    if(this.el.nativeElement.querySelectorAll('div').length === 0) this.addTranslationIcon();
    if(typeof this.icon_hide !== 'undefined'){
      this.checkIfHide(this.icon_hide);
    }
    //	RegExp for seaching HTML tags in text
		let html = /<[\w\s\d=\"\;\:\-\.\/\%\_]*>[\w\s\d=\"\;\:\-\.\/\?\!\,\|\u0000-\uffff]*<\/[\w\s\d=\"\;\:\-\.\/]*>/ig;
    if(typeof this.trelm !== 'undefined' && this.trelm.innerText !== "" && this.current_word.trim() !== this.el.nativeElement.innerHTML.replace(html, '').trim()){
      this.clearTranslationPopup();
    }
  }

  clearTranslationPopup() {
    let that = this;
    that.trelm.innerHTML = "";
    that.trelm.innerText = "?";
    that.trelm.classList.remove("translation-expand"+this.position_class);
    that.in_translation = false;
  }


	setTranslationPopup(content, word) {
		document.querySelectorAll('.translate-popup-expanded').forEach((el)=>{
			el.remove();
		});
		// Find root node for popup
		let rootclass = 'card-block-item';
		let rootn = null;
    let next_node = this.trelm.parentNode;
    if(!next_node) return;
		for(let i = 0; i < 10; i++) {
			if(!next_node.classList.contains(rootclass)) {
				next_node = next_node.parentNode;
			} else {
				rootn = next_node;
				break;
			}
		}

		//	Create popup element
		let pp = document.createElement("div");
		pp.classList.add("translate-popup-init");
		setTimeout(()=>{ pp.classList.add("translate-popup-expanded"); }, 10);
		//setTimeout(()=>{ pp.innerText = content; }, 100);

		//	Create header
		let hh = document.createElement("h3");
		hh.innerText = word;
		pp.appendChild(hh);

		//	Create content
		let cn = document.createElement("span");
		cn.innerHTML = content;
		pp.appendChild(cn);
		let that = this;
		pp.onclick = (e)=>{
      //	If mouse event locked by feedback
      if(that.pe.mouseLock()) return;
			e.stopPropagation();
			e.preventDefault();
			pp.remove();
			document.querySelectorAll('.translate-popup-expanded').forEach((el)=>{
				el.remove();
			});
		}
		rootn.appendChild(pp);

	}

	showTranslation(translation, word) {
		if(translation.length < 2){
			this.trelm.innerHTML = "";
			this.trelm.innerText = translation;
			this.addPointerSign();
		} else {
			this.setTranslationPopup(translation, word);
			this.trelm.classList.remove("translation-expand");
			this.trelm.innerHTML = "?";
		}
	}


  clickToSeeTranslation(e) {
    e.stopPropagation();
    e.preventDefault();
    document.querySelectorAll('.translate-popup-expanded').forEach((el)=>{
			el.remove();
		});
    let that = this;
    this.in_translation = true;
    this.innerText = this.el.nativeElement.innerText.slice(0, -1);
    clearTimeout(that.clear_show_timer);
    if(this.word_translation && this.current_word === this.innerText) {
      setTimeout(()=>{
        that.trelm.classList.add("translation-expand"+this.position_class);
        setTimeout(()=>{
          if(that.in_translation){
						that.showTranslation(that.word_translation.translation, that.innerText);
					}
        }, 200);
      }, 10);
      
    } else {
      that.trelm.innerText = ".";
      this.innerText = this.el.nativeElement.innerText.slice(0, -1);
      this.current_word = this.innerText;
      if(this.innerText === "") return;
      this.dl.getTranslation(this.innerText).then((data)=>{
        if(typeof data === 'undefined') return;
        that.word_translation = data;
        console.log(data);
        if(that.in_translation){
          that.showTranslation(that.word_translation.translation, that.innerText);
        }


      });
      console.log(this.innerText);

      //  Change translation element to loading
      this.trelm.innerHTML = "";
      let load = document.createElement("span");
      load.innerHTML = "<img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMic+PGxpbmVhckdyYWRpZW50IGlkPSdGYXN0TG9hZGluZ0luZGljYXRvci1saW5lYXJHcmFkaWVudCcgZ3JhZGllbnRVbml0cz0ndXNlclNwYWNlT25Vc2UnIHgxPScxLjc4MDQnIHkxPScxNi4wMzc5JyB4Mj0nMzAuMTQzOScgeTI9JzE2LjAzNzknPjxzdG9wIG9mZnNldD0nMC40MTY5JyBzdG9wLWNvbG9yPScjQ0RDRkQyJy8+PHN0b3Agb2Zmc2V0PScwLjkzNzYnIHN0b3AtY29sb3I9J3JnYmEoMjQ4LDI0OCwyNDksMCknLz48L2xpbmVhckdyYWRpZW50PjxjaXJjbGUgY3g9JzE2JyBjeT0nMTYnIHI9JzEyLjcnIHN0eWxlPSdmaWxsOiBub25lOyBzdHJva2U6IHVybCgjRmFzdExvYWRpbmdJbmRpY2F0b3ItbGluZWFyR3JhZGllbnQpOyBzdHJva2Utd2lkdGg6IDI7Jz48L2NpcmNsZT48L3N2Zz4=' alt='' style='' />";
      setTimeout(()=>{ 
        that.trelm.classList.add("translation-expand"+this.position_class); 
      }, 20);
      setTimeout(()=>{ 
        that.trelm.appendChild(load); 
      }, 40);
    }
    
    //this.trelm.appendChild(load);
    
  }

  bindWordplayClickEvent(){

		let that = this;

	}

}
