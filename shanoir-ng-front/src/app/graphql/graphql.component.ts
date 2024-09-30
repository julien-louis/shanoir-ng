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

import { Component, ElementRef, HostListener } from '@angular/core';
import { GraphQlService } from './graphql.service';
import { Highlight } from 'ngx-highlightjs';

@Component({
    selector: 'graphql',
    templateUrl: 'graphql.component.html',
    styleUrls: ['graphql.component.css'],
    viewProviders: [Highlight]
})

export class GraphQlComponent {
    
    protected request: string;
    protected response: string;
    
    constructor(private graphQlService: GraphQlService) {
        this.request = sessionStorage.getItem('lastGraphQl');
        console.log(this.request)
    }
    
    protected submit() {
        this.graphQlService.postGraphQlRequest(this.request)
        .then(response => {
            if (response.errors) {
                this.response = JSON.stringify(response.errors, null, 4);
            }
            this.response = JSON.stringify(response, null, 4)
        })
        .catch(error => {
            this.response = error.error.error;
            console.log('error', error)
        });
    }
    
    onKeyPress(event: any) {
        if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
            this.submit();
        }
    }
    
    onChange() {
        sessionStorage.setItem('lastGraphQl', this.request);
    }
}