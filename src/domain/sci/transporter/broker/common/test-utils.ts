import * as fs from 'fs';

export function writeLabelAndLog(transporter, result) {
  const filename = `temp/${transporter}_${result.trackingNumber}.${result.labelFormat}`;
  fs.writeFileSync(filename, result.label, 'base64');
  if (result.cn23) {
    fs.writeFileSync(`temp/${transporter}_${result.trackingNumber}_cn23.pdf`, result.cn23, 'base64');
  }
  if (result.invoice) {
    fs.writeFileSync(`temp/${transporter}_${result.trackingNumber}_invoice.pdf`, result.invoice, 'base64');
  }
  const log = `
    <!-- request: -->
    ${result.transporterRequest}
    --------------------
    <!-- response: -->
    ${result.transporterResponse}
  `;
  fs.writeFileSync(`temp/${transporter}_${result.trackingNumber}_log.xml`, log);
}
