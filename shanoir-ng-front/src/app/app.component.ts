import { Component, OnInit, ElementRef } from '@angular/core';

import { KeycloakService } from './shared/keycloak/keycloak.service';
import { GlobalService } from './shared/services/global.service';

@Component({
    selector: 'shanoir-ng-app',
    templateUrl: 'app.component.html',
    styles: [':host() { display: block; position: relative; width: 100%; height: 100%; }']
})

export class AppComponent implements OnInit{

    constructor(private globalService: GlobalService, private element: ElementRef) {
    }

    ngOnInit() {
        this.globalService.registerGlobalClick(this.element);
    }

    isAuthenticated(): boolean {
        return KeycloakService.auth.loggedIn;
    }

}