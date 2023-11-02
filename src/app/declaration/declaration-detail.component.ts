/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';

import { Person, Declaration } from '../shared/data-model';
import { ClimateScienceService } from "../shared/climate-science.service";
import { HttpEvent, HttpResponse, HttpStatusCode } from '@angular/common/http';

/**
 * Displays details for a Declaration. Also supports explicit linking of signatory <@link Person}s to the selected {@link Declaration}.
 * @see {@link Declaration}
 */
@Component({
  selector: 'app-declaration-detail',
  templateUrl: './declaration-detail.component.html',
  styleUrls: ['./declaration-detail.component.css'],
  standalone: true,
  imports: [CommonModule, MatCheckboxModule],
})
export class DeclarationDetailComponent {

  @Input() master: string = "NONE";
  @Input() person: Person | undefined;
  @Input() declaration: Declaration | undefined;
  @ViewChild('linked') linkedCheckbox : MatCheckbox;

  /**
   * Constructs a new DeclarationDetailComponent.
   * @param climateScienceService The injected climate science service.
   */
  constructor(public climateScienceService: ClimateScienceService) {}

  /**
   * Makes or breaks the explicit signatory link between the selected Person and selected Declaration.
   */
  toggle() : void {
    if (this.person && this.declaration) {
      if (this.declaration.LINKED) {
        this.climateScienceService.deleteSignatory(this.person.ID, this.declaration.ID).subscribe(httpEvent => this.handleResponse(httpEvent));
      } else {
        this.climateScienceService.createSignatory(this.person.ID, this.declaration.ID).subscribe(httpEvent => this.handleResponse(httpEvent));
      }
    }
  }

  /**
   * Handles the response to the HTTP update request. If successful, updates the model to match the UI;
   * otherwise, reverts the UI to match the (unchanged) model.
   * @param httpEvent The HTTP event received.
   */
  private handleResponse(httpEvent: HttpEvent<string | void>): void {
    if (httpEvent instanceof HttpResponse) {
      let httpResponse : HttpResponse<any> = httpEvent;
      switch (httpResponse.status) {
        case HttpStatusCode.Ok:
        case HttpStatusCode.Created:
          // If the write operation succeeded, update the model to match the UI.
          if (this.declaration) {
            this.declaration.LINKED = !this.declaration.LINKED;
            console.debug(`Updated declaration.LINKED to ${this.declaration.LINKED}`);
          }
          break;
        default:
          // If the write operation failed, update the UI to match the unchanged model.
          this.linkedCheckbox.toggle();
          console.debug(`Reverted #linked to ${this.linkedCheckbox.checked}`);
      }
    }
  }

}
