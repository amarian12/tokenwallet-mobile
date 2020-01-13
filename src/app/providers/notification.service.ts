import { Injectable } from '@angular/core';
import { LogService } from './log.service';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
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
                private localNotifications: LocalNotifications
              ) {
        this.logger.debug('### INIT NotificationService');
        this.nativeNotificationSupported = false;
        // this.electronService.remote.Notification.isSupported();
        this.logger.debug('### NotificationService - Native Support?: ' + this.nativeNotificationSupported);
    }

    addMessage(msg: NotificationType) {
        this.logger.debug('### NotificationService: ' + JSON.stringify(msg));

        this.localNotifications.schedule([{
           id: 1,
           foreground:true,
           icon:'res://ic_launcher',
           smallIcon:'res://ic_launcher',
           title: msg.title,
           text: msg.body
         }]);
        this.logger.debug('### Push notification not send. It should be implemented on ionic');
        // this.electronService.ipcRenderer.send('push-notification', msg);
        /*let notificationOptions: NotificationOptions = {
            tag: "CasinoCoin",
            icon: path.join(__dirname, 'assets/brand/casinocoin-icon-256x256.png'),
            body: msg.body
        }
        let notification = new Notification(msg.title, notificationOptions);*/
    }
}
