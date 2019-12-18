import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router, UrlSegment, CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { AppflowService } from '../providers/appflow.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements  CanLoad {
  constructor(private appflow:AppflowService,
              private router: Router){}
  canLoad(
    route:Route,
    segments:UrlSegment[]
  ):Observable<boolean> | Promise<boolean> | boolean{
    if(!this.appflow.loggedIn){
      this.router.navigateByUrl('/login');
    }

    return this.appflow.loggedIn;
  }
}
