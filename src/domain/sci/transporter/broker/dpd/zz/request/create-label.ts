import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { AddressDto, ParcelDto } from '@/domain/ord/parcel/dto';
import _ from 'lodash';
import { ShipmentDimension } from '@/domain/sci/transporter/broker/dpd/zz/request/shipment-dimension';
import { Moment } from '@softbrains/common-utils';
import { ShipmentItemDetail } from '@/domain/sci/transporter/broker/dpd/zz/request/shipment-item-detail';

export class CreateLabel {
  // 订单信息
  // 服务类型 DPD 相关服务: DPD Business | DPD Business-FBA | DPD Home | DPD Pudo
  @IsString()
  serviceTypeName: string;
  // 店铺 Id: 只有使用DPD Pudo服务时, pudoId才必填
  @IsString()
  @IsOptional()
  pudoId: string;
  @IsString()
  @IsOptional()
  orderNumber: string;
  @IsString()
  @IsOptional()
  customerHawb: string;
  //服务供应商(如填空系统自动取默认值)
  @IsString()
  @IsOptional()
  coloaderName: string;
  // 物品件数
  @IsNumber()
  piece: number;
  //货物描述
  @IsString()
  contents: string;
  @IsString()
  @IsOptional()
  remark: string;
  //货物号码
  @IsString()
  shipmentNumber: string;
  // 货物类型
  // 文件/货样(填一即可)
  @IsString()
  shipmentType: string;
  // 客户实际重量
  @IsNumber()
  actualWeight: number;
  // 客户体积重量
  @IsNumber()
  @IsOptional()
  volumetricWeight: number;

  // 保险及申报信息
  @IsNumber()
  insuredAmount: number;
  @IsString()
  declaredCurrency: string;
  @IsNumber()
  declaredAmount: number;
  // 关税支付人:R( 收 件 人 )/S( 发 件人) (填一即可)
  @IsString()
  dutyPaidBy: string;

  // 收件人信息
  @IsString()
  consigneeCompany: string;

  @IsString()
  consigneePersonName: string;

  @IsString()
  consigneeTelephone: string;

  @IsString()
  consigneePost: string;

  @IsString()
  destinationCountry: string;

  @IsString()
  destinationCity: string;

  @IsString()
  consigneeAddress: string;

  @IsString()
  @IsOptional()
  destinationState: string;

  @IsString()
  @IsOptional()
  consigneeEmail: string;

  @IsString()
  @IsOptional()
  eoriNumber: string;
  @IsString()
  @IsOptional()
  vatNumber: string;
  @IsNumber()
  @IsOptional()
  vatAmount: number;

  // 发件人信息
  // 客户名称
  @IsString()
  customerName: string;
  // 发件人公司名称
  @IsString()
  shipperCompany: string;
  // 发件人名称
  @IsString()
  shipperPersonName: string;
  @IsString()
  shipperTelephone: string;
  @IsString()
  shipperAddress: string;
  @IsString()
  shipperCity: string;
  @IsString()
  shipperZip: string;
  @IsString()
  @IsOptional()
  shipperState: string;
  @IsString()
  shipperCountry: string;
  // 运费成本货币
  @IsString()
  shippingCostCurrency: string;
  // 运费成本
  @IsNumber()
  shippingCostValue: number;
  // 发件人增值税税号
  @IsString()
  shipperVATNumber: string;
  // 发件人 EORI 税号
  @IsString()
  shipperEoriNumber: string;

  // importer information
  @IsString()
  @IsOptional()
  importerCompanyName: string;
  @IsString()
  @IsOptional()
  importerContactName: string;
  @IsString()
  @IsOptional()
  importerTelephone: string;
  @IsString()
  @IsOptional()
  importerEmail: string;
  @IsString()
  @IsOptional()
  importerPostCode: string;
  @IsString()
  @IsOptional()
  importerCityCode: string;
  @IsString()
  @IsOptional()
  importerStateCode: string;
  @IsString()
  @IsOptional()
  importerCountryCode: string;
  @IsString()
  @IsOptional()
  importerCompanyAddress: string;
  @IsString()
  @IsOptional()
  importerEORINumber: string;
  @IsString()
  @IsOptional()
  importerVATNumber: string;

  @IsArray()
  listShipmentDimension: any[];
  @IsArray()
  listShipmentItemDetail: any[];

  constructor(
    senderAddress: AddressDto,
    receiverAddress: AddressDto,
    parcels: ParcelDto[],
    others?: {
      customerName: string | '';
      serviceTypeName: string | '';
    },
  ) {
    this.shipperCompany = this.getStringValue(senderAddress.company);
    this.shipperPersonName = `${this.getStringValue(senderAddress.lastName)} ${this.getStringValue(
      senderAddress.firstName,
    )}`;
    this.shipperTelephone = this.getStringValue(senderAddress.mobileNumber);
    this.shipperAddress =
      this.getStringValue(senderAddress.street1) +
      ' ' +
      this.getStringValue(senderAddress.street2) +
      ' ' +
      this.getStringValue(senderAddress.street3);
    this.shipperCity = this.getStringValue(senderAddress.city);
    this.shipperZip = this.getStringValue(senderAddress.postalCode);
    this.shipperState = this.getStringValue(senderAddress.province);
    this.shipperCountry = this.getStringValue(senderAddress.countryCode);
    this.shippingCostCurrency = '欧元';
    this.shippingCostValue = 0;
    this.shipperVATNumber = '';
    this.shipperEoriNumber = '';

    this.importerCompanyName = '';
    this.importerContactName = '';
    this.importerTelephone = '';
    this.importerEmail = '';
    this.importerPostCode = '';
    this.importerCityCode = '';
    this.importerStateCode = '';
    this.importerCountryCode = '';
    this.importerCompanyAddress = '';
    this.importerEORINumber = '';
    this.importerVATNumber = '';

    this.consigneeCompany = this.getStringValue(receiverAddress.company);
    this.consigneePersonName =
      this.getStringValue(receiverAddress.lastName) + ' ' + this.getStringValue(receiverAddress.firstName);
    this.consigneeTelephone = this.getStringValue(receiverAddress.phoneNumber);
    this.consigneePost = this.getStringValue(receiverAddress.postalCode);
    this.destinationCountry = this.getStringValue(receiverAddress.countryCode);
    this.destinationCity = this.getStringValue(receiverAddress.city);
    this.consigneeAddress =
      this.getStringValue(receiverAddress.street1) +
      ' ' +
      this.getStringValue(receiverAddress.street2) +
      '' +
      this.getStringValue(receiverAddress.street3);
    this.destinationState = this.getStringValue(receiverAddress.province);
    this.consigneeEmail = this.getStringValue(receiverAddress.email);
    this.eoriNumber = senderAddress.eori || 'EORI200000';
    this.vatNumber = '';
    this.vatAmount = 0;

    this.customerName = this.getStringValue(others.customerName);
    this.serviceTypeName = this.getStringValue(others.serviceTypeName);
    this.pudoId = '';
    this.orderNumber = '';
    this.customerHawb = '';
    this.coloaderName = '';
    this.piece = parcels.length;
    this.contents = 'personal things';
    this.remark = '';
    this.shipmentNumber = parcels[0].reference || Moment.utc().format('YYYYMMDDHHmmSS');
    this.shipmentType = '货样';
    this.actualWeight = _.sumBy(parcels, parcel => parcel.weight);
    this.volumetricWeight = this.actualWeight;
    this.insuredAmount = _.sumBy(parcels, parcel => parcel.insuranceValue) || 0;
    this.declaredCurrency = '欧元';
    this.declaredAmount = 0;
    // 关税支付人 是发件人
    this.dutyPaidBy = 'S';

    const listShipmentDimension = _.map(parcels, (parcel, index) => {
      const shipmentDimension = new ShipmentDimension();
      shipmentDimension.packageVolumetricWeight = parcel.weight;
      shipmentDimension.packageWeight = parcel.weight;
      shipmentDimension.length = 1;
      shipmentDimension.width = 2;
      shipmentDimension.height = 3;
      if (index === 0) {
        shipmentDimension.trackingNumber = this.shipmentNumber;
      } else {
        // !!! shipmentDimension.trackingNumber 是面单上的 ref, 因此在这里取了parcel.reference
        shipmentDimension.trackingNumber = parcel.reference || Moment.utc().format('YYYYMMDDHHmmSSsss');
      }
      return shipmentDimension;
    });

    const listShipmentItemDetail = [];
    _.forEach(parcels, parcel => {
      if (parcel.items && parcel.items.length) {
        _.forEach(parcel.items, item => {
          const shipmentItemDetail = new ShipmentItemDetail();
          shipmentItemDetail.contentCN = 'personal things';
          shipmentItemDetail.contentEN = item.description;
          shipmentItemDetail.description = item.description;
          shipmentItemDetail.hsCodeCN = '001';
          shipmentItemDetail.hsCodeEN = item.hsCode;
          shipmentItemDetail.itemWeight = item.weight;
          shipmentItemDetail.pieces = 1;
          shipmentItemDetail.price = 1;
          shipmentItemDetail.unitEN = 'pieces';
          listShipmentItemDetail.push(shipmentItemDetail);
        });
      } else {
        // 固定
        const shipmentItemDetail = new ShipmentItemDetail();
        shipmentItemDetail.contentCN = 'personal things';
        shipmentItemDetail.contentEN = 'personal things';
        shipmentItemDetail.description = 'personal things';
        shipmentItemDetail.hsCodeCN = '001';
        shipmentItemDetail.hsCodeEN = '001';
        shipmentItemDetail.itemWeight = 0;
        shipmentItemDetail.pieces = 1;
        shipmentItemDetail.price = 1;
        shipmentItemDetail.unitEN = 'pieces';
        listShipmentItemDetail.push(shipmentItemDetail);
      }
    });
    this.listShipmentDimension = listShipmentDimension || [];
    this.listShipmentItemDetail = listShipmentItemDetail || [];
  }

  private getStringValue(value): string {
    return value || '';
  }
}
