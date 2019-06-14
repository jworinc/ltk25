import { Injectable } from '@angular/core';
import { CardItem } from '../card-item';
import { Al1Component } from '../activities/al1/al1.component';
import { CarComponent } from '../activities/car/car.component';
import { Al2Component } from '../activities/al2/al2.component';
import { Ar1Component } from '../activities/ar1/ar1.component';
import { Ar2Component } from '../activities/ar2/ar2.component';
import { Ar3Component } from '../activities/ar3/ar3.component';
import { Ar4Component } from '../activities/ar4/ar4.component';
import { Ar5Component } from '../activities/ar5/ar5.component';
import { Ar6Component } from '../activities/ar6/ar6.component';
import { Or1Component } from '../activities/or1/or1.component';
import { Or2Component } from '../activities/or2/or2.component';
import { Or3Component } from '../activities/or3/or3.component';
import { Or4Component } from '../activities/or4/or4.component';
import { Bw1Component } from '../activities/bw1/bw1.component';
import { Bw2Component } from '../activities/bw2/bw2.component';
import { Bw3Component } from '../activities/bw3/bw3.component';
import { Bw5Component } from '../activities/bw5/bw5.component';
import { Bw6Component } from '../activities/bw6/bw6.component';
import { Bw7Component } from '../activities/bw7/bw7.component';
import { SypComponent } from '../activities/syp/syp.component';
import { DiwComponent } from '../activities/diw/diw.component';
import { GscComponent } from '../activities/gsc/gsc.component';
import { Rp1Component } from '../activities/rp1/rp1.component';
import { Rp2Component } from '../activities/rp2/rp2.component';
import { GwmComponent } from '../activities/gwm/gwm.component';
import { SiwComponent } from '../activities/siw/siw.component';
import { GwfComponent } from '../activities/gwf/gwf.component';
import { GqwComponent } from '../activities/gqw/gqw.component';
import { DisComponent } from '../activities/dis/dis.component';
import { SplComponent } from '../activities/spl/spl.component';
import { GdnComponent } from '../activities/gdn/gdn.component';
import { GcpComponent } from '../activities/gcp/gcp.component';
import { GcsComponent } from '../activities/gcs/gcs.component';
import { GisComponent } from '../activities/gis/gis.component';
import { GmuComponent } from '../activities/gmu/gmu.component';
import { GnbComponent } from '../activities/gnb/gnb.component';
import { GslComponent } from '../activities/gsl/gsl.component';
import { GsmComponent } from '../activities/gsm/gsm.component';
import { GssComponent } from '../activities/gss/gss.component';
import { Rw1Component } from '../activities/rw1/rw1.component';
import { IdmComponent } from '../activities/idm/idm.component';
import { Wl1Component } from '../activities/wl1/wl1.component';
import { Bs1Component } from '../activities/bs1/bs1.component';
import { CccComponent } from '../activities/ccc/ccc.component';
 
@Injectable({
  providedIn: 'root'
})
export class CardbuilderService {

  constructor() { }

  getCards(data) {

    let out = [];

    for(let i in data){

      let c = data[i];

      if(c.type === 'al1') out.push(new CardItem(Al1Component, c));
      if(c.type === 't1') out.push(new CardItem(CarComponent, c));
      if(c.type === 'al2') out.push(new CardItem(Al2Component, c));
      if(c.type === 'ar1') out.push(new CardItem(Ar1Component, c));
      if(c.type === 'ar2') out.push(new CardItem(Ar2Component, c));
      if(c.type === 'ar3') out.push(new CardItem(Ar3Component, c));
      if(c.type === 'ar4') out.push(new CardItem(Ar4Component, c));
      if(c.type === 'ar5') out.push(new CardItem(Ar5Component, c));
      if(c.type === 'ar6') out.push(new CardItem(Ar6Component, c));
      if(c.type === 'or1') out.push(new CardItem(Or1Component, c));
      if(c.type === 'or2') out.push(new CardItem(Or2Component, c));
      if(c.type === 'or3') out.push(new CardItem(Or3Component, c));
      if(c.type === 'or4') out.push(new CardItem(Or4Component, c));
      if(c.type === 'bw1') out.push(new CardItem(Bw1Component, c));
      if(c.type === 'bw2') out.push(new CardItem(Bw2Component, c));
      if(c.type === 'bw3') out.push(new CardItem(Bw3Component, c));
      if(c.type === 'bw5') out.push(new CardItem(Bw5Component, c));
      if(c.type === 'bw6') out.push(new CardItem(Bw6Component, c));
      if(c.type === 'bw7') out.push(new CardItem(Bw7Component, c));
      if(c.type === 'syp') out.push(new CardItem(SypComponent, c));
      if(c.type === 'diw') out.push(new CardItem(DiwComponent, c));
      if(c.type === 'gsc') out.push(new CardItem(GscComponent, c));
      if(c.type === 'rp1') out.push(new CardItem(Rp1Component, c));
      if(c.type === 'rp2') out.push(new CardItem(Rp2Component, c));
      if(c.type === 'gwm') out.push(new CardItem(GwmComponent, c));
      if(c.type === 'siw') out.push(new CardItem(SiwComponent, c));
      if(c.type === 'gwf') out.push(new CardItem(GwfComponent, c));
      if(c.type === 'gqw') out.push(new CardItem(GqwComponent, c));
      if(c.type === 'dis') out.push(new CardItem(DisComponent, c));
      if(c.type === 'spl') out.push(new CardItem(SplComponent, c));
      if(c.type === 'gdn') out.push(new CardItem(GdnComponent, c));
      if(c.type === 'gcp') out.push(new CardItem(GcpComponent, c));
      if(c.type === 'gcs') out.push(new CardItem(GcsComponent, c));
      if(c.type === 'gis') out.push(new CardItem(GisComponent, c));
      if(c.type === 'gmu') out.push(new CardItem(GmuComponent, c));
      if(c.type === 'gnb') out.push(new CardItem(GnbComponent, c));
      if(c.type === 'gsl') out.push(new CardItem(GslComponent, c));
      if(c.type === 'gsm') out.push(new CardItem(GsmComponent, c));
      if(c.type === 'gss') out.push(new CardItem(GssComponent, c));
      if(c.type === 'rw1') out.push(new CardItem(Rw1Component, c));
      if(c.type === 'idm') out.push(new CardItem(IdmComponent, c));
      if(c.type === 'wl1') out.push(new CardItem(Wl1Component, c));
      if(c.type === 'bs1') out.push(new CardItem(Bs1Component, c));
      if(c.type === 'ccc') out.push(new CardItem(CccComponent, c));
    }

    return out;

  }

}
