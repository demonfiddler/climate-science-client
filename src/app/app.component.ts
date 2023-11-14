/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, ViewChild } from '@angular/core';
import { MatRadioGroup } from '@angular/material/radio';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment as env } from '../environments/environment';
import { Person, Publication, Declaration, Quotation } from './shared/data-model';
import { Master } from './shared/utils';
import { ClimateScienceService } from './shared/climate-science.service';
import { LoginDialogComponent } from './login/login-dialog.component';

/**
 * The top-level application component. It supports four entity lists for Persons, Publications,
 * Declarations and Quotations, each with its own details component. The lists and detail views
 * are each contained within their own expandable panel. The lists may be linked in various ways
 * to reflect the relationships between the data.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  title? = 'app';

  @ViewChild('master') master : MatRadioGroup;
  @ViewChild('persons') personsExpander : MatExpansionPanel;
  @ViewChild('publications') publicationsExpander : MatExpansionPanel;
  @ViewChild('declarations') declarationsExpander : MatExpansionPanel;
  @ViewChild('quotations') quotationsExpander : MatExpansionPanel;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  person : Person;
  publication : Publication;
  declaration : Declaration;
  quotation : Quotation;

  constructor(public authService: ClimateScienceService, public dialog: MatDialog, private snackBar: MatSnackBar) {
    this.title = env.title;
  }

  /**
   * Registers a change event listener on the 'master' control, to expand or collapse the
   * appropriate panels according when the 'master' setting changes. For example, when 'master'
   * is set to a particular list, it expands that list's panel. Conversely, lists which
   * cannot behave as a detail view of the current master are disabled by the template
   * and programmatically collapsed here.
   * @inheritdoc
   * @override
   */
  ngAfterViewInit() {
    this.master.change.subscribe(change => {
      switch (change.value) {
        case Master.None:
          break;
        case Master.Persons:
          this.personsExpander.expanded = true;
          break;
        case Master.Publications:
          this.publicationsExpander.expanded = true;
          this.declarationsExpander.expanded = false;
          this.quotationsExpander.expanded = false;
          break;
        case Master.Declarations:
          this.declarationsExpander.expanded = true;
          this.publicationsExpander.expanded = false;
          this.quotationsExpander.expanded = false;
          break;
        case Master.Quotations:
          this.quotationsExpander.expanded = true;
          this.publicationsExpander.expanded = false;
          this.declarationsExpander.expanded = false;
          break;
      }
    });
    this.authService.loginChange.subscribe(loggedIn => this.openSnackBar("You are now logged " + (loggedIn ? "in" : "out"), undefined, 5));
  }

  /**
   * Presents a modal login dialog.
   */
  openLoginDialog() : void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.restoreFocus = false;
    const dialogRef = this.dialog.open(LoginDialogComponent, dialogConfig);
    dialogRef.componentInstance.dialogRef = dialogRef;

    // Manually restore focus to the menu trigger since the element that
    // opens the dialog won't be in the DOM any more when the dialog closes.
    dialogRef.afterClosed().subscribe(() => {
      // MatIcon doesn't have a focus method.
      // this.menuTrigger.focus();
    });
  }

  private openSnackBar(message: string, action?: string, duration?: number) : void {
    this.snackBar.open(message, action, duration ? {duration: duration * 1000, verticalPosition: 'top'} : undefined);
  }
}