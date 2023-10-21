/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * An enumeration of possible values for the app component's 'master' control.
 */
export enum Master {
    None = "NONE",
    Persons = "PERSONS",
    Publications = "PUBLICATIONS",
    Declarations = "DECLARATIONS",
    Quotations = "QUOTATIONS",
}  