import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { IMyOptions } from 'mydatepicker';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'datepicker',
    templateUrl: 'dependency-list.component.html',
    styleUrls: ['dependency-list.component.css'],
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => DependencyListComponent),
          multi: true,
        }]   
})

export class DependencyListComponent implements ControlValueAccessor {
    
    @Input() ngModel: Array<any> = null;
    @Output() ngModelChange = new EventEmitter();

    constructor() {

    }

    onModelChange(event) {
        this.ngModelChange.emit('');
    }

    writeValue(obj: any): void {
        this.ngModel = obj;
    }
    
    registerOnChange(fn: any): void {
    }

    registerOnTouched(fn: any): void {
    }

}