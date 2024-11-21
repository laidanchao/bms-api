import { parse } from 'papaparse';
import * as XLSX from 'xlsx';
import { Sheet2JSONOpts } from 'xlsx';

export class ParserUtils {
  public parse(buffer, options): any {
    options = options || { header: true, typing: true };
    const result = options.fileType !== 'excel' ? this.parseCsv(buffer, options) : this.parseExcel(buffer, options);
    return result.data;
  }

  private parseCsv(buffer: Buffer, options) {
    const papaOptions = {
      header: options.header,
      delimiter: options.delimiter || ';',
      dynamicTyping: options.typing,
      skipEmptyLines: true,
    };
    return parse(buffer.toString(options.encoding || 'utf8'), papaOptions);
  }

  private parseExcel(buffer, options) {
    // call 'xlsx' to read the file
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, cellNF: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const header = options.header ? this.getHeader(worksheet) : [];

    const excelOptions = {
      header: options.header ? '' : 1,
      raw: Boolean(options.typing),
    };
    const data = XLSX.utils.sheet_to_json(worksheet, excelOptions as Sheet2JSONOpts);
    return { header, data };
  }

  private getHeader(sheet) {
    const headers = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    let C;
    const R = range.s.r;
    /* start in the first row */
    for (C = range.s.c; C <= range.e.c; ++C) {
      /* walk every column in the range */
      const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
      /* find the cell in the first row */
      let hdr = 'UNKNOWN ' + C; // <-- replace with your desired default
      if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
      headers.push(hdr);
    }
    return headers;
  }

  public writeToExcel(data, fileName) {
    const workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workBook, workSheet);
    return XLSX.writeFile(workBook, fileName);
  }
}
