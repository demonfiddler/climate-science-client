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

/**
 * Unescapes a base64 encoded string.
 * @param str The string to escape.
 * @returns The unescaped string.
 */
function unescape(str : string) : string {
    return (str + '==='.slice((str.length + 3) % 4))
        .replace(/-/g, '+')
        .replace(/_/g, '/')
}

/**
 * Escapes a base64 encoded string.
 * @param str The string to escape.
 * @returns The escaped string.
 */
function escape(str : string) : string {
    return str.replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}

/**
 * Encodes an ASCII string using base64-url encoding.
 * @param str The string to encode.
 * @return The encoded string.
 */
export function base64UrlEncode(str : string) : string {
    return escape(btoa(str));
}

/**
 * Decodes a base64-url encoded ASCII string.
 * @param str The encoded string to decode.
 * @returns The decoded string.
 */
export function base64UrlDecode(str : string) : string {
    return atob(unescape(str));
}
  