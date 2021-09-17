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
import { ActivatedRoute } from '@angular/router';
import { AcquisitionEquipment } from '../../acquisition-equipments/shared/acquisition-equipment.model';
import { ManufacturerModel } from '../../acquisition-equipments/shared/manufacturer-model.model';
import { BreadcrumbsService } from '../../breadcrumbs/breadcrumbs.service';
import { DatasetAcquisition } from '../../dataset-acquisitions/shared/dataset-acquisition.model';
import { DatasetAcquisitionService } from '../../dataset-acquisitions/shared/dataset-acquisition.service';
import { Dataset } from '../../datasets/shared/dataset.model';
import { DatasetService } from '../../datasets/shared/dataset.service';
import { DatasetModalityType } from '../../enum/dataset-modality-type.enum';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { BrowserPaging } from '../../shared/components/table/browser-paging.model';
import { FilterablePageable, Page } from '../../shared/components/table/pageable.model';
import { TableComponent } from '../../shared/components/table/table.component';
import { StudyCard } from '../shared/study-card.model';
import { StudyCardService } from '../shared/study-card.service';

@Component({
    selector: 'study-card-apply',
    templateUrl: 'study-card-apply.component.html',
    styleUrls: ['study-card-apply.component.css']
})
export class StudyCardApplyComponent {

    studycard: StudyCard;
    private loadedPromise: Promise<void>;
    private browserPaging: BrowserPaging<DatasetAcquisition>;
    private datasetAcquisitions: DatasetAcquisition[];
    columnsDefs: any = this.getColumnDefs();
    subRowsDefs: any = this.getSubRowsDefs();
    selected: Set<number> = new Set();


    constructor(
            //private datasetService: DatasetService,
            private dsAcqService: DatasetAcquisitionService,
            private studycardService: StudyCardService,
            private activatedRoute: ActivatedRoute,
            breadcrumbsService: BreadcrumbsService,
            private confirmService: ConfirmDialogService) {
        breadcrumbsService.nameStep('Reapply Study Card');
        this.loadAcquisitions();
        this.loadStudyCard();
    }

    private loadAcquisitions(): Promise<void>  {
        const studycardId: number = +this.activatedRoute.snapshot.params['id'];
        this.loadedPromise = this.dsAcqService.getByStudycardId(studycardId).then((acqs) => {
            this.datasetAcquisitions = acqs;
            this.browserPaging = new BrowserPaging(acqs, this.columnsDefs);
            console.log(acqs[0])
            console.log(TableComponent.getCellValue(acqs[0], this.subRowsDefs.columns[0]))
        });
        return this.loadedPromise;
    }

    private loadStudyCard() {
        const studycardId: number = +this.activatedRoute.snapshot.params['id'];
        this.studycardService.get(studycardId).then(sc => this.studycard = sc);
    }

    getPage(pageable: FilterablePageable, forceRefresh: boolean = false): Promise<Page<DatasetAcquisition>> {
        return this.loadedPromise.then(() => {
            if (forceRefresh) {
                return this.loadAcquisitions().then(() => this.browserPaging.getPage(pageable));
            } else {
                return this.browserPaging.getPage(pageable);
            }
        });
    }

    getColumnDefs(): any[] {
        let colDef: any[] = [
            { headerName: 'Id', field: 'id', type: 'number', width: '30px', defaultSortCol: true, defaultAsc: false},
            { headerName: 'Type', field: 'type', width: '22px'},
            { headerName: 'Nb Datasets', width: '30px', 
                cellRenderer: params => params.data.datasetsAndProcessings ? params.data.datasetsAndProcessings.length : 0
            },
            { headerName: 'Name', field: 'name'},
        ];
        return colDef;       
    }

    getSubRowsDefs() {
        function dateRenderer(date: number) {
            if (date) {
                return new Date(date).toLocaleDateString();
            }
            return null;
        };
        let subRows = {
            field: 'datasetsAndProcessings',
            columns: [
                { headerName: 'Id', field: 'id', type: 'number', width: '30px', defaultSortCol: true, defaultAsc: false},
                { headerName: 'Name', field: 'name'},
                { headerName: "Creation", field: "creationDate", type: "date", cellRenderer: (params: any) => dateRenderer(params.data.creationDate)},
            ]
        }
        return subRows;
    }

    transformAcqEq(acqEqpt: AcquisitionEquipment): string {
        if (!acqEqpt) return "";
        else if (!acqEqpt.manufacturerModel) return String(acqEqpt.id);
        else {
            let manufModel: ManufacturerModel = acqEqpt.manufacturerModel;
            return manufModel.manufacturer.name + " - " + manufModel.name + " " + (manufModel.magneticField ? (manufModel.magneticField + "T") : "")
                + " (" + DatasetModalityType.getLabel(manufModel.datasetModalityType) + ") " + acqEqpt.serialNumber
        }
    }


    private getAllAcqsIds(): number[] {
        return this.datasetAcquisitions.map(ds => ds.id);
    }

    reapplyOnAll() {
        this.reapplyOn(this.getAllAcqsIds());
    }

    reapplyOnSelected() {
        this.reapplyOn([...this.selected]);
    }

    private reapplyOn(datasetIds: number[]) {
        this.confirmService.confirm('Apply Study Card ?',
                'Would you like to apply the study card "' 
                + this.studycard.name
                + '" to ' + datasetIds.length
                + ' datasets? Note that any previous study card application will be permanentely overwriten by new values.'
        ).then(res => {
            if (res) {
                this.studycardService.applyStudyCardOn(this.studycard.id, datasetIds);
            }
        });
    }

}
