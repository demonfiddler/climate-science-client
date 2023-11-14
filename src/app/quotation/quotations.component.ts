/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule, MatHint } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule, MatIcon } from '@angular/material/icon'; 

import { Person, Quotation } from '../shared/data-model';
import { QuotationDataSource } from './quotation-data-source';
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractTableComponent } from '../shared/abstract-table.component';
import { Master } from '../shared/utils';

/**
 * A component for displaying a paginated list of Quotations.
 */
@Component({
  selector: 'app-quotations',
  templateUrl: './quotations.component.html',
  styleUrls: ['./quotations.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class QuotationsComponent extends AbstractTableComponent<Quotation> {
  @Input() person: Person;
  override dataSource: QuotationDataSource;

  /**
   * Constructs a new QuotationsComponent.
   * @param climateScienceService The injected climate science service.
   */
  constructor(protected override climateScienceService: ClimateScienceService) {
    super(climateScienceService);
    this.displayedColumns = ['AUTHOR', 'DATE', 'SOURCE'];
  }

  /**
   * @inheritdoc
   * @override
   */
  componentName() {
    return 'QuotationsComponent';
  }

  /**
   * @inheritdoc
   * @override
   */
  override ngOnInit() {
    super.ngOnInit();
    this.dataSource = new QuotationDataSource(this.climateScienceService);
    this.dataSource.loadQuotations('', 0, 5);
  }

  /**
   * A change is relevant to the Quotations list if: the 'master' setting has changed, or
   * 'master' is set to 'PERSONS' and the selected Person has changed.
   * @inheritdoc
   * @override
   */
  isRelevantChange(changes: SimpleChanges) : boolean {
    let relevant = 'master' in changes
      || this.master == Master.Persons && 'person' in changes;
    return relevant;
  }

  /**
   * Loads Quotations unconditionally if the 'master' setting is 'NONE' or 'QUOTATIONS'.
   * Loads Quotations by authorship if 'master' is set to 'PERSONS'.
   * Otherwise, clears the Quotations list.
   * @inheritdoc
   * @override
   */
  loadData(filter: string) {
    if (this.dataSource && this.master) {
      switch (this.master) {
        case Master.None:
        case Master.Quotations:
          this.dataSource.loadQuotations(filter, this.paginator.pageIndex, this.paginator.pageSize);
          break;
        case Master.Persons:
          this.dataSource.loadQuotationsByAuthor(this.getEntityId(this.person), this.getLastName(this.person), filter, this.paginator.pageIndex, this.paginator.pageSize);
          break;
        case Master.Publications:
        case Master.Declarations:
          this.dataSource.unload();
          break;
      }
    }
  }

}
