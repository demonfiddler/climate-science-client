/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { catchError, finalize, of, tap } from 'rxjs';
import { Person } from "../shared/data-model";
import { AbstractDataSource } from "../shared/abstract-data-source";
import { ListConfig } from '../shared/list-config';

/**
 * A DataSource for fetching Persons from the back-end REST service.
 * @see {@link AbstractDataSource}
 * @see {@link Person}
 */
export class PersonDataSource extends AbstractDataSource<Person> {

  /**
   * Constructs a new PersonDataSource.
   * @param cfg The list configuration to control pagination, filtering and sorting.
   */
  constructor(cfg : ListConfig) {
    super(cfg);
  }

  /**
   * Loads the specified Person from the REST service.
   * @param personId The ID of the Person to load.
   */
  loadPerson(personId?: number) {
    if (personId) {
      this.loadingSubject.next(true);
      let subscription = this.cfg.api.getPersonById(personId)
        .pipe(
          // TODO: use MessagesService to show a closeable error popup.
          catchError(() => of([])),
          tap(result => this.countSubject.next(result ? 1 : 0)),
          finalize(() => {this.loadingSubject.next(false); subscription.unsubscribe()})
        )
        // Ditto re. instanceof and error TS2339.
        .subscribe(result => this.contentSubject.next(result instanceof Array ? [] : [result]));
    } else {
      this.unload();
    }
  }

  /**
   * Loads Persons from the REST service.
   */
  loadPersons() {
      this.loadingSubject.next(true);
      let subscription = this.cfg.api.findPersons(this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count)
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
   * Loads the Persons known to be authors of the specified Publication.
   * @param publicationId The ID of the specified Publication.
   */
  loadPersonsByPublication(publicationId : number|undefined) {
    if (publicationId) {
      this.loadingSubject.next(true);
      let subscription = this.cfg.api.findPersonsByPublication(publicationId, this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count)
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

  /**
   * Loads the Persons known to be signatories of the specified Declaration.
   * @param declarationId The ID of the specified Declaration.
   */
  loadPersonsByDeclaration(declarationId : number|undefined) {
    if (declarationId) {
      this.loadingSubject.next(true);
      let subscription = this.cfg.api.findPersonsByDeclaration(declarationId, this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count)
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