import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByArray'
})
export class FilterByArrayPipe implements PipeTransform {

  transform(items: any[], term: any[]): any {
    return items.filter((item) => {
      let res = false;
      let imi = parseInt(item.menu_id);
      if(term.indexOf(imi) !== -1) res = true;
      return res;
    });
  }

}
