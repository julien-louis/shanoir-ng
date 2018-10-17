import { Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';


export abstract class AbstractImportStepComponent implements OnChanges {

    @Output() validityChange = new EventEmitter<boolean>();
    private valid: boolean;

    constructor() {}
    
    ngOnChanges(changes: SimpleChanges) {
        this.updateValidity();
    }

    protected updateValidity() {
        let newValue = this.getValidity();
        if (this.valid != newValue) {
            this.validityChange.emit(newValue);
        }
        this.valid = newValue;
    }

    abstract getValidity(): boolean;

}