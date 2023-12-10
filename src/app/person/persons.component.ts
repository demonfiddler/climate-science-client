/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { environment as env } from '../../environments/environment';
import { Person, Publication, Declaration, Quotation } from '../shared/data-model';
import { PersonDataSource } from './person-data-source';
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractTableComponent } from '../shared/abstract-table.component';
import { NgbRating } from '@ng-bootstrap/ng-bootstrap';
import { Master } from '../shared/utils';
import * as paths  from '../shared/paths';

/**
 * A component for displaying a paginated list of Persons.
 */
@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    NgbRating,
  ],
})
export class PersonsComponent extends AbstractTableComponent<Person> {
  @Input() publication: Publication;
  @Input() declaration: Declaration;
  @Input() quotation: Quotation;

  override dataSource: PersonDataSource;

  /**
   * Constructs a new PersonsComponent.
   * @param api The injected climate science service.
   */
  constructor(public override api: ClimateScienceService) {
    super(api);
    this.displayedColumns = ['TITLE', 'FIRST_NAME', 'LAST_NAME', 'COUNTRY', 'RATING', 'PUBLISHED'];
  }

  /**
   * @inheritdoc
   * @override
   */
  componentName() {
    return 'PersonsComponent';
  }

  /**
   * @inheritdoc
   * @override
   */
  override ngOnInit() {
    this.dataSource = new PersonDataSource(this);
    super.ngOnInit();
  }

  /**
   * A change is relevant to the Persons list if: the 'master' setting has changed, or
   * 'master' is set to 'PUBLICATIONS' and the selected Publication has changed, or
   * 'master' is set to 'DECLARATIONS' and the selected Declaration has changed, or
   * 'master' is set to 'QUOTATIONS' and the selected Quotation has changed.
   * @inheritdoc
   * @override
   */
  isRelevantChange(changes: SimpleChanges) : boolean {
    let relevant = 'master' in changes
      || this.master == Master.Publications && 'publication' in changes
      || this.master == Master.Declarations && 'declaration' in changes
      || this.master == Master.Quotations && 'quotation' in changes;
    return relevant;
  }

  /**
   * Loads Persons unconditionally if the 'master' setting is 'NONE' or 'PERSONS'.
   * Loads Persons by Publication authorship if 'master' is set to 'PUBLICATIONS'.
   * Loads Persons by Declaration signatory if 'master' is set to 'DECLARATIONS'.
   * Loads a single Person by ID if 'master' is set to 'QUOTATIONS'.
   * @inheritdoc
   * @override
   */
  loadData() {
    console.log('PersonsComponent.loadData()');
    if (this.dataSource && this.master) {
      switch (this.master) {
        case Master.None:
        case Master.Persons:
          this.dataSource.loadPersons();
          break;
        case Master.Publications:
          this.dataSource.loadPersonsByPublication(this.getEntityId(this.publication));
          break;
        case Master.Declarations:
          this.dataSource.loadPersonsByDeclaration(this.getEntityId(this.declaration));
          break;
        case Master.Quotations:
          this.dataSource.loadPerson(this.quotation ? this.quotation.PERSON_ID : undefined);
          break;
        }
    }
  }

  /**
   * Returns the URL to download the current list in the specified format.
   * @param contentType The MIME content type to request.
   * @returns The requested download URL.
   */
  getDownloadUrl(contentType: string) : string {
    let url;
    if (this.master) {
      url = env.serviceUrl;
      let paramAdded = false;
      switch (this.master) {
        case Master.None:
        case Master.Persons:
          url += paths.PERSON_FIND;
          break;
        case Master.Publications:
          let publicationId = this.getEntityId(this.publication);
          url += `${paths.PERSON_FIND_BY_PUBLICATION}?publicationId=${publicationId}`;
          paramAdded = true;
          break;
        case Master.Declarations:
          let declarationId = this.getEntityId(this.declaration);
          url += `${paths.PERSON_FIND_BY_DECLARATION}?declarationId=${declarationId}`;
          paramAdded = true;
          break;
        case Master.Quotations:
          let personId = this.quotation ? this.quotation.PERSON_ID : undefined;
          url += `${paths.PERSON}/${personId}`;
          break;
      }
      if (this.filter) {
        let sep = paramAdded ? '&' : '?';
        url += `${sep}filter=${this.filter}`;
        paramAdded = true;
      }
      if (this.sort) {
        let sep = paramAdded ? '&' : '?';
        url += `${sep}sort=${this.sort}`;
        paramAdded = true;
      }
      let sep = paramAdded ? '&' : '?';
      url += `${sep}contentType=${contentType}`;
    } else {
      url = '';
    }
    return url;
  }

}
