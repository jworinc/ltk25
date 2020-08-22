import { Type } from '@angular/core';

export class ResultItem {
  
    public type: string;
    public inst: string;
    public presented: number;
    public wrong: number;
    public level: number;
    public details: any[];
    public description: string;
    public treshold: number;

    constructor(type, description, presented, wrong, level, details, treshold, inst='') {
        this.type = type;
        this.inst = inst;
        this.presented = presented;
        this.wrong = wrong;
        this.level = level;
        this.description = description;
        this.treshold = parseInt(treshold);
        let that = this;
        that.details = [];
        details.map((i)=>{ that.details.push(i); });
    }

    getSuccess() {
        let clear_success = Math.round(((this.presented - this.wrong) / this.presented) * 100);
        //  Success without treshold
        //let st = clear_success - this.treshold;
        //  Get percentage of corrected success, treshold correction
        //let r = 0;
        //if(st > 0) r = Math.round((st / (100 - this.treshold)) * 100);
        return clear_success;
    }

}