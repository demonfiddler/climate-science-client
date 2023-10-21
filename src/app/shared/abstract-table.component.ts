/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';

import { Entity, Person } from './data-model';
import { AbstractDataSource } from './abstract-data-source';
import { ClimateScienceService } from "./climate-science.service";

/**
 * Abstract base for a component that displays a list of entities, with a uni-selection model.
 * @typeParam T - The type of objects the list contains.
 */
@Component({
  template: ''
})
export abstract class AbstractTableComponent<T> implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() master: string = "NONE";
  dataSource: AbstractDataSource<T>;
  displayedColumns : string[];
  selectionModel = new SelectionModel<T>(false, []);
  @Output() selectionChange = new EventEmitter<T>(true);
  countSubscription : Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  paginatorSubscription : Subscription;

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
   * Implementations can create their data source and load the initial data.
   * @inheritdoc 
   * @override
   * @virtual
   */
  abstract ngOnInit() : void;
  
  /**
   * @inheritdoc
   * The implementation initialises listeners on the count and paginator.
   * @override
   */
  ngAfterViewInit() {
    this.countSubscription = this.dataSource.count$.subscribe(count => this.paginator.length = count);
    this.paginatorSubscription = this.paginator.page.subscribe(() => {
      this.selectionModel.clear(true);
      this.loadData();
    });
  }

  /**
   * The implementation determines whether it is a relevant change and if so,
   * clears the current selection and loads the appropriate data.
   * @inheritdoc
   * @override
   */
  ngOnChanges(changes: SimpleChanges) {
    let isRelevantChange = this.isRelevantChange(changes);
    // let msg = this.componentName() + ` relevant = ${isRelevantChange}:\n`;
    // for (const propName in changes) {
    //   const chng = changes[propName];
    //   const cur  = this.stringify(chng.currentValue);
    //   const prev = this.stringify(chng.previousValue);
    //   msg += `\t${propName}: currentValue = ${cur}, previousValue = ${prev}\n`;
    // }
    // console.debug(msg);
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
   * Returns the last name of a (possibly undefined) Person.
   * @param person The Person whose last name is required.
   * @return The Person's last name or undefined if no Person was passed.
   */
  getLastName(person : Person | undefined) : string | undefined {
    return person ? person.LAST_NAME : undefined;
  }

}
