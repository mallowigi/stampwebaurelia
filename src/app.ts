import {Router, RouterConfiguration} from 'aurelia-router';
import {I18N} from 'aurelia-i18n';
import {autoinject, LogManager} from 'aurelia-framework';
import {Countries} from './services/Countries';

const logger = LogManager.getLogger('stamp-web');

@autoinject
export class App {

  constructor(private router: Router, private i18n: I18N) {
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = "Stamp Web Editor";
    config.map([
      {
        route: ['', 'stamp-list'],
        name: 'stamp-list',
        moduleId: './resources/views/stamps/stamps-list',
        nav: true,
        title: this.i18n.tr('nav.stamps')
      },
      {
        route: 'manage',
        moduleId: './resources/views/manage/manage-list',
        nav: true,
        title: this.i18n.tr('nav.manage')
      },
      {
        route: 'settings',
        moduleId: './resources/views/preferences/user-settings',
        nav: false,
        title: this.i18n.tr('nav.settings-short')
      }
    ]);
    this.router = router;
  }

  activate() {
    logger.info("Application is activated");
  }
}
