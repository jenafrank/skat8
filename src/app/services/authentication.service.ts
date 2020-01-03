import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class AuthenticationService {

  provider: any;

  constructor(private afAuth: AngularFireAuth) { 
    this.provider = new firebase.auth.GoogleAuthProvider();    
  }

  login():void {
    this.afAuth.auth.signInWithPopup(this.provider);
  }

  logout():void {
    this.afAuth.auth.signOut();    
  }

  user(): any {
    return this.afAuth.auth.currentUser;
  }

  username(): string {
    return this.afAuth.auth.currentUser.displayName;
  }

  email(): string {
    return this.afAuth.auth.currentUser.email;
  }

  uid(): string {
    return this.afAuth.auth.currentUser.uid;
  }

}
