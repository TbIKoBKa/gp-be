import crypto from 'crypto';

type TGetSignature = (data: { privateKey: string; data: string }) => string;

export const getDataStringFromDataObject = (
  dataObject: Record<string, any>
) => {
  return Buffer.from(JSON.stringify(dataObject)).toString('base64');
};

export const getDataObjectFromDataString = (dataString: string) => {
  return JSON.parse(Buffer.from(dataString, 'base64').toString('utf-8'));
};

export const getSignature: TGetSignature = ({ data, privateKey }) => {
  const sign_string = privateKey + data + privateKey;

  const shasum = crypto.createHash('sha1');
  shasum.update(sign_string);

  return shasum.digest('base64');
};
