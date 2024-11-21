import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import moment from 'moment';
import _ from 'lodash';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

global['PNG'] = require('png-js');
global['atob'] = require('atob');
global['btoa'] = require('btoa');

export const GeneratorInvoicePdf = {
  generator(shipment, channelConfig?: any) {
    if (!!shipment.options && shipment.options.invoiceWay === 'LAST') {
      return this.generateInvoiceForESENDEO(shipment, channelConfig);
    } else {
      return this.generateInvoiceDefault(shipment);
    }
  },
  generateInvoiceForESENDEO(shipment, channelConfig?: any) {
    const doc = new jsPDF('portrait', 'pt', 'a4');
    const trackingNumberText = shipment?.trackingNumber ? `: ${shipment.trackingNumber}` : '';
    let titleTextEN = `PROFORMA INVOICE${trackingNumberText}`;
    const isChronopost = ['CHRONOPOST'].includes(channelConfig?.transporterId);
    if (isChronopost) {
      titleTextEN = `COMMERCIAL INVOICE: ${shipment.trackingNumber}`;
    }
    const headers1 = [{ header: 'title', dataKey: 'title' }];
    const tableStyel: any = {
      lineColor: [0, 0, 0],
      lineWidth: 1,
      textColor: [0, 0, 0],
      fontSize: 9,
      minCellHeight: 25,
      valign: 'middle',
    };
    //title
    const data1 = [{ title: [`${titleTextEN}`] }];
    autoTable(doc, {
      columns: headers1,
      body: data1,
      theme: 'grid',
      showHead: 'never',
      styles: tableStyel,
      bodyStyles: { halign: 'center', fontStyle: 'bold', fontSize: 11 },
      columnStyles: { 0: { minCellWidth: 140 } },
    });
    // hawb number
    let finalY = (doc as any).lastAutoTable.finalY;

    if (channelConfig?.transporterId === 'GPX') {
      autoTable(doc, {
        theme: 'grid',
        startY: finalY,
        tableLineColor: [0, 0, 0],
        tableLineWidth: 1,
        body: [[`Invoice No:${shipment.options.invoiceNumber}`, `Invoice Date:${shipment.options.invoiceDate}`]],
        styles: tableStyel,
        columnStyles: {
          0: { cellWidth: 255, fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
          1: { cellWidth: 260, fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
        },
      });
      finalY = (doc as any).lastAutoTable.finalY;
    }

    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      tableLineColor: [0, 0, 0],
      tableLineWidth: 1,
      body: [['FROM:(Shipper)', 'TO:(Receiver)']],
      styles: tableStyel,
      columnStyles: {
        0: { cellWidth: 255, fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
        1: { cellWidth: 260, fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
      },
    });
    // hawb number
    finalY = (doc as any).lastAutoTable.finalY;
    // doc.autoTable({
    //   theme: 'grid',
    //   startY: finalY,
    //   head: [['']],
    //   showHead: 'never',
    //   body: [[`${shipment.trackingNumber}`]],
    //   styles: tableStyel,
    //   bodyStyles: {halign: 'center'}
    // });
    // // address info
    // finalY = doc.previousAutoTable.finalY;
    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      head: [['senderKey', 'senderValue', 'receiverKey', 'receiverValue']],
      showHead: 'never',
      // headStyles: {fillColor: [255, 255, 255], textColor: [0, 0, 0]},
      tableLineColor: [0, 0, 0],
      tableLineWidth: 1,
      body: [
        [
          'Company:',
          `${shipment.senderAddress.company || ''}`,
          'Company(if applicable):',
          `${shipment.receiverAddress.company || ''}`,
        ],
        ['EORI:', `${shipment.senderAddress.EORI || ''}`, 'EORI:', `${shipment.receiverAddress.EORI || ''}`],
        [
          'VAT Number:',
          `${shipment.senderAddress.vatNumber || ''}`,
          'VAT Number:',
          `${shipment.receiverAddress.vatNumber || ''}`,
        ],
        [
          'Contact Name:',
          `${TransporterUtils.getAddressName(shipment.senderAddress)}`,
          'Contact Name:',
          `${TransporterUtils.getAddressName(shipment.receiverAddress)}`,
        ],
        [
          'Address *:',
          `${TransporterUtils.streetsToString(shipment.senderAddress)}`,
          'Address:',
          `${TransporterUtils.streetsToString(shipment.receiverAddress)}`,
        ],
        ['City:', `${shipment.senderAddress.city || ''}`, 'City:', `${shipment.receiverAddress.city || ''}`],
        [
          'Country:',
          `${shipment.senderAddress.countryCode || ''}`,
          'Country:',
          `${shipment.receiverAddress.countryCode || ''}`,
        ],
        ['Post Code*:', `${shipment.senderAddress.postalCode}`, 'Post code:', `${shipment.receiverAddress.postalCode}`],
        [
          'Tel No*:',
          `${shipment.senderAddress.phoneNumber || shipment.senderAddress.mobileNumber}`,
          'Tel No:',
          `${shipment.receiverAddress.phoneNumber || shipment.receiverAddress.mobileNumber}`,
        ],
        ['Email:', `${shipment.senderAddress.email || ''}`, 'Email:', `${shipment.receiverAddress.email || ''}`],
      ],
      styles: tableStyel,
      columnStyles: {
        0: { cellWidth: 110, fontStyle: 'bold' },
        1: { cellWidth: 145 },
        2: { cellWidth: 110, fontStyle: 'bold', overflow: 'visible' },
        3: { cellWidth: 150 },
      },
    });
    // product item info
    finalY = (doc as any).lastAutoTable.finalY;
    const itemHeader = [
      {
        description: 'DESCRIPTION OF GOOD',
        hsCode: 'HS CODE',
        quantity: 'QUANTITY',
        price: 'UNIT PRICE(EUR)',
        value: 'VALUE(EUR)',
        country: 'Country of Origin',
      },
    ];

    // const itemBody = [
    //   {description: 'clothing \n shoe', quantity: '2', price: '12,50', value: '25', country: 'FR'},
    //   {description: 'shoe', quantity: '2', price: '12,50', value: '25', country: 'FR'}
    // ];
    const itemBody = shipment.parcel.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      price: this.numFormat(item.value),
      value: this.numFormat(item.value * item.quantity),
      totalValue: item.value * item.quantity,
      country: item.originCountry,
      hsCode: item.hsCode,
    }));
    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      head: itemHeader,
      body: itemBody,
      styles: tableStyel,
      tableLineColor: [0, 0, 0],
      tableLineWidth: 1,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: 'center',
        lineWidth: 1,
      },
      bodyStyles: { halign: 'center' },
      columnStyles: {
        description: { cellWidth: 125, lineWidth: 1 },
        hsCode: { cellWidth: 65, lineWidth: 1 },
        quantity: { cellWidth: 65, lineWidth: 1 },
        price: { cellWidth: 85, lineWidth: 1 },
        value: { cellWidth: 85, lineWidth: 1 },
        country: { cellWidth: 90, lineWidth: 1 },
      },
    });

    //total info
    finalY = (doc as any).lastAutoTable.finalY;
    const head: any = [['', '']];
    head[0][1] = { colSpan: 3 };
    let totalPrice = _.sumBy(itemBody, 'totalValue');
    totalPrice = this.numFormat(totalPrice);
    const infoBody = [
      ['', 'Total Declared Value(EUR):', `${totalPrice}`],
      ['', 'Terms of trade:', 'DAP'],
      ['', 'Reason for Sending:', ''],
    ];
    // const checkBox = new CheckBox();
    // checkBox.caption = '3';
    // checkBox.Rect = [10, 10, 20, 20];
    // doc.addField(checkBox);
    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      showHead: 'never',
      head: head,
      tableLineColor: [0, 0, 0],
      tableLineWidth: 1,
      headStyles: { lineWidth: 0, lineColor: 0 },
      styles: tableStyel,
      body: infoBody,
      didDrawCell: function(data) {
        if (data.row.index === 2 && data.column.index === 2) {
          data.row.height = 75;
          doc.text('Gift', data.cell.x + 20, data.cell.y + 15);
          doc.text('Samples', data.cell.x + 165, data.cell.y + 15);
          doc.text('Sale of merchandise', data.cell.x + 20, data.cell.y + 35);
          doc.text('Documents', data.cell.x + 165, data.cell.y + 35);
          doc.text('Merchandise return', data.cell.x + 20, data.cell.y + 55);
          doc.setDrawColor(0, 0, 0);
          doc.rect(data.cell.x + 5, data.cell.y + 8, 10, 10);
          doc.rect(data.cell.x + 150, data.cell.y + 8, 10, 10);
          doc.rect(data.cell.x + 5, data.cell.y + 28, 10, 10);
          doc.rect(data.cell.x + 150, data.cell.y + 28, 10, 10);
          doc.rect(data.cell.x + 5, data.cell.y + 48, 10, 10);
          if (shipment.parcel.options) {
            switch (shipment.parcel.options.sendingReasonCode) {
              case 0:
                doc.line(data.cell.x + 15, data.cell.y + 8, data.cell.x + 5, data.cell.y + 18);
                doc.line(data.cell.x + 15, data.cell.y + 18, data.cell.x + 5, data.cell.y + 8);
                return;
              case 1:
                doc.line(data.cell.x + 160, data.cell.y + 8, data.cell.x + 150, data.cell.y + 18);
                doc.line(data.cell.x + 160, data.cell.y + 18, data.cell.x + 150, data.cell.y + 8);
                return;
              case 2:
                doc.line(data.cell.x + 15, data.cell.y + 28, data.cell.x + 5, data.cell.y + 38);
                doc.line(data.cell.x + 15, data.cell.y + 38, data.cell.x + 5, data.cell.y + 28);
                return;
              case 3:
                doc.line(data.cell.x + 160, data.cell.y + 28, data.cell.x + 150, data.cell.y + 38);
                doc.line(data.cell.x + 160, data.cell.y + 38, data.cell.x + 150, data.cell.y + 28);
                return;
              case 4:
                doc.line(data.cell.x + 15, data.cell.y + 48, data.cell.x + 5, data.cell.y + 58);
                doc.line(data.cell.x + 15, data.cell.y + 58, data.cell.x + 5, data.cell.y + 48);
                return;
              case 5:
                doc.line(data.cell.x + 160, data.cell.y + 48, data.cell.x + 150, data.cell.y + 58);
                doc.line(data.cell.x + 160, data.cell.y + 58, data.cell.x + 150, data.cell.y + 48);
                return;
            }
          } else {
            doc.line(data.cell.x + 15, data.cell.y + 28, data.cell.x + 5, data.cell.y + 38);
            doc.line(data.cell.x + 15, data.cell.y + 38, data.cell.x + 5, data.cell.y + 28);
          }
        }
      },
      columnStyles: {
        0: { cellWidth: 0, lineWidth: 0 },
        1: { cellWidth: 180, halign: 'left', lineWidth: 0 },
        2: { cellWidth: 390, halign: 'left', lineWidth: 0 },
      },
    });

    // reamrks 备注
    finalY = (doc as any).lastAutoTable.finalY;
    const remarksBody = [
      ['REMARKS:'],
      [
        'I hereby certify the information on this declaration is true and correct;and the contents of this shipment are as stated above.',
      ],
      ['SIGNATURE:', 'Date:'],
      [TransporterUtils.getFullName(shipment.senderAddress), moment(shipment.shippingDate).format('DD/MM/YYYY')],
    ];
    remarksBody[1][0] = {
      content:
        'I hereby certify the information on this declaration is true and correct;and the contents of this shipment are as stated above.',
      colSpan: 2,
    };
    if (isChronopost && shipment.options.originCountryIsUE) {
      remarksBody.splice(2, 0, [
        {
          content:
            'The exporter of the products covered by this document declares that, except otherwise clearly indicated, these products are of EEA preferential origin.',
          colSpan: 2,
        },
      ]);
    }
    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      showHead: 'never',
      head: [['', '']],
      headStyles: { lineWidth: 0, lineColor: 0 },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 1,
      styles: tableStyel,
      body: remarksBody,
      columnStyles: {
        0: { minCellWidth: 106, lineWidth: 0 },
        1: { lineWidth: 0 },
      },
    });

    const arraybuffer = doc.output('arraybuffer');
    return Buffer.from(arraybuffer).toString('base64');
  },
  generateInvoiceDefault(shipment) {
    const doc = new jsPDF('portrait', 'pt', 'a4');
    const titleTextEN = 'PROFORMA INVOICE';
    const headers1 = [{ header: 'title', dataKey: 'title' }];
    const tableStyel: any = {
      lineColor: [0, 0, 0],
      lineWidth: 1,
      textColor: [0, 0, 0],
      fontSize: 9,
      minCellHeight: 25,
      valign: 'middle',
    };
    //title
    const data1 = [{ title: [`${titleTextEN}`] }];
    autoTable(doc, {
      columns: headers1,
      body: data1,
      theme: 'grid',
      showHead: 'never',
      styles: tableStyel,
      bodyStyles: { halign: 'center', fontStyle: 'bold', fontSize: 11 },
    });
    // hawb number
    let finalY = (doc as any).lastAutoTable.finalY;
    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      head: [['']],
      showHead: 'never',
      body: [[`${shipment.trackingNumber}`]],
      styles: tableStyel,
      bodyStyles: { halign: 'center' },
    });
    // address info
    finalY = (doc as any).lastAutoTable.finalY;
    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      head: [['FROM:(Shipper)', 'TO:(Receiver)']],
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 1,
      body: [
        ['Company', 'Company(if applicable)'],
        [`${shipment.senderAddress.company || ''}`, `${shipment.senderAddress.company || ''}`],
        ['Contact Name', 'Contact Name'],
        [
          `${TransporterUtils.getAddressName(shipment.senderAddress)}`,
          `${TransporterUtils.getAddressName(shipment.receiverAddress)}`,
        ],
        ['Address * ', 'Address'],
        [
          `${TransporterUtils.streetsToString(shipment.senderAddress)}`,
          `${TransporterUtils.streetsToString(shipment.receiverAddress)}`,
        ],
        ['Country', 'Country'],
        [shipment.senderAddress.countryCode, shipment.receiverAddress.countryCode],
        ['Post Code*', 'Post code'],
        [`${shipment.senderAddress.postalCode}`, `${shipment.receiverAddress.postalCode}`],
        ['Tel No*', 'Tel No'],
        [
          `${shipment.senderAddress.phoneNumber || shipment.senderAddress.mobileNumber}`,
          `${shipment.senderAddress.phoneNumber || shipment.senderAddress.mobileNumber}`,
        ],
      ],
      didParseCell: function(data) {
        if (data.row.index % 2 === 0) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
      styles: tableStyel,
      columnStyles: {
        0: { minCellWidth: 140 },
      },
    });
    // product item info
    finalY = (doc as any).lastAutoTable.finalY;
    const itemHeader = [
      {
        description: 'DESCRIPTION OF GOOD',
        quantity: 'QUANTITY',
        price: 'UNITE PRICE(EUR)',
        value: 'VALUE(EUR)',
        country: 'Country of Origin',
      },
    ];

    // const itemBody = [
    //   {description: 'clothing \n shoe', quantity: '2', price: '12,50', value: '25', country: 'FR'},
    //   {description: 'shoe', quantity: '2', price: '12,50', value: '25', country: 'FR'}
    // ];
    const itemBody = shipment.parcel.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      price: item.value,
      value: item.value * item.quantity,
      country: item.originCountry,
    }));
    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      head: itemHeader,
      body: itemBody,
      styles: tableStyel,
      tableLineColor: [0, 0, 0],
      tableLineWidth: 1,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: 'center',
        lineWidth: 1,
      },
      bodyStyles: { halign: 'center' },
      columnStyles: {
        description: { minCellWidth: 175, lineWidth: 1 },
        quantity: { cellWidth: 70, lineWidth: 1 },
      },
    });

    //total info
    finalY = (doc as any).lastAutoTable.finalY;
    const head: any = [['', '']];
    head[0][1] = { colSpan: 3 };
    const totalPrice = _.sumBy(itemBody, 'value');
    const infoBody = [
      ['', 'Total Declared Value(EUR):', `${totalPrice}`],
      ['', 'Terms of trade:', 'DAP'],
      ['', 'Reason for Sending:', ''],
    ];
    // const checkBox = new CheckBox();
    // checkBox.caption = '3';
    // checkBox.Rect = [10, 10, 20, 20];
    // doc.addField(checkBox);
    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      showHead: 'never',
      head: head,
      tableLineColor: [0, 0, 0],
      tableLineWidth: 1,
      headStyles: { lineWidth: 0, lineColor: 0 },
      styles: tableStyel,
      body: infoBody,
      didDrawCell: function(data) {
        if (data.row.index === 2 && data.column.index === 2) {
          data.row.height = 125;
          doc.text('Commercial', data.cell.x - 5, data.cell.y + 15);
          doc.text('Non-Commercial', data.cell.x - 5, data.cell.y + 35);
          doc.text('Vente de marchandises', data.cell.x - 5, data.cell.y + 55);
          doc.text('Échantillons', data.cell.x - 5, data.cell.y + 75);
          doc.text('Documents', data.cell.x - 5, data.cell.y + 95);
          doc.text('Retour de marchandise', data.cell.x - 5, data.cell.y + 115);
          doc.setDrawColor(0, 0, 0);
          doc.rect(data.cell.x - 20, data.cell.y + 8, 10, 10);
          doc.rect(data.cell.x - 20, data.cell.y + 28, 10, 10);
          doc.rect(data.cell.x - 20, data.cell.y + 48, 10, 10);
          doc.rect(data.cell.x - 20, data.cell.y + 68, 10, 10);
          doc.rect(data.cell.x - 20, data.cell.y + 88, 10, 10);
          doc.rect(data.cell.x - 20, data.cell.y + 108, 10, 10);
        }
      },
      columnStyles: {
        0: { minCellWidth: 130, lineWidth: 0 },
        1: { minCellWidth: 100, halign: 'center', lineWidth: 0 },
        2: { minCellWidth: 50, halign: 'center', lineWidth: 0 },
        3: { lineWidth: 0 },
      },
    });

    // reamrks 备注
    finalY = (doc as any).lastAutoTable.finalY;
    const remarksBody = [
      ['REMARKS:'],
      [
        'I hereby certify the information on this declaration is true and correct;and the contents of this shipment are as stated above.',
      ],
      ['SIGNATURE:', 'Date:'],
      [TransporterUtils.getFullName(shipment.senderAddress), moment(shipment.shippingDate).format('DD/MM/YYYY')],
    ];
    remarksBody[1][0] = {
      content:
        'I hereby certify the information on this declaration is true and correct;and the contents of this shipment are as stated above.',
      colSpan: 2,
    };
    autoTable(doc, {
      theme: 'grid',
      startY: finalY,
      showHead: 'never',
      head: [['', '']],
      headStyles: { lineWidth: 0, lineColor: 0 },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 1,
      styles: tableStyel,
      body: remarksBody,
      columnStyles: {
        0: { minCellWidth: 106, lineWidth: 0 },
        1: { lineWidth: 0 },
      },
    });

    const arraybuffer = doc.output('arraybuffer');
    return Buffer.from(arraybuffer).toString('base64');
  },
  numFormat(num) {
    const str = num.toFixed(2) + '';
    const intSum = str.substring(0, str.indexOf('.')).replace(/\B(?=(?:\d{3})+$)/g, ','); //取到整数部分
    const dot = str.substring(str.length, str.indexOf('.')); //取到小数部分搜索
    const endNum = intSum + dot;
    return endNum;
  },
};
