import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  displayCustomPin = false;
  loginDisable = false;
  loginEntry = false;

  constructor() { }

  ngOnInit() {

  }
  enterPIN(){

  }
  forgotPin(){

  }

  handlePinInput(key){
    // key entered
  }
  cancelPin(){

  }
  backspacePin(){

  }

}
