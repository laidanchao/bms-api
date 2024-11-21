const Excel = require('exceljs');
const BufferWritableStream = require('@softbrains/ftp/src/BufferWritableStream');

export class ExcelService {
  constructor() {
    // do nothing
  }

  async read(type, stream, options = {}) {
    type = type.includes('csv') ? 'csv' : 'xlsx';
    const workbook = new Excel.Workbook();
    await workbook[type].read(stream, options);
    const worksheet = workbook.getWorksheet(1);

    // TODO worksheet to json array
    const data = [];
    worksheet.eachRow(function(row) {
      // exceljs read's result since 1
      data.push(row.values.slice(1, row.values.length));
    });
    return data;
  }

  async write(options) {
    const { sheetName, headers, data, mergedCells } = options;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = headers;
    worksheet.addRows(data);

    if (mergedCells) {
      this.mergeCells(worksheet, mergedCells);
    }

    const bufferWritableStream = new BufferWritableStream();
    await workbook.xlsx.write(bufferWritableStream);
    return bufferWritableStream.toBuffer();
  }

  async writeFile(options) {
    const { sheetName, headers, data, path } = options;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = headers;
    worksheet.addRows(data);
    await workbook.xlsx.writeFile(path);
  }
  /**
   * @param {Worksheet} worksheet
   * @param {Array} headers
   * @param {Array} data
   */
  private mergeCells(worksheet, mergedCells) {
    for (const [top, left, bottom, right] of mergedCells) {
      worksheet.mergeCells(top, left, bottom, right);
    }
  }
}
