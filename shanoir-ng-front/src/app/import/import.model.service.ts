import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { ContextData } from './clinical-context/clinical-context.component';
import { ImportJob, PatientDicom } from './dicom-data.model';

@Injectable()
export class ImportModelService {
    
    public extractedSub: Subject<any> = new Subject<any>();
    public importJobSub: Subject<ImportJob> = new Subject<ImportJob>();
    public selectedPatientsSub: Subject<PatientDicom[]> = new Subject<PatientDicom[]>();
    public contextSub: Subject<ContextData> = new Subject<ContextData>();

    constructor() {
    }

    
}  