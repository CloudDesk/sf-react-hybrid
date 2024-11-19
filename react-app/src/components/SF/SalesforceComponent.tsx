import React from "react";

export const SalesforceComponent: React.FC<{
  instanceUrl: string;
  accessToken: string;
}> = ({ instanceUrl, accessToken }) => {
  console.log(instanceUrl, accessToken);
  return <></>;
};
