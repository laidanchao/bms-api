import { Density, PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';

describe('pdf-util', () => {
  it('convert zpl to pdf', async function() {
    const zplString =
      '^XA\n' +
      '^FO10 ,48 ^GB780,655,3 ^FS\n' +
      '^FO13 ,89 ^GB571,3,3 ^FS\n' +
      '^FO13 ,228^GB571,3,3 ^FS\n' +
      '^FO13 ,395^GB571,3,3 ^FS\n' +
      '^FO424,230^GB3,169,3 ^FS\n' +
      '^FO584,48^GB3,382,3 ^FS\n' +
      '^FO730,48^GB3,382,3 ^FS\n' +
      '^FO585,430^GB202,3,3 ^FS\n' +
      '^FO50,53^A0N,17,17^FDOn delivery, damage or thelt must be the subject of precise and complete ^FS\n' +
      '^FO50,72^A0N,17,17^FDreservations, dated and signed by the consignee, on the delivery note. ^FS\n' +
      '^FO753,70^A0R,28,48^FDCHRONOPOST^FS\n' +
      '^FO735,70^A0R,18,18^FDwww.chronopost.fr^FS\n' +
      '^FO710,70^A0R,19,19^FDSender^FS\n' +
      '^FO615,70^A0R,19,19^FDPhone^FS\n' +
      '^FO595,70^A0R,19,19^FDRef^FS\n' +
      '^FO560,102^A0R,19,19^FDDelivery address ^FS\n' +
      '^FO695,70^A0R,19,19^FDX sociale^FS\n' +
      '^FO675,70^A0R,19,19^FDfirstS lastS^FS\n' +
      '^FO655,70^A0R,19,19^FDsender street address 1 ds^FS\n' +
      '^FO635,70^A0R,19,19^FD75018 paris FRANCE^FS\n' +
      '^FO615,160^A0R,19,19^FD0659969984^FS\n' +
      '^FO595,100^A0R,19,19^FDref123456^FS\n' +
      '^FO17 ,238^AQN,15,15^FDContact :^FS\n' +
      '^FO17 ,258^AQN,15,15^FDPhone :^FS\n' +
      '^FO17 ,278^AQN,15,15^FDRef :^FS\n' +
      '^FO17 ,297^AQN,15,15^FDConsignement^FS\n' +
      '^FO455,322^AQN,15,15^FDWeight ^FS\n' +
      '^FO530,350^ARN,19,19^FDKG  ^FS\n' +
      '^FO17 ,500^A0N,19,19^FDDate : ^FS\n' +
      '^FO17, 100^AQN,10,10,^FDX sociale^FS\n' +
      '^FO17,120^AQN,10,10,^FDfirstS lastS^FS\n' +
      '^FO17,140^AQN,10,10,^FDsender street address 1 ds^FS\n' +
      '^FO17,160^AQN,10,10,^FDsender street address 2 ds^FS\n' +
      '^FO17,180^AQN,10,10^FD75018    paris^FS\n' +
      '^FO17,200^AQN,10,10^FDFR - FRANCE    ^FS\n' +
      '^FO100,238^AQN,10,10^FDfirstS lastS^FS\n' +
      '^FO100,258^AQN,10,10^FD0659969984^FS\n' +
      '^FO065,278^AQN,10,10^FDref123456^FS\n' +
      '^FO150,297^AQN,20,20^FDXP414755886FR^FS\n' +
      '^FO050,359^ARN,20,20^FDref123456^FS\n' +
      '^FO035,448^AUN,15,15^FD^FS\n' +
      '^FO445,260^AUN,20,20^FD1/1^FS\n' +
      '^FO450,350^ARN,20,20^FD1.0^FS\n' +
      '^FO75,500^A0N,19,19^FD04/11/2021^FS\n' +
      '^FO17,517^A0N,19,19^FD^FS\n' +
      '^FO30,635^AUN,15,15^FD^FS\n' +
      '^FO450,562^ARN,20,20^FD^FS\n' +
      '^BY2,2\n' +
      '^FO35,407^BCN, 40,N,N,N,A^FDXP414755886FR^FS\n' +
      '^FO50,465^ARN,20,20^FDXP414755886FR^FS\n' +
      '^FO10,645^ATN,20,20^FB485,1,0,R^FD13H^FS\n' +
      '\n' +
      '\n' +
      '^FO14,706^AUN,20,20^FDXP41^FS\n' +
      '^FO122,707^ABN,30,15^FD 4755 8862 48Z^FS\n' +
      '^FO270,708^AUN,20,20^FB530,1,0,R^FDAM2-NO^FS\n' +
      '^FO16 ,755^A0N,20,20^FDTrack^FS\n' +
      '^FO720,755^A0N,20,20^FDService^FS\n' +
      '^FO23,783^AUN,20,20^FD^FS\n' +
      '^FO15,775^GB40,60,3 ^FS\n' +
      '^FO150,780^AVN,60,45^FDFR-CHR-0466-NEY0^FS\n' +
      '^FO240,880^ADN,40,20^FD226-FR-75018^FS\n' +
      '^FO20,870^AVN,40,20^FDIDF^FS\n' +
      '^FO580,870^AVN,40,20^FD98R00^FS\n' +
      '^FO200,920^A0N,19,19^FD04/11/2021^FS\n' +
      '^FO280,920^A0N,19,19^FD^FS\n' +
      '^FO330,920^A0N,19,19^FDCHRWS 0817^FS\n' +
      '^FO30,950^GB734,7,7^FS\n' +
      '^BY3,2\n' +
      '^FO30,960^BCN,200,N,N,N,A^FD%0075018XP414755886248226250^FS\n' +
      '^FO190,1160^ARN,20,20^FD0075 018X P414 7558 8624 8226 2507^FS\n' +
      '\n' +
      '\n' +
      '^FO518,440\n' +
      '^B0R,3,N,0,N,1,0\n' +
      '^FH`^FD[)>`1E01020075018250226XP414755886248GEOP199997003081/11KGNsender street address 1 dsparisX sociale`1E07G03000firstS lastSfirstS lastS06599699840659969984ddd@ggla.comsender street address 2 ds1KGref123456ref123456DGALLIA BEBE EXPERT HA 2 800G0`1E07S010X sociale0659969984firstS lastSsender street address 1 dssender street address 2 dsparis75018250`1E07D001011041121XP414755886FR000?0`1E^FS\n' +
      '^XZ\n';
    const zplBuffer = Buffer.from(zplString);
    const result = await new PdfUtil().convertZplToPdf(zplBuffer, Density.DPI203, 4, 6);
    expect(result).not.toBeNull();
  });

  it('convert A4 to A6 exp1', async () => {
    const base64 =
      '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MScwMCcpL0NyZWF0aW9uRGF0ZShEOjIwMjExMTE4MDcxMjQzKzAxJzAwJyk+PgplbmRvYmoKeHJlZgowIDEzCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAxMTUwMyAwMDAwMCBuIAowMDAwMDAwMDAwIDY1NTM2IG4gCjAwMDAwMTEyODggMDAwMDAgbiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAxMzgyIDAwMDAwIG4gCjAwMDAwMDY0ODkgMDAwMDAgbiAKMDAwMDAwNzQ0MSAwMDAwMCBuIAowMDAwMDA4OTQwIDAwMDAwIG4gCjAwMDAwMTExMDggMDAwMDAgbiAKMDAwMDAxMTE5NSAwMDAwMCBuIAowMDAwMDExNTUzIDAwMDAwIG4gCjAwMDAwMTE1OTggMDAwMDAgbiAKdHJhaWxlcgo8PC9Sb290IDExIDAgUi9JRCBbPGFiMTMxOGU4NzQxOWU4ZjYzZWNmYzFiNGYwYjIyYzVmPjxhYjEzMThlODc0MTllOGY2M2VjZmMxYjRmMGIyMmM1Zj5dL0luZm8gMTIgMCBSL1NpemUgMTM+PgpzdGFydHhyZWYKMTE3NTQKJSVFT0YK';
    const buffer = Buffer.from(base64, 'base64');
    const base64Result = await new PdfUtil().convertA4ToA6(base64);
    const base64Result2 = await new PdfUtil().convertA4ToA6(buffer);
    const bufferResult = await new PdfUtil().convertA4ToA6(base64, true);
    const bufferResult2 = await new PdfUtil().convertA4ToA6(buffer, true);

    expect(base64Result).toEqual(base64Result2);
    expect(bufferResult).toEqual(bufferResult2);
    expect(Buffer.from(bufferResult).toString('base64')).toEqual(base64Result);
  });
});
