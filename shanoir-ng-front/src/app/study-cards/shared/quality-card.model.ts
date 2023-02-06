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
import { Entity } from '../../shared/components/entity/entity.abstract';
import { Option } from '../../shared/select/select.component';
import { Study } from '../../studies/shared/study.model';
import { allOfEnum } from '../../utils/app.utils';
import { StudyCardCondition } from './study-card.model';


export class QualityCard extends Entity {

    id: number;
    name: string;
    study: Study;
    rules: QualityCardRule[] = [];
}


export class QualityCardRule {

    tag: QualityTag[];
    conditions: StudyCardCondition[];
}

export enum QualityTag {

    VALID = 1,
    WARNING = 2,
    ERROR = 3

} export namespace QualityTag {
    
    export function all(): Array<QualityTag> {
        return allOfEnum<QualityTag>(QualityTag);
    }

    export var options: Option<QualityTag>[] = all().map(prop => new Option<QualityTag>(prop, prop.toString()));
}