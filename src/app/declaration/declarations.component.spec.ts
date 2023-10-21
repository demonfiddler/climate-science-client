/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationsComponent } from './declarations.component';

describe('DeclarationsComponent', () => {
  let component: DeclarationsComponent;
  let fixture: ComponentFixture<DeclarationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeclarationsComponent]
    });
    fixture = TestBed.createComponent(DeclarationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
