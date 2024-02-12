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
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    Output,
    QueryList,
    SimpleChanges,
    ViewChildren,
    forwardRef,
} from '@angular/core';

import { Mode } from '../../shared/components/entity/entity.component.abstract';
import { Option } from '../../shared/select/select.component';
import { SuperPromise } from '../../utils/super-promise';
import { StudyCardAssignment, StudyCardCondition, StudyCardRule } from '../shared/study-card.model';
import { ShanoirMetadataField, StudyCardActionComponent } from './action/action.component';
import { ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
    selector: 'study-card-rule',
    templateUrl: 'study-card-rule.component.html',
    styleUrls: ['study-card-rule.component.css'],
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => StudyCardRuleComponent),
          multi: true,
        }]
})
export class StudyCardRuleComponent implements OnChanges, ControlValueAccessor {

    @Input() mode: Mode;
    rule: StudyCardRule;
    private rulePromise: SuperPromise<StudyCardRule> = new SuperPromise(); 
    @Input() assignmentFields: ShanoirMetadataField[];
    @Input() conditionFields: ShanoirMetadataField[];
    @Output() userChange: EventEmitter<StudyCardRule> = new EventEmitter();
    @Output() moveUp: EventEmitter<void> = new EventEmitter();
    @Output() moveDown: EventEmitter<void> = new EventEmitter();
    @Output() onCopy: EventEmitter<void> = new EventEmitter();
    @Output() delete: EventEmitter<void> = new EventEmitter();
    @Input() showErrors: boolean = false;
    @ViewChildren(StudyCardActionComponent) assignmentChildren: QueryList<StudyCardActionComponent>;
    touched: boolean = false;
    assignmentFieldOptions: Option<string>[];
    conditionFieldOptions: Option<string>[];
    form: FormGroup;
    @Input() parentForm: FormGroup;
    private parentFormPromise: SuperPromise<void> = new SuperPromise();
    private onTouchedCallback = () => {};
    private onChangeCallback = (_: any) => {};

    constructor(public elementRef: ElementRef, private formBuilder: FormBuilder) {
        Promise.all([this.rulePromise, this.parentFormPromise]).then(() => {
            this.form = this.formBuilder.group({'conditions': new FormArray([])}); 
            this.rule.conditions.forEach(cond => (this.form.controls.conditions as FormArray).push(new FormControl(cond)));
            this.parentForm.addControl('rule', this.form);
            console.log('control added', this.rule.conditions.length)
        });
    }

    writeValue(obj: any): void {
        this.rule = obj;
        if (this.rule) this.rulePromise.resolve(this.rule);
    }

    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    onRuleChange() {
        this.onChangeCallback(this.rule);
        this.userChange.emit(this.rule);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.assignmentFields) {
            this.rulePromise.then(() => {
                if (this.assignmentFields) {
                    this.assignmentFieldOptions = this.assignmentFields
                        .filter(field => this.rule.scope == 'DatasetAcquisition' || (this.rule.scope == 'Dataset' && field.scope == 'Dataset'))
                        .map(field => new Option<string>(field.field, field.label, field.scope));
                } else {
                    this.assignmentFieldOptions = [];
                }
            });
        }
        if (changes.conditionFields) {
            this.rulePromise.then(() => {
                if (this.conditionFields) {
                    this.conditionFieldOptions = this.conditionFields
                        .filter(field => this.rule.scope == 'DatasetAcquisition' || (this.rule.scope == 'Dataset' && field.scope == 'Dataset'))
                        .map(field => new Option<string>(field.field, field.label, field.scope));
                } else {
                    this.conditionFieldOptions = [];
                }
            });
        }
        if (changes.parentForm) {
            console.log(this.parentForm)
        }
        if (changes.parentForm && this.parentForm) {
           this.parentFormPromise.resolve();
        }
    }

    addNewCondition() {
        let cond = new StudyCardCondition('StudyCardDICOMConditionOnDatasets');
        cond.values = [null];
        this.rule.conditions.push(cond);
        this.onChangeCallback(this.rule);
        this.userChange.emit(this.rule);
    }

    addNewAction() {
        this.rule.assignments.push(new StudyCardAssignment(this.rule.scope));
        this.onChangeCallback(this.rule);
        this.userChange.emit(this.rule);
    }

    deleteCondition(index: number) {
        this.rule.conditions.splice(index, 1);
        this.onChangeCallback(this.rule);
        this.userChange.emit(this.rule);
    }
    
    deleteAction(index: number) {
        let fieldOption: Option<string> = this.assignmentFieldOptions.find(opt => opt.value === this.rule.assignments[index].field);
        if (fieldOption) fieldOption.disabled = false;
        this.rule.assignments.splice(index, 1);
        this.onChangeCallback(this.rule);
        this.userChange.emit(this.rule);
    }

    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
        const clickedInside = this.elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.touched = true;
        }
    }

}