/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { catchError, finalize, of, tap } from 'rxjs';
import { Declaration } from "../shared/data-model";
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractDataSource } from "../shared/abstract-data-source";

/**
 * A DataSource for fetching Declarations from the back-end REST service.
 * @see {@link AbstractDataSource}
 * @see {@link Declaration}
 */
export class DeclarationDataSource extends AbstractDataSource<Declaration> {

  /**
   * Constructs a new DeclarationDataSource.
   * @param climateScienceService The injected climate science service.
   */
  constructor(climateScienceService: ClimateScienceService) {
    super(climateScienceService);
  }

  /**
   * Loads Declarations from the REST service.
   * @param filter User-defined search string.
   * @param pageIndex The 0-based index of the page requested.
   * @param pageSize The number of items to load.
   */
  loadDeclarations(filter: string, pageIndex : number, pageSize : number) {
      this.loadingSubject.next(true);

      let subscription = this.climateScienceService.findDeclarations(filter, pageIndex * pageSize, pageSize)
        .pipe(
          // TODO: use MessagesService to show a closeable error popup.
          catchError(() => of([])),
          // The weird instanceof check is to circumvent compiler error TS2339 Property 'count' does not exist on type 'never[]'.
          tap(result => this.countSubject.next(result instanceof Array ? result.length : result.count)),
          finalize(() => {this.loadingSubject.next(false); subscription.unsubscribe()})
        )
        // Ditto re. instanceof and error TS2339.
        .subscribe(result => this.contentSubject.next(result instanceof Array ? [] : result.records));
  }

  /**
   * Loads Declarations signed by the specified Person.
   * @param personId The ID of the person.
   * @param lastName The person's last name.
   * @param filter User-defined search string.
   * @param pageIndex The 0-based index of the page requested.
   * @param pageSize The number of items to load.
   */
  loadDeclarationsBySignatory(personId : number|undefined, lastName : string|undefined, filter: string, pageIndex : number, pageSize : number) {
    this.loadingSubject.next(true);

    if (this.climateScienceService.isLoggedOut())
      lastName = undefined;
    if (personId) {
      let subscription = this.climateScienceService.findDeclarationsBySignatory(personId, lastName, filter, pageIndex * pageSize, pageSize)
        .pipe(
          // TODO: use MessagesService to show a closeable error popup.
          catchError(() => of([])),
          // The weird instanceof check is to circumvent compiler error TS2339 Property 'count' does not exist on type 'never[]'.
          tap(result => this.countSubject.next(result instanceof Array ? result.length : result.count)),
          finalize(() => {this.loadingSubject.next(false); subscription.unsubscribe()})
        )
        // Ditto re. instanceof and error TS2339.
        .subscribe(result => this.contentSubject.next(result instanceof Array ? [] : result.records));
    } else {
      this.unload();
    }
  }

}