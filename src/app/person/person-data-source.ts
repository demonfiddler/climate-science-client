/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

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
      this.callApi(this.cfg.api.getPersonById, false, personId);
    } else {
      this.unload();
    }
  }

  /**
   * Loads Persons from the REST service.
   */
  loadPersons() {
    this.callApi(this.cfg.api.findPersons, true, this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count);
  }

  /**
   * Loads the Persons known to be authors of the specified Publication.
   * @param publicationId The ID of the specified Publication.
   */
  loadPersonsByPublication(publicationId : number|undefined) {
    if (publicationId) {
      this.callApi(this.cfg.api.findPersonsByPublication, true, publicationId, this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count);
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
      this.callApi(this.cfg.api.findPersonsByDeclaration, true, declarationId, this.cfg.filter, this.cfg.sort, this.cfg.start, this.cfg.count);
    } else {
      this.unload();
    }
  }

}