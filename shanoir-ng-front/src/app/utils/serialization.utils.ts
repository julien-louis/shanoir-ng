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
import { AcquisitionEquipment } from '../acquisition-equipments/shared/acquisition-equipment.model';
import { ManufacturerModel } from '../acquisition-equipments/shared/manufacturer-model.model';
import { Manufacturer } from '../acquisition-equipments/shared/manufacturer.model';
import { Task } from '../async-tasks/task.model';
import { Center } from '../centers/shared/center.model';
import { Coil } from '../coils/shared/coil.model';
import { DataUserAgreement } from '../dua/shared/dua.model';
import { Examination } from '../examinations/shared/examination.model';
import { NiftiConverter } from '../niftiConverters/nifti.converter.model';
import { Anesthetic } from '../preclinical/anesthetics/anesthetic/shared/anesthetic.model';
import { ExaminationAnesthetic } from '../preclinical/anesthetics/examination_anesthetic/shared/examinationAnesthetic.model';
import { AnestheticIngredient } from '../preclinical/anesthetics/ingredients/shared/anestheticIngredient.model';
import { AnimalSubject } from '../preclinical/animalSubject/shared/animalSubject.model';
import { PreclinicalSubject } from '../preclinical/animalSubject/shared/preclinicalSubject.model';
import { ContrastAgent } from '../preclinical/contrastAgent/shared/contrastAgent.model';
import { ExtraData } from '../preclinical/extraData/extraData/shared/extradata.model';
import { Pathology } from '../preclinical/pathologies/pathology/shared/pathology.model';
import { PathologyModel } from '../preclinical/pathologies/pathologyModel/shared/pathologyModel.model';
import { SubjectPathology } from '../preclinical/pathologies/subjectPathology/shared/subjectPathology.model';
import { Reference } from '../preclinical/reference/shared/reference.model';
import { SubjectTherapy } from '../preclinical/therapies/subjectTherapy/shared/subjectTherapy.model';
import { Therapy } from '../preclinical/therapies/therapy/shared/therapy.model';
import { Entity } from '../shared/components/entity/entity.abstract';
import { StudyCenter } from '../studies/shared/study-center.model';
import { Study } from '../studies/shared/study.model';
import { StudyCard } from '../study-cards/shared/study-card.model';
import { Subject } from '../subjects/shared/subject.model';
import { User } from '../users/shared/user.model';


export function serialize(obj: Object, catalog: Set<string> = new Set()): string {
    let str: string = JSON.stringify(obj, (key, value) => {
        if (value instanceof Entity) {
            let entityKey: string = value.constructor.name + '_' + value.id;
            if (catalog.has(entityKey)) {
                return {
                    id: value.id,
                    _entity_type: value.constructor.name,
                    _duplicated: true
                };
            } else {
                catalog.add(entityKey);
                value['_entity_type'] = value.constructor.name;
                return value;
            }
        }  else {
            return value;
        }
    });    
    return str;
}

export function parse(str: string): any {
    let rawParsed: any = JSON.parse(str);
    return revive(rawParsed);
}

function revive(obj: any, catalog: Map<string, Entity> = new Map<string, Entity>()): any {
    if (obj instanceof Object) {
        let reference: boolean = false;
        if (obj._entity_type) {
            let entityKey: string = obj._entity_type + '_' + obj.id;
            if (obj._duplicated) {
                let referenced: Entity = catalog.get(entityKey);
                if (!referenced) throw new Error('parsing error : cannot revive object, no breference for ' + entityKey);
                else {
                    obj = referenced;
                    reference = true;
                }
            } else {
                obj = Object.assign(callConstructor(obj._entity_type), obj);
                catalog.set(entityKey, obj);
                delete obj._entity_type;
            }
        }
        if (!reference) {
            Object.entries(obj).forEach(([key, value]) => {
                obj[key] = revive(value, catalog);
            })
        }
    } else if (obj instanceof Array) {
        obj.map(elt => revive(elt, catalog));
    }
    return obj;
}

function callConstructor(str: string): Entity {
    switch (str) {
        case 'Subject' : return new Subject();
        case 'StudyCard' : return new StudyCard();
        case 'NiftiConverter' : return new NiftiConverter();
        case 'User' : return new User();
        case 'Examination' : return new Examination();
        case 'AcquisitionEquipment' : return new AcquisitionEquipment();
        case 'ManufacturerModel' : return new ManufacturerModel();
        case 'Manufacturer' : return new Manufacturer();
        case 'Task' : return new Task();
        case 'DataUserAgreement' : return new DataUserAgreement();
        case 'PathologyModel' : return new PathologyModel();
        case 'SubjectPathology' : return new SubjectPathology();
        case 'Pathology' : return new Pathology();
        case 'PreclinicalSubject' : return new PreclinicalSubject();
        case 'AnimalSubject' : return new AnimalSubject();
        case 'ContrastAgent' : return new ContrastAgent();
        case 'ExtraData' : return new ExtraData();
        case 'AnestheticIngredient' : return new AnestheticIngredient();
        case 'ExaminationAnesthetic' : return new ExaminationAnesthetic();
        case 'Anesthetic' : return new Anesthetic();
        case 'SubjectTherapy' : return new SubjectTherapy();
        case 'Therapy' : return new Therapy();
        case 'Reference' : return new Reference();
        case 'Coil' : return new Coil();
        case 'StudyCenter' : return new StudyCenter();
        case 'Study' : return new Study();
        case 'Center' : return new Center();
        default : throw new Error('parsing error : cant find a constructor for ' + str);
    }
}