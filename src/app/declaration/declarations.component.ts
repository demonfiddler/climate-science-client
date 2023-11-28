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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule, MatHint } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule, MatIcon } from '@angular/material/icon'; 

import { Person, Publication, Declaration, Quotation } from '../shared/data-model';
import { DeclarationDataSource } from './declaration-data-source';
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractTableComponent } from '../shared/abstract-table.component';
import { Master } from '../shared/utils';

/**
 * A component for displaying a paginated list of Declarations.
 */
@Component({
  selector: 'app-declarations',
  templateUrl: './declarations.component.html',
  styleUrls: ['./declarations.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class DeclarationsComponent extends AbstractTableComponent<Declaration> {
  @Input() person: Person;
  @Input() publication : Publication;
  @Input() quotation: Quotation;
  override dataSource: DeclarationDataSource;

  /**
   * Constructs a new DeclarationsComponent.
   * @param climateScienceService The injected climate science service.
   */
  constructor(protected override climateScienceService: ClimateScienceService) {
    super(climateScienceService);
    this.displayedColumns = ['TITLE', 'DATE', 'TYPE', 'COUNTRY'];
  }

  /**
   * @inheritdoc
   * @override
   */
  componentName() {
    return 'DeclarationsComponent';
  }

  /**
   * @inheritdoc
   * @override
   */
  override ngOnInit() {
    super.ngOnInit();
    this.dataSource = new DeclarationDataSource(this.climateScienceService);
    this.dataSource.loadDeclarations('', 0, 5);
  }

  /**
   * A change is relevant to the Declarations list if: the 'master' setting has changed or
   * master is set to 'PERSONS' and the selected person has changed.
   * @inheritdoc
   * @override
   */
  isRelevantChange(changes: SimpleChanges) : boolean {
    let relevant = 'master' in changes
      || this.master == Master.Persons && 'person' in changes;
    return relevant;
  }

  /**
   * Loads Declarations unconditionally if the 'master' setting is 'NONE' or 'DECLARATIONS'.
   * Loads Declarations by signatories if 'master' is set to 'PERSONS'.
   * Otherwise, clears the Declarations list.
   * @inheritdoc
   * @override
   */
  loadData(filter: string) {
    if (this.dataSource && this.master) {
      switch (this.master) {
        case Master.None:
        case Master.Declarations:
          this.dataSource.loadDeclarations(filter, this.paginator.pageIndex, this.paginator.pageSize);
          break;
        case Master.Persons:
          this.dataSource.loadDeclarationsBySignatory(this.getEntityId(this.person), this.getLastName(this.person), filter, this.paginator.pageIndex, this.paginator.pageSize);
          break;
        case Master.Publications:
        case Master.Quotations:
          this.dataSource.unload();
          break;
      }
    }
  }

}
