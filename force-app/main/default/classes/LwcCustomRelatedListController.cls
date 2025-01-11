/* @Author Kamlesh Kahar
 * @Description: This apex class used as a server side controller for lwcCustomRelatedList.
                This fetches the data from the server based on the recordId and soql query supplied to the method.
 * Test Class: LwcCustomRelatedListControllerTest
 */

public with sharing class LwcCustomRelatedListController {

    @AuraEnabled(Cacheable=true)
    public static String getRecords(Id recordId, String soqlQuery){
        return JSON.serialize((list<object>)Database.query(soqlQuery));
    }

    @AuraEnabled(Cacheable=true)
    public static String getSchemaDetails(String sObjectName, String soqlQuery){
        List<String> fieldApiNames = soqlQuery.toLowerCase().substringAfter('select').substringBefore('from').replace(' ','').split(',');
        System.debug('fieldApiNames: '+fieldApiNames);

        SObjectType sObjectType = Schema.getGlobalDescribe().get(sObjectName);
        Map<String,Schema.SObjectField> fieldsMap = sObjectType.getDescribe().fields.getMap();

        List<ColumnWrapper> columnsList = new List<ColumnWrapper>();
        for(String field: fieldApiNames) {
            System.debug('Field: '+field);
            if(!fieldsMap.containsKey(field)){
                continue;
            }
            ColumnWrapper col = new ColumnWrapper();

            String fieldType = String.valueOf(fieldsMap.get(field).getDescribe().getType());
            String fieldLabel = String.valueOf(fieldsMap.get(field).getDescribe().getLabel());
            col.label = fieldLabel;
            col.fieldName = field;
            col.type = getFieldType(fieldType.toLowerCase());
            col.isCustom = Boolean.valueOf(fieldsMap.get(field).getDescribe().isCustom());
            columnsList.add(col);
        }
        return JSON.serialize(columnsList);
    }

    public static String getFieldType(String type){
        if(type == 'picklist'){
            type = 'string';
        }
        return type;
    }

    public class ColumnWrapper{
        public String label;
        public String fieldName;
        public String type;
        public Boolean isCustom;
    }
}