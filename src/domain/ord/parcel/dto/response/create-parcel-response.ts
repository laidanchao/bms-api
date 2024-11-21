export class CreateParcelResponse {
  trackingNumber: string;
  shippingNumber: string;
  label: string;
  invoice?: string;
  cn23?: string;
  pickUp?: string; // DPD
  labelFormat: string;
  transporterRequest?: string;
  transporterResponse?: string;
  orderNumber?: string;
  waybillNumber?: string;
  sortCode?: string;
  labelUrl?: string;
  invoiceUrl?: string;
  instructions?: string;
  pallets?: [
    {
      reference: string;
      palletNumber: string;
    },
  ];
  manifestLabel?: string;
  manifestLabelFormat?: string;
  barCode?: string; // 条形码的值
  lastmileProviderTrackingNumber?: string; // 能识别尾程派送商的单号
  lastmileProviderMapKey?: string; //espost 返回的下游派送商映射
  lastmileProvider?: string; // 尾程派送商
  reference?: string; // parcel表需要存修改后的reference
  parcelId?: number;
}

// todo delete applicationToPlatform
export class CreateMultiParcelResponse {
  parcels: CreateParcelResponse[];
  transporter?: string;
  client?: string;
  application?: string;
  platform?: string;
  trackingNumber?: string;
  parcelId?: number;
  barCode?: string; // 条形码的值
}
