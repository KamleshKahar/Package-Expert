/**
 * @Author Kamlesh Kahar
 * Description: This apex controller is used to get the field details to render on lwc_CustomRecordDetailPage
 *              You can place this LWC on the objects where Salesforce do not provide Record Types to display 
 *              fields based on the record types. In that case you can use this component as a workaround which works great!
 * Test Class: Lwc_CustomRecordDetailPageControllerTest
 */

public with sharing class Lwc_CustomRecordDetailPageController {

    public static Map<String,Schema.SObjectField> fieldsMap;
    static List<String> readOnlyFields;

    @AuraEnabled(Cacheable=true)
    public static String getFieldsMap(String objectName, String fieldSetNames, String fieldsToMakeReadOnly){
        readOnlyFields = fieldsToMakeReadOnly.replace(' ','').toLowerCase().split(',');
        Schema.SObjectType sObjectTypeObj = Schema.getGlobalDescribe().get(objectName);
        Map<String, Schema.FieldSet> fieldSetMap = sObjectTypeObj.getDescribe().FieldSets.getMap();
        fieldsMap = sObjectTypeObj.getDescribe().fields.getMap();
        List<FieldsInfo> fieldsInfoList = new List<FieldsInfo>();
        for(String fieldSetName : fieldSetNames.replace(' ','').split(',')){
            Schema.FieldSet fieldSet = fieldSetMap.get(fieldSetName);
            FieldsInfo info = new FieldsInfo();
            info.sectionName = fieldSet.getLabel();
            info.fields = getFieldApiNames(fieldSet);
            fieldsInfoList.add(info);
        }
        return JSON.serialize(fieldsInfoList);
    }

    public static List<TwoColumnFields> getFieldApiNames(Schema.FieldSet fieldSet){
        List<String> fields = new List<String>();
        List<TwoColumnFields> columnFields = new List<TwoColumnFields>();

        for(Schema.FieldSetMember fieldSetMember :fieldSet.getFields()){
            Integer i = columnFields.size() -1;
            Boolean addInListFlag = false;
            fields.add(fieldSetMember.getFieldPath());

            TwoColumnFields colField = new TwoColumnFields();
            colField.field1 = fieldSetMember.getFieldPath();

            Boolean readOnly = false;
            if(readOnlyFields.contains(colField.field1.toLowerCase())){
                readOnly = false;
            }else{
                readOnly = fieldsMap.get(fieldSetMember.getFieldPath()).getDescribe().isUpdateable();
            }

            if(columnFields.isEmpty()){
                addInListFlag = true;
            }else if(!columnFields.isEmpty() && columnFields[i].field2 == null){
                columnFields[i].field2 = fieldSetMember.getFieldPath();
                columnFields[i].showField2 = true;
                columnFields[i].isEditable2 = readOnly;
            }else{
                addInListFlag = true;
            }
            if(addInListFlag){
                colField.isEditable1 = readOnly;
                columnFields.add(colField);
            }
        }
        return columnFields;
    }

    public class FieldsInfo{
        @AuraEnabled
        public String sectionName = '';
        @AuraEnabled
        public List<TwoColumnFields> fields = new List<TwoColumnFields>();
    }
    public class TwoColumnFields{
        @AuraEnabled
        public String field1;
        @AuraEnabled
        public String field2;
        @AuraEnabled
        public Boolean showField2 = false;
        @AuraEnabled
        public Boolean isEditable1 = true;
        @AuraEnabled
        public Boolean isEditable2 = true;
    }
}