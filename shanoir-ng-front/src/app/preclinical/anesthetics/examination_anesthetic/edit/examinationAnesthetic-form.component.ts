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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { InjectionInterval } from 'src/app/preclinical/shared/enum/injectionInterval';
import { InjectionSite } from 'src/app/preclinical/shared/enum/injectionSite';
import { InjectionType } from 'src/app/preclinical/shared/enum/injectionType';
import { Mode } from 'src/app/shared/components/entity/entity.component.abstract';

import { Reference } from '../../../reference/shared/reference.model';
import { ReferenceService } from '../../../reference/shared/reference.service';
import * as PreclinicalUtils from '../../../utils/preclinical.utils';
import { Anesthetic } from '../../anesthetic/shared/anesthetic.model';
import { AnestheticService } from '../../anesthetic/shared/anesthetic.service';
import { ExaminationAnesthetic } from '../shared/examinationAnesthetic.model';

@Component({
    selector: 'examination-anesthetic-form',
    templateUrl: 'examinationAnesthetic-form.component.html',
    standalone: false
})
export class ExaminationAnestheticFormComponent {

    @Input() mode: Mode;
    @Input() parentFormGroup: UntypedFormGroup;
    @Input() examinationAnesthetic: ExaminationAnesthetic;
    @Output() newAnesthetic: EventEmitter<void> = new EventEmitter();
    anesthetics: Anesthetic[] = [];
    injectionSites: InjectionSite[] = [];
    injectionIntervals: InjectionInterval[] = [];
    injectionTypes: InjectionType[] = [];
    doseUnits: Reference[] = [];

    constructor(
            private route: ActivatedRoute,
            private referenceService: ReferenceService,
            private anestheticService: AnestheticService) {
        
        this.getEnums();
        this.loadReferences();
        this.loadAnesthetics();
    }

    loadReferences(): Promise<void> {
        return this.referenceService.getReferencesByCategoryAndType(PreclinicalUtils.PRECLINICAL_CAT_UNIT, PreclinicalUtils.PRECLINICAL_UNIT_VOLUME).then(units => {
            this.doseUnits = units;
        });

    }

    loadAnesthetics() {
        this.anestheticService.getAll().then(anesthetics => {
            this.anesthetics = anesthetics;
        });
    }

    getEnums(): void {
        this.injectionIntervals = InjectionInterval.all();
        this.injectionSites = InjectionSite.all();
        this.injectionTypes = InjectionType.all();
    }
    
    protected onNewAnesthetic() {
        this.newAnesthetic.emit();
    }
}