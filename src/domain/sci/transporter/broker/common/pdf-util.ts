import axios from 'axios';
import FormData from 'form-data';
import PDFDocument from 'pdf-lib/cjs/api/PDFDocument';
import { degrees, rgb } from 'pdf-lib';
import { Logo } from '@/domain/sci/transporter/broker/common/logo';
import { Logger } from '@/app/logger';

export enum Density {
  DPI152 = '6dpmm',
  DPI203 = '8dpmm',
  DPI300 = '12dpmm',
  DPI600 = '24dpmm',
}

/**
 * 拼接而成
 * 平台_供应商_格式
 */
class LogoPosition {
  static ESENDEO_DPD_A6_PDF = {
    width: 60,
    height: 30,
    x: 50,
    y: 150,
    rotate: degrees(90),
  };

  static ESENDEO_DPD_A4_PDF = {
    width: 60,
    height: 30,
    x: 230,
    y: 750,
  };

  static ESENDEO_CHRONOPOST_A4_PDF = {
    width: 50,
    height: 25,
    x: 640,
    y: 440,
  };

  static ESENDEO_CHRONOPOST_A4_PDF_THE = {
    width: 100,
    height: 50,
    x: 280,
    y: 700,
  };

  static ESENDEO_CHRONOPOST_A6_PDF = {
    width: 50,
    height: 25,
    x: 140,
    y: 350,
  };

  static ESENDEO_GLS_A6_PDF = {
    width: 50,
    height: 25,
    x: 170,
    y: 50,
  };

  static ESENDEO_GLS_A5_PDF = {
    width: 50,
    height: 25,
    x: 470,
    y: 50,
  };

  static ESENDEO_UPS_16x30_PDF = {
    width: 80,
    height: 40,
    x: 330,
    y: 660,
  };

  static ESENDEO_MONDIAL_RELAY_A6_PDF = {
    width: 60,
    height: 30,
    x: 10,
    y: 10,
  };

  static ESENDEO_MONDIAL_RELAY_10x15_PDF = {
    width: 60,
    height: 30,
    x: 10,
    y: 10,
  };

  static ESENDEO_MONDIAL_RELAY_A5_PDF = {
    width: 100,
    height: 50,
    x: 450,
    y: 100,
  };
}

export class PdfUtil {
  /**
   * 将 zpl 转为 pdf
   *
   * @param zplBuffer   zpl 字符串的 buffer
   * @param density     打印密度 {@see Density}
   * @param width       打印宽度 (单位 inches)
   * @param height      打印高度 (单位 inches)
   * @return Base64 加密后的 PDF 字符串
   */
  public async convertZplToPdf(zplBuffer: Buffer, density: Density, width: number, height: number): Promise<string> {
    const form = new FormData();
    form.append('file.zpl', zplBuffer);
    const result = (
      await axios.request({
        method: 'post',
        baseURL: 'http://api.labelary.com',
        url: `/v1/printers/${density}/labels/${width}x${height}/`,
        headers: {
          Accept: 'application/pdf',
        },
        data: form,
        responseType: 'arraybuffer',
      })
    ).data;
    return Buffer.from(result).toString('base64');
  }

  public async convertA4ToA6(pdf: string | Buffer, returnBuffer?: boolean) {
    let buffer;
    if (typeof pdf === 'string') {
      buffer = Buffer.from(pdf, 'base64');
    } else {
      buffer = pdf;
    }

    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    pages.forEach(page => page.scale(0.5, 0.5));
    if (returnBuffer) {
      return await pdfDoc.save();
    }
    return await pdfDoc.saveAsBase64();
  }

  public async drawLogoOnLabel(
    label: string,
    platform: string,
    transporter: string,
    labelFormat: string,
    enable = false,
  ) {
    const logoPosition = `${platform}_${transporter}_${labelFormat}`;
    if (!enable || !Logo[platform] || !LogoPosition[logoPosition] || !label) {
      return label;
    }

    let document: PDFDocument;
    try {
      document = await PDFDocument.load(label);
    } catch (e) {
      Logger.error(e.message);
      return label;
    }
    const image = await document.embedPng(Logo[platform]);

    document.getPages().forEach(page => {
      page.drawImage(image, LogoPosition[logoPosition]);
    });

    return await document.saveAsBase64();
  }

  public async drawCMSSTAGINGLogo(label: string) {
    let document: PDFDocument;
    try {
      document = await PDFDocument.load(label);
    } catch (e) {
      Logger.error(e.message);
      return label;
    }
    const image = await document.embedPng(Logo['CMSSTAGING']);
    document.getPages().forEach(page => {
      page.drawImage(image, {
        x: page.getWidth() * 0.25,
        y: page.getHeight() * 0.07,
        rotate: degrees(30),
        opacity: 1,
      });
    });

    return await document.saveAsBase64();
  }

  public async drawHKAceCirCleText(label, text, reference) {
    let document: PDFDocument;
    try {
      document = await PDFDocument.load(label);
    } catch (e) {
      Logger.error(e.message);
      return label;
    }
    document.getPages().forEach(page => {
      // 设置圆圈的属性
      const circleColor = rgb(1, 1, 1);

      // 在页面上绘制圆圈
      page.drawCircle({
        x: page.getWidth() * 0.11,
        y: page.getHeight() * 0.11,
        size: page.getWidth() * 0.05,
        color: circleColor, // 圆的颜色
        borderWidth: 1, // 圆边的宽度
        opacity: 0.3,
      });
      page.drawText(text, {
        x: page.getWidth() * 0.09,
        y: page.getHeight() * 0.09,
        size: page.getWidth() * 0.07,
        color: rgb(0, 0, 0),
        rotate: degrees(0),
        opacity: 1,
      });

      page.drawText(reference, {
        x: page.getWidth() * 0.03,
        y: page.getHeight() * 0.25,
        size: page.getWidth() * 0.03,
        color: rgb(0, 0, 0),
        rotate: degrees(0),
        opacity: 1,
      });
    });
    return await document.saveAsBase64();
  }
}
