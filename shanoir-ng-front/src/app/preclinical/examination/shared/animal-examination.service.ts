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

import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ExaminationService } from 'src/app/examinations/shared/examination.service';

import { Examination } from '../../../examinations/shared/examination.model';
import { Page, Pageable } from '../../../shared/components/table/pageable.model';
import * as AppUtils from '../../../utils/app.utils';
import { AnimalExamination } from './animal-examination.model';

@Injectable()
export class AnimalExaminationService extends ExaminationService {
    
    API_URL = AppUtils.BACKEND_API_EXAMINATION_URL;
    
    getEntityInstance() { return new AnimalExamination(); }

    getPage(pageable: Pageable): Promise<Page<Examination>> {
        return this.http.get<Page<Examination>>(
            AppUtils.BACKEND_API_EXAMINATION_PRECLINICAL_URL+'/1', 
            { 'params': pageable.toParams() }
        ).toPromise();
    }

    getBrukerArchive(examinationId): Promise<HttpResponse<Blob>> {
        return this.http.get(
            AppUtils.BACKEND_API_EXAMINATION_PRECLINICAL_URL+'/examinationId/' + examinationId  + '/export',
            { observe: 'response', responseType: 'blob' }
        ).toPromise();
    }
}