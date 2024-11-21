import { Module } from '@nestjs/common';
import { AsendiaBroker } from '@/domain/sci/transporter/broker/asendia/asendia.broker';
import { BeBroker } from '@/domain/sci/transporter/broker/be/be.broker';
import { CainiaoBroker } from '@/domain/sci/transporter/broker/cainiao/cainiao.broker';
import { ChronopostBroker } from '@/domain/sci/transporter/broker/chronopost/chronopost.broker';
import { ColissimoBroker } from '@/domain/sci/transporter/broker/colissimo/colissimo.broker';
import { CorreosBroker } from '@/domain/sci/transporter/broker/correos/correos.broker';
import { DpdBroker } from '@/domain/sci/transporter/broker/dpd/dpd.broker';
import { DpdZzBroker } from '@/domain/sci/transporter/broker/dpd/zz/dpd-zz.broker';
import { FedexBroker } from '@/domain/sci/transporter/broker/fedex/fedex.broker';
import { GlsBroker } from '@/domain/sci/transporter/broker/gls/gls.broker';
import { GlsEsBroker } from '@/domain/sci/transporter/broker/gls-es/gls-es.broker';
import { SfBroker } from '@/domain/sci/transporter/broker/sf/sf.broker';
import { UpsBroker } from '@/domain/sci/transporter/broker/ups/ups.broker';
import { XbsBroker } from '@/domain/sci/transporter/broker/xbs/xbs.broker';
import { TransporterBrokerFactory } from '@/domain/sci/transporter/broker/transporter-broker-factory';
import { ColispriveBroker } from '@/domain/sci/transporter/broker/colisprive/colisprive.broker';
import { MrBroker } from '@/domain/sci/transporter/broker/mr/mr.broker';
import { ConfigService } from '@nestjs/config';
import { DelivengoBroker } from '@/domain/sci/transporter/broker/delivengo/delivengo.broker';
import { DhlBroker } from '@/domain/sci/transporter/broker/dhl/dhl.broker';
import { ColicoliBroker } from '@/domain/sci/transporter/broker/colicoli/colicoli.broker';
import { StoBroker } from '@/domain/sci/transporter/broker/sto/sto.broker';
import { ExpBroker } from '@/domain/sci/transporter/broker/exp/exp.broker';
import { GeodisBroker } from '@/domain/sci/transporter/broker/geodis/geodis.broker';
import { GlsV2Broker } from '@/domain/sci/transporter/broker/gls-v2/gls-v2.broker';
import { DpdCnBroker } from '@/domain/sci/transporter/broker/dpd/cn/dpd-cn.broker';
import { EspostBroker } from '@/domain/sci/transporter/broker/espost/espost.broker';
import { AmazonBroker } from '@/domain/sci/transporter/broker/amazon/amazon.broker';
import { CttBroker } from '@/domain/sci/transporter/broker/ctt/ctt.broker';
import { BoyacaBroker } from '@/domain/sci/transporter/broker/boyaca/boyaca.broker';
import { WelcoBroker } from '@/domain/sci/transporter/broker/welco/welco.broker';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { PaackBroker } from '@/domain/sci/transporter/broker/paack/paack-broker.service';
import { CainiaoV2Broker } from '@/domain/sci/transporter/broker/cainiao-v2/cainiao-v2.broker';
import { DispeoBroker } from '@/domain/sci/transporter/broker/dispeo/dispeo.broker';
import { GpxBroker } from '@/domain/sci/transporter/broker/gpx/gpx.broker';
import { MfbBroker } from '@/domain/sci/transporter/broker/mfb/mfb.broker';
import { CronoBroker } from '@/domain/sci/transporter/broker/crono/crono.broker';
import { HkaceBroker } from '@/domain/sci/transporter/broker/hkace/hkace.broker';

const MrBrokerProvider = {
  provide: 'MondialRelayBroker',
  useExisting: MrBroker,
};

@Module({
  providers: [
    TransporterBrokerFactory,
    AsendiaBroker,
    BeBroker,
    CainiaoBroker,
    CainiaoV2Broker,
    ChronopostBroker,
    ColispriveBroker,
    ColissimoBroker,
    CorreosBroker,
    DhlBroker,
    DpdBroker,
    DpdZzBroker,
    DpdCnBroker,
    ExpBroker,
    FedexBroker,
    GlsBroker,
    GlsEsBroker,
    HkaceBroker,
    MrBroker,
    MfbBroker,
    MrBrokerProvider,
    SfBroker,
    StoBroker,
    UpsBroker,
    XbsBroker,
    DelivengoBroker,
    XPushService,
    ConfigService,
    ColicoliBroker,
    GeodisBroker,
    GlsV2Broker,
    EspostBroker,
    AmazonBroker,
    CttBroker,
    BoyacaBroker,
    WelcoBroker,
    PaackBroker,
    DispeoBroker,
    GpxBroker,
    CronoBroker,
  ],
  exports: [TransporterBrokerFactory],
})
export class ClientModule {}
