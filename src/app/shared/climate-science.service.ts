/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpResponse, HttpStatusCode } from '@angular/common/http'
import { Observable, Subject } from 'rxjs';
import { DateTime } from 'luxon';

import { Person, Publication, Declaration, Quotation, Statistic, ResultSet } from './data-model';
import { base64UrlDecode } from './utils';
import { environment as env } from '../../environments/environment';

const JWT_EXPIRY = 'jwt_expiry';
const JWT_PAYLOAD = 'jwt_payload';
const JWT_SUBJECT = 'jwt_subject';
const JWT_TOKEN = 'jwt_token';

/**
 * Provides the client API for the REST service.
 */
@Injectable({
  providedIn: 'root'
})
export class ClimateScienceService {

  static readonly httpGetOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  /**
   * Notifies changes in logged in status.
   */
  loginChange = new EventEmitter<boolean>();
  private sessionTimer : any;

  /**
   * Constructs a new ClimateScienceService.
   * @param http The injected HttpClient.
   */
  constructor(private http: HttpClient) {
    console.debug('Service URL: ' + env.serviceUrl);
  }

  /**
   * Authenticates a user.
   * @param userId The user ID.
   * @param password The password.
   * @see https://blog.angular-university.io/angular-jwt/
   */
  login(userId: string, password: string) : Observable<boolean> {
    // POST /auth/login
    let url = env.serviceUrl + '/auth/login';
    let auth = this.http.post<string>(url, {userId: userId, password: password}, {observe: "events"});
    let result = new Subject<boolean>();
    let _this = this;
    let subs = auth.subscribe({
      next(e) {
        if (e instanceof HttpResponse) {
          let resp : HttpResponse<string> = e;
          switch (resp.status) {
            case HttpStatusCode.Ok:
              let jwt = resp.body;
              _this.setSession(jwt);
              console.debug("Authentication successful, Authorization: " + resp.body);
              result.next(true);
              break;
            default:
              _this.setSession(null);
              console.debug("Authentication failed, status: " + resp.status);
              result.next(false);
              break;
          }
          subs.unsubscribe();
        }
      },
      error(err) {
        _this.setSession(null);
        console.debug("Authentication failed, error: " + err);
        result.next(false);
      }
    });
    return result;
  }

  /**
   * Clears the authentication token from session storage, so future requests will be unauthenticated.
   */
  logout() : void {
    this.setSession(null);
  }

  /**
   * Stores the authentication token in session storage and fires a loginChange event.
   * Also sets a timer to fire when the session has expired.
   * @param jwt The authentication object returned by the server.
   */
  private setSession(jwt: string|null) : void {
    clearInterval(this.sessionTimer);
    if (jwt) {
      let tokens = jwt.split('.');
      let payloadStr = base64UrlDecode(tokens[1]);
      let payload = JSON.parse(payloadStr);

      sessionStorage.setItem(JWT_TOKEN, jwt);
      sessionStorage.setItem(JWT_EXPIRY, payload.exp);
      sessionStorage.setItem(JWT_SUBJECT, payload.sub);
      sessionStorage.setItem(JWT_PAYLOAD, payloadStr);

      // Clear credentials and fire logout event when session expires.
      this.sessionTimer = setInterval(() => {
        sessionStorage.clear();
        this.loginChange.next(false);
      }, (payload.exp - DateTime.now().toSeconds()) * 1000);
    } else {
      sessionStorage.clear();
    }
    this.loginChange.next(jwt != null);
  }

  /**
   * Returns the current session.
   * @returns The current session or null if not logged in.
   */
  getCurrentSession() : any {
    let payloadStr = sessionStorage.getItem(JWT_PAYLOAD);
    return payloadStr ? JSON.parse(payloadStr) : null;
  }

  /**
   * Returns the current session.
   * @returns The current session or null if not logged in.
   */
  getCurrentSubject() : string|null {
    return sessionStorage.getItem(JWT_SUBJECT);
  }

  /**
   * Tests whether the client is logged in.
   * @returns true if the client holds an unexpired authentication token.
   */
  isLoggedIn() : boolean {
    return DateTime.now().toSeconds() < this.getExpiration();
  }

  /**
   * Tests whether the client is logged out.
   * @returns true if the client does not hold an unexpired authentication token.
   */
  isLoggedOut() : boolean {
      return !this.isLoggedIn();
  }

  /**
   * Returns the authentication token's expiration date/time, if one is held.
   * @returns the expiration date/time in Epoch seconds.
   */
  private getExpiration() : number {
      const expiration = sessionStorage.getItem("jwt_expiry");
      return expiration ? JSON.parse(expiration) : null;
  }

  /**
   * Initialises an HttpParams object, optionally creating it.
   * @param params An optional HttpParams instance.
   * @param name The parameter to set.
   * @param value The value to set.
   * @returns An HttpParams object with the specified parameter set.
   */
  private addParam(params = new HttpParams(), name : string, value? : string|number|boolean) : HttpParams {
    if (value)
      params = params.set(name, value);
    return params;
  }

  /**
   * Initialises an HttpParams object, optionally creating it.
   * @param params An optional HttpParams instance.
   * @param filter Optional user-defined filter string.
   * @param start Optional start index.
   * @param count Optional result set count.
   * @returns An HttpParams object with the specified parameters set.
   */
  private addParams(params = new HttpParams(), filter? : string, start? : number, count? : number) : HttpParams {
    if (filter && filter.length > 0)
      params = params.set('filter', filter);
    if (start && start > 0)
      params = params.set('start', start);
    if (count && count > 0)
      params = params.set('count', count);
    return params;
  }

  /**
   * Fetches a specified Person.
   * @param personId The ID of the Person to retrieve.
   * @return An Observable to deliver the requested Person.
   */
  getPersonById(personId: number) : Observable<Person> {
    // GET /person/{personId} => getPersonById(personId)
    let url = env.serviceUrl + "/person/" + personId;
    return this.http.get<Person>(url, ClimateScienceService.httpGetOptions);
  }

  /**
   * Fetches a paginated sub-list of Persons.
   * @param filter User-defined search string.
   * @param start The index of the first Person to retrieve.
   * @param count The maximum number of Persons to retrieve.
   * @return An Observable to deliver the requested Persons.
   */
  findPersons(filter? : string, start = 0, count = 0) : Observable<ResultSet<Person>> {
    // GET /person/find?filter=&start=0&count=0 => findPersons(filter, start, count)
    let url = env.serviceUrl + "/person/find";
    let params = this.addParams(undefined, filter, start, count);
    return this.http.get<ResultSet<Person>>(url, {params: params});
  }

  /**
   * Fetches a paginated sub-list of Persons who are authors of a specified Publication.
   * @param publicationId The ID of the Publication whose authors are required.
   * @param filter User-defined search string.
   * @param start The index of the first Person to retrieve.
   * @param count The maximum number of Persons to retrieve.
   * @return An Observable to deliver the requested Persons.
   */
  findPersonsByPublication(publicationId?: number, filter? : string, start = 0, count = 0) : Observable<ResultSet<Person>> {
    // GET /person/findByPublication?publicationId=0&filter=&start=0&count=0 => findPersonsByPublication(publicationId, filter, start, count)
    let url = env.serviceUrl + "/person/findByPublication";
    let params = this.addParam(undefined, 'publicationId', publicationId);
    params = this.addParams(params, filter, start, count);
    return this.http.get<ResultSet<Person>>(url, {params: params});
  }

  /**
   * Fetches a paginated sub-list of Persons who are signatories to a specified Declaration.
   * @param declarationId The ID of the Declaration whose signatories are required.
   * @param filter User-defined search string.
   * @param start The index of the first Person to retrieve.
   * @param count The maximum number of Persons to retrieve.
   * @return An Observable to deliver the requested Persons.
   */
  findPersonsByDeclaration(declarationId?: number, filter? : string, start = 0, count = 0) : Observable<ResultSet<Person>> {
    // GET /person/findByDeclaration?declarationId=0&filter=&start=0&count=0 => findPersonsByDeclaration(declarationId, filter, start, count)
    let url = env.serviceUrl + "/person/findByDeclaration";
    let params = this.addParam(undefined, 'declarationId', declarationId);
    params = this.addParams(params, filter, start, count);
    return this.http.get<ResultSet<Person>>(url, {params: params});
  }

  /**
   * Fetches a specified Publication.
   * @param personId The ID of the Publication to retrieve.
   * @return An Observable to deliver the requested Publication.
   */
  getPublicationById(publicationId: number) : Observable<Publication> {
    // GET /publication/{publicationId} => getPublicationById(publicationId)
    let url = env.serviceUrl + "/publication/" + publicationId;
    return this.http.get<Publication>(url, ClimateScienceService.httpGetOptions);
  }

  /**
   * Fetches a paginated sub-list of Publications.
   * @param filter User-defined search string.
   * @param start The index of the first Publication to retrieve.
   * @param count The maximum number of Publications to retrieve.
   * @return An Observable to deliver the requested Publications.
   */
  findPublications(filter? : string, start = 0, count = 0) : Observable<ResultSet<Publication>> {
    // GET /publication/find?filter=&start=0&count=0 => findPublications(filter, start, count)
    let url = env.serviceUrl + "/publication/find";
    let params = this.addParams(undefined, filter, start, count);
    return this.http.get<ResultSet<Publication>>(url, {params: params});
  }

  /**
   * Fetches a paginated sub-list of Publications authored by a specified Person.
   * @param personId The ID of the Person whose Publications are required.
   * @param filter User-defined search string.
   * @param start The index of the first Publication to retrieve.
   * @param count The maximum number of Publications to retrieve.
   * @return An Observable to deliver the requested Publications.
   */
  findPublicationsByAuthor(personId?: number, lastName?: string, filter? : string, start = 0, count = 0) : Observable<ResultSet<Publication>> {
    // GET /publication/findByAuthor?personId=0&lastName=author&filter=&start=0&count=0 => findPublicationsByAuthor(personId, lastName, filter, start, count)
    let url = env.serviceUrl + "/publication/findByAuthor";
    let params = this.addParam(undefined, 'personId', personId);
    params = this.addParam(params, 'lastName', lastName);
    params = this.addParams(params, filter, start, count);
    return this.http.get<ResultSet<Publication>>(url, {params: params});
  }

  /**
   * Fetches a specified Declaration.
   * @param personId The ID of the Declaration to retrieve.
   * @return An Observable to deliver the requested Declaration.
   */
  getDeclarationById(declarationId: number) : Observable<Declaration> {
    // GET /declaration/{declarationId} => getDeclarationById(declarationId)
    let url = env.serviceUrl + "/declaration/" + declarationId;
    return this.http.get<Declaration>(url, ClimateScienceService.httpGetOptions);
  }

  /**
   * Fetches a paginated sub-list of Declarations.
   * @param filter User-defined search string.
   * @param start The index of the first Declaration to retrieve.
   * @param count The maximum number of Declarations to retrieve.
   * @return An Observable to deliver the requested Declarations.
   */
  findDeclarations(filter? : string, start = 0, count = 0) : Observable<ResultSet<Declaration>> {
    // GET /declaration/find?filter=&start=0&count=0 => findDeclarations(filter, start, count)
    let url = env.serviceUrl + "/declaration/find";
    let params = this.addParams(undefined, filter, start, count);
    return this.http.get<ResultSet<Declaration>>(url, {params: params});
  }

  /**
   * Fetches a paginated sub-list of Declarations signed by a specified Person.
   * @param personId The ID of the Person whose Declarations are required.
   * @param lastName The specified Person's last name.
   * @param filter User-defined search string.
   * @param start The index of the first Declaration to retrieve.
   * @param count The maximum number of Declarations to retrieve.
   * @return An Observable to deliver the requested Declarations.
   */
  findDeclarationsBySignatory(personId? : number, lastName? : string, filter? : string, start = 0, count = 0) : Observable<ResultSet<Declaration>> {
    // GET /declaration/find?filter=&start=0&count=0 => findDeclarations(filter, start, count)
    let url = env.serviceUrl + "/declaration/findBySignatory";
    let params = this.addParam(undefined, 'personId', personId);
    params = this.addParam(params, 'lastName', lastName);
    params = this.addParams(params, filter, start, count);
    return this.http.get<ResultSet<Declaration>>(url, {params: params});
  }

  /**
   * Fetches a paginated sub-list of Quotations.
   * @param filter User-defined search string.
   * @param start The index of the first Quotation to retrieve.
   * @param count The maximum number of Quotations to retrieve.
   * @return An Observable to deliver the requested Quotations.
   */
  findQuotations(filter? : string, start = 0, count = 0) : Observable<ResultSet<Quotation>> {
    // GET /quotation/find?filter=&start=0&count=0 => findQuotations(filter, start, count)
    let url = env.serviceUrl + "/quotation/find";
    let params = this.addParams(undefined, filter, start, count);
    return this.http.get<ResultSet<Quotation>>(url, {params: params});
  }

  /**
   * Fetches a paginated sub-list of Quotations authored by a specified Person.
   * @param personId The ID of the Person whose Quotations are required.
   * @param filter User-defined search string.
   * @param start The index of the first Quotation to retrieve.
   * @param count The maximum number of Quotations to retrieve.
   * @return An Observable to deliver the requested Quotations.
   */
  findQuotationsByAuthor(personId? : number, lastName? : string, filter? : string, start = 0, count = 0) : Observable<ResultSet<Quotation>> {
    // GET /quotation/findByAuthor?personId=0filter=&start=0&count=0 => findQuotationsByAuthor(start, count)
    let url = env.serviceUrl + "/quotation/findByAuthor";
    let params = this.addParam(undefined, 'personId', personId);
    params = this.addParam(params, 'lastName', lastName);
    params = this.addParams(params, filter, start, count);
    return this.http.get<ResultSet<Quotation>>(url, {params: params});
  }

  /**
   * Fetches a paginated sub-list of database Statistics.
   * @param topic The topic for which Statistics are requested.
   * @param start The index of the first Statistic to retrieve.
   * @param count The maximum number of Statistics to retrieve.
   * @returns An Observable to deliver the requested Statistics.
   */
  findStatistics(topic : string, start = 0, count = 0) : Observable<ResultSet<Statistic>> {
    // GET /statistics/find?topic=climate&start=0&count=0 => findStatistics(topic, start, count)
    let url = env.serviceUrl + "/statistics/find";
    let params = this.addParam(undefined, 'topic', topic);
    params = this.addParams(params, undefined, start, count);
    return this.http.get<ResultSet<Statistic>>(url, {params: params});
  }

  /**
   * Links or unlinks a specified Person as the origin of a specified Quotation.
   * @param quotationId The ID of the Quotation.
   * @param personId The ID of the Person to link, pass undefined to unlink.
   * @return An Observable to deliver the HttpEvents from the request.
   */
  linkQuotationAuthor(quotationId: number, personId?: number) : Observable<HttpEvent<void>> {
    // PATCH /quotation/{quotationId}?personId={personId} => linkQuotationAuthor(quotationId, personId)
    let url = env.serviceUrl + "/quotation/" + quotationId;
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
    // PUT /authorship/{personId}/{publicationId} => createAuthorship(personId, publicationId)
    let url = env.serviceUrl + "/authorship/" + personId + "/" + publicationId;
    return this.http.put<string>(url, null, {observe: "events"});
  }

  /**
   * Unlinks a specified Person as the author of a specified Publication.
   * @param personId The ID of the Person to unlink.
   * @param publicationId The ID of the Publication.
   * @return An Observable to deliver the HttpEvents from the request.
   */
  deleteAuthorship(personId: number, publicationId: number) : Observable<HttpEvent<void>> {
    // DELETE /authorship/{personId}/{publicationId} => deleteAuthorship(personId, publicationId)
    let url = env.serviceUrl + "/authorship/" + personId + "/" + publicationId;
    return this.http.delete<void>(url, {observe: "events"});
  }

  /**
   * Links a specified Person as a signatory of a specified Declaration.
   * @param personId The ID of the Person to link.
   * @param declarationId The ID of the Declaration.
   * @return An Observable to deliver the HttpEvents from the request.
   */
  createSignatory(personId: number, declarationId: number) : Observable<HttpEvent<string>> {
    // PUT /signatory/{personId}/{declarationId} => createSignatory(personId, declarationId)
    let url = env.serviceUrl + "/signatory/" + personId + "/" + declarationId;
    return this.http.put<string>(url, null, {observe: "events"});
  }

  /**
   * Unlinks a specified Person as a signatory of a specified Declaration.
   * @param personId The ID of the Person to unlink.
   * @param declarationId The ID of the Declaration.
   * @return An Observable to deliver the HttpEvents from the request.
   */
  deleteSignatory(personId: number, declarationId: number) : Observable<HttpEvent<void>> {
    // DELETE /signatory/{personId}/{declarationId} => deleteSignatory(personId, declarationId)
    let url = env.serviceUrl + "/signatory/" + personId + "/" + declarationId;
    return this.http.delete<void>(url, {observe: "events"});
  }

}