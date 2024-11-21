import moment from 'moment';
import papa from 'papaparse';

export class CsvAndPath {
  filePath: string;
  csv: any;
}

export class SctService {
  static async buildCsvAndPath(crawlerParcel, transporterId, date, platform, officialStr): Promise<CsvAndPath> {
    const csv = papa.unparse(crawlerParcel);
    const time = moment(date)
      .format('YYYY-MM-DD')
      .replace(/-/g, '/');
    const filePath = `tracking/daily_tracking_number/${time}/${transporterId}/${platform}-${officialStr}-${moment()
      .utc()
      .format('x')}.csv`;
    return { filePath, csv };
  }
}
