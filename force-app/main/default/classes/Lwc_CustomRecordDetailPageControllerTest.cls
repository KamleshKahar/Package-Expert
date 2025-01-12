@isTest
public class Lwc_CustomRecordDetailPageControllerTest {
    @isTest
    public static void testMethod1(){
        String objectName = 'OrderItem';
        String fieldSetname = 'Prices'; //Make sure to mention the fieldSetName that exists in your org. Otherwise it will throw null pointer exception.
        String fieldsToMakeReadOnly = 'ListPrice,Quantity';
        Lwc_CustomRecordDetailPageController.getFieldsMap(objectName, fieldSetname, fieldsToMakeReadOnly);
    }
}