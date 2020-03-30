import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PickElementService {

  constructor() { }

  private lock_mouse_events: boolean = false;
  private current_click_element: any = null;
  private prev_click_element: any = null;
  public element_set = new EventEmitter<any>();

  mouseLock() {
    return this.lock_mouse_events;
  }

  setMouseLock() {
    this.lock_mouse_events = true;
    console.log((document as any).querySelector("body"));
    (document as any).querySelector("body").style.cursor = "pointer";
  }

  unsetMouseLock() {
    this.lock_mouse_events = false;
    (document as any).querySelector("body").style.cursor = "inherit";
  }

  setNewElement(el) {
    this.current_click_element = el;
    if(this.lock_mouse_events){
      console.log("New element selected ---->");
      console.log(el);
      this.pointNewElement(el);
    }
  }

  addElementAsSelected() {
    let pr = (document as any).querySelector("body #feedback-pick-element-hlight");
    if(pr) pr.remove();
    this.unsetMouseLock();
    this.element_set.emit(this.prev_click_element.outerHTML);
  }

  pointNewElement(el) {
    if(this.lock_mouse_events && this.prev_click_element !== el){
      this.prev_click_element = el;
      let pr = (document as any).querySelector("body #feedback-pick-element-hlight");
      if(pr) pr.remove();

      console.log("Point New element |>");
      console.log(el);

      //  Get rect
      let r = el.getBoundingClientRect();
      let padding = 8;
      //  Create element with above params
      let p = (document as any).createElement("div");
      p.style.display = 'block';
      p.style.position = 'fixed';
      p.style.top = (r.top - padding) + "px";
      p.style.left = (r.left - padding) + "px";
      p.style.width = (r.width + (padding*2)) + "px";
      p.style.height = (r.height + (padding*2)) + "px";
      p.style.backgroundColor = "rgba(0, 255, 0, 0.25)";
      p.style.borderStyle = "dotted";
      p.style.borderWidth = "2px";
      p.style.borderColor = "#00AA00";
      p.style.borderRadius = "3px";
      p.style.zIndex = 999999;

      p.setAttribute("id", "feedback-pick-element-hlight");

      //  Position setting for select button
      let tp = -8;
      let rt = -8;

      //  Check bordering
      if(r.top < 10) tp = (-1*(r.top - 12)) + tp;
      if(r.left + r.width + (padding*2) + 10 > (window as any).innerWidth) rt = (r.left + r.width + (padding*2)) - (window as any).innerWidth - 10;

      //  Create ready select button
      let b = (document as any).createElement("div");
      b.style.display = 'block';
      b.style.position = 'absolute';
      b.style.width = '19px';
      b.style.height = '19px';
      b.style.top = tp + 'px';
      b.style.right = rt + 'px';
      b.style.cursor = 'pointer';
      b.style.backgroundColor = '#0000AA';
      b.style.borderRadius = '3px';
      b.style.color = 'white';
      b.style.fontSize = '16px';
      b.style.lineHeight = '19px';
      b.style.textAlign = 'center';

      b.innerHTML = '<i class="fas fa-check"></i>';

      let that = this;
      b.onclick = () => {
        that.addElementAsSelected();
      }

      p.appendChild(b);
      (document as any).querySelector("body").appendChild(p);

    }
  }

}
