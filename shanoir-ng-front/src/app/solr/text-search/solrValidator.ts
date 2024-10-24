/**
 * Shanoir NG - Import, manage and share neuroimaging data
 * Copyright (C) 2009-2019 Inria - https://www.inria.fr/
 * Contact us on https://project.inria.fr/shanoir/
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/gpl-3.0.html
 */

// JavaScript Lucene Query Validator

// Special characters are + - && || ! ( ) { } [ ] ^ " ~ * ? : \
// Special words are (case-sensitive) AND NOT OR

// Makes wildcard queries case-insensitive if true.
// Refer to http://www.mail-archive.com/lucene-user@jakarta.apache.org/msg00646.html
let wildcardCaseInsensitive = true;

export type Result = {result: boolean, message?: string};

// Mutator method for wildcardCaseInsensitive.
// @param Should wildcard queries be case-insensitive?
function setWildcardCaseInsensitive(bool) {
    wildcardCaseInsensitive = bool;
}

// Should the user be prompted with an alert box if validation fails?
let alertUser = false;

function setAlertUser(bool) {
    alertUser = bool;
}

// validates a lucene query.
// @param Form field that contains the query
function doCheckLuceneQuery(queryField): Result {
    return doCheckLuceneQueryValue(queryField.value)
}

// validates a lucene query.
// @param query string
export function doCheckLuceneQueryValue(query): Result {
    if (query != null && query.length > 0) {
        query = removeEscapes(query);
        let result: Result;

        // check for allowed characters
        result = checkAllowedCharacters(query);

        // check * is used properly
        result = checkAsterisk(query);

        // check for && usage
        result = checkAmpersands(query);

        // check ^ is used properly 
        result = checkCaret(query);

        // check ~ is used properly
        result = checkSquiggle(query);

        // check ! is used properly 
        result = checkExclamationMark(query);

        // check question marks are used properly
        result = checkQuestionMark(query);

        // check parentheses are used properly
        result = checkParentheses(query);

        // check '+' and '-' are used properly      
        result = checkPlusMinus(query);

        // check AND, OR and NOT are used properly
        result = checkANDORNOT(query);

        // check that quote marks are closed
        result = checkQuotes(query);

        // check ':' is used properly
        result = checkColon(query);

        if (wildcardCaseInsensitive) {
            if (query.indexOf("*") != -1) {
                var i = query.indexOf(':');
                if (i == -1) {
                    query = query.toLowerCase();
                }
                else // found a wildcard field search
                {
                    query = query.substring(0, i) + query.substring(i).toLowerCase();
                }
            }
        }
        return result;
    } else {
        return {result: true};
    }
}

// remove the escape character and the character immediately following it
function removeEscapes(query) {
    return query.replace(/\\./g, "");
}

function checkAllowedCharacters(query): Result {
    let matches = query.match(/[^a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'= ]/);
    if (matches != null && matches.length > 0) {
        let message: string = ("Invalid search query! The allowed characters are a-z A-Z 0-9.  _ + - : () \" & * ? | ! {} [ ] ^ ~ \\ @ = # % $ ' /. Please try again.")
        return {result: false, message: message};
    }
    return {result: true};
}

function checkAsterisk(query): Result {
    let matches = query.match(/^[\*]*$|[\s]\*|^\*[^\s]/);
    if (matches != null) {
        let message: string = ("Invalid search query! The wildcard (*) character must be preceded by at least one alphabet or number. Please try again.")
        return {result: false, message: message};
    }
    return {result: true};
}

function checkAmpersands(query): Result {
    // NB: doesn't handle term1 && term2 && term3 in Firebird 0.7
    let matches = query.match(/[&]{2}/);
    if (matches != null && matches.length > 0) {
        let matches = query.match(/^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+( && )?[a-zA-Z0-9_+\-:.()\"*?|!{}\[\]\^~\\@#\/$%'=]+[ ]*)+$/); // note missing & in pattern
        if (matches == null) {
            let message: string = ("Invalid search query! Queries containing the special characters && must be in the form: term1 && term2. Please try again.")
            return {result: false, message: message};
        }
    }
    return {result: true};
}

function checkCaret(query): Result {
    //let matches = query.match(/^[^\^]*$|^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\~\\@#\/]+(\^[\d]+)?[ ]*)+$/); // note missing ^ in pattern
    let matches = query.match(/[^\\]\^([^\s]*[^0-9.]+)|[^\\]\^$/);
    if (matches != null) {
        let message: string = ("Invalid search query! The caret (^) character must be preceded by alphanumeric characters and followed by numbers. Please try again.")
        return {result: false, message: message};
    }
    return {result: true};
}

function checkSquiggle(query): Result {
    //let matches = query.match(/^[^~]*$|^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^\\@#\/]+(~[\d.]+|[^\\]\\~)?[ ]*)+$/); // note missing ~ in pattern
    let matches = query.match(/[^\\]~[^\s]*[^0-9\s]+/);
    if (matches != null) {
        let message: string = ("Invalid search query! The tilde (~) character must be preceded by alphanumeric characters and followed by numbers. Please try again.")
        return {result: false, message: message};
    }
    return {result: true};
}

function checkExclamationMark(query): Result {
    // foo! is not a query, but !foo is. hmmmm...
    // NB: doesn't handle term1 ! term2 ! term3 or term1 !term2
    let matches = query.match(/^[^!]*$|^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+( ! )?[a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+[ ]*)+$/);
    if (matches == null || matches.length == 0) {
        let message: string = ("Invalid search query! Queries containing the special character ! must be in the form: term1 ! term2. Please try again.")
        return {result: false, message: message};
    }


    return {result: true};
}

function checkQuestionMark(query): Result {
    let matches = query.match(/^(\?)|([^a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]\?+)/);
    if (matches != null && matches.length > 0) {
        let message: string = ("Invalid search query! The question mark (?) character must be preceded by at least one alphabet or number. Please try again.")
        return {result: false, message: message};
    }
    return {result: true};
}

function checkParentheses(query): Result {
    var hasLeft = false;
    var hasRight = false;
    let matchLeft = query.match(/[(]/g);
    if (matchLeft != null) hasLeft = true
    let matchRight = query.match(/[)]/g);
    if (matchRight != null) hasRight = true;

    if (hasLeft || hasRight) {
        if (hasLeft && !hasRight || hasRight && !hasLeft) {
            let message: string = ("Invalid search query! Parentheses must be closed. Please try again.")
            return {result: false, message: message};
        }
        else {
            var number = matchLeft.length + matchRight.length;
            if ((number % 2) > 0 || matchLeft.length != matchRight.length) {
                let message: string = ("Invalid search query! Parentheses must be closed. Please try again.")
                return {result: false, message: message};
            }
        }
        let matches = query.match(/\(\)/);
        if (matches != null) {
            let message: string = ("Invalid search query! Parentheses must contain at least one character. Please try again.")
            return {result: false, message: message};
        }
    }
    return {result: true};
}

function checkPlusMinus(query): Result {
    let matches = query.match(/^[^\n+\-]*$|^([+-]?[a-zA-Z0-9_:.()\"*?&|!{}\[\]\^~\\@#\/$%'=]+[ ]?)+$/);
    if (matches == null || matches.length == 0) {
        let message: string = ("Invalid search query! '+' and '-' modifiers must be followed by at least one alphabet or number. Please try again.")
        return {result: false, message: message};
    }
    return {result: true};
}

function checkANDORNOT(query): Result {
    let matches = query.match(/AND|OR|NOT/);
    if (matches != null && matches.length > 0) {
        matches = query.match(/^([a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@\/#$%'=]+\s*((AND )|(OR )|(AND NOT )|(NOT ))?[a-zA-Z0-9_+\-:.()\"*?&|!{}\[\]\^~\\@\/#$%'=]+[ ]*)+$/);
        if (matches == null || matches.length == 0) {
            let message: string = ("Invalid search query!  Queries containing AND/OR/NOT must be in the form: term1 AND|OR|NOT|AND NOT term2 Please try again.")
            return {result: false, message: message};
        }

        // its difficult to distinguish AND/OR/... from the usual [a-zA-Z] because they're...words!
        matches = query.match(/^((AND )|(OR )|(AND NOT )|(NOT ))|((AND)|(OR)|(AND NOT )|(NOT))[ ]*$/)
        if (matches != null && matches.length > 0) {
            let message: string = ("Invalid search query!  Queries containing AND/OR/NOT must be in the form: term1 AND|OR|NOT|AND NOT term2 Please try again.")
            return {result: false, message: message};
        }
    }
    return {result: true};
}

function checkQuotes(query): Result {
    let matches = query.match(/\"/g);
    if (matches != null && matches.length > 0) {
        var number = matches.length;
        if ((number % 2) > 0) {
            let message: string = ("Invalid search query! Please close all quote (\") marks.");
            return {result: false, message: message};
        }
        matches = query.match(/""/);
        if (matches != null) {
            let message: string = ("Invalid search query! Quotes must contain at least one character. Please try again.")
            return {result: false, message: message};
        }
    }
    return {result: true};
}

function checkColon(query): Result {
    let matches = query.match(/[^\\\s]:[\s]|[^\\\s]:$|[\s][^\\]?:|^[^\\\s]?:/);
    if (matches != null) {
        let message: string = ("Invalid search query! Field declarations (:) must be preceded by at least one alphabet or number and followed by at least one alphabet or number. Please try again.")
        return {result: false, message: message};
    }
    return {result: true};
}

