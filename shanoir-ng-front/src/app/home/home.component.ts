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

import { Component } from '@angular/core';
import { Task } from '../async-tasks/task.model';
import { TaskService } from '../async-tasks/task.service';

import { BreadcrumbsService } from '../breadcrumbs/breadcrumbs.service';
import { DataUserAgreement } from '../dua/shared/dua.model';
import { slideRight } from '../shared/animations/animations';
import { KeycloakService } from '../shared/keycloak/keycloak.service';
import { IdName } from '../shared/models/id-name.model';
import { Option } from '../shared/select/select.component';
import { ImagesUrlUtil } from '../shared/utils/images-url.util';
import { Study } from '../studies/shared/study.model';
import { StudyService } from '../studies/shared/study.service';
import { User } from '../users/shared/user.model';
import { UserService } from '../users/shared/user.service';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css'],
    animations: [ slideRight ]
})

export class HomeComponent {

    shanoirBigLogoUrl: string = ImagesUrlUtil.SHANOIR_BLACK_LOGO_PATH;
    
    challengeDuas: DataUserAgreement[];
    challengeStudies: Study[];
    studies: Study[];
    accountRequests: User[];
    jobs: Task[];
    solrInput: string;
    notifications: any[];
    loaded: boolean = false;
    nbAccountRequests: number;
    nbExtensionRequests: number;
    otherChallengeOptions: Option<IdName>[];
    selectedChallenge: IdName = null;
    challengeApplied: boolean = false;

    constructor(
            private breadcrumbsService: BreadcrumbsService,
            private studyService: StudyService,
            private keycloakService: KeycloakService,
            private userService: UserService,
            private taskService: TaskService) {
        //this.breadcrumbsService.nameStep('Home');
        this.breadcrumbsService.markMilestone();
        this.load();
    }

    load() {
        this.studyService.getMyDUA().then(duas => {
            this.challengeDuas = null;
            this.notifications = null;
            if (duas) {
                this.challengeDuas = duas.filter(dua => dua.isChallenge);
                this.notifications = duas.slice(0, 10);

            }
        }).then(() => {
            this.loaded = true;
            if (this.admin || !this.challengeDuas || this.challengeDuas.length == 0) {
                this.fetchChallengeStudy().then(() => this.fetchOtherChallenges());
                if (this.admin) {
                    this.fetchAccountRequests();
                }
                this.fetchJobs();
            }
        });
    }

    onSign() {
        this.load();
    }

    private fetchChallengeStudy(): Promise<void> {
        return this.studyService.getAll().then(studies => {
            if (studies) {
                this.challengeStudies = studies.filter(study => study.challenge);
                this.studies = studies.slice(0, 8);
            }
        });
    }

    downloadFile(filePath: string, studyId: number) {
        this.studyService.downloadFile(filePath, studyId, 'protocol-file');
    }

    isAuthenticated(): boolean {
        return KeycloakService.auth.loggedIn;
    }

    get admin(): boolean {
        return this.keycloakService.isUserAdmin();
    }

    fetchAccountRequests() {
        this.userService.getAllAccountRequests()
            .then(ars => {
                this.nbAccountRequests = ars.filter(user => !!user.accountRequestDemand).length;
                this.nbExtensionRequests = ars.filter(user => !!user.extensionRequestDemand).length;
                this.accountRequests = ars.slice(0, 7);
            });
    }

    fetchJobs() {
        this.taskService.getAll()
            .then(tasks => this.jobs = tasks.slice(0, 10));
    }

    canUserImportFromPACS(): boolean {
        return this.keycloakService.canUserImportFromPACS();
    }

    fetchOtherChallenges() {
        this.studyService.getChallenges().then(result => {
            if (result) {
                this.otherChallengeOptions = result
                    // filter the challenge already subscribed
                    .filter(chal => !this.challengeStudies.find(study => study.id == chal.id))
                    .map(chal => new Option(new IdName(chal.id, chal.name), chal.name));
            }
        });
    }

    subscribeChallenge() {
        if (this.selectedChallenge) {
            this.studyService.applyChallenge(this.selectedChallenge.id);
            this.challengeApplied = true;
        }
    }
}