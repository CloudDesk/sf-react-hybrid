import axios from 'axios';
import { Field } from '../components/CKEditor/types';

export const fetchObjects = async (instanceUrl: string, accessToken: string): Promise<Field[]> => {
  try {
    const response = await axios.get(
      `${instanceUrl}/services/data/v53.0/sobjects/`,
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
    const response = await axios.get(
      `${instanceUrl}/services/data/v53.0/sobjects/${objectName}/describe`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.fields
      .filter((field: any) => field.updateable)
      .map((field: any) => ({
        label: field.label,
        value: field.name,
        type: field.type,
        referenceTo: field.referenceTo?.[0] || undefined
      }));
  } catch (error) {
    console.error('Error fetching Salesforce fields:', error);
    throw error;
  }
};

export const fetchOrgLocaleInfo = async (instanceUrl: string, accessToken: string) => {
  try {
    const response = await axios.get(
      `${instanceUrl}/services/data/v53.0/query/?q=SELECT+Id,DefaultLocaleSidKey,LanguageLocaleKey,TimeZoneSidKey+FROM+Organization+LIMIT+1`,
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
