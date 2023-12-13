/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { catchError, finalize, of, tap } from 'rxjs';
import { Declaration } from "../shared/data-model";
import { AbstractDataSource } from "../shared/abstract-data-source";
import { ListConfig } from '../shared/list-config';

/**
 * A DataSource for fetching Declarations from the back-end REST service.
 * @see {@link AbstractDataSource}
 * @see {@link Declaration}
 */
export class DeclarationDataSource extends AbstractDataSource<Declaration> {

  /**
   * Constructs a new DeclarationDataSource.
   * @param cfg The list configuration to control pagination, filtering and sorting.
   */
  constructor(cfg : ListConfig) {
    super(cfg);
  }

  /**
   * Loads Declarations from the REST service.
   */
  loadDeclarations() {
    this.callApi(this.cfg.api.findDeclarations, true, this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count);
  }

  /**
   * Loads Declarations signed by the specified Person.
   * @param personId The ID of the person.
   * @param lastName The person's last name.
   */
  loadDeclarationsBySignatory(personId : number|undefined, lastName : string|undefined) {
    if (personId) {
      this.callApi(this.cfg.api.findDeclarationsBySignatory, true, personId, lastName, this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count);
    } else {
      this.unload();
    }
  }

}