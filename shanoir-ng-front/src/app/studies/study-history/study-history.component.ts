import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ColumnDefinition} from "../../shared/components/table/column.definition.type";
import {ShanoirEvent} from "../../users/shanoir-event/shanoir-event.model";
import {ShanoirEventService} from "../../users/shanoir-event/shanoir-event.service";
import {Study} from "../shared/study.model";
import {Page, Pageable} from "../../shared/components/table/pageable.model";
import {BrowserPaging} from "../../shared/components/table/browser-paging.model";
import {TableComponent} from "../../shared/components/table/table.component";
import {StudyUser} from "../shared/study-user.model";
import {Observable} from "rxjs";

@Component({
  selector: 'study-history',
  templateUrl: './study-history.component.html',
  styleUrl: './study-history.component.css'
})
export class StudyHistoryComponent {

    @ViewChild('table', {static: false}) table: TableComponent;
    @Input() study: Study;
    @Input() eventHistory: Promise<any>;

    history: ShanoirEvent[]=[];

    historyColumns: ColumnDefinition[] = [
        {headerName: 'Creation date', field: 'creationDate', type: 'dateTime'},
        {headerName: 'User', field: 'username'},
        {headerName: 'Event type', field: 'eventType', cellRenderer: function (params: any) {
                if (params.data.eventType.includes(".event")) {
                    params.data.eventType = params.data.eventType.replace(".event", "");
                }
                return params.data.eventType;
            }
        },
        {headerName: 'ObjectId', field: 'objectId', route: function(params:ShanoirEvent) {
            let event = params.eventType;
            let id = params.objectId;
            if (event.includes("create")) {
                if (event.includes("Dataset") && !event.includes("Acquisition")) { return "/dataset/details/" + id; }
                else if (event.includes("Examination")) { return "/examination/details/" + id; }
                else if (event.includes("Acquisition")) { return "/dataset-acquisition/details/" + id; }
                else if (event.includes("Subject")) { return "/subject/details/" + id; }
            } else if (event.includes("update")) {
                if (event.includes("Study")) { return "/study/details/" + id; }
                else if (event.includes("Examination")) { return "/examination/details/" + id; }
                else if (event.includes("Subject")) { return "/subject/details/" + id; }
            }
        }},
        {headerName: 'Message', field: 'message'}
    ];

    constructor(
        private shanoirEventService: ShanoirEventService
    ) {}
    ngOnInit() {
        this.eventHistory.then( () => this.onFetchHistory());
    }

    public onFetchHistory() {
        this.shanoirEventService.requestHistory(this.study.id).then(history => {

            history.forEach(item => {
                let studyUser : StudyUser;
                studyUser = this.study.studyUserList.find(user => user.userId == item.userId);
                if (studyUser) {
                    item.username = studyUser.userName;
                }
            });
            this.history = history;

            this.table.refresh();
        });
    }

    getPage = (pageable: Pageable): Promise<Page<ShanoirEvent>> => {
        return Promise.resolve(new BrowserPaging(this.history, this.historyColumns).getPage(pageable));
    }
}
