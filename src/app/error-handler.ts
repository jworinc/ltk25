import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { ErrorLogService } from './services/error-log.service';
import { ActivatedRoute } from '@angular/router';
import { DataloaderService } from './services/dataloader.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private lcn: Location, private injector: Injector) { }
  handleError(error) {
    console.log('Error catched!');
    console.log({error: error, path: this.lcn.path()});

    const loggingService = this.injector.get(ErrorLogService);
    const router = this.injector.get(ActivatedRoute);
    const dl = this.injector.get(DataloaderService);
    const message = error.message ? error.message : error.toString();
    const stack = error.stack ? error.stack : 'none';
    let reference = 'none';
    
    //  Try to get descriptor
    let current_component = "none";
    if(router.children.length > 0) current_component = (router.children[0].component as any).name;
    if(current_component === 'LessonComponent'){
        reference = dl.card_descriptor;
    }


    // log on the server
    loggingService.log({ 
        message: message, 
        stack: stack, 
        path: this.lcn.path(), 
        reference: "Component: "+current_component+"; Decriptor: "+reference
    }).then(()=>{
        console.log("Error saved!");
    });

    //console.log(reference);

    // IMPORTANT: Rethrow the error otherwise it gets swallowed
    //throw error;
    alert("Oops, something went wrong! We will try to help you soon. Sorry for inconvenience.");


  }
  
}