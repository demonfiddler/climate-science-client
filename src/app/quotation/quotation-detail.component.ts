/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';

import { Person, Quotation } from '../shared/data-model';
import { ClimateScienceService } from "../shared/climate-science.service";
import { HttpEvent, HttpResponse, HttpStatusCode } from '@angular/common/http';

/**
 * Displays details for a Quotation. Also supports explicit linking of author <@link Person}s to the selected {@link Quotation}.
 * @see {@link Quotation}
 */
@Component({
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.component.html',
  styleUrls: ['./quotation-detail.component.css'],
  standalone: true,
  imports: [CommonModule, MatCheckboxModule],
})
export class QuotationDetailComponent {

  @Input() master: string = "NONE";
  @Input() person: Person | undefined;
  @Input() quotation: Quotation | undefined;
  @ViewChild('linked') linkedCheckbox : MatCheckbox;

  /**
   * Constructs a new QuotationDetailComponent.
   * @param climateScienceService The injected climate science service.
   */
  constructor(public climateScienceService: ClimateScienceService) {}

  /**
   * Makes or breaks the explicit authorship link between the selected Person and selected Quotation.
   */
  toggle() : void {
    if (this.quotation && this.person) {
      let personId =  this.linkedCheckbox.checked ? this.person.ID : undefined;
      this.climateScienceService.linkQuotationAuthor(this.quotation.ID, personId).subscribe(httpEvent => this.handleResponse(httpEvent));
    }
  }

  /**
   * Handles the response to the HTTP update request. If successful, updates the model to match the UI;
   * otherwise, reverts the UI to match the (unchanged) model.
   * @param httpEvent The HTTP event received.
   */
  handleResponse(httpEvent: HttpEvent<string | void>): void {
    if (httpEvent instanceof HttpResponse) {
      let httpResponse : HttpResponse<any> = httpEvent;
      switch (httpResponse.status) {
        case HttpStatusCode.Ok:
          // If the write operation succeeded, update the model to match the UI.
          if (this.quotation && this.person) {
            this.quotation.PERSON_ID = this.quotation.PERSON_ID ? undefined : this.person.ID;
            // console.debug(`Updated quotation.PERSON_ID to ${this.quotation.PERSON_ID}`);
          }
          break;
        default:
          // If the write operation failed, update the UI to match the unchanged model.
          this.linkedCheckbox.toggle();
          // console.debug(`Reverted #linked to ${this.linkedCheckbox.checked}`);
      }
    }
  }

}
