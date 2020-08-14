import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { auth as firebaseAuth } from 'firebase/app';

@Injectable()
export class AuthenticationService {

  constructor(private auth: AngularFireAuth) {
  }

  login(): void {
    this.auth.signInWithPopup(new firebaseAuth.GoogleAuthProvider());
  }

  logout(): void {
    this.auth.signOut();
  }

  user(): firebase.User {
    return firebase.auth().currentUser;
  }

  username(): string {
    return firebase.auth().currentUser.displayName;
  }

  email(): string {
    return firebase.auth().currentUser.email;
  }

  uid(): string {
    return firebase.auth().currentUser.uid;
  }

}
