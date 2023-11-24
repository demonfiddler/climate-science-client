/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule, MatHint } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule, MatIcon } from '@angular/material/icon'; 

import { Statistic } from '../shared/data-model';
import { StatisticsDataSource } from '../statistics/statistics-data-source';
import { ClimateScienceService } from "../shared/climate-science.service";
import { AbstractTableComponent } from '../shared/abstract-table.component';
import { Master } from '../shared/utils';

/**
 * A component for displaying a paginated list of Statistics.
 */
@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class StatisticsComponent extends AbstractTableComponent<Statistic> {
  override dataSource: StatisticsDataSource;

  /**
   * Constructs a new StatisticsComponent.
   * @param climateScienceService The injected climate science service.
   */
  constructor(protected override climateScienceService: ClimateScienceService) {
    super(climateScienceService);
    this.displayedColumns = ['CATEGORY', 'COUNT', 'DESCRIPTION'];
  }

  /**
   * @inheritdoc
   * @override
   */
  componentName() {
    return 'StatisticsComponent';
  }

  /**
   * @inheritdoc
   * @override
   */
  override ngOnInit() {
    super.ngOnInit();
    this.dataSource = new StatisticsDataSource(this.climateScienceService);
    this.dataSource.loadStatistics('climate', 0, 0);
  }

  /**
   * No change is relevant to the Statistics list.
   * @inheritdoc
   * @override
   */
  isRelevantChange(changes: SimpleChanges) : boolean {
    return false;
  }

  /**
   * Loads Statistics unconditionally.
   * @inheritdoc
   * @override
   */
  loadData(filter: string) {
    if (this.dataSource && this.master) {
      this.dataSource.loadStatistics('climate', 0, 0);
    }
  }

}
