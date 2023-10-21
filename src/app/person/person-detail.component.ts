/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgbRating } from '@ng-bootstrap/ng-bootstrap';

import { Person } from '../shared/data-model';

/**
 * Displays details for a Person.
 * @see {@link Person}
 */
@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.css'],
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, NgbRating],
})
export class PersonDetailComponent {

  @Input() person: Person | undefined;

}
