// import * as crypto from 'crypto';

// import { RSA_PKCS1_PADDING } from 'constants';

// const formatKey = (key, type) => {
//   if (type === 'PRIVATE') {
//     return /begin/i.test(key)
//       ? key.trim()
//       : `-----BEGIN PRIVATE KEY-----\n${key.trim()}\n-----END PRIVATE KEY-----`;
//   }
//   if (type === 'PUBLIC') {
//     return /begin/i.test(key)
//       ? key.trim()
//       : `-----BEGIN PUBLIC KEY-----\n${key.trim()}\n-----END PUBLIC KEY-----`;
//   }
// };

// export const genKeys = (publicKey, privateKey) => {
//   return {
//     publicKey: formatKey(publicKey, 'PUBLIC'),
//     privateKey: formatKey(privateKey, 'PRIVATE'),
//   };
// };

// export const getDate = () => {
//   const now = new Date();
//   const day =
//     `${now.getDate()}`.length === 1 ? `0${now.getDate()}` : `${now.getDate()}`;
//   const hour =
//     `${now.getHours()}`.length === 1
//       ? `0${now.getHours()}`
//       : `${now.getHours()}`;
//   const minute =
//     `${now.getMinutes()}`.length === 1
//       ? `0${now.getMinutes()}`
//       : `${now.getMinutes()}`;
//   const second =
//     `${now.getSeconds()}`.length === 1
//       ? `0${now.getSeconds()}`
//       : `${now.getSeconds()}`;
//   const month =
//     now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : `${now.getMonth()}`;
//   const year = now.getFullYear();
//   return `${year}${month}${day}${hour}${minute}${second}`;
// };

// export const createHash = (string) => {
//   return crypto.createHash('sha1').update(string).digest('hex').toUpperCase();
// };

// export const encrypt = (plainSensitiveData, publicKey) => {
//   const signerObject = crypto.publicEncrypt(
//     { key: publicKey, padding: RSA_PKCS1_PADDING },
//     Buffer.from(JSON.stringify(plainSensitiveData))
//   );
//   return signerObject.toString('base64');
// };

// export const sign = (plainSensitiveData, privateKey) => {
//   const signerObject = crypto.createSign('SHA256');
//   signerObject.update(JSON.stringify(plainSensitiveData, privateKey));
//   signerObject.end();
//   const signed = signerObject.sign(privateKey, 'base64');
//   return signed;
// };

// export const decrypt = (value, privateKey) => {
//   const decrypted = crypto
//     .privateDecrypt(
//       { key: privateKey, padding: RSA_PKCS1_PADDING },
//       Buffer.from(value, 'base64')
//     )
//     .toString();
//   return JSON.parse(decrypted);
// };

// // export const encryptStringWithRsaPublicKey = function (toEncrypt, publicKey) {
// //   var buffer = Buffer.from(JSON.stringify(toEncrypt));
// //   var encrypted = crypto.publicEncrypt(publicKey, buffer);
// //   return encrypted.toString('base64');
// // };

// // export const decryptStringWithRsaPrivateKey = function (toDecrypt, privateKey) {
// //   var buffer = Buffer.from(toDecrypt, 'base64');
// //   var decrypted = crypto.privateDecrypt(privateKey, buffer);
// //   return decrypted.toString('utf8');
// // };
