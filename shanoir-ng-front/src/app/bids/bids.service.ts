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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as AppUtils from '../utils/app.utils';
import { SingleDownloadService } from '../shared/mass-download/single-download.service';
import { BidsElement } from './model/bidsElement.model';
import { Subject } from '../subjects/shared/subject.model';
import { DatasetService } from '../datasets/shared/dataset.service';
import { TaskState } from '../async-tasks/task.model';

export type Format = 'nii' | 'dcm';

@Injectable()
export class BidsService {

    readonly API_URL = AppUtils.BACKEND_API_DATASET_URL;
    readonly MAX_DATASETS_IN_ZIP_DL: number = 500;

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    constructor(
        private datasetService: DatasetService, 
        private downloadService: SingleDownloadService) {}

    public downloadAsBids(item: BidsElement, studyId: number, downloadState?: TaskState): void {
       this.downloadPath(item.path, studyId, downloadState);
    }

    private downloadPath(path: string, studyId, downloadState?: TaskState): void {
        const endpoint = this.API_URL + "/exportBIDS/studyId/" + studyId;
        let params = new HttpParams().set("filePath", path);
        this.downloadService.downloadSingleFile(endpoint, params, downloadState);
    }

    public downloadSubjectAsBids(subject: Subject, studyId: number, downloadState?: TaskState): void {
        let dirFragment: string = this.formatLabel(subject.name);
        this.datasetService.getBidsStructure(studyId).then(studyElt => {
            let subjectElt : BidsElement = studyElt.elements.find(subjectElt => {
                console.log(subjectElt.path, dirFragment, subjectElt.path.includes(dirFragment))
                subjectElt.path.includes(dirFragment);
            });
            if (subjectElt) {
                this.downloadAsBids(subjectElt, studyId);
            } else {
                throw new Error(`Can't find subject with id ${subject.id} in the bids structure`);
            }
        });
    }

    /**
     * Must match the BIDSServiceImpl.java formatLabel method
     * @param label 
     * @returns 
     */
    private formatLabel(label: string): string {
		return label = label.replace(/[^a-zA-Z0-9]+/, "");
	} 
}
