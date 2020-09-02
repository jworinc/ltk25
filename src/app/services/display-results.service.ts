import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DisplayResultsService {

  constructor() { }

  //  Wrong answers
  public wrong: number = 0;
  //  Right answers
  public right: number = 0;
  //  Praise phrase
  public praise: string = '';

  public goodScorePraising = [
      "Good Job!", 
      "Wonderful!", 
      "Outstanding!"
  ];
  public badScorePraising = [
      "Let's try harder",
      "Let's work harder",
      "Keep trying",
  ];

  /**
   * Check if any results exists
   * Not all activities uses results, this method helps to define if display result
   * is needed. In general result displays on a conclusion card
   */
  isEmpty() {
    if(this.praise == '' && this.right == 0 && this.wrong == 0) return true;
    else return false;
  }

  /**
   * Clear current results
   */
  clear() {
    this.praise = '';
    this.right = 0;
    this.wrong = 0;
  }

  /**
   * Set praise phrase according to current results
   */
  setPraise() {
    if (this.right / (this.right + this.wrong) >= 0.7) {
      this.praise = this.goodScorePraising[
          Math.floor(Math.random() * this.goodScorePraising.length)
      ];
    } else {
      this.praise = this.badScorePraising[
          Math.floor(Math.random() * this.badScorePraising.length)
      ];
    }
  }

  /**
   * Set current result
   */
  setResult(r, w) {
    this.right = r;
    this.wrong = w;
    this.setPraise();
  }


}
