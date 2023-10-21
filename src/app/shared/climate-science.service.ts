/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs';

import { Person, Publication, Declaration, Quotation, ResultSet } from './data-model';

/**
 * Provides the client API for the REST service.
 */
@Injectable({
  providedIn: 'root'
})
export class ClimateScienceService {
  static readonly BASE_URL = "http://debian.local/climate-service";

  /**
   * Constructs a new ClimateScienceService.
   * @param http The injected HttpClient.
   */
  constructor(private http: HttpClient) { }

  static readonly httpGetOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  static readonly httpWriteOptions = {
    observe: "events"
  };

  /**
   * Fetches a specified Person.
   * @param personId The ID of the Person to retrieve.
   * @return An Observable to deliver the requested Person.
   */
  getPersonById(personId: number) : Observable<Person> {
    // GET /person/{personId} => getPersonById(personId)
    let url = ClimateScienceService.BASE_URL + "/person/" + personId;
    return this.http.get<Person>(url, ClimateScienceService.httpGetOptions);
  }

  /**
   * Fetches a paginated sub-list of Persons.
   * @param start The index of the first Person to retrieve.
   * @param count The maximum number of Persons to retrieve.
   * @return An Observable to deliver the requested Persons.
   */
  findPersons(start: number = 0, count: number = 10) : Observable<ResultSet<Person>> {
    // GET /person/find?start=0&count=10 => findPersons(start, count)
    let url = ClimateScienceService.BASE_URL + "/person/find";
    return this.http.get<ResultSet<Person>>(url, {params: new HttpParams().set('start', start).set('count', count)});
  }

  /**
   * Fetches a paginated sub-list of Persons who are authors of a specified Publication.
   * @param publicationId The ID of the Publication whose authors are required.
   * @param start The index of the first Person to retrieve.
   * @param count The maximum number of Persons to retrieve.
   * @return An Observable to deliver the requested Persons.
   */
  findPersonsByPublication(publicationId?: number, start = 0, count = 10) : Observable<ResultSet<Person>> {
    // GET /person/findByPublication?publicationId=0&start=0&count=10 => findPersonsByPublication(publicationId, start, count)
    let url = ClimateScienceService.BASE_URL + "/person/findByPublication";
    let params = new HttpParams();
    if (publicationId)
      params = params.set('publicationId', publicationId);
    params = params.set('start', start).set('count', count);
    return this.http.get<ResultSet<Person>>(url, {params: params});
  }

  /**
   * Fetches a paginated sub-list of Persons who are signatories to a specified Declaration.
   * @param declarationId The ID of the Declaration whose signatories are required.
   * @param start The index of the first Person to retrieve.
   * @param count The maximum number of Persons to retrieve.
   * @return An Observable to deliver the requested Persons.
   */
  findPersonsByDeclaration(declarationId?: number, start = 0, count = 10) : Observable<ResultSet<Person>> {
    // GET /person/findByDeclaration?declarationId=0&start=0&count=10 => findPersonsByDeclaration(declarationId, start, count)
    let url = ClimateScienceService.BASE_URL + "/person/findByDeclaration";
    let params = new HttpParams();
    if (declarationId)
      params = params.set('declarationId', declarationId);
    params = params.set('start', start).set('count', count);
    return this.http.get<ResultSet<Person>>(url, {params: params});
  }

  /**
   * Fetches a specified Publication.
   * @param personId The ID of the Publication to retrieve.
   * @return An Observable to deliver the requested Publication.
   */
  getPublicationById(publicationId: number) : Observable<Publication> {
    // GET /publication/{publicationId} => getPublicationById(publicationId)
    let url = ClimateScienceService.BASE_URL + "/publication/" + publicationId;
    return this.http.get<Publication>(url, ClimateScienceService.httpGetOptions);
  }

  /**
   * Fetches a paginated sub-list of Publications.
   * @param start The index of the first Publication to retrieve.
   * @param count The maximum number of Publications to retrieve.
   * @return An Observable to deliver the requested Publications.
   */
  findPublications(start: number = 0, count: number = 10) : Observable<ResultSet<Publication>> {
    // GET /publication/find?start=0&count=10 => findPublications(start, count)
    let url = ClimateScienceService.BASE_URL + "/publication/find";
    return this.http.get<ResultSet<Publication>>(url, {params: new HttpParams().set('start', start).set('count', count)});
  }

  /**
   * Fetches a paginated sub-list of Publications authored by a specified Person.
   * @param personId The ID of the Person whose Publications are required.
   * @param start The index of the first Publication to retrieve.
   * @param count The maximum number of Publications to retrieve.
   * @return An Observable to deliver the requested Publications.
   */
  findPublicationsByAuthor(personId?: number, lastName?: string, start: number = 0, count: number = 10) : Observable<ResultSet<Publication>> {
    // GET /publication/findByAuthor?personId=0&lastName=author&start=0&count=10 => findPublicationsByAuthor(personId, lastName, start, count)
    let url = ClimateScienceService.BASE_URL + "/publication/findByAuthor";
    let params = new HttpParams();
    if (personId)
      params = params.set('personId', personId);
    if (lastName)
      params = params.set('lastName', lastName);
    params = params.set('start', start).set('count', count);
    return this.http.get<ResultSet<Publication>>(url, {params: params});
  }

  /**
   * Fetches a specified Declaration.
   * @param personId The ID of the Declaration to retrieve.
   * @return An Observable to deliver the requested Declaration.
   */
  getDeclarationById(declarationId: number) : Observable<Declaration> {
    // GET /declaration/{declarationId} => getDeclarationById(declarationId)
    let url = ClimateScienceService.BASE_URL + "/declaration/" + declarationId;
    return this.http.get<Declaration>(url, ClimateScienceService.httpGetOptions);
  }

  /**
   * Fetches a paginated sub-list of Declarations.
   * @param start The index of the first Declaration to retrieve.
   * @param count The maximum number of Declarations to retrieve.
   * @return An Observable to deliver the requested Declarations.
   */
  findDeclarations(start: number = 0, count: number = 10) : Observable<ResultSet<Declaration>> {
    // GET /declaration/find?start=0&count=10 => findDeclarations(start, count)
    let url = ClimateScienceService.BASE_URL + "/declaration/find";
    return this.http.get<ResultSet<Declaration>>(url, {params: new HttpParams().set('start', start).set('count', count)});
  }

  /**
   * Fetches a paginated sub-list of Declarations signed by a specified Person.
   * @param personId The ID of the Person whose Declarations are required.
   * @param lastName The specified Person's last name.
   * @param start The index of the first Declaration to retrieve.
   * @param count The maximum number of Declarations to retrieve.
   * @return An Observable to deliver the requested Declarations.
   */
  findDeclarationsBySignatory(personId? : number, lastName? : string, start: number = 0, count: number = 10) : Observable<ResultSet<Declaration>> {
    // GET /declaration/find?start=0&count=10 => findDeclarations(start, count)
    let url = ClimateScienceService.BASE_URL + "/declaration/findBySignatory";
    let params = new HttpParams();
    if (personId)
      params = params.set('personId', personId);
    if (lastName)
      params = params.set('lastName', lastName);
    params = params.set('start', start).set('count', count);
    return this.http.get<ResultSet<Declaration>>(url, {params: params});
  }

  /**
   * Fetches a paginated sub-list of Quotations.
   * @param start The index of the first Quotation to retrieve.
   * @param count The maximum number of Quotations to retrieve.
   * @return An Observable to deliver the requested Quotations.
   */
  findQuotations(start: number = 0, count: number = 10) : Observable<ResultSet<Quotation>> {
    // GET /quotation/find?start=0&count=10 => findQuotations(start, count)
    let url = ClimateScienceService.BASE_URL + "/quotation/find";
    return this.http.get<ResultSet<Quotation>>(url, {params: new HttpParams().set('start', start).set('count', count)});
  }

  /**
   * Fetches a paginated sub-list of Quotations authored by a specified Person.
   * @param personId The ID of the Person whose Quotations are required.
   * @param start The index of the first Quotation to retrieve.
   * @param count The maximum number of Quotations to retrieve.
   * @return An Observable to deliver the requested Quotations.
   */
  findQuotationsByAuthor(personId? : number, lastName? : string, start: number = 0, count: number = 10) : Observable<ResultSet<Quotation>> {
    // GET /quotation/find?start=0&count=10 => findQuotations(start, count)
    let url = ClimateScienceService.BASE_URL + "/quotation/findByAuthor";
    let params = new HttpParams();
    if (personId)
      params = params.set('personId', personId);
    if (lastName)
      params = params.set('lastName', lastName);
    params = params.set('start', start).set('count', count);
    return this.http.get<ResultSet<Quotation>>(url, {params: params});
  }

  /**
   * Links or unlinks a specified Person as the origin of a specified Quotation.
   * @param quotationId The ID of the Quotation.
   * @param personId The ID of the Person to link, pass undefined to unlink.
   * @return An Observable to deliver the HttpEvents from the request.
   */
  linkQuotationAuthor(quotationId: number, personId?: number) : Observable<HttpEvent<void>> {
    // PUT /quotation/{quotationId}?personId={personId} => linkQuotationAuthor(quotationId, personId)
    let url = ClimateScienceService.BASE_URL + "/quotation/" + quotationId;
    let params = new HttpParams();
    if (personId)
      params = params.set('personId', personId);
    return this.http.patch<void>(url, null, {observe: "events", params: params});
  }

  /**
   * Links a specified Person as the author of a specified Publication.
   * @param personId The ID of the Person to link.
   * @param publicationId The ID of the Publication.
   * @return An Observable to deliver the HttpEvents from the request.
   */
  createAuthorship(personId: number, publicationId: number) : Observable<HttpEvent<string>> {
    // POST /authorship/{personId}/{publicationId} => createAuthorship(personId, publicationId)
    let url = ClimateScienceService.BASE_URL + "/authorship/" + personId + "/" + publicationId;
    return this.http.post<string>(url, null, {observe: "events"});
  }

  /**
   * Unlinks a specified Person as the author of a specified Publication.
   * @param personId The ID of the Person to unlink.
   * @param publicationId The ID of the Publication.
   * @return An Observable to deliver the HttpEvents from the request.
   */
  deleteAuthorship(personId: number, publicationId: number) : Observable<HttpEvent<void>> {
    // DELETE /authorship/{personId}/{publicationId} => deleteAuthorship(personId, publicationId)
    let url = ClimateScienceService.BASE_URL + "/authorship/" + personId + "/" + publicationId;
    return this.http.delete<void>(url, {observe: "events"});
  }

  /**
   * Links a specified Person as a signatory of a specified Declaration.
   * @param personId The ID of the Person to link.
   * @param declarationId The ID of the Declaration.
   * @return An Observable to deliver the HttpEvents from the request.
   */
  createSignatory(personId: number, declarationId: number) : Observable<HttpEvent<string>> {
    // POST /signatory/{personId}/{declarationId} => createSignatory(personId, declarationId)
    let url = ClimateScienceService.BASE_URL + "/signatory/" + personId + "/" + declarationId;
    return this.http.post<string>(url, null, {observe: "events"});
  }

  /**
   * Unlinks a specified Person as a signatory of a specified Declaration.
   * @param personId The ID of the Person to unlink.
   * @param declarationId The ID of the Declaration.
   * @return An Observable to deliver the HttpEvents from the request.
   */
  deleteSignatory(personId: number, declarationId: number) : Observable<HttpEvent<void>> {
    // DELETE /signatory/{personId}/{declarationId} => deleteSignatory(personId, declarationId)
    let url = ClimateScienceService.BASE_URL + "/signatory/" + personId + "/" + declarationId;
    return this.http.delete<void>(url, {observe: "events"});
  }

}