import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import Decimal from 'decimal.js';

describe('MathCalculator test', () => {
  it('mul', function() {
    expect(MathCalculator.mul(undefined, 0)).toEqual(undefined);
    expect(MathCalculator.mul(1, 2)).toEqual(2);
    expect(MathCalculator.mul(0, null)).toEqual(undefined);
    expect(MathCalculator.mul(0, 0)).toEqual(0);
  });

  it('sum() exp1', () => {
    const data = [1, 2, 3, 4, 5, 0.1, 0.2, 1101.1];
    const result = MathCalculator.sum(data);
    expect(result).toEqual(1116.4);
  });

  it('sum() exp2', function() {
    const data = [1, 2, 3.3, 4.4, 5.5];
    const result = MathCalculator.sum(data);
    expect(result).toEqual(16.2);
  });

  it('sum() exp3', function() {
    const data = [-1, '-2', 3.3, '4.4', '5.5'];
    const result = MathCalculator.sum(data);
    expect(result).toEqual(10.2);
  });

  it('sum() exp4', function() {
    expect(MathCalculator.sum([])).toEqual(0);
    expect(MathCalculator.sum(null)).toEqual(0);
    expect(MathCalculator.sum(undefined)).toEqual(0);
  });

  it('sumBy() exp1', function() {
    const data = [
      {
        n: 1,
        m: 1.1,
      },
      {
        n: 2,
        m: 2.2,
      },
      {
        n: 3,
        m: 3.3,
      },
      {
        n: 4,
        m: 4.4,
      },
      {
        n: 5,
        m: 5.5,
      },
    ];
    const result = MathCalculator.sumBy(data, 'n');
    expect(result).toEqual(15);
  });

  it('sumBy() exp2', function() {
    const data = [
      {
        n: 1,
        m: 1.1,
      },
      {
        n: 2,
        m: 2.2,
      },
      {
        n: 3,
        m: 3.3,
      },
      {
        n: 4,
        m: 4.4,
      },
      {
        n: 5,
        m: 5.5,
      },
    ];
    const result = MathCalculator.sumBy(data, 'm');
    expect(result).toEqual(16.5);
  });

  it('sumBy() exp3', function() {
    const data = [
      {
        n: 1,
        m: 1.1,
      },
      {
        n: 2,
        m: 2.2,
      },
      {
        n: 3,
        m: ' 3.3',
      },
      {
        n: '4',
        m: 4.4,
      },
      {
        n: 5,
        m: '5.5  ',
      },
    ];
    const result = MathCalculator.sumBy(data, item => Number(item.n) + Number(item.m));
    expect(result).toEqual(31.5);
  });

  it('sumBy() exp4', function() {
    const data = [
      {
        n: 7.8,
        m: 1.1,
      },
      {
        n: 2.2,
        m: 2.2,
      },
      {
        n: 3.3,
        m: 3.3,
      },
      {
        n: 4.4,
        m: 4.4,
      },
      {
        n: 5.5,
        m: 5.5,
      },
    ];
    const result = MathCalculator.sumBy(data, item => item.n * 0.1);
    expect(result).toEqual(2.3200000000000003);
  });

  it('sumBy() exp5', function() {
    const data = [
      {
        n: 7.8,
        m: 1.1,
      },
      {
        n: 2.2,
        m: 2.2,
      },
      {
        n: 3.3,
        m: 3.3,
      },
      {
        n: 4.4,
        m: 4.4,
      },
      {
        n: 5.5,
        m: 5.5,
      },
    ];
    const result = MathCalculator.sumBy(data, item => Decimal.mul(item.n, 0.1));
    expect(result).toEqual(2.32);
  });

  it('sumBy() exp6', function() {
    const data = [
      {
        n: 1,
        m: 1.1,
      },
      {
        n: 2,
        m: 2.2,
      },
      {
        n: 3,
        m: ' 3.3',
      },
      {
        n: '4',
        m: 4.4,
      },
      {
        n: 5,
        m: '5.5  ',
      },
    ];
    expect(MathCalculator.sumBy(data, null)).toEqual(0);
    expect(MathCalculator.sumBy(data, undefined)).toEqual(0);
    expect(MathCalculator.sumBy([], item => item.n)).toEqual(0);
  });
});
