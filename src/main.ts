import {LogManager, Aurelia} from 'aurelia-framework'
import {ConsoleAppender} from 'aurelia-logging-console';
import environment from './environment';
import {I18N} from 'aurelia-i18n';
import Backend from 'i18next-xhr-backend';

const logger = LogManager.getLogger('stamp-web');
LogManager.addAppender(new ConsoleAppender());
if (window.location.href.indexOf('debug=true') >= 0) {
  LogManager.setLevel(LogManager.logLevel.debug);
}

//Configure Bluebird Promises.
//Note: You may want to use environment-specific configuration.
(<any>Promise).config({
  warnings: {
    wForgottenReturn: false
  }
});

function setRoot(aurelia) {
  logger.info('bootstrapped:' + aurelia.setupAureliaFinished + ", localization:" + aurelia.setupI18NFinished);
  if (aurelia.setupAureliaFinished && aurelia.setupI18NFinished) {
    aurelia.setRoot('app');
  }
}

export function configure(aurelia) {
  aurelia.setupAureliaFinished = false;
  aurelia.setupI18NFinished = false;

  aurelia.use
    .standardConfiguration()
    .feature('resources')
  // .feature('bootstrap-validation')

  .plugin('aurelia-dialog', config => {
    config.useDefaults();
    config.settings.lock = true;
    config.settings.centerHorizontally = false;
    config.settings.startingZIndex = 1000;
  })
  .plugin('aurelia-validation')
  .plugin('aurelia-validatejs')
  .plugin('aurelia-i18n', config => {
    config.i18next.use(Backend);
    // Config i18next
    return config.setup({
      backend: {                                  // <-- configure backend settings
        loadPath: 'resources/locales/{{lng}}/{{ns}}.json' // <-- XHR settings for where to get the files from
      },
      lng: 'en',
      attributes: ['t', 'i18n'],
      fallbackLng: 'en',
      ns: ['stamp-web'/*, 'translation'*/],
      fallbackNS: ['stamp-web'],
      defaultNS: 'stamp-web',
      debug: true // make true to see un-translated keys
    }).then(() => {
      aurelia.setupI18NFinished = true;
      setRoot(aurelia);
    });
  })
  ;

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => {
    aurelia.setupAureliaFinished = true;
    aurelia.setupI18NFinished = true;
    setRoot(aurelia);
  });
}
