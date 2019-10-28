import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-wallet-setup-modal',
  templateUrl: './wallet-setup-modal.component.html',
  styleUrls: ['./wallet-setup-modal.component.scss'],
})
export class WalletSetupModalComponent implements OnInit {

  @Input() modalContent: Object;

  constructor() { }

  ngOnInit() {}

}
