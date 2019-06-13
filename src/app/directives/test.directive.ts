import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[app-test]'
})
export class TestDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
