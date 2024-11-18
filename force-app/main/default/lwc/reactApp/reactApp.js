import { LightningElement, api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import App from '@salesforce/resourceUrl/edc_resources';
import getQuickSearchKeys from '@salesforce/apex/EdCastController.getQuickSearchKeys';
import userId from '@salesforce/user/Id';
import getOrganizationInfo from '@salesforce/apex/EdCastController.getOrganizationInfo';
import LANG from '@salesforce/i18n/lang';

export default class LearnerDashBoardComponent extends LightningElement {
  @api source;
  @api domainURL;
  @api isRelated;
  @api isProdENV;
  @api isMiniUI;
  @api isDetail;
  @api quickSearchFields;
  @api objectApiName;
  @api recordId;

  renderedCallback() {
    getOrganizationInfo().then(async ({ orgId, lxpNamespace, lxpVFNamespace }) => {
      let configParams = {
        source: this.source,
        domainURL: this.domainURL,
        isRelated: this.isRelated,
        isProdENV: this.isProdENV,
        isMiniUI: this.isMiniUI,
        isDetail: this.isDetail,
        userId,
        orgId,
        sfdcLocaleLanguage: LANG,
        initSearchKeys: undefined,
        initSearchErrorCode: undefined,
        redirectToSearchPage: false,
        lxpNamespace,
        lxpVFNamespace,
      };
      console.log(JSON.stringify(configParams));
      if (this.objectApiName != null) {
        configParams.redirectToSearchPage = true;

        const searchKeysResponse = await getQuickSearchKeys({
          objectApiName: this.objectApiName,
          recordId: this.recordId,
          fieldAPINames: this.quickSearchFields,
        });
        const ERR_PREFIX = '__[ERROR]__';
        if (searchKeysResponse.indexOf(ERR_PREFIX) === 0) {
          configParams.initSearchErrorCode = searchKeysResponse.replace(ERR_PREFIX, '');
        } else {
          configParams.initSearchKeys = searchKeysResponse;
        }
      }
      Promise.all([
        (window.resourcePath = App.slice(1)),
        loadScript(this, App + '/js/main.js'),
        loadStyle(this, App + '/css/main.css'),
      ]).then(() => {
        window.edcastMount(this.template.querySelector('div'), {
          ...configParams,
          getOrganizationInfo,
        });
      });
    });
  }
}
