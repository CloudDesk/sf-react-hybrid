import { Field } from '../components/CKEditor/types';

export const fetchObjects = async (instanceUrl: string, accessToken: string): Promise<Field[]> => {
  try {
    const response = await fetch(`${instanceUrl}/services/data/v53.0/sobjects/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch objects');
    }

    const data = await response.json();
    return data.sobjects
      .filter((obj: any) => !obj.custom && obj.queryable)
      .map((obj: any) => ({
        value: obj.name,
        label: obj.label
      }));
  } catch (error) {
    console.error('Error fetching Salesforce objects:', error);
    throw error;
  }
};

export const fetchFields = async (instanceUrl: string, accessToken: string, objectName: string): Promise<Field[]> => {
  try {
    const response = await fetch(`${instanceUrl}/services/data/v53.0/sobjects/${objectName}/describe`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch fields');
    }

    const data = await response.json();
    return data.fields
      .filter((field: any) => field.updateable)
      .map((field: any) => ({
        value: field.name,
        label: field.label
      }));
  } catch (error) {
    console.error('Error fetching Salesforce fields:', error);
    throw error;
  }
};

export const fetchOrgLocaleInfo = async (instanceUrl: string, accessToken: string): Promise<any> => {
  try {
    const response = await fetch(`${instanceUrl}/services/data/v53.0/query/?q=SELECT+Id,DefaultLocaleSidKey,LanguageLocaleKey,TimeZoneSidKey+FROM+Organization+LIMIT+1`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organization locale info');
    }

    const data = await response.json();
    return data.records[0];
  } catch (error) {
    console.error('Error fetching organization locale info:', error);
    throw error;
  }
};
