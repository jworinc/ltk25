import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private iss = {
    login: 'https://api.ltk.cards/api/login',
    rellogin: 'https://api.ltk.cards/api/rel/login',
    signup: 'http://localhost:8000/api/signup',
    entrance: 'https://api.ltk.cards/api/entrance'
  };
<<<<<<< HEAD
=======
  
  private current_email = 'none';
  private current_name = '';
  private current_prof = '';
  private current_code = '';
  private current_type = '';

>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results

  constructor() { 
    this.iss.login = `${this.getApiUrl()}/login`;
    this.iss.rellogin = `${this.getApiUrl()}/rel/login`;
    this.iss.entrance = `${this.getApiUrl()}/entrance`;
  }

  handle(token) {
    this.set(token);
    console.log('Logged in: '+this.loggedIn());
  }

  set(token) {
    localStorage.setItem('token', token);
  }
  get() {
    return localStorage.getItem('token');
  }

<<<<<<< HEAD
=======
  
  setEmail(email, name='') {
    localStorage.setItem('email', email);
    if(name!=='') {
      localStorage.setItem('name', name);
      this.current_name = name;
    }
    this.current_email = email;
  }
  getEmail() {
    //return localStorage.getItem('email');
    let e = this.current_email;
    if(e == 'none' || e == '') e = localStorage.getItem('email');
    return e;
  }

  getName() {
    //return localStorage.getItem('email');
    return this.current_name;
  }

  setProf(prof) {
    localStorage.setItem('prof', prof);
    this.current_prof = prof;
  }
  getProf() {
    return this.current_prof;
  }

  setCode(code) {
    localStorage.setItem('pcmcode', code);
    this.current_code = code;
  }
  getCode() {
    
    let e = this.current_code;
    if(e == 'none' || e == '') e = localStorage.getItem('pcmcode');
    return e;
  }

  setType(type) {
    localStorage.setItem('testtype', type);
    this.current_type = type;
  }
  getType() {
    let e = this.current_type;
    if(e == 'none' || e == '') e = localStorage.getItem('testtype');
    return e;
  }


>>>>>>> 1b61e38... Test changes, routes, customizations, democodes, results
  getAuthHeader() {
    let t = this.get();
    return {'Authorization': `Bearer ${t}`};
  }

  remove() {
    localStorage.removeItem('token');
  }

  isValid() {
    const token = this.get();
    if (token) {
      const payload = this.payload(token);
      if (payload) {
        //console.log(payload);
        //"https://api.alexapp.pp.ua/api/entrance/BOu3Gcea3HvhNQNoFfm1u6ln72DdOqgXAy46uYjLlYEe99sT5uSrRBWLKKRbDnbtGC7dmALF8eA3XprB2whtl9TySSwktrvnyhjniXex3fOqh7vRRAuPOrf2CtmMKTrbl7ktLmfhEH8nlscvKcJEAQKOwyVuZs4BDUWXnOCfmd3dT4vgdIGxwD0bpPmjyoJ1Asxl"
        let r = /api\/entrance/ig;
        if(r.test(payload.iss)) payload.iss = this.iss['entrance'];
        let iss_valid = Object.values(this.iss).indexOf(payload.iss) > -1 ? true : false;
        let current_time = new Date().getTime()/1000;
        let exp_valid = current_time < payload.exp;
        return iss_valid && exp_valid;
      }
    }
    return false;
  }

  payload(token) {
    const payload = token.split('.')[1];
    return this.decode(payload);
  }

  decode(payload) {
    return JSON.parse(atob(payload));
  }

  loggedIn() {
    return this.isValid();
  }

  getApiUrl() {
  	return environment.baseApi;
  }


}
