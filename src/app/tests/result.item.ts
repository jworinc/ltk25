import { Type } from '@angular/core';

export class ResultItem {
  
    public type: string;
    public presented: number;
    public wrong: number;
    public level: number;
    public details: any[];
    public description: string;

    constructor(type, description, presented, wrong, level, details) {
        this.type = type;
        this.presented = presented;
        this.wrong = wrong;
        this.level = level;
        this.description = description;
        let that = this;
        that.details = [];
        details.map((i)=>{ that.details.push(i); });
    }

    getSuccess() {
        return 100 - Math.round((this.wrong / this.presented) * 100);
    }

}