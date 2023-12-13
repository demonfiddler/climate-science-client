/*
 * Climate Science Client: an Angular web app for querying a climate science database via a REST service.
 * Copyright © 2023 Adrian Price. All rights reserved.
 * Licensed under the GNU Affero General Public License v.3 https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * A base level entity with a unique numeric identifier.
 */
export interface Entity {
    ID: number;
}

/**
 * An entity representing a person.
 */
export interface Person extends Entity {
    TITLE: string;
    FIRST_NAME: string;
    NICKNAME?: string;
    PREFIX?: string;
    LAST_NAME: string;
    SUFFIX?: string;
    ALIAS?: string;
    DESCRIPTION?: string;
    QUALIFICATIONS?: string;
    COUNTRY: string;
    RATING: number;
    CHECKED: boolean | number;
    PUBLISHED: boolean | number;
}

/**
 * An entity representing a scientific publication.
 */
export interface Publication extends Entity {
    TITLE: string;
    AUTHORS: string;
    JOURNAL: string;
    LOCATION: string;
    PUBLICATION_TYPE_ID: string;
    PUBLICATION_DATE: Date;
    PUBLICATION_YEAR: number;
    ABSTRACT: string;
    PEER_REVIEWED: boolean | number;
    DOI: string;
    ISSN_ISBN: string;
    URL: string;
    ACCESSED: Date;
    LINKED?: boolean | number;
}

/**
 * An entity representing a climate declaration, open letter or other public statement.
 */
export interface Declaration extends Entity {
    TYPE: string;
    TITLE: string;
    DATE: Date;
    COUNTRY: string;
    URL: string;
    SIGNATORIES: string;
    SIGNATORY_COUNT: string;
    LINKED?: boolean | number;
}

/**
 * An entity representing a quotation by a climate sceptic.
 */
export interface Quotation extends Entity {
    PERSON_ID?: number;
    AUTHOR: string;
    TEXT: string;
    DATE: Date;
    SOURCE: string;
    URL: string;
    LINKED?: boolean | number;
}

/**
 * An object representing a single database metric.
 */
export interface Statistic {
    CATEGORY: string;
    COUNT: number;
    DESCRIPTION: string;
}

/**
 * Describes the form of a paginated result set returned by the REST service.
 */
export interface ResultSet<T> {
    count: number;
    records: T[];
}
