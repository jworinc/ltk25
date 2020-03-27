import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PickElementService {

  constructor() { }

  private lock_mouse_events: boolean = false;
  

  mouseLock() {
    return this.lock_mouse_events;
  }

  setMouseLock() {
    this.lock_mouse_events = true;
  }

  unsetMouseLock() {
    this.lock_mouse_events = false;
  }

}
