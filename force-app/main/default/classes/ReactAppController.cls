global class ReactAppController {
    
    static final String PKG_NAMESPACE = 'PKG_NAMESPACE';
    static final String PKG_VFNAMESPACE = 'PKG_VFNAMESPACE';
    public String getOrgBaseUrl () {
        String baseUrl;
        String hostname = Test.isRunningTest()?'my--domain.com':Url.getOrgDomainUrl().getHost();
        String myDomain = hostname.split('\\.')[0];
        if(myDomain.contains('--')) {
            myDomain = myDomain.substring(0, hostname.lastIndexOf('--'));
        }
        Boolean isSandbox = [SELECT IsSandbox FROM Organization Limit 1].IsSandbox;
        if(isSandbox){
            baseUrl = 'https://' + myDomain + '.sandbox.lightning.force.com';
        }
        else{
            baseUrl = 'https://' + myDomain + '.lightning.force.com';
        }
        return baseUrl;            
    }
    

    public static Object invokeApexMethod(String ACTION_NAME, Object ACTION_PAYLOAD ) {
        actionServices.get('ACTION_NAME').execute(ACTION_PAYLOAD)
    }

    @AuraEnabled(cacheable=true)
    public static Map<String,String> getOrganizationInfo() {
        return new Map<String,String>{'orgId'=>UserInfo.getOrganizationId(),'sfNamespace'=>PKG_NAMESPACE, 'sfVFNamespace'=>PKG_VFNAMESPACE};
    }
   
    public static Object getFieldValue(SObject record, String fieldName){
        fieldName = fieldName.trim();
        if(fieldName.contains('.')){
            String refFieldName = fieldName.split('\\.')[0];
            if(refFieldName.endsWithIgnoreCase('__r'))
                refFieldName = refFieldName.replace('__r','__c');
            
            return getFieldValue(record.getSObject(refFieldName),fieldName.substringAfter('.'));
        }
        return record.get(fieldName)==null?'':record.get(fieldName);
    }

    @AuraEnabled
    public static String getQuickSearchKeys(String objectApiName, String recordId, String fieldAPINames){
        
        String ERR_PREFIX = '__[ERROR]__';

        if(fieldAPINames==null || fieldAPINames==''){
            return ERR_PREFIX+'NO_SEARCH_FIELDS';
        }

        fieldAPINames = fieldAPINames.trim();
        if(fieldAPINames.endsWithIgnoreCase(','))
            fieldAPINames = fieldAPINames.left(fieldAPINames.length()-1);
        if(fieldAPINames.startsWithIgnoreCase(','))
            fieldAPINames = fieldAPINames.right(fieldAPINames.length()-1);
        
        if(fieldAPINames.split(',').size() > 3){
            return ERR_PREFIX+'TOO_MANY_SEARCH_FIELDS';
        }
        else{
            String result = '';
            try {
                SObject obj = Database.query('select '+ fieldAPINames +' from '+objectApiName+' where Id = \''+recordId+'\' limit 1');
                
                for(String fieldName : fieldAPINames.split(',')){
                    result+= String.valueOf(getFieldValue(obj,fieldName))+', ';
                }
                if(result.replaceAll(', ','')==''){
                    return ERR_PREFIX+'BLANK_SEARCH_DATA';
                }
                
                result = result.substring(0,result.length()-2);
                return result;
            } catch (Exception e) {
                if(e.getMessage().startsWith('No such column'))
                    return ERR_PREFIX+'UNKNOWN_SEARCH_FIELD';
                else
                    return ERR_PREFIX+'UNKNOWN_SEARCH_ERROR';
            }
        }
        
    }
}