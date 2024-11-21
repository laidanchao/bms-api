import Decimal from 'decimal.js';

export class MathCalculator {
  static mul(x: number, y: number) {
    if (!x && 0 !== x) {
      return undefined;
    } else if (!y && 0 !== y) {
      return undefined;
    } else {
      return Decimal.mul(x, y).toNumber();
    }
  }

  static sum(array) {
    let ans = new Decimal(0);
    if (!array || !array.length) {
      return ans.toNumber();
    }
    array.forEach(item => {
      ans = ans.plus(Number(item));
    });
    return ans.toNumber();
  }

  static sumBy(array, iteratee) {
    let ans = new Decimal(0);
    if (!array || !array.length) {
      return ans.toNumber();
    }
    if (typeof iteratee === 'function') {
      array.forEach(item => {
        ans = ans.plus(Number(iteratee(item)));
      });
    } else if (typeof iteratee === 'string') {
      array.forEach(item => {
        ans = ans.plus(Number(item[iteratee]));
      });
    }
    return ans.toNumber();
  }
}
