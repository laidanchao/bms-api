import XLSX, { JSON2SheetOpts, Sheet2JSONOpts } from 'xlsx';
import { createCanvas } from 'canvas';
import _ from 'lodash';
import moment from 'moment';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ProofType } from '@/domain/ord/parcel-proof/entity/parcel-proof.entity';

/**
 * 获取文件MIME
 * @param extension 文件后缀
 */
export function getMIME(extension: string) {
  switch (extension) {
    case 'txt':
      return 'text/plain';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';
    case 'pdf':
      return 'application/pdf';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'png':
      return 'image/png';
    case 'jpg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'ico':
      return 'image/x-icon';
    case 'bmp':
      return 'image/bmp';
    default:
      return 'application/octet-stream';
  }
}

export function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * 延迟执行
 * @param timeout 毫秒
 */
export function delay(timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export function excelToJson(buffer: any, options: Sheet2JSONOpts = { defval: '' }) {
  // csv转json
  const wb = XLSX.read(buffer);
  const ws = wb.Sheets[wb.SheetNames[0]];
  // defval须给空字符串，表示没有数据的列用空字符串填充
  return XLSX.utils.sheet_to_json(ws, options);
}

export function jsonToExcel(data, options: JSON2SheetOpts = { skipHeader: false }) {
  const book = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(data, options);
  XLSX.utils.book_append_sheet(book, sheet);
  return XLSX.write(book, { bookType: 'xlsx', type: 'buffer' });
}

export function dataConvertToImage(title: string, columnNames: string[], dataRows: any[]) {
  // 绘制表格
  const cellWidth = 200;
  const cellHeight = 40;

  const headHeight = cellHeight * 2;
  const bodyHeight = cellHeight * dataRows.length;

  const tableWidth = cellWidth * columnNames.length;
  const tableHeight = headHeight + bodyHeight;

  const canvasWidth = tableWidth;
  const canvasHeight = tableHeight;
  const borderWidth = 1;

  // 创建 canvas
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff'; // 设置背景颜色
  ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充背景色

  ctx.font = 'bold 24px Arial'; // 设置字体
  ctx.fillStyle = '#444444'; // 设置字体颜色

  // title
  ctx.strokeRect(0, 0, tableWidth, cellHeight);
  ctx.fillText(title, 555, 30);

  ctx.strokeStyle = '#444444'; // 设置边框颜色
  ctx.lineWidth = borderWidth; // 设置边框线宽
  ctx.font = '16px Arial'; // 设置字体

  // head
  for (let i = 0; i < columnNames.length; i++) {
    const x = i * cellWidth;
    const y = cellHeight;

    ctx.strokeRect(x, y, cellWidth, cellHeight);
    ctx.fillText(columnNames[i], x + 10, y + 25);
  }

  // body
  for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
    const values = _.values(dataRows[rowIndex]);
    for (let colIndex = 0; colIndex < values.length; colIndex++) {
      const x = colIndex * cellWidth;
      const y = rowIndex * cellHeight + headHeight;

      // 绘制单元格边框
      ctx.strokeRect(x, y, cellWidth, cellHeight);

      // 绘制单元格内容
      const text = values[colIndex];
      const array = text.split('/');
      if (array.length === 2) {
        const text0 = array[0];
        const text1 = array[1];
        const text0Width = ctx.measureText(text0).width;

        if (array[0] === array[1]) {
          ctx.fillStyle = '#7ac756'; // 变绿
        } else {
          ctx.fillStyle = '#f77'; // 变红
        }

        ctx.fillText(text0, x + 10, y + 25);
        ctx.fillStyle = '#444444'; // 变黑
        ctx.fillText('/' + text1, x + 10 + text0Width, y + 25);
      } else if (array.length === 3) {
        const text0 = array[0];
        const text1 = array[1];
        const text2 = array[2];
        const text0Width = ctx.measureText(text0).width;
        const text1Width = ctx.measureText('/' + text1).width;

        if (text0 === text2) {
          ctx.fillStyle = '#7ac756'; // 变绿
        } else {
          ctx.fillStyle = '#F1AB41'; // 变橘色
        }

        ctx.fillText(text0, x + 10, y + 25);
        if (text1 === text2) {
          ctx.fillStyle = '#7ac756'; // 变绿
        } else {
          ctx.fillStyle = '#f77'; // 变红
        }

        ctx.fillText('/' + text1, x + 10 + text0Width, y + 25);
        ctx.fillStyle = '#444444'; // 变黑
        ctx.fillText('/' + text2, x + 10 + text0Width + text1Width, y + 25);
      } else {
        if (text === 'abnormal') {
          ctx.fillStyle = '#f77'; // 变红
          ctx.fillText(text, x + 10, y + 25);
          ctx.fillStyle = '#444444'; // 变黑
        } else {
          ctx.fillText(text, x + 10, y + 25);
        }
      }
    }
  }

  // ctx.strokeRect(0,0,canvasWidth,cellHeight);
  //
  // for (let row = 0; row < rows; row++) {
  //   for (let col = 0; col < columnNames; col++) {
  //     const x = col * cellWidth;
  //     const y = row * cellHeight;
  //
  //     // 绘制单元格边框
  //     ctx.strokeRect(x, y, cellWidth, cellHeight);
  //
  //     // 绘制单元格内容
  //     const text = `Row ${row + 1}, Col ${col + 1}`;
  //     ctx.fillText(text, x + 10, y + 25);
  //   }
  // }

  // 将 canvas 转换为图片
  return canvas.toBuffer();
}

/**
 * 生成任务编号
 * @param proofType
 */
export function generateTaskCode(proofType: ProofType) {
  if ([ProofType.POW, ProofType.POD].includes(proofType)) {
    return proofType + moment().format('YYYYMMDDHHmmssSSS') + _.padStart(_.random(1, 999), 3, 0);
  } else {
    throw new Error('任务类型不存在');
  }
}

/**
 * 获取代理IP（青果）
 * EVERY_TIME: 每次请求更换IP
 * ONE_MINUTE：每1分钟更换IP
 */
export function getHttpAgent(type: 'EVERY_TIME' | 'ONE_MINUTE' = 'ONE_MINUTE') {
  let authKey;
  let password;
  let proxyHost;
  let proxyPort;
  if (type === 'ONE_MINUTE') {
    authKey = '1E24CC18';
    password = '0E9392098DB9';
    proxyHost = '120.42.248.197';
    proxyPort = '11374';
  } else {
    authKey = 'XHUPTNZ3';
    password = '9305E4A0CC68';
    proxyHost = 'overseas.tunnel.qg.net';
    proxyPort = '12058';
  }

  return new HttpsProxyAgent(`http://${authKey}:${password}@${proxyHost}:${proxyPort}`);
}
