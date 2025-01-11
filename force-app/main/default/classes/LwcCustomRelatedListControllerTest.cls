@isTest
public with sharing class LwcCustomRelatedListControllerTest {
    @isTest
    public static void LwcCustomRelatedListControllerTestController() {
        Account acc = new Account(Name = 'Package-Expert', Website = 'https://github.com/KamleshKahar/Package-Expert.git');
		insert acc;

        String soqlQuery = 'SELECT Name, Industry FROM Account';

        System.assertEquals(true, LwcCustomRelatedListController.getRecords(acc.id, soqlQuery) != null, 'expected some value returned null');
        System.assertEquals(true, LwcCustomRelatedListController.getSchemaDetails('Account', soqlQuery) != null, 'expected some value returned null');
    }
}