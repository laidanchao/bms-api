import moment from 'moment';

describe('moment test', function() {
  it('moment diff ', function() {
    const moment1 = moment('2021-10-01 10:29:13');
    const moment2 = moment('2021-10-01 10:29:14');
    const moment3 = moment('2021-10-01 10:29:23');
    expect(moment2.diff(moment1)).toEqual(1000);
    expect(moment3.diff(moment1)).toEqual(10 * 1000);
    expect(moment3.diff(moment2)).toEqual(9 * 1000);
    const startDateTime = moment().toDate();
    console.log(1111111111);
    const elapsedTime = moment().diff(startDateTime);
    console.log(elapsedTime);
  });
});
