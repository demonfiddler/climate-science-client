/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { catchError, finalize, of, tap } from 'rxjs';
import { Publication } from "../shared/data-model";
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractDataSource } from "../shared/abstract-data-source";

/**
 * A DataSource for fetching Publications from the back-end REST service.
 * @see {@link AbstractDataSource}
 * @see {@link Publication}
 */
export class PublicationDataSource extends AbstractDataSource<Publication> {

  /**
   * Constructs a new PublicationDataSource.
   * @param climateScienceService The injected climate science service.
   */
  constructor(climateScienceService: ClimateScienceService) {
    super(climateScienceService);
  }

  /**
   * Loads Publications from the REST service.
   * @param filter User-defined search string.
   * @param pageIndex The 0-based index of the page requested.
   * @param pageSize The number of items to load.
   */
  loadPublications(filter: string, pageIndex = 0, pageSize = 10) {
      this.loadingSubject.next(true);

      let subscription = this.climateScienceService.findPublications(filter, pageIndex * pageSize, pageSize)
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
   * Loads the Publications that were (or may be) authored by the specified Person.
   * @param personId The ID of the specified Person.
   * @param lastName The specified Person's last name, matched against Publication authors.
   * @param filter User-defined search string.
   * @param pageIndex The 0-based index of the page requested.
   * @param pageSize The number of items to load.
   */
  loadPublicationsByAuthor(personId : number|undefined, lastName : string|undefined, filter: string, pageIndex = 0, pageSize = 10) {
    this.loadingSubject.next(true);

    if (personId) {
      let subscription = this.climateScienceService.findPublicationsByAuthor(personId, lastName, filter, pageIndex * pageSize, pageSize)
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