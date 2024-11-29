import React, { useEffect } from "react";
import CKEditor from "../CKEditor";
import { useSalesforce } from "../../contexts/SalesforceContext";

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
  const { objects, loadObjects, loadFields } = useSalesforce();
  const [editorContent, setEditorContent] = React.useState<string>("");

  useEffect(() => {
    loadObjects(instanceUrl, accessToken);
  }, [instanceUrl, accessToken, loadObjects]);

  const getFields = async (objectName: string) => {
    debugger;
    return await loadFields(instanceUrl, accessToken, objectName);
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
