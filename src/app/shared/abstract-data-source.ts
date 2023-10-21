/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { Observable, BehaviorSubject } from 'rxjs';
import { ClimateScienceService } from "./climate-science.service";

/**
 * An abstract DataSource base class for interacting with the back-end REST service.
 * The implementation provides {@link Subject}s for receiving async notifications of loading, item count and content.
 */
export abstract class AbstractDataSource<T> implements DataSource<T> {

  protected countSubject = new BehaviorSubject<number>(0);
  protected contentSubject = new BehaviorSubject<T[]>([]);
  protected loadingSubject = new BehaviorSubject<boolean>(false);
  public count$ = this.countSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Constructs a new AbstractDataSource.
   * @param climateScienceService The injected climate science service.
   */
  constructor(protected climateScienceService: ClimateScienceService) {}

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

  /**
   * Loads an empty data set.
   */
  unload() {
    this.countSubject.next(0);
    this.contentSubject.next([]);
    this.loadingSubject.next(false);
  }

}