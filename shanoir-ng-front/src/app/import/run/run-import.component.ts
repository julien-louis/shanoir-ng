import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImportJob, PatientDicom } from '../dicom-data.model';
import { Subject } from '../../subjects/shared/subject.model';
import { ImportService } from '../import.service';
import { SubjectService } from '../../subjects/shared/subject.service';
import { MsgBoxService } from '../../shared/msg-box/msg-box.service';
import { BreadcrumbsService } from '../../breadcrumbs/breadcrumbs.service';
import { ImagesUrlUtil } from '../../shared/utils/images-url.util';
import { ContextData } from '../clinical-context/clinical-context.component';
import { ImportModelService } from '../import.model.service';

@Component({
    selector: 'run-import',
    templateUrl: 'run-import.component.html',
    styleUrls: []
})
export class ImportRunComponent implements OnInit {

    private importJob: ImportJob;
    private selectedPatients: PatientDicom[];
    private context: ContextData
    private importing: boolean = false;

    private ImagesUrlUtil = ImagesUrlUtil;
    
    constructor(
            private importService: ImportService,
            private importModelService: ImportModelService,
            private subjectService: SubjectService,
            private msgService: MsgBoxService,
            private router: Router,
            private breadcrumbsService: BreadcrumbsService) {

        this.breadcrumbsService.addStep('Run');
    }

    ngOnInit() {
        this.importModelService.importJobSub.subscribe(importJob => this.importJob = importJob);
        this.importModelService.selectedPatientsSub.subscribe(patients => this.selectedPatients = patients);
        this.importModelService.contextSub.subscribe(context => this.context = context);
    }
    

    private get patient(): PatientDicom {
        if (!this.selectedPatients || this.selectedPatients.length <= 0) return null;
        return this.selectedPatients[0];
    }
    
    private startImportJob(): void {
        this.subjectService
            .updateSubjectStudyValues(this.context.subject.subjectStudy)
            .then(() => {
                let that = this;
                this.importing = true;
                this.importData()
                    .then(() => {
                        this.importing = false;
                        setTimeout(function () {
                            that.msgService.log('info', 'The data has been successfully imported')
                        }, 0);
                        this.router.navigate(['/dataset/list']);
                    }).catch(error => {
                        this.importing = false;
                        throw error;
                    });
            }).catch(error => {
                throw new Error('Could not save the subjectStudy object, the import job has been stopped. Cause : ' + error);
            });
    }

    private importData (): Promise<any> {
        if (true) {
            let importJob = new ImportJob();
            importJob.patients = new Array<PatientDicom>();
            // this.patient.subject = new IdNameObject(this.context.subject.id, this.context.subject.name);
            this.patient.subject = Subject.makeSubject(
                    this.context.subject.id, 
                    this.context.subject.name, 
                    this.context.subject.identifier, 
                    this.context.subject.subjectStudy);
            importJob.patients.push(this.patient);
            importJob.workFolder = this.importJob.workFolder;
            importJob.fromDicomZip = true;
            importJob.examinationId = this.context.examination.id;
            importJob.frontStudyId = this.context.study.id;
            importJob.frontStudyCardId = this.context.studycard.id;
            importJob.frontConverterId = this.context.studycard.niftiConverter.id;
            return this.importService.startImportJob(importJob);
        }
    }

}