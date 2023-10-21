/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list'; 
import { MatCardModule}  from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';

import { PersonsComponent } from './person/persons.component';
import { PersonDetailComponent } from './person/person-detail.component';
import { PublicationsComponent } from './publication/publications.component';
import { PublicationDetailComponent } from './publication/publication-detail.component';
import { DeclarationsComponent } from './declaration/declarations.component';
import { DeclarationDetailComponent } from './declaration/declaration-detail.component';
import { QuotationsComponent } from './quotation/quotations.component';
import { QuotationDetailComponent } from './quotation/quotation-detail.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
    MatDividerModule,
    MatRadioModule,
    MatTabsModule,
    MatTableModule,
    MatExpansionModule,
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
