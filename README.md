# Edcast Salesforce Widget (React)

## Local Setup

### Creating a Sandbox Account:

To start, create a Sandbox Account on Salesforce by visiting [Salesforce Developer Signup](https://developer.salesforce.com/signup). Please note that emails from Salesforce may take a few minutes to appear in your inbox.

After the initial deployment, proceed with the following steps:

1. Authorize Newly Created Sandbox:

   - In VSCode, select `cmd(ctrl) + p` and search for `sfdx: Authorize Org`.
   - Choose "Custom Domain".
   - Input the new sandbox URL received in the Salesforce confirmation email after creating your Account.
   - Assign a nickname for the org (this can be anything).


2. Create `.env` File:

   - Navigate to `react-app` directory
   - Within `react-app` directory create `.env` file
   - Add ENV's from [Widgets ENV Doc](https://edcast.atlassian.net/wiki/spaces/EP/pages/7184973859/Widgets+-+ENV+Vars) - Same as MS Teams

3. Build the Package:

   - Run `npm run build` to build the package.

4. First Deployment of XML File:
   - Navigate to the manifest directory.
   - Right-click on `package.xml`.
   - Select "Deploy to Org" to deploy the XML file.

5. Setup Profile:
   - Open the newly created sandbox org.
   - Edit the page from settings (gear icon) in Salesforce.
   - Drag and drop the Learner Dashboard component into Page Builder.
   - Save the changes.

6. Deploying the Widget:
   - Navigate to `force-app/staticresources/edc_resources`.
   - Right-click on `edc_resources` and select "Deploy to Org".

## Deploying to QA:

Follow the same steps as the local setup, ensuring to authorize your QA org. Then, proceed with the deployment using the steps below:

1. Authorization:

   - Authorize the QA org.

2. Deploying the Widget:
   - Navigate to `force-app/staticresources/edc_resources`.
   - Right-click on `edc_resources` and select "Deploy to Org".

## Handling Errors:

1. ES Lint Error:
   - Create a `.vscode` directory in the root project.
   - Create a `settings.json` file within the `.vscode` directory.
   - Add the following code snippet:
     ```json
     {
       "editor.formatOnSave": true,
       "eslint.alwaysShowStatus": true,
       "files.autoSave": "onFocusChange",
       "editor.defaultFormatter": "esbenp.prettier-vscode",
       "editor.codeActionsOnSave": ["source.formatDocument", "source.fixAll.eslint"],
       "prettier.trailingComma": "es5",
       "prettier.singleQuote": true,
       "prettier.printWidth": 100,
       "[javascript]": {
         "editor.defaultFormatter": "esbenp.prettier-vscode"
       },
       "cSpell.words": ["Aggs", "CMNETWORK"],
       "eslint.workingDirectories": ["./react-app"],
       "git.ignoreLimitWarning": true
     }
     ```
