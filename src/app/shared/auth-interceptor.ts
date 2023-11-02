/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler } from '@angular/common/http'
import { Observable } from 'rxjs';

/**
 * Intercepts HttpRequests and adds authentication token if logged in.
 */
@Injectable({
    providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

    /**
     * Implementation adds an HTTP Authorization header if the user is logged in.
     * @inheritdoc
     * @override
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const jwt = sessionStorage.getItem("jwt_token");
        if (jwt) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization", "Bearer " + jwt)
            });

            return next.handle(cloned);
        } else {
            return next.handle(req);
        }
    }

}