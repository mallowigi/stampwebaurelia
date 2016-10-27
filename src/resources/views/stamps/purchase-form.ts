import {autoinject, LogManager} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import {I18N} from 'aurelia-i18n';
import {Stamps} from '../../../services/Stamps';
import {ValidationController} from 'aurelia-validation';

const logger = LogManager.getLogger('purchase-form');

@autoinject
export class PurchaseForm {

  constructor(public controller: DialogController,
              private i18n: I18N,
              private stampService: Stamps,
              private validationController: ValidationController,
  ) {


  }
}
