import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[app-card]'
})
export class CardDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
