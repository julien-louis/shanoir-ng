import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, OnDestroy, OnChanges, SimpleChanges, ContentChildren, QueryList, AfterContentInit} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOptionComponent } from './select.option.component';
import { GlobalService } from '../services/global.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'select-box',
    templateUrl: 'select.component.html',
    styleUrls: ['select.component.css'],
    providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => SelectBoxComponent),
          multi: true,
        }]   
})

export class SelectBoxComponent implements ControlValueAccessor, OnDestroy, OnChanges, AfterContentInit {
    
    @Input() ngModel: any = null;
    @Output() ngModelChange = new EventEmitter();
    @ContentChildren(forwardRef(() => SelectOptionComponent)) options: QueryList<SelectOptionComponent>;
    private selectedOption: SelectOptionComponent;
    private openState: boolean = false;
    private globalClickSubscription: Subscription;


    constructor(private element: ElementRef, private globalService: GlobalService) { 
    }

    ngOnDestroy() {
        this.unsubscribeToGlobalClick();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['ngModel']) {
            this.updateSelectedOption();
        }
    }

    ngAfterContentInit() {
        this.options.forEach((option) => {
            option.parent = this;
        });
        this.options.changes.subscribe(() => {
            this.options.forEach((option) => {
                option.parent = this;
            });
            this.updateSelectedOption();
        })
    }

    private updateSelectedOption() {
        this.selectedOption = null;
        if (this.ngModel && this.options) {
            this.options.forEach((option) => {
                if(option.value == this.ngModel) {
                    this.selectedOption = option;
                    option.selected = true;
                } else {
                    option.selected = false;
                }
            });
        }
    }

    public onSelectedOptionChange(option: SelectOptionComponent) {
        this.selectedOption = option;
        this.ngModelChange.emit(option.value);
        this.open = false;
    }

    private get label(): string {
        if (!this.selectedOption) return null;
        return this.selectedOption.label;
    }

    private set open(open: boolean) {
        if (open && !this.openState) { //open
            this.subscribeToGlobalClick();
        } else if (!open && this.openState) { //close
            this.unsubscribeToGlobalClick();
        }
        this.openState = open;
    }

    private get open(): boolean {
        return this.openState;
    }

    private subscribeToGlobalClick() {
        this.globalClickSubscription = this.globalService.onGlobalClick.subscribe((clickEvent: Event) => {
            if (!this.element.nativeElement.contains(clickEvent.target)) {
                this.open = false;
            }
        });
    }

    private unsubscribeToGlobalClick() {
        if (this.globalClickSubscription) this.globalClickSubscription.unsubscribe();
    }

    writeValue(obj: any): void {
        this.ngModel = obj;
        this.updateSelectedOption();
    }
    
    registerOnChange(fn: any): void {
    }

    registerOnTouched(fn: any): void {
    }

}