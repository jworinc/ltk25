import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'reverse' })

export class ReversePipe implements PipeTransform {
  transform(value) {
    let rev = [];
    value.forEach((sen)=>{
      rev.push(sen);
    });
    return rev.reverse();
  }
}
