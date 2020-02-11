import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-store';
import { LogService } from '../providers/log.service';
import { AppConstants } from '../domains/app-constants';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackGuard implements  CanActivate{
  constructor(
    private router: Router,
    private logger: LogService,
    private localStorageService: LocalStorageService
  ){

  }
 canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      const walletAlreadySetup = this.localStorageService.get(AppConstants.KEY_SETUP_COMPLETED);
      this.logger.debug("#### BackGuard Wallet Setup is finished?: "+walletAlreadySetup);
      if (walletAlreadySetup){
        this.logger.debug("#### BackGuard redirect to /tabs: ");
        this.router.navigateByUrl('/tabs');
      }
      return !walletAlreadySetup;

  }
 // canLoad(
 //    route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean  {
 //
 //      const walletAlreadySetup = this.localStorageService.get(AppConstants.KEY_SETUP_COMPLETED);
 //      this.logger.debug("#### BackGuard Wallet Setup is finished?: "+walletAlreadySetup);
 //      if (walletAlreadySetup){
 //        this.router.navigateByUrl('/',{replaceUrl:true})
 //      }
 //      return !walletAlreadySetup;
 //
 //  }

}
