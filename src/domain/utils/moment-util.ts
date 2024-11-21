import moment from 'moment';

export function today() {
  return moment().format('YYYY-MM-DD');
}

export function yesterday() {
  return moment()
    .subtract(1)
    .format('YYYY-MM-DD');
}

export function tomorrow() {
  return moment()
    .add(1)
    .format('YYYY-MM-DD');
}

export function todayStart() {
  return moment()
    .startOf('day')
    .format('YYYY-MM-DD');
}

export function weekStart() {
  return moment()
    .startOf('week')
    .add(1, 'day')
    .format('YYYY-MM-DD');
}

export function monthStart() {
  return moment()
    .startOf('month')
    .format('YYYY-MM-DD');
}

export function yearStart() {
  return moment()
    .startOf('year')
    .format('YYYY-MM-DD');
}

/**
 * N个小时前
 * @param n
 */
export function hourAgo(n: number) {
  return moment()
    .subtract(n, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
}

/**
 * N个星期前
 * @param n
 */
export function weekAgo(n: number) {
  return moment()
    .subtract(n, 'week')
    .startOf('day')
    .format('YYYY-MM-DD');
}

/**
 * N个月前
 * @param n
 */
export function monthAgo(n: number) {
  return moment()
    .subtract(n, 'month')
    .startOf('day')
    .format('YYYY-MM-DD');
}
