import React, { useEffect, useState } from "react";
import CKEditor from "../CKEditor";
import { fetchObjects, fetchFields } from "../../services/salesforceService";

interface SalesforceComponentProps {
  instanceUrl: string;
  accessToken: string;
  localeInfo: any;
}

const SalesforceComponent: React.FC<SalesforceComponentProps> = ({
  instanceUrl,
  accessToken,
  localeInfo,
}) => {
  const [objects, setObjects] = useState<Array<{ value: string; label: string }>>(
    []
  );
  const [editorContent, setEditorContent] = useState<string>("");

  useEffect(() => {
    const getObjects = async () => {
      try {
        const objectsData = await fetchObjects(instanceUrl, accessToken);
        setObjects(objectsData);
      } catch (error) {
        console.error("Error fetching objects:", error);
      }
    };

    getObjects();
  }, [instanceUrl, accessToken]);

  const getFields = async (objectName: string) => {
    try {
      const fields = await fetchFields(instanceUrl, accessToken, objectName);
      return fields;
    } catch (error) {
      console.error("Error fetching fields:", error);
      return [];
    }
  };

  return (
    <div className="w-full h-screen flex flex-col p-4">
      <div className="flex-grow">
        <CKEditor
          editorContent={editorContent}
          onchange={(content: string) => setEditorContent(content)}
          objects={objects}
          fields={[]}
          getFields={getFields}
        />
      </div>
    </div>
  );
};

export default SalesforceComponent;
