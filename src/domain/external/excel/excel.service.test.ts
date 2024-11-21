import { ExcelService } from '@/domain/external/excel/excel.service';

describe('excel service test', () => {
  describe('write', () => {
    it('should write file successfully', async function() {
      const headers = [
        { header: 'platform', key: 'platform' },
        { header: 'transporter', key: 'transporter' },
        { header: 'clientId', key: 'clientId' },
        { header: 'transferredDate', key: 'transferredDate' },
        { header: 'quantity', key: 'parcelQuantity' },
      ];
      const data = [
        { platform: 'OMS', transporter: 123456, clientId: 'YUN', parcelQuantity: 10 },
        { platform: 'TMS', transporter: 123456, clientId: 'YUN', parcelQuantity: 1 },
      ];
      const excelService = new ExcelService();
      const result = await excelService.write({ data, headers });
      expect(result.toString('base64').length).toEqual(8620);
    });
  });
});
