import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'bindhtml'
})
export class BindhtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }
  transform(value: any): any {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}
