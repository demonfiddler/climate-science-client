/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { Entity, Person } from './data-model';
import { AbstractDataSource } from './abstract-data-source';
import { ClimateScienceService } from './climate-science.service';
import { ListConfig } from '../shared/list-config';

/**
 * Abstract base for a component that displays a list of entities, with a uni-selection model.
 * @typeParam T - The type of object the list contains.
 */
@Component({
  template: ''
})
export abstract class AbstractTableComponent<T> implements OnInit, AfterViewInit, OnChanges, OnDestroy, ListConfig {

  @Input() master: string = "NONE";
  @Input() toolbars: boolean = false;
  @Output() selectionChange = new EventEmitter<T>(true);
  dataSource: AbstractDataSource<T>;
  displayedColumns: string[];
  selectionModel = new SelectionModel<T>(false, []);
  countSubscription: Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild(MatInput) filterInput : HTMLInputElement;
  paginatorSubscription: Subscription;
  sortSubscription: Subscription;
  filter : string = '';
  private filter$ = new Subject<string>();

  get sort() {
    return this.matSort && this.matSort.active && this.matSort.direction ? this.matSort.active + '+' + this.matSort.direction.toUpperCase() : '';
  }

  get start() {
    return this.paginator ? this.paginator.pageIndex * this.paginator.pageSize : 0;
  }

  get count() {
    return this.paginator ? this.paginator.pageSize : 0;
  }

  /**
   * Constructs a new AbstractTableComponent. 
   * @param api The injected climate science service.
   */
  constructor(public api: ClimateScienceService) {
    // TODO: See if there is any way to use the SelectionModel directly as the event source.
    this.selectionModel.changed.subscribe(() => this.selectionChange.emit(this.selection));
  }  

  /**
   * Overrides should create their data source before calling super.ngOnInit().
   * @inheritdoc 
   * @override
   * @virtual
   */
  ngOnInit() : void {
  }
  
  /**
   * @inheritdoc
   * This implementation initialises listeners on the filter, sorter, count and paginator.
   * @override
   */
  ngAfterViewInit() {
    this.filter$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(filter => {
      this.filter = filter;
      this.clearAndReload(true);
    });
    if (this.matSort) {
      this.sortSubscription = this.matSort.sortChange.subscribe(() => {
        this.clearAndReload(true);
      });
    }
    if (this.paginator) {
      this.countSubscription = this.dataSource.count$.subscribe(count => this.paginator.length = count);
      this.paginatorSubscription = this.paginator.page.subscribe(() => {
        this.clearAndReload(false);
      });
    }

    // Perform initial data loading asynchronously, to avoid changing component state after Angular change detection has completed.
    setTimeout(this.loadData.bind(this), 0);
  }

  /**
   * Clears current selection, optionally resets the paginator, then loads data.
   * @param setFirstPage Whether to reset the paginator to page 1.
   */
  private clearAndReload(setFirstPage : boolean) {
    this.selectionModel.clear();
    if (setFirstPage && this.paginator)
      this.paginator.firstPage();
    this.loadData();
}

  /**
   * The implementation determines whether it is a relevant change and if so,
   * clears the current selection and loads the appropriate data.
   * @inheritdoc
   * @override
   */
  ngOnChanges(changes: SimpleChanges) {
    let isRelevantChange = this.isRelevantChange(changes);
    if (isRelevantChange && this.dataSource) {
      this.selectionModel.clear(true);
      this.loadData();
    }
  }

  /**
   * The implementation unsubscribes from the count and paginator evemts.
   * @inheritdoc
   * @override
   */
  ngOnDestroy() {
    this.countSubscription.unsubscribe();
    this.paginatorSubscription.unsubscribe();
    this.sortSubscription.unsubscribe();
  }

  /**
   * Returns the component type name.
   * @return The component type name.
   * @virtual
   */
  abstract componentName() : string;

  /**
   * Read accessor for the table component's current selection.
   */
  get selection() : T | undefined {
    return this.selectionModel.isEmpty() ? undefined : this.selectionModel.selected[0];
  }

  /**
   * Callback to select or deselect the specified row.
   * @param row The newly selected row.
   * @param event The selection event.
   */
  onSelectRow(row : T, event: MouseEvent) {
    let selected = this.selectionModel.selected.includes(row);
    if (!selected || event.ctrlKey || event.metaKey)
      this.selectionModel.toggle(row);
  }  

  /**
   * Applies a user-supplied filter string.
   * @param e The key-up event.
   */
  applyFilter(e: KeyboardEvent) {
    if (e.key == 'Escape') {
      this.clearFilter();
    } else {
      const filter = this.filterInput.value.trim().toLowerCase();
      this.filter$.next(filter);
    }
  }

  /**
   * Clears any filter string and selection then reloads the data.
   */
  clearFilter() {
    if (this.filterInput)
      this.filterInput.value = '';
    this.filter='';
    this.selectionModel.clear();
    this.loadData();
  }

  /**
   * Converts a value to a string representation. For an object with an ID property, returns the value of that property.
   * @param value The value to convert.
   * @return The value expressed as a string.
   */
  stringify(value : any) : string {
    return typeof value == 'object' && 'ID' in value ? value.ID : JSON.stringify(value);
  }

  /**
   * Determines whether a given change is relevant to the receiving table component.
   * @param changes The changes to analyse.
   * @virtual
   */
  abstract isRelevantChange(changes: SimpleChanges) : boolean;

  /**
   * Loads the appropriate data into the receiving table component.
   * @virtual
   */
  abstract loadData() : void;

  /**
   * Returns the ID of a (possibly undefined) Entity.
   * @param entity The entity whose ID is required.
   * @return The entity ID or undefined if no entity was passed.
   */
  getEntityId(entity : Entity | undefined) : number | undefined {
    return entity? entity.ID : undefined;
  }

  /**
   * Returns the last name of a (possibly undefined) Person, if the current user is authenticated.
   * @param person The Person whose last name is required.
   * @return The Person's last name or undefined if no Person was passed or current user is unauthenticated.
   */
  getLastName(person : Person | undefined) : string | undefined {
    return person && this.api.isLoggedIn() ? person.LAST_NAME : undefined;
  }

  /**
   * Reloads the list using current paginator settings.
   */
  reload() : void {
    this.loadData();
  }

}
