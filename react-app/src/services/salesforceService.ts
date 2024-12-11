import axios from 'axios';
import { Field } from '../components/CKEditor/types';

export const fetchObjects = async (instanceUrl: string, accessToken: string): Promise<Field[]> => {
  try {
    const response = await axios.get(
      `${instanceUrl}/services/data/v58.0/sobjects/`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.sobjects
      .filter((obj: any) => obj.queryable && !obj.customSetting)
      .map((obj: any) => ({
        label: obj.label,
        value: obj.name,
      }));
  } catch (error) {
    console.error('Error fetching Salesforce objects:', error);
    throw error;
  }
};

export const fetchFields = async (instanceUrl: string, accessToken: string, objectName: string): Promise<Field[]> => {
  try {
    // Get the object describe
    const describeResponse = await axios.get(
      `${instanceUrl}/services/data/v58.0/sobjects/${objectName}/describe`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Log the raw response to see all fields
    console.log('Raw Describe Response:', describeResponse.data);

    // Log specific system fields we're looking for
    const systemFields = describeResponse.data.fields.filter((field: any) => 
      ['RecordType', 'RecordTypeId', 'CreatedById', 'LastModifiedById', 'SystemModstamp'].includes(field.name)
    );
    console.log('System Fields Found:', systemFields);

    // Map all fields without any filtering
    const fields = describeResponse.data.fields.map((field: any) => ({
      label: field.label,
      value: field.name,
      type: field.type,
      referenceTo: field.referenceTo?.[0] || undefined,
      relationshipName: field.relationshipName || undefined,
    }));

    // Add child relationships
    const childRelationships = describeResponse.data.childRelationships.map((rel: any) => ({
      label: rel.relationshipName || rel.childSObject,
      value: rel.field,
      type: 'childRelationship',
      childRelationship: {
        field: rel.field,
        relationshipName: rel.relationshipName,
        childSObject: rel.childSObject,
      }
    }));

    console.log('Mapped Fields:', fields);
    console.log('Child Relationships:', childRelationships);

    return [...fields, ...childRelationships];
  } catch (error) {
    console.error('Error fetching Salesforce fields:', error);
    throw error;
  }
};

export const fetchOrgLocaleInfo = async (instanceUrl: string, accessToken: string) => {
  try {
    const response = await axios.get(
      `${instanceUrl}/services/data/v58.0/query/?q=SELECT+Id,DefaultLocaleSidKey,LanguageLocaleKey,TimeZoneSidKey+FROM+Organization+LIMIT+1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.records[0];
  } catch (error) {
    console.error('Error fetching organization locale information:', error);
    throw error;
  }
};
