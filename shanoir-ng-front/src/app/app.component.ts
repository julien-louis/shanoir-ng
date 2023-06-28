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

import { Component, ElementRef, ViewContainerRef, HostBinding, HostListener, ViewChild } from '@angular/core';

import { KeycloakService } from './shared/keycloak/keycloak.service';
import { GlobalService } from './shared/services/global.service';
import { ServiceLocator } from './utils/locator.service';
import { slideRight, parent, slideMarginLeft } from './shared/animations/animations';
import { WindowService } from './shared/services/window.service';
import { KeycloakSessionService } from './shared/session/keycloak-session.service';
import { ConfirmDialogService } from './shared/components/confirm-dialog/confirm-dialog.service';
import { Router } from '@angular/router';
import { StudyService } from './studies/shared/study.service';
import { ConsoleComponent } from './shared/console/console.component';
import { UserService } from './users/shared/user.service';
import { UserComponent } from './users/user/user.component';
import { DatasetListComponent } from './datasets/dataset-list/dataset-list.component';


@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
    animations: [ slideRight, slideMarginLeft, parent ]
})

export class AppComponent {

    @HostBinding('@parent') public menuOpen: boolean = true;
    @ViewChild('console') consoleComponenent: ConsoleComponent;

    constructor(
            public viewContainerRef: ViewContainerRef,
            private globalService: GlobalService,
            private windowService: WindowService,
            private element: ElementRef,
            private keycloakSessionService: KeycloakSessionService,
            private confirmService: ConfirmDialogService,
            protected router: Router,
            private studyService: StudyService,
            private userService: UserService) {
        
        ServiceLocator.rootViewContainerRef = this.viewContainerRef;
        this.test();
    }

    ngOnInit() {
        this.globalService.registerGlobalClick(this.element);
        this.windowService.width = window.innerWidth;
        if(this.keycloakSessionService.isAuthenticated()) {
            this.userService.getAccessRequestsForAdmin();
            this.duaAlert();
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.windowService.width = event.target.innerWidth;
    }

    toggleMenu(open: boolean) {
        this.menuOpen = open;
    }

    isAuthenticated(): boolean {
        return KeycloakService.auth.loggedIn;
    }

    private duaAlert() {
        this.studyService.getMyDUA().then(dua => {
            let hasDUA: boolean = dua && dua.length > 0;
            if (hasDUA && !this.keycloakSessionService.hasBeenAskedDUA) {
                this.keycloakSessionService.hasBeenAskedDUA = true;
                if (this.router.url != '/dua' && this.router.url != '/home') {
                    this.askForDuaSigning();
                }
            }
        });
    }

    private askForDuaSigning() {
        const title: string = 'Data User Agreement awaiting for signing';
        const text: string = 'You are a member of at least one study that needs you to accept its data user agreement. '
            + 'Until you have agreed those terms you cannot access to any data from these studies. '
            + 'Would you like to review those terms now?';
        const buttons = {ok: 'Yes, proceed to the signing page', cancel: 'Later'};
        this.confirmService.confirm(title, text, buttons).then(response => {
                if (response == true) this.router.navigate(['/dua']);
            });
    }

    diagram: string;
    test() {
        let modelJson: any = {
            classes: [
                {
                    name: 'Study',
                    properties: [
                        {
                            name: 'name',
                            type: 'string'
                        }, {
                            name: 'id',
                            type: 'number'
                        }
                    ]
                }, {
                    name: 'Examination',
                    properties: [
                        {
                            name: 'name',
                            type: 'string'
                        }, {
                            name: 'id',
                            type: 'number'
                        }, {
                            name: 'studyId',
                            type: 'Study'
                        }
                    ]
                }, {
                    name: 'ExtraFile',
                    properties: [
                        {
                            name: 'name',
                            type: 'string'
                        }, {
                            name: 'id',
                            type: 'number'
                        }, {
                            name: 'studyId',
                            type: 'Study'
                        }
                    ]
                }

            ]
        };

// Lost in a wave
// Landmvrks

        
        
        
        let diagram: string = '';



        modelJson?.classes.forEach(clazz => {
            console.log(clazz.name, clazz.drawn)
            if (!clazz.drawn) {
                diagram = this.addToTheRight(this.buildClass(clazz), diagram);
                clazz.drawn = true;
                modelJson.classes.filter(c => c.name != clazz.name && !c.drawn && c.properties?.find(prop => prop.type == clazz.name)).forEach((subClazz, index) => {
                    console.log(index)
                    if (index == 0) {
                        diagram = this.addToTheRight(this.buildClass(subClazz), diagram);
                        subClazz.drawn = true;
                    } else if (index == 1) {
                        // diagram = this.addToTheBottom(this.buildClass(subClazz), diagram);
                        subClazz.drawn = true;
                    }
                });
            }
        });


        // const classStringBlocks: string[] = modelJson?.classes?.map(c => this.buildClass(c));

        // classStringBlocks.forEach(block => {
        //     diagram = this.addToTheLeft(block, diagram);
        // });

        
        this.diagram = diagram;
    }
    
    buildLine(content: string, width: number, align: 'left' | 'center'): string {
        const nNbFillers: number = width - content?.length;
        if (align == 'center') {
            return '|' + (' '.repeat(Math.floor(nNbFillers / 2))) + content + (' '.repeat(Math.round(nNbFillers / 2))) + '|';
        } else if (align == 'left') {
            return '|' + content + (' '.repeat(nNbFillers)) + '|';
        } else {
            throw new Error('invalid value for align');
        };
    }
    
    buildHorizontalBar(length: number): string {
        const hline: string = '-';
        return '+' + hline.repeat(length) + '+';
    }

    buildClass(clazz: any) {
        let classStr: string = '';
        let propertyLines: string [] = clazz.properties?.map(prop => {
            return '- ' + prop.name + ': ' + prop.type;
        });
        const maxWidth: number = propertyLines.concat(clazz.name).reduce((prev, current) => {
            return (prev.length > current.length) ? prev : current
        }).length + 2;
        
        // header
        classStr += this.buildHorizontalBar(maxWidth);
        classStr += '\n' + this.buildLine(clazz.name, maxWidth, 'center');
        classStr += '\n' + this.buildHorizontalBar(maxWidth);
        
        // body
        propertyLines.forEach(propLine => {
            classStr += '\n' + this.buildLine(propLine, maxWidth, 'left');
        });
        classStr += '\n' + this.buildHorizontalBar(maxWidth);
        
        return classStr;
    }

    addToTheLeft(added: string, to: string): string {
        const margin: number = 5;
        const splitAdded: string[] = added.split('\n');
        const splitTo: string[] = to.split('\n');
        splitTo.forEach((toLine, lineNumber) => {
            splitAdded[lineNumber] = (splitAdded[lineNumber] || ' '.repeat(splitTo[0].length)) + ' '.repeat(margin) + toLine;
        });
        return splitAdded.join('\n');
    }

    addToTheRight(added: string, to: string): string {
        return this.addToTheLeft(to, added);
    }
    
    addToTheBottom(added: string, to: string): string {
        const margin: number = 5;
        to += '\n'.repeat(margin) + added
        return to;
    }

}