import { Component, ContentChildren, EventEmitter, forwardRef, Input, Output, QueryList } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MultiSelectOptionComponent } from './multiselect.option.component';

@Component({
    selector: 'mulitselect',
    templateUrl: 'multiselect.component.html',
    styleUrls: ['multiselect.component.css'],
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => MultiSelectComponent),
          multi: true,
        }]   
})

export class MultiSelectComponent implements ControlValueAccessor {
    
    @Input() ngModel: any = null;
    @Output() ngModelChange = new EventEmitter();
    @ContentChildren(forwardRef(() => MultiSelectOptionComponent)) private options: QueryList<MultiSelectOptionComponent>;

    constructor() {}

    
    writeValue(obj: any): void {
    }
    
    registerOnChange(fn: any): void {
    }

    registerOnTouched(fn: any): void {
    }

}