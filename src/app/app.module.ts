/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list'; 
import { MatCardModule}  from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PersonsComponent } from './person/persons.component';
import { PersonDetailComponent } from './person/person-detail.component';
import { PublicationsComponent } from './publication/publications.component';
import { PublicationDetailComponent } from './publication/publication-detail.component';
import { DeclarationsComponent } from './declaration/declarations.component';
import { DeclarationDetailComponent } from './declaration/declaration-detail.component';
import { QuotationsComponent } from './quotation/quotations.component';
import { QuotationDetailComponent } from './quotation/quotation-detail.component';
import { httpInterceptorProviders } from './shared/http-interceptors';

/**
 * The main application module.
 */
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatGridListModule,
    MatListModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
    MatInputModule,
    MatRadioModule,
    MatTabsModule,
    MatTableModule,
    MatExpansionModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    PersonsComponent,
    PersonDetailComponent,
    PublicationsComponent,
    PublicationDetailComponent,
    DeclarationsComponent,
    DeclarationDetailComponent,
    QuotationsComponent,
    QuotationDetailComponent,
    NgbModule,
  ],
  providers: [httpInterceptorProviders],
  bootstrap: [AppComponent],
})
export class AppModule { }
