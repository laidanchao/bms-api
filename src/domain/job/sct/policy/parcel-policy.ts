import _ from 'lodash';
export const ParcelPolicy = {
  isSetSync,
};

function isSetSync(targetParcel, copyOfParcel) {
  if (targetParcel && !_.isEqual(targetParcel, copyOfParcel)) {
    // await parcel.save();
    if (
      !_.isEqual(targetParcel.lastTimestamps, copyOfParcel.lastTimestamps) ||
      !_.isEqual(targetParcel.lastEvent, copyOfParcel.lastEvent) ||
      !_.isEqual(targetParcel.lastDescription, copyOfParcel.lastDescription)
    ) {
      // Logger.log(
      //   `ParcelPolicy trackingNumber:${targetParcel.trackingNumber} tracking updated and need to be sync(value=false)`,
      // );
      targetParcel.sync = false;
    }
  }
}
