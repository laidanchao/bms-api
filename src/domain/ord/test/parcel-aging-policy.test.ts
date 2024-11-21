import { ParcelAgingPolicy } from '@/domain/ord/parcel-aging/parcel-aging.service';
import { Moment } from '@softbrains/common-utils';
import moment from 'moment';

describe('ParcelAgingPolicy test', function() {
  it('should aaa', function() {
    const transporter = 'aa';
    const filePath = 'bb';
    const timeOfStart = moment()
      .utc()
      .startOf('day');
    const trackingPlanArray = [];
    for (let i = 0; i < 30; i++) {
      const time1 = moment(timeOfStart).add(3, 'hours');
      const time2 = moment(timeOfStart).add(7, 'hours');
      const time3 = moment(timeOfStart).add(-1, 'hours');
      const timeOfDay = [time1, time2, time3];
      for (const schedule of timeOfDay) {
        const trackingPlan = {
          transporter,
          filePath,
          schedule: schedule,
          status: 'RUNNABLE',
          result: `0/1`,
        };
        trackingPlanArray.push(trackingPlan);
      }
      timeOfStart.add(1, 'days');
    }
    console.log(1111);
  });

  it('computeAging', function() {
    const declaredAt = new Date('2021-05-06T18:00:00+00:00');
    const transferredAt = new Date('2021-05-08T18:00:00+00:00');
    const arrivedAt = new Date('2021-05-16T18:00:00+00:00');
    const result = ParcelAgingPolicy.computeAging(declaredAt, transferredAt, arrivedAt);
    console.log(result);
    expect(result).toMatchObject({
      transferredAging: 2,
      arrivedAging: 6.167,
      transferredAtIsSunday: false,
      arrivedAtIsSunday: true,
    });
  });

  it('computeAging condition2', function() {
    const declaredAt = new Date('2021-05-01T18:00:00+00:00');
    const transferredAt = new Date('2021-05-02T18:00:00+00:00');
    const arrivedAt = new Date('2021-05-16T18:00:00+00:00');
    const result = ParcelAgingPolicy.computeAging(declaredAt, transferredAt, arrivedAt);
    console.log(result);
    expect(result).toMatchObject({
      transferredAging: 0.167,
      arrivedAging: 12,
      transferredAtIsSunday: true,
      arrivedAtIsSunday: true,
    });
  });

  it('computeAging start and end is one day', function() {
    const declaredAt = new Date('2021-05-02T13:30:00+00:00');
    const transferredAt = new Date('2021-05-02T16:00:00+00:00');
    const arrivedAt = new Date('2021-05-02T18:00:00+00:00');
    const result = ParcelAgingPolicy.computeAging(declaredAt, transferredAt, arrivedAt);
    console.log(result);
    expect(result).toMatchObject({
      transferredAging: 0,
      arrivedAging: 0,
      transferredAtIsSunday: true,
      arrivedAtIsSunday: true,
    });
  });

  it('computeAging start and end is one day not sunday', function() {
    const declaredAt = new Date('2021-05-03T13:30:00+00:00');
    const transferredAt = new Date('2021-05-03T16:00:00+00:00');
    const arrivedAt = new Date('2021-05-03T18:00:00+00:00');
    const result = ParcelAgingPolicy.computeAging(declaredAt, transferredAt, arrivedAt);
    console.log(result);
    expect(result).toMatchObject({
      transferredAging: 0.104,
      arrivedAging: 0.083,
      transferredAtIsSunday: false,
      arrivedAtIsSunday: false,
    });
  });

  it('computeAging both not sunday', function() {
    const declaredAt = new Date('2021-05-06T18:00:00+00:00');
    const transferredAt = new Date('2021-05-08T18:00:00+00:00');
    const arrivedAt = new Date('2021-05-17T18:00:00+00:00');
    const result = ParcelAgingPolicy.computeAging(declaredAt, transferredAt, arrivedAt);
    console.log(result);
    expect(result).toMatchObject({
      transferredAging: 2,
      arrivedAging: 7,
      transferredAtIsSunday: false,
      arrivedAtIsSunday: false,
    });
  });

  it('computeAging both not sunday arrivedAtIsSunday', function() {
    const declaredAt = new Date('2021-05-06T18:00:00+00:00');
    const transferredAt = new Date('2021-05-08T23:00:00+00:00');
    const arrivedAt = new Date('2021-05-17T10:00:00+00:00');
    const result = ParcelAgingPolicy.computeAging(declaredAt, transferredAt, arrivedAt);
    console.log(result);
    expect(result).toMatchObject({
      transferredAging: 2.167,
      arrivedAging: 6.5,
      transferredAtIsSunday: true,
      arrivedAtIsSunday: false,
    });
  });

  it.skip('should moment.tzss ', function() {
    const transferredAt = new Date('2021-05-08T18:00:00+00:00');
    const moment1 = Moment(transferredAt)
      .tz('Europe/Paris')
      .toDate();
    const moment2 = Moment(transferredAt)
      .tz('Europe/Paris')
      .endOf('day')
      .toDate();

    const moment3 = Moment(transferredAt)
      .tz('Europe/Paris')
      .startOf('day')
      .toDate();
    console.log(moment1.getTime() - transferredAt.getTime());
    console.log(moment2.getTime() - moment1.getTime());
    console.log(moment1.getTime() - moment3.getTime());
  });

  it('computeAging', function() {
    const declaredAt = new Date('2022-01-30 13:11:00+00');
    const transferredAt = new Date('2022-02-11 17:49:00+00');
    const arrivedAt = new Date('2022-02-14 08:30:00+00');
    const result = ParcelAgingPolicy.computeAging(declaredAt, transferredAt, arrivedAt);
    console.log(result);
    expect(result).toMatchObject({
      transferredAging: 10.784,
      arrivedAging: 1.612,
      transferredAtIsSunday: false,
      arrivedAtIsSunday: false,
    });
  });
});
