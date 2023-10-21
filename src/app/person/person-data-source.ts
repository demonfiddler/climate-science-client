/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { catchError, finalize, of, tap } from 'rxjs';
import { Person } from "../shared/data-model";
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractDataSource } from "../shared/abstract-data-source";

/**
 * A DataSource for fetching Persons from the back-end REST service.
 * @see {@link AbstractDataSource}
 * @see {@link Person}
 */
export class PersonDataSource extends AbstractDataSource<Person> {

  /**
   * Constructs a new PersonDataSource.
   * @param climateScienceService The injected climate science service.
   */
  constructor(climateScienceService: ClimateScienceService) {
    super(climateScienceService);
  }

  /**
   * Loads the specified Person from the REST service.
   * @param personId The ID of the Person to load.
   */
  loadPerson(personId?: number) {
    this.loadingSubject.next(true);

    if (personId) {
      this.climateScienceService.getPersonById(personId)
        .pipe(
          // TODO: use MessagesService to show a closeable error popup.
          catchError(() => of([])),
          tap(result => this.countSubject.next(result ? 1 : 0)),
          finalize(() => this.loadingSubject.next(false))
        )
        // Ditto re. instanceof and error TS2339.
        .subscribe(result => this.contentSubject.next(result instanceof Array ? [] : [result]));
    } else {
      this.unload();
    }
  }

  /**
   * Loads Persons from the REST service.
   * @param pageIndex The 0-based index of the page requested.
   * @param pageSize The number of items to load.
   */
  loadPersons(pageIndex = 0, pageSize = 5) {
      this.loadingSubject.next(true);

      this.climateScienceService.findPersons(pageIndex * pageSize, pageSize)
        .pipe(
          // TODO: use MessagesService to show a closeable error popup.
          catchError(() => of([])),
          // The weird instanceof check is to circumvent compiler error TS2339 Property 'count' does not exist on type 'never[]'.
          tap(result => this.countSubject.next(result instanceof Array ? result.length : result.count)),
          finalize(() => this.loadingSubject.next(false))
        )
        // Ditto re. instanceof and error TS2339.
        .subscribe(result => this.contentSubject.next(result instanceof Array ? [] : result.records));
  }

  /**
   * Loads the Persons known to be authors of the specified Publication.
   * @param publicationId The ID of the specified Publication.
   * @param pageIndex The 0-based index of the page requested.
   * @param pageSize The number of items to load.
   */
  loadPersonsByPublication(publicationId? : number, pageIndex = 0, pageSize = 5) {
    this.loadingSubject.next(true);

    if (publicationId) {
      let subscription = this.climateScienceService.findPersonsByPublication(publicationId, pageIndex * pageSize, pageSize)
        .pipe(
          // TODO: use MessagesService to show a closeable error popup.
          catchError(() => of([])),
          // The weird instanceof check is to circumvent compiler error TS2339 Property 'count' does not exist on type 'never[]'.
          tap(result => this.countSubject.next(result instanceof Array ? result.length : result.count)),
          finalize(() => this.loadingSubject.next(false))
        )
        // Ditto re. instanceof and error TS2339.
        .subscribe(result => this.contentSubject.next(result instanceof Array ? [] : result.records));
    } else {
      this.unload();
    }
  }

  /**
   * Loads the Persons known to be signatories of the specified Declaration.
   * @param declarationId The ID of the specified Declaration.
   * @param pageIndex The 0-based index of the page requested.
   * @param pageSize The number of items to load.
   */
  loadPersonsByDeclaration(declarationId? : number, pageIndex = 0, pageSize = 5) {
    this.loadingSubject.next(true);

    if (declarationId) {
      let subscription = this.climateScienceService.findPersonsByDeclaration(declarationId, pageIndex * pageSize, pageSize)
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