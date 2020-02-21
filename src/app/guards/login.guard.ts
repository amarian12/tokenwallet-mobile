import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppflowService } from '../providers/appflow.service';
import { LogService } from '../providers/log.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements  CanActivate {
  constructor(private appflow:AppflowService,
              private logger: LogService,
              private router: Router){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      this.logger.debug("#### Login Guard ::: loggedIn?: "+this.appflow.loggedIn);
      this.logger.debug("#### Login Guard ::: Auth correct?: "+this.appflow.authCorrect);
    if(!this.appflow.authCorrect){

      this.logger.debug("#### Login guard Redirect to Login!");
      this.router.navigateByUrl('/login');
    }

    return this.appflow.authCorrect;
  }
}
