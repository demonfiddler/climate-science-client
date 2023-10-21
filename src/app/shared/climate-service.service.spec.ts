/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { TestBed } from '@angular/core/testing';

import { ClimateScienceService } from './climate-science.service';

describe('ClimateServiceService', () => {
  let service: ClimateScienceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClimateScienceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
