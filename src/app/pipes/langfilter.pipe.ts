import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'langfilter'
})
export class LangfilterPipe implements PipeTransform {

  transform(items: any, sku: any): any {

    if(!sku || !sku.languages) return items;
    let locales = [];
    sku.languages.split(",").map((l)=>{ locales.push(l.trim()) });
    return items.filter((item) => {
      let res = false;
      if(locales.indexOf(item.locale) !== -1) res = true;
      return res;
    });
  }

}
