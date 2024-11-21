// 很纠结不知道是否应该,自己封装一层理解.
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class RelayPointDetailDTO {
  relayPointId: string;
  relayPointName1: string;
  relayPointName2: string;
  relayPointAddress1: string;
  relayPointAddress2: string;
  zipCode: string;
  city: string;
  countryCode: string;
  information: string;
  extraInformation1: string;
  extraInformation2: string;
  latitude: string;
  longitude: string;
  tradeType: string;
}

export class RelayPointDTO {
  @IsString()
  channel: string;

  @IsString()
  @IsOptional()
  platform: string;
  // todo delete applicationToPlatform
  @IsString()
  @IsOptional()
  application: string;
  // 2 Alphanumerical characters ^[A-Za-z]{2}$
  @IsString()
  countryCode: string;
  // 6 Alphanumerical characters ^[0-9]{6}$
  @IsString()
  @IsOptional()
  relayPointId: string;
  // 25 Alphanumerical characters ^[A-Za-z_\-' ]{2,25}$
  @IsString()
  @IsOptional()
  city: string;
  @IsString()
  @IsOptional()
  zipCode: string;
  // 11 Characters ^?[09]{2}\.[0-9]{7}$ 纬度
  @IsString()
  @IsOptional()
  latitude: string;
  // 11 Characters ^?[09]{2}\.[0-9]{7}$ 经度
  @IsString()
  @IsOptional()
  longitude: string;
  // List of values ^(XS|S|M|L|XL|3XL)$
  @IsString()
  @IsOptional()
  size: string;
  // Shipment weight in grams. (15 grams minimum) 6 Numerical characters ^[0-9]{1,6}$
  @IsNumber()
  @IsOptional()
  weight: number;
  // List of values ^(REL|24R|24L|DRI)$
  // The possible values are:
  // • 24R : Search the Points Relais which suggest the delivery to Point Relais® L
  // • 24L : Search the Points Relais which suggest the delivery to Point Relais® XL
  // • DRI : Search the Points Relais wich suggest the delivery to Colisdrive®
  // • REL : Search the Points Relais which suggest the collection from Point Relais®
  //
  // A maximum search radius is applied according to the action type parameter:
  // • Action = REL , Maximum radius = 75 Km
  // • Action = 24R, Maximum radius = 100 Km
  // • Action = 24L, Maximum radius = 100 Km
  // • Action = DRI, , Maximum radius = 200 Km
  @IsString()
  @IsOptional()
  action: string;
  // 4 Numerical characters ^[0-9]{1,4}$
  // Search radius in Km from a point of search origin. If not given or blank, the value
  // by default is 50Km. In order not to use this filter “RayonRecherche” please mention “0”.
  @IsNumber()
  @IsOptional()
  searchRadius: number;
  // Specify trade type for Point Relais®. Several trade types can be specified, they
  // have to be seperated by « , » »
  @IsString()
  @IsOptional()
  tradeType: string;
  // Numerical (max : 30) [0-3][0-9]
  @IsNumber()
  @IsOptional()
  numberOfResults: number;
  // 32 Alphanumerical characters ^[0-9A-Z]{32}$
  // MD5 hash in capital letters for the following string :
  // [Enseigne][Pays][NumPointRelais][Ville][CP][Latitude][Longitude][Taille][Poids][
  // Action][DelaiEnvoi][RayonRecherche][TypeActivite][NombreResultats][CLE
  // PRIVEE]
  // The [CLE PRIVEE] (private key) is mentioned on the security parameters
  // document given by Mondial Relay
  security: string;

  @IsOptional()
  @IsObject()
  accountInfo?: any;
}

export class PointRelayDetail {
  // 0 if all is correct). For the others codes, please consult the return codes list.
  STAT: string;
  // Point Relais® ID
  Num: string;
  // Point Relais® name (Line 1)
  LgAdr1: string;
  // Point Relais® name (Line 2)
  LgAdr2: string;
  // Point Relais® address (Line 1)
  LgAdr3: string;
  // Point Relais® address (Line 2)
  LgAdr4: string;
  // Point Relais® zipcode
  CP: string;
  // Point Relais® city
  Ville: string;
  // Point Relais® ISO country code
  Pays: string;
  // Extra information regarding the Point Relais® situation (Line 1)
  Localisation1: string;
  // Extra information regarding the Point Relais® situation (Line 2)
  Localisation2: string;
  // 纬度
  Latitude: string;
  // 经度
  Longitude: string;
  // Point Relais® trade type
  TypeActivite: string;
  Information: string;
  // Monday opening hours (Data 1 : Opening hours slot 1), (Data 2 : Closing time slot 1), (Data 3 : Opening hours slot 2), (Data 4 : Closing time slot 2).
  Horaires_Lundi: string[];
  // Tuesday opening hours
  Horaires_Mardi: string[];
  // Wednesday opening hours
  Horaires_Mercredi: string[];
  // Thursday opening hours
  Horaires_Jeudi: string[];
  // Friday opening hours
  Horaires_Vendredi: string[];
  // Satursday opening hours
  Horaires_Samedi: string[];
  // Sunday opening hours
  Horaires_Dimanche: string[];
  // Information for future Point Relais® vacation period
  Informations_Dispo: Period[];
  // URL of Point Relais® picture
  URL_Photo: string;
  // URL of Point Relais® google map location
  URL_Plan: string;
  // Distance in meters from the search origin.
  Distance: string;
}

export class Period {
  // Start of closing date Date
  Debut: Date;
  // End of closing date
  Fin: Date;
}
