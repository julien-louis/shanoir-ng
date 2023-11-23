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

import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {DatasetService, Format} from 'src/app/datasets/shared/dataset.service';
import { GlobalService } from '../../services/global.service';
import { Option } from '../../select/select.component';
import {Dataset} from "../../../datasets/shared/dataset.model";
import {DatasetType} from "../../../datasets/shared/dataset-type.model";

@Component({
    selector: 'download-setup',
    templateUrl: 'download-setup.component.html',
    styleUrls: ['download-setup.component.css']
})

export class DownloadSetupComponent implements OnInit {

    @Output() go: EventEmitter<{format: Format, converter: number, nbQueues: number, unzip: boolean, datasets: Dataset[]}> = new EventEmitter();
    @Output() close: EventEmitter<void> = new EventEmitter();
    @Input() studyId: number;
    @Input() examinationId: number;
    @Input() acquisitionId: number;
    @Input() subjectId: number;
    @Input() datasetIds: number[];
    form: UntypedFormGroup;
    loading: boolean;
    format: Format;
    converter: number;
    datasets: Dataset[];
    hasDicom: boolean = false;

    @ViewChild('window') window: ElementRef;

    formatOptions: Option<Format>[] = [
        new Option<Format>('dcm', 'Dicom', null, null, null, false),
        new Option<Format>('nii', 'Nifti', null, null, null, false),
    ];

    niftiConverters: Option<number>[] = [
        new Option<number>(1, 'DCM2NII_2008_03_31', null, null, null, false),
        new Option<number>(2, 'MCVERTER_2_0_7', null, null, null, false),
        new Option<number>(4, 'DCM2NII_2014_08_04', null, null, null, false),
        new Option<number>(5, 'MCVERTER_2_1_0', null, null, null, false),
        new Option<number>(6, 'DCM2NIIX', null, null, null, false),
        new Option<number>(7, 'DICOMIFIER', null, null, null, false),
        new Option<number>(8, 'MRICONVERTER', null, null, null, false),
    ];

    constructor(private formBuilder: UntypedFormBuilder,
                globalService: GlobalService,
                private datasetService: DatasetService) {
        globalService.onNavigate.subscribe(() => {
            this.cancel();
        });
    }

    ngOnInit(): void {
        this.form = this.buildForm();
        this.loading = true;
        if (this.studyId) {
            if (this.subjectId) {
                this.datasetService.getByStudyIdAndSubjectId(this.studyId, this.subjectId).then(
                    datasetsResult => {
                        this.datasets = datasetsResult;
                        this.hasDicom = this.hasDicomInDatasets(this.datasets);
                        this.loading = false;
                    }
                );
            } else {
                this.datasetService.getByStudyId(this.studyId).then(
                    datasetsResult => {
                        this.datasets = datasetsResult;
                        this.hasDicom = this.hasDicomInDatasets(this.datasets);
                        this.loading = false;
                    }
                );
            }
        } else if (this.examinationId) {
            this.datasetService.getByExaminationId(this.examinationId).then(
                datasetsResult => {
                    this.datasets = datasetsResult;
                    this.hasDicom = this.hasDicomInDatasets(this.datasets);
                    this.loading = false;
                }
            );
        } else if (this.acquisitionId) {
            this.datasetService.getByAcquisitionId(this.acquisitionId).then(
                datasetsResult => {
                    this.datasets = datasetsResult;
                    this.hasDicom = this.hasDicomInDatasets(this.datasets);
                    this.loading = false;
                }
            );
        } else if (this.datasetIds) {
            this.datasetService.getByIds(new Set(this.datasetIds)).then(
                datasetsResult => {
                    this.datasets = datasetsResult;
                    this.hasDicom = this.hasDicomInDatasets(this.datasets);
                    this.loading = false;
                }
            );
        }
    }

    private buildForm(): UntypedFormGroup {
        let formGroup = this.formBuilder.group({
            'format': [{value: this.format || 'dcm', disabled: this.format}, [Validators.required]],
            'converter': [{value: this.converter}],
            'nbQueues': [4, [Validators.required, Validators.min(1), Validators.max(1024)]],
            'unzip': [false, []],
        });
        return formGroup;
    }

    downloadNow() {
        this.go.emit({
            format: this.form.get('format').value,
            converter: (this.form.get('format').value == 'nii') ? this.form.get('converter').value : null,
            nbQueues: this.form.get('nbQueues').value,
            unzip: this.form.get('unzip').value,
            datasets: this.datasets
        });
    }

    cancel() {
        this.close.emit();
    }

    @HostListener('click', ['$event'])
    onClick(clickEvent) {
        if (!this.window.nativeElement.contains(clickEvent.target)) {
            this.cancel();
        }
    }
    // This method checks if the list of given datasets has dicom or not.
    private hasDicomInDatasets(datasets: Dataset[]) {
        for (let dataset of datasets) {
            if (dataset.type != DatasetType.Eeg && dataset.type != DatasetType.BIDS && dataset.datasetProcessing == null) {
                return true;
            }
        }
        return false;
    }

}
