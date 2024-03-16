import cryptoJS from "crypto-js"
const secretKey = "test123"
export function encryptedData(data: any) {
    const cypherText = cryptoJS.AES.encrypt(JSON.stringify(data), secretKey)
    console.log(`🚀  cypherText:`, cypherText)

    // const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    // let encryptedData = cipher.update(JSON.stringify(jsonData), 'utf8', 'hex');
    // encryptedData += cipher.final('hex');
}

export function decryptedData(data: string) {

}   
