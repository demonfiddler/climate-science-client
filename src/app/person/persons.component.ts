/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, SimpleChanges } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { Person, Publication, Declaration, Quotation } from '../shared/data-model';
import { PersonDataSource } from './person-data-source';
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractTableComponent } from '../shared/abstract-table.component';
import { NgbRating } from '@ng-bootstrap/ng-bootstrap';
import { Master } from '../shared/utils';

/**
 * A component for displaying a paginated list of Persons.
 */
@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.css'],
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, MatPaginatorModule, MatProgressSpinnerModule, CommonModule, NgbRating],
})
export class PersonsComponent extends AbstractTableComponent<Person> {
  @Input() publication: Publication;
  @Input() declaration: Declaration;
  @Input() quotation: Quotation;

  override dataSource: PersonDataSource;

  /**
   * Constructs a new PersonsComponent.
   * @param climateScienceService The injected climate science service.
   */
  constructor(protected override climateScienceService: ClimateScienceService) {
    super(climateScienceService);
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
  ngOnInit() {
    this.dataSource = new PersonDataSource(this.climateScienceService);
    this.dataSource.loadPersons(0, 5);
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
    if (this.dataSource && this.master) {
      switch (this.master) {
        case Master.None:
        case Master.Persons:
          this.dataSource.loadPersons(this.paginator.pageIndex, this.paginator.pageSize);
          break;
        case Master.Publications:
          this.dataSource.loadPersonsByPublication(this.getEntityId(this.publication), this.paginator.pageIndex, this.paginator.pageSize);
          break;
        case Master.Declarations:
          this.dataSource.loadPersonsByDeclaration(this.getEntityId(this.declaration), this.paginator.pageIndex, this.paginator.pageSize);
          break;
        case Master.Quotations:
          this.dataSource.loadPerson(this.quotation ? this.quotation.PERSON_ID : undefined);
          break;
        }
    }
  }

}
