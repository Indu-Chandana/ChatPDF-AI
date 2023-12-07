import AWS from 'aws-sdk'
import fs from 'fs' // download the file to our system
import os from 'os';

// download pdf From S3
export async function downloadFromS3(file_key: string) {
    try {
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
        })

        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME
            },
            region: 'eu-north-1'
        })

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key
        }

        // now we extract unique IdleDeadline, unique file from s3
        const obj = await s3.getObject(params).promise()
        let file_name;
        if (os.platform() === "win32") {
            file_name = `C:\\Users\\${os.userInfo().username
                }\\AppData\\Local\\Temp\\pdf-${Date.now()}.pdf`;
        } else {
            file_name = `/tmp/pdf-${Date.now()}.pdf`;
        }

        console.log('obj {{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{', file_name)

        // save file locally
        fs.writeFileSync(file_name, obj.Body as Buffer)

        return file_name
    } catch (error) {
        console.error(error)
        return null
    }
}