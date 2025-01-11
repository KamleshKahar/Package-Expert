/**
 * @Author Kamlesh Kahar
 */

import {api,track,wire, LightningElement} from 'lwc';
import getRecordsApex from '@salesforce/apex/LwcCustomRelatedListController.getRecords';
import getSchemaDetailsApex from '@salesforce/apex/LwcCustomRelatedListController.getSchemaDetails';

export default class LwcCustomRelatedList extends LightningElement {
    @api recordId;
    @api soqlQuery;
    @api sObjectName;
    @api iconName;
    @api title;
    @track tableColumns = []
    @track tableData;
    @track soqlQueryToGetRecords;
    @track isDataLoaded = false;
    @track isColumnsLoaded = false;

    fieldColumnsFromRecord = [];

    connectedCallback() {

    }

    get showDataTable(){
        if(this.isDataLoaded && this.isColumnsLoaded){
            return true;
        }else{
            return false;
        }
    }

    get showSpinner(){
        if((this.isDataLoaded || !this.tableData) && this.isColumnsLoaded){
            return true;
        }else{
            return false;
        }
    }

    get getColumns() {
        if(!this.fieldColumnsFromRecord){
            return this.tableColumns;
        }
        const excludeColumns = ['attributes'];
        const iterator = this.fieldColumnsFromRecord[Symbol.iterator]()
        for (let value of iterator) {
            if (!excludeColumns.includes(value)) {
                let index = -1;
                this.tableColumns.forEach(col => {
                    index++;
                    if(value.toLowerCase() === col.fieldName){
                        if(value === 'CurrencyIsoCode'){
                            this.tableColumns.splice(index, 1); //Remove the currency column from the list.
                        }

                        col.fieldName = value;
                        col.hideDefaultActions = true;
                        if(col.type === 'reference' || value === 'Name' || col.fieldName.includes('Number')){
                            let colName = value;

                            if(col.isCustom){
                                colName = value.slice(0, -1) + 'Name';
                            }else if(!col.isCustom && value !== 'Name' && !col.fieldName.includes('Number')){
                                colName = value.slice(0, -2) + 'Name';
                                col.label = value.slice(0, -2);// + ' Name';
                            }

                            this.tableData.forEach(data=>{
                                if(!col.isCustom && value === 'Name'){
                                    data[value + 'Link'] = '/'+ data.Id;
                                }else if(col.type === 'reference'){
                                    data[value + 'Link'] = '/'+ data[value];

                                    if(col.isCustom){
                                        if(data[value.slice(0, -1) + 'r']) {
                                            data[colName] = data[value.slice(0, -1) + 'r']['Name'];
                                        }else{
                                            data[value + 'Link'] = '';
                                        }
                                    }else{
                                        if(data[value.slice(0, -2)]){
                                            data[colName] = data[value.slice(0, -2)]['Name'];
                                        }else{
                                            data[value + 'Link'] = '';
                                        }
                                    }

                                }else if(!col.isCustom && col.fieldName.includes('Number')){    //Standard autonumber fields such as OrderNumber...
                                    data[value + 'Link'] = '/' + data.Id;
                                }
                            });

                            col.typeAttributes = {label: {fieldName: colName}, target: '_blank'}
                            col.fieldName = value + 'Link';
                            col.type = 'url';
                        }else if(col.type === 'currency'){
                            col.typeAttributes = { currencyCode: { fieldName: 'CurrencyIsoCode' }, currencyDisplayAs: "code" }
                        }
                    }
                });

            }
        }

        return this.tableColumns;
    }

    @wire(getSchemaDetailsApex, {sObjectName: '$sObjectName', soqlQuery: '$soqlQuery'})
    schemaDetails(result)
    {
        if (result.data) {
            //this.getColumns();
            console.log('Schema Data: ', result.data);
            this.tableColumns = JSON.parse(result.data);
            //this.getColumns();
            //this.soqlQueryToGetRecords = this.soqlQuery;
            this.isColumnsLoaded = true;
        } else if (result.error) {
            console.log('Schema Wire Error! ', result.error);
        }
    }

    @wire(getRecordsApex, {recordId: '$recordId', soqlQuery: '$soqlQuery'})
    getRecords(result)
    {
        if (result.data) {

            let records = JSON.parse(result.data);
            if(records && records.length > 0){
                this.title = this.title + ' ('+ records.length + ')';
                this.isDataLoaded = true;
            }else{
                this.title = this.title + ' (0)';
                return;
            }

            const map = new Map(Object.entries(records[0]));
            this.fieldColumnsFromRecord = map.keys();

            //this.getColumns();
            console.log('Records Data: ', JSON.parse(result.data));
            this.tableData = records;

            //this.showDataTable = true;
        } else if (result.error) {
            console.log('GetRecords Wire Error! ', result.error);
        }
    }
}