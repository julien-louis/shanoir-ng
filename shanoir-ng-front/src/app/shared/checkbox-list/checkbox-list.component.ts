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

import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Option } from '../select/select.component';

@Component({
    selector: 'checkbox-list',
    templateUrl: 'checkbox-list.component.html',
    styleUrls: ['checkbox-list.component.css'],
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => CheckboxListComponent),
          multi: true,
        }]   
})

export class CheckboxListComponent implements ControlValueAccessor {
    onChange = (_: any) => {};
    @Output() change: EventEmitter<any> = new EventEmitter<any>();
    onTouched = () => {};
    @Input() options: Option<any>[];
    selectedOptions: Option<any>[] = [];
    selectAll: boolean = true;
    selected: any;

    unselectAll (isChecked: boolean) {
        this.selectedOptions = [];
        this.options.forEach(opt => opt.disabled = false);
        this.sendSelected();
    }

    add(option: Option<any>) {
        option.disabled = true;
        this.selectedOptions.push(option);
        this.selected = null;
        this.sendSelected();
    }

    remove(index: number, option: Option<any>) {
        this.selectedOptions.splice(index, 1);
        option.disabled = false;
        this.sendSelected();
    }

    sendSelected() {
        let items = this.selectedOptions.map(option => option.value);
        this.onChange(items);
        this.change.emit(items);
    }
    
    writeValue(obj: any): void {
        if (!this.options) return;
        else if (!obj) this.selectedOptions = [];
        if (obj && Array.isArray(obj)) {
            this.selectedOptions = obj.map(item => {
                if (this.options) {
                    return this.options.find(opt => {
                        return opt.value == item
                                || (opt.value && opt.value.id && item.id && opt.value.id == item.id);
                    });
                } 
            });
        } else throw Error('ngModel must be an array');
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}