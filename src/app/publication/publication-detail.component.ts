/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';

import { Person, Publication } from '../shared/data-model';
import { ClimateScienceService } from "../shared/climate-science.service";
import { HttpEvent, HttpResponse, HttpStatusCode } from '@angular/common/http';

/**
 * Displays details for a Publication. Also supports explicit linking of author <@link Person}s to the selected {@link Publication}.
 * @see {@link Publication}
 */
@Component({
  selector: 'app-publication-detail',
  templateUrl: './publication-detail.component.html',
  styleUrls: ['./publication-detail.component.css'],
  standalone: true,
  imports: [CommonModule, MatCheckboxModule],
})
export class PublicationDetailComponent {
  @Input() master: string = "NONE";
  @Input() person: Person | undefined;
  @Input() publication: Publication | undefined;
  @ViewChild('linked') linkedCheckbox : MatCheckbox;

  /**
   * Constructs a new PublicationDetailComponent.
   * @param climateScienceService The injected climate science service.
   */
  constructor(private climateScienceService: ClimateScienceService) {
  }

  /**
   * Makes or breaks the explicit authorship link between the selected Person and selected Publication.
   */
  toggle() : void {
    if (this.person && this.publication) {
      if (this.publication.LINKED) {
        this.climateScienceService.deleteAuthorship(this.person.ID, this.publication.ID).subscribe(httpEvent => this.handleResponse(httpEvent));
      } else {
        this.climateScienceService.createAuthorship(this.person.ID, this.publication.ID).subscribe(httpEvent => this.handleResponse(httpEvent));
      }
    }
  }

  /**
   * Handles the response to the HTTP update request. If successful, updates the model to match the UI;
   * otherwise, reverts the UI to match the (unchanged) model.
   * @param httpEvent The HTTP event received.
   */
  handleResponse(httpEvent: HttpEvent<string | void>): void {
    console.debug("Received HttpEvent");
    if (httpEvent instanceof HttpResponse) {
      let httpResponse : HttpResponse<any> = httpEvent;
      if (httpResponse.status == HttpStatusCode.NoContent) {
        // If the write operation succeeded, update the model to match the UI.
        if (this.publication) {
          this.publication.LINKED = !this.publication.LINKED;
          console.debug(`Updated publication.LINKED to ${this.publication.LINKED}`);
        }
      } else {
        // If the write operation failed, update the UI to match the unchanged model.
        this.linkedCheckbox.toggle();
        console.debug(`Reverted #linked to ${this.linkedCheckbox.checked}`);
      }
    }
  }

}
