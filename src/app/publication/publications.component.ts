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
import { MatFormFieldModule, MatHint } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { environment as env } from '../../environments/environment';
import { Person, Publication, Declaration, Quotation } from '../shared/data-model';
import { PublicationDataSource } from './publication-data-source';
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractTableComponent } from '../shared/abstract-table.component';
import { Master } from '../shared/utils';
import * as paths  from '../shared/paths';

/**
 * A component for displaying a paginated list of Publications.
 */
@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css'],
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
  ],
})
export class PublicationsComponent extends AbstractTableComponent<Publication> {

  @Input() person: Person;
  @Input() declaration: Declaration;
  @Input() quotation: Quotation;
  override dataSource: PublicationDataSource;

  /**
   * Constructs a new PublicationsComponent.
   * @param api The injected climate science service.
   */
  constructor(public override api: ClimateScienceService) {
    super(api);
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
  override ngOnInit() {
    this.dataSource = new PublicationDataSource(this);
    super.ngOnInit();
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
          this.dataSource.loadPublications();
          break;
        case Master.Persons:
          this.dataSource.loadPublicationsByAuthor(this.getEntityId(this.person), this.getLastName(this.person));
          break;
        case Master.Declarations:
        case Master.Quotations:
          this.dataSource.unload();
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
        case Master.Publications:
          url += paths.PUBLICATION_FIND;
          break;
        case Master.Persons:
          let personId = this.getEntityId(this.person);
          let lastName = this.getLastName(this.person);
          url += `${paths.PUBLICATION_FIND_BY_AUTHOR}?personId=${personId}`;
          if (lastName)
            url += `&lastName=${lastName}`;
          paramAdded = true;
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
