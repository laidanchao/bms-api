export class TransporterException extends Error {
  private readonly cmsTransporterRequest;

  constructor(prefix, message, requestBody = {}) {
    const newMessage = prefix ? `${prefix}: ${message}` : message;
    super(newMessage);
    this.cmsTransporterRequest = requestBody;
  }
}
