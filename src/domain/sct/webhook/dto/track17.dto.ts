// 主状态

export enum Status {
  // 查询不到，进行查询操作但没有得到结果，原因请参看子状态。
  'NotFound' = 'NotFound',
  // 收到信息，运输商收到下单信息，等待上门取件。
  'InfoReceived' = 'InfoReceived',
  // 运输途中，包裹正在运输途中，具体情况请参看子状态。
  'InTransit' = 'InTransit',
  // 运输过久，包裹已经运输了很长时间而仍未投递成功。
  'Expired' = 'Expired',
  // 到达待取，包裹已经到达目的地的投递点，需要收件人自取。
  'AvailableForPickup' = 'AvailableForPickup',
  // 派送途中，包裹正在投递过程中。
  'OutForDelivery' = 'OutForDelivery',
  // 投递失败，包裹尝试派送但未能成功交付，原因请参看子状态。
  // 原因可能是：派送时收件人不在家、投递延误重新安排派送、收件人要求延迟派送、地址不详无法派送、因偏远地区不提供派送服务等。
  'DeliveryFailure' = 'DeliveryFailure',
  // 成功签收，包裹已妥投。
  'Delivered' = 'Delivered',
  // 可能异常，包裹可能被退回，原因请参看子状态。原因可能是：收件人地址错误或不详、收件人拒收、包裹无人认领超过保留期等。
  // 包裹可能被海关扣留，常见扣关原因是：包含敏感违禁、限制进出口的物品、未交税款等。包裹可能在运输途中遭受损坏、丢失、延误投递等特殊情况。
  'Exception' = 'Exception',
}

// 子状态
export enum SubStatus {
  // 运输商没有返回信息。
  'NotFound_Other' = 'NotFound_Other',
  // 物流单号无效，无法进行查询。
  'NotFound_InvalidCode' = 'NotFound_InvalidCode',
  // 收到信息
  'InfoReceived' = 'InfoReceived',
  // 已揽收。
  'InTransit_PickedUp' = 'InTransit_PickedUp',
  // 其它情况。
  'InTransit_Other' = 'InTransit_Other',
  // 已离港。
  'InTransit_Departure' = 'InTransit_Departure',
  // 已到港。
  'InTransit_Arrival' = 'InTransit_Arrival',
  // 其它原因
  'Expired_Other' = 'Expired_Other',
  // 其它原因
  'AvailableForPickup_Other' = 'AvailableForPickup_Other',
  // 其它原因
  'OutForDelivery_Other' = 'OutForDelivery_Other',
  // 其它原因
  'DeliveryFailure_Other' = 'DeliveryFailure_Other',
  // 找不到收件人。
  'DeliveryFailure_NoBody' = 'DeliveryFailure_NoBody',
  // 安全原因。
  'DeliveryFailure_Security' = 'DeliveryFailure_Security',
  // 拒收包裹。
  'DeliveryFailure_Rejected' = 'DeliveryFailure_Rejected',
  // 收件地址错误。
  'DeliveryFailure_InvalidAddress' = 'DeliveryFailure_InvalidAddress',
  // 其它原因
  'Delivered_Other' = 'Delivered_Other',
  // 其它原因
  'Exception_Other' = 'Exception_Other',
  // 退件处理中。
  'Exception_Returning' = 'Exception_Returning',
  // 退件已签收。
  'Exception_Returned' = 'Exception_Returned',
  // 没人签收。
  'Exception_NoBody' = 'Exception_NoBody',
  // 安全原因。
  'Exception_Security' = 'Exception_Security',
  // 货品损坏了。
  'Exception_Damage' = 'Exception_Damage',
  // 被拒收了。
  'Exception_Rejected' = 'Exception_Rejected',
  // 因各种延迟情况导致的异常。
  'Exception_Delayed' = 'Exception_Delayed',
  // 包裹丢失了。
  'Exception_Lost' = 'Exception_Lost',
  // 包裹被销毁了。
  'Exception_Destroyed' = 'Exception_Destroyed',
  // 物流订单被取消了。
  'Exception_Cancel' = 'Exception_Cancel',
}

// 里程碑
export enum MileStone {
  // 收到信息，运输商收到商家的下单信息，等待上门取件。
  'InfoReceived' = 'InfoReceived',
  // 揽收，运输商收取商家的包裹。
  'PickedUp' = 'PickedUp',
  // 离港，离开发件国港口（理论上是清关后的动作）。
  'Departure' = 'Departure',
  // 到港，到达收件国港口（是否有清关并不确定）。
  'Arrival' = 'Arrival',
  // 到达待取，包裹已经到达目的地的投递点，需要收件人自取。
  'AvailableForPickup' = 'AvailableForPickup',
  // 派送途中，包裹正在投递过程中。
  'OutForDelivery' = 'OutForDelivery',
  // 成功签收，包裹已妥投。
  'Delivered' = 'Delivered',
  // 退件，包裹已经完成退件操作。
  'Returned' = 'Returned',
  // 退件中，包裹在处理，但不保证处理完会转成"退件"状态；
  'Returning' = 'Returning',
}

export class Track17Dto {}
