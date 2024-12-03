import React, { useEffect } from "react";
import CKEditor from "../CKEditor";
import { useSalesforce } from "../../contexts/SalesforceContext";
import TemplateHeader from "./TemplateHeader";
import Toolbox from "./Toolbox";

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
  const [templateName, setTemplateName] = React.useState<string>("");
  const [templateDescription, setTemplateDescription] = React.useState<string>("");
  const [mode, setMode] = React.useState<'basic' | 'advanced'>('basic');

  useEffect(() => {
    loadObjects(instanceUrl, accessToken);
  }, [instanceUrl, accessToken, loadObjects]);

  const getFields = async (objectName: string) => {
    return await loadFields(instanceUrl, accessToken, objectName);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <TemplateHeader
        templateName={templateName}
        templateDescription={templateDescription}
        mode={mode}
        onNameChange={setTemplateName}
        onDescriptionChange={setTemplateDescription}
        onModeChange={setMode}
      />
      
      <div className="flex-grow flex">
        <div className="flex-1 p-4">
          <CKEditor
            editorContent={editorContent}
            onchange={(content: string) => setEditorContent(content)}
            objects={objects}
            fields={[]}
            getFields={getFields}
          />
        </div>
        <Toolbox isVisible={mode === 'advanced'} />
      </div>
    </div>
  );
};

export default SalesforceComponent;
