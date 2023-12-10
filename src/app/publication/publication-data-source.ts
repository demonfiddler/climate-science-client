/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { catchError, finalize, of, tap } from 'rxjs';
import { Publication } from "../shared/data-model";
import { AbstractDataSource } from "../shared/abstract-data-source";
import { ListConfig } from '../shared/list-config';

/**
 * A DataSource for fetching Publications from the back-end REST service.
 * @see {@link AbstractDataSource}
 * @see {@link Publication}
 */
export class PublicationDataSource extends AbstractDataSource<Publication> {

  /**
   * Constructs a new PublicationDataSource.
   * @param cfg The list configuration to control pagination, filtering and sorting.
   */
  constructor(cfg : ListConfig) {
    super(cfg);
  }

  /**
   * Loads Publications from the REST service.
   */
  loadPublications() {
      this.loadingSubject.next(true);
      let subscription = this.cfg.api.findPublications(this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count)
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
   */
  loadPublicationsByAuthor(personId : number|undefined, lastName : string|undefined) {
    if (personId) {
      this.loadingSubject.next(true);
      let subscription = this.cfg.api.findPublicationsByAuthor(personId, lastName, this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count)
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