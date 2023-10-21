/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationDetailComponent } from './declaration-detail.component';

describe('DeclarationDetailComponent', () => {
  let component: DeclarationDetailComponent;
  let fixture: ComponentFixture<DeclarationDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeclarationDetailComponent]
    });
    fixture = TestBed.createComponent(DeclarationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
