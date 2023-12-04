'use client'
import { uploadToS3 } from '@/lib/s3';
import { Inbox } from 'lucide-react';
import React from 'react'

import { useDropzone } from "react-dropzone"
import { useMutation } from "@tanstack/react-query"
import axios from 'axios';
import toast from 'react-hot-toast/headless';

// snippet -> tsrafce
const FileUpload = () => {

    const { mutate } = useMutation({
        mutationFn: async ({
            file_key,
            file_name
        }: {
            file_key: string
            file_name: string
        }) => {
            const response = await axios.post("/api/create-chat", {
                file_key,
                file_name
            })

            return response.data
        }
    })


    const { getRootProps, getInputProps } = useDropzone({
        accept: { "application/pdf": [".pdf"] },        // what file types accept from the user
        maxFiles: 1, // Only upload one file.
        onDrop: async (acceptedFiles) => {  // when ever the file 
            console.log('acceptedFiles ::', acceptedFiles)

            const file = acceptedFiles[0];

            if (file.size > 10 * 1024 * 1024) { // if this file is bigger than 10mb, we don't need to upload.

                toast.error("File too large")

                return
            }

            try {
                const data = await uploadToS3(file)

                if (!data?.file_key || !data.file_name) {
                    toast.error("something went wrong")
                    return;
                }

                mutate(data, {
                    onSuccess: (data) => {
                        console.log(data)
                    },
                    onError: (err) => {
                        toast.error("Error creating chat")

                    }
                })

            } catch (error) {
                console.log(error)
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