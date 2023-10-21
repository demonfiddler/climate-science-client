/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, ViewChild } from '@angular/core';
import { MatRadioGroup } from '@angular/material/radio';
import { MatExpansionPanel } from '@angular/material/expansion';

import { Person, Publication, Declaration, Quotation } from './shared/data-model';
import { Master } from './shared/utils';

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

  @ViewChild('master') master : MatRadioGroup;
  @ViewChild('persons') personsExpander : MatExpansionPanel;
  @ViewChild('publications') publicationsExpander : MatExpansionPanel;
  @ViewChild('declarations') declarationsExpander : MatExpansionPanel;
  @ViewChild('quotations') quotationsExpander : MatExpansionPanel;

  person : Person;
  publication : Publication;
  declaration : Declaration;
  quotation : Quotation;

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
  }

}