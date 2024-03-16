import cryptoJS from "crypto-js"

export function encryptedData(data: any, secretKey: string) {

    return cryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString()
}

export function decryptedData(ciphertext: string, secretKey: string) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}   
