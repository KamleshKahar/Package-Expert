/**
 * Created by Kamlesh Kahar
 */

import {api, LightningElement, track, wire} from 'lwc';
import getFields from '@salesforce/apex/Lwc_CustomRecordDetailPageController.getFieldsMap';

export default class LwcCustomRecordDetailPage extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api fieldSetNames;
    @api readOnlyFields;
    @track fieldSets = [];
    @track isEditMode = false;
    @track processing = false;

    connectedCallback() {
        console.log('recordId: ',this.recordId);
        console.log('readOnlyFields:: ',this.readOnlyFields);
    }

    @wire(getFields, {objectName: "$objectApiName", fieldSetNames: "$fieldSetNames", fieldsToMakeReadOnly: "$readOnlyFields"})
    wiredFieldsInfo(result){
        if(result.data){
            console.log('Data: ',result.data);
            this.fieldSets = JSON.parse(result.data);
        }else if(result.error){
            console.log('Error: ',result.error);
        }
    }

    handleClickSave(){
        this.processing = true;
    }
    handleOnSaveSuccess(){
        this.isEditMode = false;
        this.processing = false;
        console.log('saved successfully!');
    }
    handleErrorWhileSaving(event){
        this.processing = false;
        console.log('error occured while saving!');
        console.log('error msg: ',event.detail.detail);
    }
    handleEdit(){
        this.isEditMode = true;
    }
    handleCancel(){
        this.isEditMode = false;
    }
    handleSectionClick(event){
        let id = event.target.dataset.id;
        console.log('id: ','[data-icon="'+id+'"]');
        console.log(this.template.querySelector('[data-icon="'+id+'"]'));
        let iconElement = this.template.querySelector('[data-icon="'+id+'"]');
        if(iconElement.className.includes("transformSectionIcon90Degrees")){
            iconElement.classList.remove("transformSectionIcon90Degrees");
        }else{
            iconElement.classList.add("transformSectionIcon90Degrees");
        }

        //document.documentElement.style.setProperty('--rotateIcon', '-90deg');
    }
    onFocusSectionHandler(event){
        let id = event.target.dataset.id;
        let sectionDiv = this.template.querySelector('[data-sectionsummary="'+id+'"]');
        sectionDiv.classList.add("focus");
    }
    onFocusoutSectionHandler(event){
        let id = event.target.dataset.id;
        let sectionDiv = this.template.querySelector('[data-sectionsummary="'+id+'"]');
        sectionDiv.className = sectionDiv.className.replace("focus", "");
    }
}