import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from '../domains/app-constants';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletSetupGuard implements CanActivate {
  constructor(
    private router: Router,
    private localStorageService: LocalStorageService
  ){

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const walletAlreadySetup = this.localStorageService.get(AppConstants.KEY_SETUP_COMPLETED);
      console.log("!!!!!!!walletsetup?",walletAlreadySetup);
      if (!walletAlreadySetup){
        this.router.navigateByUrl('/wallet-setup')
      }
    return walletAlreadySetup;
    // return false;
  }

}
