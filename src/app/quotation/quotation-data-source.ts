/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { catchError, finalize, of, tap } from 'rxjs';
import { Quotation } from "../shared/data-model";
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractDataSource } from "../shared/abstract-data-source";

/**
 * A DataSource for fetching Quotations from the back-end REST service.
 * @see {@link AbstractDataSource}
 * @see {@link Quotation}
 */
export class QuotationDataSource extends AbstractDataSource<Quotation> {

  /**
   * Constructs a new QuotationDataSource.
   * @param climateScienceService The injected climate science service.
   */
  constructor(climateScienceService: ClimateScienceService) {
    super(climateScienceService);
  }

  /**
   * Loads Quotations from the REST service.
   * @param filter User-defined search string.
   * @param pageIndex The 0-based index of the page requested.
   * @param pageSize The number of items to load.
   */
  loadQuotations(filter: string, pageIndex = 0, pageSize = 10) {
      this.loadingSubject.next(true);

      let subscription = this.climateScienceService.findQuotations(filter, pageIndex * pageSize, pageSize)
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
   * Loads Quotations from (or possibly from) the specified Person.
   * @param personId The ID of the specified Person.
   * @param lastName The specified Person's last name.
   * @param filter User-defined search string.
   * @param pageIndex The 0-based index of the page requested.
   * @param pageSize The number of items to load.
   */
  loadQuotationsByAuthor(personId : number|undefined, lastName : string|undefined, filter: string, pageIndex = 0, pageSize = 10) {
    this.loadingSubject.next(true);

    if (this.climateScienceService.isLoggedOut())
      lastName = undefined;
    if (personId) {
      let subscription = this.climateScienceService.findQuotationsByAuthor(personId, lastName, filter, pageIndex * pageSize, pageSize)
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