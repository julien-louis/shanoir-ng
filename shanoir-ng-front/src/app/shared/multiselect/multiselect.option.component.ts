import { Component, Input, AfterViewInit, ElementRef } from '@angular/core';

@Component({
    selector: 'multiselect-option',
    template: `
        <div (click)="onClick()" [class.selected]="selected"><ng-content></ng-content></div>
    `,
    styles: [
        'div { padding: 0 5px; }',
        'div:hover, div.selected { color: var(--very-light-grey); background-color: var(--color-b-light2); }'
    ]
    
})

export class MultiSelectOptionComponent implements AfterViewInit {
    
    @Input() value: any;

    constructor(private elt: ElementRef) { 
       
    }

    ngAfterViewInit() {
        
    }

    private onClick() {
        
    }

}