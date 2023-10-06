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
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { TaskState, TaskStatus } from 'src/app/async-tasks/task.model';
import { EntityService } from '../../shared/components/entity/entity.abstract.service';
import { Page, Pageable } from '../../shared/components/table/pageable.model';
import * as AppUtils from '../../utils/app.utils';
import { ServiceLocator } from '../../utils/locator.service';
import { DatasetDTO, DatasetDTOService } from "./dataset.dto";
import { Dataset } from './dataset.model';
import { DatasetUtils } from './dataset.utils';

export type Format = 'eeg' | 'nii' | 'BIDS' | 'dcm';

@Injectable()
export class DatasetService extends EntityService<Dataset> {
    
    API_URL = AppUtils.BACKEND_API_DATASET_URL;

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    constructor(protected http: HttpClient) {
        super(http);
    }

    private datasetDTOService: DatasetDTOService = ServiceLocator.injector.get(DatasetDTOService);

    private errorService: ErrorHandler  = ServiceLocator.injector.get(ErrorHandler);

    deleteAll(ids: number[]) {
        return this.http.request<void>('delete', this.API_URL + '/delete', { body: JSON.stringify(ids) })
                .toPromise();
    }

    getEntityInstance(entity: Dataset) {
        return DatasetUtils.getDatasetInstance(entity.type);
    }

    getPage(pageable: Pageable): Promise<Page<Dataset>> {
        return this.http.get<Page<Dataset>>(AppUtils.BACKEND_API_DATASET_URL, { 'params': pageable.toParams() })
            .toPromise()
            .then((page: Page<Dataset>) => {
                if (page && page.content) {
                    page.content = page.content.map(ds => Object.assign(ds, this.getEntityInstance(ds)));
                }
                return page;
            })
            .then(this.mapPage);
    }

    getByExaminationId(examinationId: number) : Promise<Dataset[]> {
        return this.http.get<DatasetDTO[]>(AppUtils.BACKEND_API_DATASET_URL + '/examination/' + examinationId)
                .toPromise()
                .then(dtos => this.datasetDTOService.toEntityList(dtos, null, 'lazy'));
    }

    getByAcquisitionId(acquisitionId: number): Promise<Dataset[]> {
        return this.http.get<DatasetDTO[]>(AppUtils.BACKEND_API_DATASET_URL + '/acquisition/' + acquisitionId)
                .toPromise()
                .then(dtos => this.datasetDTOService.toEntityList(dtos));
    }

    getByStudycardId(studycardId: number): Promise<Dataset[]> {
        return this.http.get<DatasetDTO[]>(AppUtils.BACKEND_API_DATASET_URL + '/studycard/' + studycardId)
            .toPromise()
            .then(dtos => this.datasetDTOService.toEntityList(dtos));
    }

    getByStudyId(studyId: number): Promise<Dataset[]> {
        return this.http.get<DatasetDTO[]>(AppUtils.BACKEND_API_DATASET_URL + '/study/' + studyId)
                .toPromise()
                .then(dtos => this.datasetDTOService.toEntityList(dtos));
    }

    getByStudyIdAndSubjectId(studyId: number, subjectId: number): Promise<Dataset[]> {
		if (!subjectId) {
			return this.getByStudyId(studyId);
		}
        return this.http.get<DatasetDTO[]>(AppUtils.BACKEND_API_DATASET_URL + '/find/subject/' + subjectId + '/study/' + studyId)
                .toPromise()
                .then(dtos => this.datasetDTOService.toEntityList(dtos));
    }

    getByIds(ids: Set<number>): Promise<Dataset[]> {
        const formData: FormData = new FormData();
        formData.set('datasetIds', Array.from(ids).join(","));
        return this.http.post<DatasetDTO[]>(AppUtils.BACKEND_API_DATASET_URL + '/allById', formData)
            .toPromise()
            .then(dtos => this.datasetDTOService.toEntityList(Array.from(dtos)));
    }

    public downloadDatasets(ids: number[], format: string, state?: TaskState): Observable<TaskState> {
        const formData: FormData = new FormData();
        formData.set('datasetIds', ids.join(","));
        formData.set("format", format);

        return this.http.post(
            AppUtils.BACKEND_API_DATASET_URL + '/massiveDownload', formData, {
                reportProgress: true,
                observe: 'events',
                responseType: 'blob'
        }).map(event => {
            state = this.extractProgression(event);
            return state;
        });
    }

    public downloadDatasetsByStudy(studyId: number, format: string, state?: TaskState): Observable<TaskState>  {
        let params = new HttpParams().set("studyId", '' + studyId).set("format", format);
        return this.http.get(
            AppUtils.BACKEND_API_DATASET_URL + '/massiveDownloadByStudy',{
                reportProgress: true,
                observe: 'events',
                responseType: 'blob',
                params: params
            }).map(event => {
                state = this.extractProgression(event);
                return state;
            });
    }

    public downloadDatasetsByExamination(examinationId: number, format: string, state?: TaskState): Observable<TaskState>  {
        let params = new HttpParams().set("examinationId", '' + examinationId).set("format", format);
        return this.http.get(
            AppUtils.BACKEND_API_DATASET_URL + '/massiveDownloadByExamination',{
                reportProgress: true,
                observe: 'events',
                responseType: 'blob',
                params: params
            }).map(event => {
                state = this.extractProgression(event);
                return state;
            });
  }

    public downloadDatasetsByAcquisition(acquisitionId: number, format: string, state?: TaskState): Observable<TaskState> {
        let params = new HttpParams().set("acquisitionId", '' + acquisitionId).set("format", format);
        return this.http.get(
            AppUtils.BACKEND_API_DATASET_URL + '/massiveDownloadByAcquisition',{
                reportProgress: true,
                observe: 'events',
                responseType: 'blob',
                params: params
            }).map(event => {
                state = this.extractProgression(event);
                return state;
            });
    }

    downloadStatistics(studyNameInRegExp: string, studyNameOutRegExp: string, subjectNameInRegExp: string, subjectNameOutRegExp: string) {
        let params = new HttpParams()
            .set("studyNameInRegExp", studyNameInRegExp)
            .set("studyNameOutRegExp", studyNameOutRegExp)
            .set("subjectNameInRegExp", subjectNameInRegExp)
            .set("subjectNameOutRegExp", subjectNameOutRegExp);
        return this.http.get(
            AppUtils.BACKEND_API_DATASET_URL + '/downloadStatistics', { observe: 'response', responseType: 'blob', params: params})
            .toPromise().then(
            response => {
                this.downloadIntoBrowser(response);
            }
        )
    }

    download(dataset: Dataset, format: Format, converterId: number = null): Promise<void> {
        if (!dataset.id) throw Error('Cannot download a dataset without an id');
        return this.downloadFromId(dataset.id, format, converterId);
    }

    downloadDicomMetadata(datasetId: number): Promise<any> {
        return this.http.get(
            AppUtils.BACKEND_API_DATASET_URL + '/dicom-metadata/' + datasetId,
            { responseType: 'json' }
        ).toPromise();
    }

    downloadFromId(datasetId: number, format: string, converterId: number = null): Promise<void> {
        if (!datasetId) throw Error('Cannot download a dataset without an id');
        return this.downloadToBlob(datasetId, format, converterId).then(
            response => {
                this.downloadIntoBrowser(response);
            }
        ).catch(error => {
            this.errorService. handleError(error);
        });
    }

    downloadToBlob(id: number, format: string, converterId: number = null): Promise<HttpResponse<Blob>> {
        if (!id) throw Error('Cannot download a dataset without an id');
        return this.http.get(
            AppUtils.BACKEND_API_DATASET_URL + '/download/' + id + '?format=' + format + (converterId ? ('&converterId=' + converterId) : ''),
            { observe: 'response', responseType: 'blob' }
        ).toPromise();
    }

    exportBIDSBySubjectId(subjectId: number, subjectName: string, studyName: string): void {
        if (!subjectId) throw Error('subject id is required');
        this.http.get(AppUtils.BACKEND_API_DATASET_URL + '/exportBIDS/subjectId/' + subjectId
            + '/subjectName/' + subjectName + '/studyName/' + studyName,
            { observe: 'response', responseType: 'blob' }
        ).toPromise().then(response => {this.downloadIntoBrowser(response);});
    }

    getUrls(id: number): Observable<HttpResponse<any>> {
        if (!id) throw Error('Cannot get the urls of a dataset without an id');
        return this.http.get<any>(AppUtils.BACKEND_API_DATASET_URL + '/urls/' + id);
    }

    prepareUrl(id: number, url: string, format: string): Observable<any> {
        if (!id) throw Error('Cannot get the urls of a dataset without an id');
        // return this.http.get<any>(AppUtils.BACKEND_API_DATASET_URL + '/urls/' + id + '/url/?url=' + url + '&format=' + format);

        let httpOptions: any = Object.assign( { responseType: 'text' }, this.httpOptions);

        return this.http.post<string>(`${AppUtils.BACKEND_API_DATASET_URL}/prepare-url/${encodeURIComponent(id)}?format=${encodeURIComponent(format)}`, { url: url }, httpOptions);
    }

    private downloadIntoBrowser(response: HttpResponse<Blob>){
        AppUtils.browserDownloadFileFromResponse(response.body, response);
    }

    protected mapEntity = (dto: DatasetDTO, quickResult?: Dataset, mode: 'eager' | 'lazy' = 'eager'): Promise<Dataset> => {
        let result: Dataset = DatasetUtils.getDatasetInstance(dto.type);
        this.datasetDTOService.toEntity(dto, result, mode);
        return Promise.resolve(result);
    }

    protected mapEntityList = (dtos: DatasetDTO[]): Promise<Dataset[]> => {
        let result: Dataset[] = [];
        if (dtos) this.datasetDTOService.toEntityList(dtos, result);
        return Promise.resolve(result);
    }

    public stringify(entity: Dataset) {
        let dto = new DatasetDTO(entity);
        return JSON.stringify(dto, (key, value) => {
            return this.customReplacer(key, value, dto);
        });
    }
}
