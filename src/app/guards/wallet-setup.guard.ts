import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
// import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class WalletSetupGuard implements CanActivate {
  constructor(
    // private router: Router,
    // private storage: Storage
  ){

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      // const walletAlreadySetup = await this.storage.get('setupFinished');
    //   if (!walletAlreadySetup){
    //     //this.router.navigateByUrl('/wallet-setup')
    //   }
    // return walletAlreadySetup;
    return false;
  }

}
