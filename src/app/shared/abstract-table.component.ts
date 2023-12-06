/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { Entity, Person } from './data-model';
import { AbstractDataSource } from './abstract-data-source';
import { ClimateScienceService } from "./climate-science.service";

/**
 * Abstract base for a component that displays a list of entities, with a uni-selection model.
 * @typeParam T - The type of object the list contains.
 */
@Component({
  template: ''
})
export abstract class AbstractTableComponent<T> implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() master: string = "NONE";
  @Input() toolbars: boolean = false;
  @Output() selectionChange = new EventEmitter<T>(true);
  dataSource: AbstractDataSource<T>;
  displayedColumns: string[];
  selectionModel = new SelectionModel<T>(false, []);
  countSubscription: Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filterInput : HTMLInputElement;
  paginatorSubscription: Subscription;
  filter : string = '';
  private filter$ = new Subject<string>();

  /**
   * Constructs a new AbstractTableComponent. 
   * @param climateScienceService The injected climate science service.
   */
  constructor(protected climateScienceService: ClimateScienceService) {
    // TODO: See if there is any way to use the SelectionModel directly as the event source.
    this.selectionModel.changed.subscribe(() => this.selectionChange.emit(this.selection));
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
    this.filterInput = e.target as HTMLInputElement;
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
    this.filterInput.value = '';
    this.filter='';
    this.selectionModel.clear();
    this._loadData();
  }

  /**
   * Implementations can create their data source and load the initial data.
   * Overrides must call super.ngOnInit().
   * @inheritdoc 
   * @override
   * @virtual
   */
  ngOnInit() : void {
    this.filter$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(filter => {
      this.filter = filter;
      this.selectionModel.clear();
      this._loadData();
    });
  }
  
  /**
   * @inheritdoc
   * The implementation initialises listeners on the count and paginator.
   * @override
   */
  ngAfterViewInit() {
    if (this.paginator) {
      this.countSubscription = this.dataSource.count$.subscribe(count => this.paginator.length = count);
      this.paginatorSubscription = this.paginator.page.subscribe(() => {
        this.selectionModel.clear(true);
        this._loadData();
      });
    }
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
      this._loadData();
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
   * Passes any user-defined search text to include in query predicates.
   */
  protected _loadData() : void {
    this.loadData(this.toolbars ? this.filter : '');
  }

  /**
   * Loads the appropriate data into the receiving table component.
   * @param filter User-defined search text to include in query predicates.
   * @virtual
   */
  abstract loadData(filter: string) : void;

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
    return person && this.climateScienceService.isLoggedIn() ? person.LAST_NAME : undefined;
  }

  /**
   * Reloads the list using current paginator settings.
   */
  reload() : void {
    this._loadData();
  }

}
