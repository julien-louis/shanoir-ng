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
import { Component, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { AcquisitionEquipmentService } from 'src/app/acquisition-equipments/shared/acquisition-equipment.service';
import { BreadcrumbsService } from 'src/app/breadcrumbs/breadcrumbs.service';
import { slideDown } from '../../shared/animations/animations';
import { CenterNode, ClinicalSubjectNode, MemberNode, PreclinicalSubjectNode, RightNode, StudyNode, SubjectNode, UNLOADED } from '../../tree/tree.model';
import { StudyUserRight } from '../shared/study-user-right.enum';
import { Study } from '../shared/study.model';
import { StudyService } from '../shared/study.service';

@Component({
    selector: 'study-tree',
    templateUrl: 'study-tree.component.html',
    styleUrls: ['study-tree.component.css'],
    animations: [slideDown]
})

export class StudyTreeComponent {

    protected studyNode: StudyNode;
    protected study: Study;
    protected subscriptions: Subscription[] = [];
    protected selection: Selection = new Selection();

    constructor(
            private breadcrumbsService: BreadcrumbsService,
            protected activatedRoute: ActivatedRoute,
            private studyService: StudyService,
            private equipmentService: AcquisitionEquipmentService) {

        this.subscriptions.push(this.activatedRoute.params.subscribe(
            params => {
                const id = +params['id'];
                this.init(id).then(() => {
                    this.breadcrumbsService.currentStepAsMilestone(this.study.name);
                });
            }
        ));
    }

    init(id: number): Promise<void> {
        let studyPromise: Promise<any> = this.studyService.get(id, null).then(study => {
            this.study = study;
            let subjectNodes: SubjectNode[] = study.subjectStudyList?.map(ss => {
                let subjectNode: SubjectNode;
                if (ss.subject?.preclinical){
                    subjectNode = new PreclinicalSubjectNode(
                        ss.subject?.id,
                        ss.subject?.name,
                        ss.tags,
                        UNLOADED,
                        null,
                        false);
                } else {
                    subjectNode = new ClinicalSubjectNode(
                        ss.subject?.id,
                        ss.subject?.name,
                        ss.tags,
                        UNLOADED,
                        null,
                        false);
                }
                return subjectNode;
            });
            let centerNodes: CenterNode[] = study.studyCenterList?.map(sc => new CenterNode(sc.center.id, sc.center.name, UNLOADED));
            let memberNodes: MemberNode[] = study.studyUserList?.map(su => new MemberNode(su.user?.id, su.userName, su.studyUserRights?.map(sur => new RightNode(null, StudyUserRight.getLabel(sur)))));
            this.studyNode = new StudyNode(study.id, study.name, subjectNodes, centerNodes, UNLOADED, memberNodes);
            this.studyNode.open = true;
        });
        return studyPromise;
    }

    protected onCenterNodeSelect(id: number) {
        this.resetSelection();
        this.selection.centerId = id;
    }

    protected onEquipementNodeSelect(id: number) {
        this.resetSelection();
        this.selection.equipmentId = id;
    }

    protected onMemberNodeSelect(id: number) {
        this.resetSelection();
        this.selection.memberId = id;
    }

    protected onQualityCardNodeSelect(id: number) {
        this.resetSelection();
        // TODO
    }

    protected onStudyCardNodeSelect(id: number) {
        this.resetSelection();
        // TODO
    }

    protected onProcessingNodeSelect(id: number) {
        this.resetSelection();
        //TODO
    }

    protected onDatasetNodeSelect(id: number) {
        this.resetSelection();
        this.selection.datasetId = id;
    }

    protected onAcquisitionNodeSelect(id: number) {
        this.resetSelection();
        this.selection.acquisitionId = id;
    }

    protected onExaminationNodeSelect(id: number) {
        this.resetSelection();
        this.selection.examinationId = id;
    }

    protected onSubjectNodeSelect(id: number) {
        this.resetSelection();
        this.selection.subjectId = id;
    }

    protected onStudyNodeSelect() {
        this.resetSelection();
        this.selection.studyId = this.study.id;
    }

    private resetSelection() {
        this.selection.studyId = null;
        this.selection.subjectId = null;
        this.selection.examinationId = null;
        this.selection.acquisitionId = null;
        this.selection.datasetId = null;
        this.selection.processingId = null;
        this.selection.centerId = null;
        this.selection.equipmentId = null;
        this.selection.studycardId = null;
        this.selection.qualitycardId = null;
        this.selection.memberId = null;
    }

    @HostListener('document:keypress', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        if (event.key == '²') {
            console.log('selection', this.selection);
        }
    }
}

export class Selection {

    private selectedEntity: 'study' | 'subject' | 'examination' | 'acquisition' | 'dataset' | 'processing' | 'center' | 'equipment' | 'studycard' | 'qualitycard' | 'member';
    private id: number;

    set studyId(id: number) {
        this.selectedEntity = 'study';
        this.id = id;
    }

    get studyId(): number {
        return this.selectedEntity == 'study' ? this.id : null;
    }

    set subjectId(id: number) {
        this.selectedEntity = 'subject';
        this.id = id;
    }

    get subjectId(): number {
        return this.selectedEntity == 'subject' ? this.id : null;
    }

    set examinationId(id: number) {
        this.selectedEntity = 'examination';
        this.id = id;
    }

    get examinationId(): number {
        return this.selectedEntity == 'examination' ? this.id : null;
    }

    set acquisitionId(id: number) {
        this.selectedEntity = 'acquisition';
        this.id = id;
    }

    get acquisitionId(): number {
        return this.selectedEntity == 'acquisition' ? this.id : null;
    }

    set datasetId(id: number) {
        this.selectedEntity = 'dataset';
        this.id = id;
    }

    get datasetId(): number {
        return this.selectedEntity == 'dataset' ? this.id : null;
    }

    set processingId(id: number) {
        this.selectedEntity = 'processing';
        this.id = id;
    }

    get processingId(): number {
        return this.selectedEntity == 'processing' ? this.id : null;
    }

    set centerId(id: number) {
        this.selectedEntity = 'center';
        this.id = id;
    }

    get centerId(): number {
        return this.selectedEntity == 'center' ? this.id : null;
    }

    set equipmentId(id: number) {
        this.selectedEntity = 'equipment';
        this.id = id;
    }

    get equipmentId(): number {
        return this.selectedEntity == 'equipment' ? this.id : null;
    }

    set studycardId(id: number) {
        this.selectedEntity = 'studycard';
        this.id = id;
    }

    get studycardId(): number {
        return this.selectedEntity == 'studycard' ? this.id : null;
    }

    set qualitycardId(id: number) {
        this.selectedEntity = 'qualitycard';
        this.id = id;
    }

    get qualitycardId(): number {
        return this.selectedEntity == 'qualitycard' ? this.id : null;
    }

    set memberId(id: number) {
        this.selectedEntity = 'member';
        this.id = id;
    }

    get memberId(): number {
        return this.selectedEntity == 'member' ? this.id : null;
    }
}
