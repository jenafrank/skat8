import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent, AppSeasonAdd, AppSeasonRemove } from './app.component';
import { environment } from "../environments/environment";

import { AngularFireModule } from "@angular/fire";
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from "@angular/fire/database";

import {
  MatToolbarModule, MatSelectModule, MatMenuModule,
  MatIconModule, MatButtonModule
} from "@angular/material";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';

import { RouterModule, Routes } from '@angular/router';
import { EditComponent } from './components/edit/edit.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { ReadComponent } from './components/read/read.component';
import { MatTableModule } from '@angular/material/table';
import { EditSpieltagComponent, AppGameRemove } from './components/edit-spieltag/edit-spieltag.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpieltagTableComponent } from './components/spieltag-table/spieltag-table.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AddGameComponent } from './components/add-game/add-game.component';
import { EditGameComponent } from './components/edit-game/edit-game.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { GalerieComponent } from './components/galerie/galerie.component';
import { MatRadioModule } from '@angular/material/radio';

const appRoutes: Routes = [
  {
    path: 'galerie',
    component: GalerieComponent
  },
  {
    path: 'read',
    component: ReadComponent
  },
  {
    path: 'edit',
    component: EditComponent
  },
  {
    path: 'edit/spieltag/:id',
    component: EditSpieltagComponent
  },
  {
    path: 'add_game',
    component: AddGameComponent
  },
  {
    path: 'edit_game',
    component: EditGameComponent
  },
  {
    path: '',
    redirectTo: '/read',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PagenotfoundComponent
  }
];

@NgModule({

  declarations: [

    AppComponent,
    EditComponent,
    PagenotfoundComponent,
    ReadComponent,
    EditSpieltagComponent,
    AppSeasonAdd,
    AppSeasonRemove,
    SpieltagTableComponent,
    AddGameComponent,
    EditGameComponent,
    AppGameRemove,
    GalerieComponent

  ],

  imports: [

    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // debug: true
    ),

    BrowserModule,
    BrowserAnimationsModule,
    
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    
    FlexLayoutModule,
    
    MatToolbarModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatGridListModule,
    MatCardModule,
    MatTableModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatTabsModule,
    MatExpansionModule,
    MatRadioModule],

  entryComponents: [
    AppSeasonAdd,
    AppSeasonRemove,
    AppGameRemove
  ],

  providers: [],
  bootstrap: [AppComponent]

})

export class AppModule { }
