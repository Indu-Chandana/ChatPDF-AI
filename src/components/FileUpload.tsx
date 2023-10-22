'use client'
import { uploadToS3 } from '@/lib/s3';
import { Inbox } from 'lucide-react';
import React from 'react'

import { useDropzone } from "react-dropzone"

// snippet -> tsrafce
const FileUpload = () => {

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "application/pdf": [".pdf"] },        // what file types accept from the user
        maxFiles: 1, // Only upload one file.
        onDrop: async (acceptedFiles) => {  // when ever the file 
            console.log('acceptedFiles ::', acceptedFiles)

            const file = acceptedFiles[0];

            if (file.size > 10 * 1024 * 1024) { // if this file is bigger than 10mb, we don't need to upload.

                alert('Please upload a smaller file.')
                return
            }

            try {
                const data = await uploadToS3(file)
                console.log('data', data)
            } catch (error) {
                console.log('err FileUpload', error)
            }

        }
    });

    return (
        <div className='p-2 bg-white rounded-xl'>
            <div {...getRootProps({
                className: 'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col'
            })}>
                <input {...getInputProps()} />

                <>
                    <Inbox className='w-10 h-10 text-blue-500' />
                    <p className='mt-2 text-sm text-slate-400'>Drop PDF Here</p>
                </>
            </div>
        </div>
    )
}

export default FileUpload