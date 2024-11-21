import { removeAccents } from './util';

export class ReplaceRule {
  regEx: string;
  replaceTo: string;
}

export const CityRuleService = {
  replaceStrByRules(str: string, rules?: Array<ReplaceRule>) {
    if (rules) {
      for (const rule of rules) {
        const regex = eval(rule.regEx);
        str = str.replace(regex, rule.replaceTo);
      }
      return str;
    }
  },
  /**
   * 收件城市进行正则表达式替换
   * @param city
   * @private
   */
  receiveCityHandler(city: string) {
    return removeAccents(city)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\bSAINT\b/g, 'ST')
      .replace(/\bSAINTE\b/g, 'STE')
      .trim();
  },
};
