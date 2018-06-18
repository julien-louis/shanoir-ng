import { Component, Input, Host, AfterViewInit, ElementRef } from '@angular/core';
import { SelectBoxComponent } from './select.component';

@Component({
    selector: 'select-option',
    template: `
        <div (click)="onClick()" [class.selected]="selected"><ng-content></ng-content></div>
    `,
    styles: [
        'div { padding: 0 5px; }',
        'div:hover, div.selected { color: var(--very-light-grey); background-color: var(--color-b-light2); }'
    ]
    
})

export class SelectOptionComponent implements AfterViewInit {
    
    @Input() value: any;
    public parent: SelectBoxComponent;
    public label: string;
    public selected: boolean = false;

    constructor(private elt: ElementRef) { 
       
    }

    ngAfterViewInit() {
        let textNode = this.elt.nativeElement.childNodes[1].childNodes[0];
        this.label = textNode.textContent;
      }

    private onClick() {
        this.parent.onSelectedOptionChange(this);
    }

}