import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as shajs from 'sha.js';

import { preventInitialChildAnimations, slideDown } from '../../shared/animations/animations';
import { EntityComponent } from '../../shared/components/entity/entity.component.abstract';
import { ShanoirError } from '../../shared/models/error.model';
import { IdNameObject } from '../../shared/models/id-name-object.model';
import { StudyService } from '../../studies/shared/study.service';
import { ImagedObjectCategory } from '../shared/imaged-object-category.enum';
import { Subject } from '../shared/subject.model';
import { SubjectService } from '../shared/subject.service';

@Component({
    selector: 'subject-detail',
    templateUrl: 'subject.component.html',
    styleUrls: ['subject.component.css'],
    animations: [slideDown, preventInitialChildAnimations]
})

export class SubjectComponent extends EntityComponent<Subject> {

    private readonly ImagedObjectCategory = ImagedObjectCategory;
    private readonly HASH_LENGTH: number = 14;
    private studies: IdNameObject[] = [];
    private isAlreadyAnonymized: boolean;
    private hasNameUniqueError: boolean = false;
    private existingSubjectError: string;
    private firstName: string = "";
    private lastName: string = "";
    private nameValidators = [Validators.required, Validators.minLength(2), Validators.maxLength(64)];

    constructor(private route: ActivatedRoute,
            private subjectService: SubjectService,
            private studyService: StudyService) {

        super(route, 'subject');
        this.manageSaveErrors();
    }

    public get subject(): Subject { return this.entity; }
    public set subject(subject: Subject) { this.entity = subject; }

    initView(): Promise<void> {
        return this.subjectService.get(this.id).then(subject => { this.subject = subject; });
    }

    initEdit(): Promise<void> {
        this.loadAllStudies();
        return this.subjectService.get(this.id).then(subject => { this.subject = subject; });
    }

    initCreate(): Promise<void> {
        this.loadAllStudies();
        this.subject = new Subject();
        this.subject.imagedObjectCategory = ImagedObjectCategory.LIVING_HUMAN_BEING;
        return Promise.resolve();
    }

    buildForm(): FormGroup {
        let subjectForm = this.formBuilder.group({
            'imagedObjectCategory': [this.subject.imagedObjectCategory, [Validators.required]],
            'isAlreadyAnonymized': [],
            'name': [this.subject.name, this.nameValidators],
            'firstName': [this.firstName],
            'lastName': [this.lastName],
            'birthDate': [this.subject.birthDate, this.mode == 'create' ? [Validators.required] : undefined],
            'sex': [this.subject.sex],
            'subjectStudyList': [],
            'manualHemisphericDominance': [this.subject.manualHemisphericDominance],
            'languageHemisphericDominance': [this.subject.languageHemisphericDominance],
            'personalComments': []
        });
        this.updateFormControl(subjectForm);
        subjectForm.get('imagedObjectCategory').valueChanges.subscribe(val => {
            this.isAlreadyAnonymized = false;
            this.updateFormControl(subjectForm);
        });
        subjectForm.get('isAlreadyAnonymized').valueChanges.subscribe(val => {
            this.updateFormControl(subjectForm);
        });
        return subjectForm;
    }

    private updateFormControl(formGroup: FormGroup) {
        if (this.subject.imagedObjectCategory == ImagedObjectCategory.LIVING_HUMAN_BEING && !this.isAlreadyAnonymized) {
            formGroup.get('firstName').setValidators(this.nameValidators);
            formGroup.get('lastName').setValidators(this.nameValidators);
        } else {
            formGroup.get('firstName').setValidators([]);
            formGroup.get('lastName').setValidators([]);
        }
        formGroup.get('firstName').updateValueAndValidity();
        formGroup.get('lastName').updateValueAndValidity();
    }

    loadAllStudies(): void {
        this.studyService
            .getStudiesNames()
            .then(studies => {
                this.studies = studies;
            });
    }  

    private manageSaveErrors() {
        this.subscribtions.push(
            this.onSave.subscribe(response => {
                if (response && response instanceof ShanoirError && response.code == 422) {
                    this.hasNameUniqueError = response.hasFieldError('name', 'unique');     
                }
            })
        );
    }

    private generateSubjectIdentifier(): string {
        let hash;
        if (this.humanSelected() && !this.isAlreadyAnonymized) {
            hash = this.firstName + this.lastName + this.subject.birthDate;
        }
        else {
            hash = this.subject.name + this.subject.birthDate;
        }
        return this.getHash(hash);
    }

    private getHash(stringToBeHashed: string): string {
        let hash = shajs('sha').update(stringToBeHashed).digest('hex');
        let hex = "";
        hex = hash.substring(0, this.HASH_LENGTH);
        return hex;
    }

    /**
     * Try to compute patient first name and last name from dicom tags. 
     * eg. TOM^HANKS -> return TOM as first name and HANKS as last name
     */
    private computeNameFromDicomTag (patientName: string): void {
        if (patientName) {
            let names: string[] = patientName.split("\\^");
            if (names !== null && names.length == 2) {
                this.firstName = names[1];
                this.lastName = names[2];
            } else {
                this.firstName = this.lastName = patientName;
            }
        }
    }

    private humanSelected(): boolean {
        return this.subject.imagedObjectCategory != null
            && (this.subject.imagedObjectCategory == ImagedObjectCategory.HUMAN_CADAVER
                || this.subject.imagedObjectCategory == ImagedObjectCategory.LIVING_HUMAN_BEING);
    }
}