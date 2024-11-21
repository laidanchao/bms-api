import * as math from 'mathjs';
import _ from 'lodash';

/**
 * 加法 num1+num2
 * @param num1
 * @param num2
 * @param precision 保留小数
 */
export function add(num1: number, num2: number, precision = null) {
  const num = math
    .bignumber(num1)
    .plus(num2)
    .toNumber();
  return typeof precision === 'number' ? _.round(num, precision) : num;
}

/**
 * 减法 num1-num2
 * @param num1
 * @param num2
 * @param precision 保留小数
 */
export function subtract(num1: number, num2: number, precision = null) {
  const num = math
    .bignumber(num1)
    .sub(num2)
    .toNumber();
  return typeof precision === 'number' ? _.round(num, precision) : num;
}

/**
 * 乘法 num1×num2
 * @param num1
 * @param num2
 * @param precision 保留小数
 */
export function multiply(num1: number, num2: number, precision = null) {
  const num = math
    .bignumber(num1)
    .mul(num2)
    .toNumber();
  return typeof precision === 'number' ? _.round(num, precision) : num;
}

/**
 * 除法 num1÷num2
 * @param num1
 * @param num2
 * @param precision 保留小数
 */
export function divide(num1: number, num2: number, precision = null) {
  const num = math
    .bignumber(num1)
    .div(num2)
    .toNumber();
  return typeof precision === 'number' ? _.round(num, precision) : num;
}
