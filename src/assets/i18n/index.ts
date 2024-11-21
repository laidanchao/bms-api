import { I18n } from 'i18n';
import _ from 'lodash';

const supportLanguages = ['cn', 'en', 'fr', 'zh'];
const i18nList = _.map(supportLanguages, language => {
  const i18n: any = new I18n();
  i18n.configure({
    locales: [language],
    directory: `${__dirname}`,
    defaultLocale: language,
  });
  i18n._t = function(phrase, fallback?) {
    const result = i18n.__(phrase);
    return result !== phrase ? result : fallback || phrase;
  };
  return i18n;
});

const i18n = _.zipObject(supportLanguages, i18nList);

export = i18n;
