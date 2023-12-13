/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject, catchError, finalize, of, tap, Subscription } from 'rxjs';

import { ListConfig } from './list-config';
import { ClimateScienceService } from "./climate-science.service";
import { ResultSet } from './data-model';

/**
 * An abstract DataSource base class for interacting with the back-end REST service.
 * The implementation provides {@link Subject}s for receiving async notifications of loading, item count and content.
 */
export abstract class AbstractDataSource<T> implements DataSource<T> {

  protected cfg : ListConfig;
  protected countSubject = new BehaviorSubject<number>(0);
  protected contentSubject = new BehaviorSubject<T[]>([]);
  protected loadingSubject = new BehaviorSubject<boolean>(false);
  public count$ = this.countSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Constructs a new AbstractDataSource.
   * @param cfg The list configuration to control pagination, filtering and sorting.
   */
  constructor(cfg : ListConfig) {
    this.cfg = cfg;
  }

  /** @override */
  connect(collectionViewer: CollectionViewer): Observable<T[]> {
      return this.contentSubject.asObservable();
  }

  /** @override */
  disconnect(collectionViewer: CollectionViewer): void {
    this.countSubject.complete();
    this.contentSubject.complete();
    this.loadingSubject.complete();
  }

  private complete(subscription : Subscription) {
    this.loadingSubject.next(false);
    subscription.unsubscribe();
  }

  /**
   * Invokes a REST API method, managing the 'busy' state.
   * @param method The API method to invoke.
   * @param args The arguments to pass to the API.
   */
  callApi(method: (...a : any[]) => Observable<any>, multi : boolean, ...args: any[]) {
    this.loadingSubject.next(true);
    let subscription = method.apply<ClimateScienceService, any[], Observable<ResultSet<T>>>(this.cfg.api, args)
      .subscribe(
        {
          next: (result) => {
            let count : number;
            let records : T[];
            if (multi) {
              let rs = result as ResultSet<T>;
              count = rs.count;
              records = rs.records;
            } else {
              let t = result as T;
              count = result ? 1 : 0;
              records = [t];
            }
            this.countSubject.next(count);
            this.contentSubject.next(records);
          },
          error: (err) => {
            this.cfg.onError(err);
            this.complete(subscription);
          },
          complete: () => {
            // this.loadingSubject.next(false);
            // subscription.unsubscribe();
            this.complete(subscription);
          }
        } 
      );
  }

  /**
   * Loads an empty data set.
   */
  unload() {
    this.countSubject.next(0);
    this.contentSubject.next([]);
    this.loadingSubject.next(false);
  }

}