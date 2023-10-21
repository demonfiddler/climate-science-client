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
import { PublicationDataSource } from './publication-data-source';
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractTableComponent } from '../shared/abstract-table.component';
import { Master } from '../shared/utils';

/**
 * A component for displaying a paginated list of Publications.
 */
@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css'],
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, MatPaginatorModule, MatProgressSpinnerModule, CommonModule],
})
export class PublicationsComponent extends AbstractTableComponent<Publication> {

  @Input() person: Person;
  @Input() declaration: Declaration;
  @Input() quotation: Quotation;
  override dataSource: PublicationDataSource;

  /**
   * Constructs a new PublicationsComponent.
   * @param climateScienceService The injected climate science service.
   */
  constructor(protected override climateScienceService: ClimateScienceService) {
    super(climateScienceService);
    this.displayedColumns = ['TITLE', 'JOURNAL', 'PUBLICATION_TYPE_ID', 'PUBLICATION_YEAR', 'PEER_REVIEWED'];
  }

  /**
   * @inheritdoc
   * @override
   */
  componentName() {
    return 'PublicationsComponent';
  }

  /**
   * @inheritdoc
   * @override
   */
  ngOnInit() {
    this.dataSource = new PublicationDataSource(this.climateScienceService);
    this.dataSource.loadPublications(0, 5);
  }

  /**
   * A change is relevant to the Publications list if: the 'master' setting has changed, or
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
   * Loads Publications unconditionally if the 'master' setting is 'NONE' or 'PUBLICATIONS'.
   * Loads Publications by authorship if 'master' is set to 'PERSONS'.
   * Otherwise, clears the Publications list.
   * @inheritdoc
   * @override
   */
  loadData() {
    if (this.dataSource && this.master) {
      switch (this.master) {
        case Master.None:
        case Master.Publications:
          this.dataSource.loadPublications(this.paginator.pageIndex, this.paginator.pageSize);
          break;
        case Master.Persons:
          this.dataSource.loadPublicationsByAuthor(this.getEntityId(this.person), this.getLastName(this.person), this.paginator.pageIndex, this.paginator.pageSize);
          break;
        case Master.Declarations:
        case Master.Quotations:
          this.dataSource.unload();
          break;
      }
    }
  }

}
