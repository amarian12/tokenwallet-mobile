import { Injectable } from '@angular/core';
import { LogService } from './log.service';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
// import { MessageService } from 'primeng/components/common/messageservice';
// import { ElectronService } from './electron.service';

// var notifier = require('node-notifier');
// const path = require('path');

export enum SeverityType {
    info = 'Info',
    error = 'Error',
    warning = 'Warning'
}
export interface Callback {
  (smth?:any):any;
}

export interface NotificationType {
    severity?: SeverityType;
    title: string;
    body: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

    private messagesSubject = new Subject<NotificationType>();
    private nativeNotificationSupported: boolean;

    constructor(private router: Router,
                private logger: LogService,
                private localNotifications: LocalNotifications,
                public toast: ToastController
              ) {
        this.logger.debug('### INIT NotificationService');
        this.nativeNotificationSupported = false;
        // this.electronService.remote.Notification.isSupported();
        this.logger.debug('### NotificationService - Native Support?: ' + this.nativeNotificationSupported);
    }

    async addMessage(msg: NotificationType, callback?:Callback) {
        // it is an error
        let icon = "star";
        let color = "primary";
        if(msg.severity === SeverityType.error){
          icon = "alert";
          color = "danger";
        }
        if(msg.severity === SeverityType.warning){
          icon = "warning";
          color = "warning";
        }
        if(msg.severity === SeverityType.info){
          icon = "information-circle";
          color = "dark";
        }
        //it is a warning
        this.logger.debug('### NotificationService: ' + JSON.stringify(msg));

        const toast = await this.toast.create({
          header: msg.title,
          message: msg.body,
          color: color,
          position: 'top',
          duration: 5000,
          buttons: [
            {
              side: 'start',
              icon: icon,
              handler: () => {
                console.log('Favorite clicked');
              }
            }, {
              text: 'Ok',
              role: 'cancel',
              handler: () => {
                toast.dismiss();
              }
            }
          ]
        });
    
        toast.present();
        return await toast.onDidDismiss().then( data => {
           if(callback){
             return callback(data);
           }else{
             return data;
           }

        });

        this.logger.debug('### Toast notification sent');

        this.localNotifications.schedule([{
           // id: 1,
           foreground:true,
           icon:'res://ic_launcher',
           smallIcon:'res://ic_launcher',
           title: msg.title,
           text: msg.body
         }]);
        this.logger.debug('### Local notification sent');
        // this.electronService.ipcRenderer.send('push-notification', msg);
        /*let notificationOptions: NotificationOptions = {
            tag: "CasinoCoin",
            icon: path.join(__dirname, 'assets/brand/casinocoin-icon-256x256.png'),
            body: msg.body
        }
        let notification = new Notification(msg.title, notificationOptions);*/
    }
}
