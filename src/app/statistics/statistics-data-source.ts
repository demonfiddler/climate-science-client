/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { catchError, finalize, of, tap } from 'rxjs';
import { Statistic } from "../shared/data-model";
import { AbstractDataSource } from "../shared/abstract-data-source";
import { ListConfig } from '../shared/list-config';

/**
 * A DataSource for fetching Statistics from the back-end REST service.
 * @see {@link AbstractDataSource}
 * @see {@link Statistic}
 */
export class StatisticsDataSource extends AbstractDataSource<Statistic> {

  /**
   * Constructs a new StatisticsDataSource.
   * @param cfg The list configuration to control pagination, filtering and sorting.
   */
  constructor(cfg : ListConfig) {
    super(cfg);
  }

  /**
   * Loads Statistics from the REST service.
   * @param topic The topic for which metrics are requested
   */
  loadStatistics(topic : string) {
    this.callApi(this.cfg.api.findStatistics, true, topic);
  }

}