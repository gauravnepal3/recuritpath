import React from 'react'
import Image from 'next/image'
const FormSubmitted = () => {
    return (
        <div className='min-h-[400px] grid place-items-center'>
            <div className="text-center">

                <Image src={'/sent.png'} height={200} width={200} alt='Image' />
                <div className="text-2xl mt-2">Thank You</div>
                <div className=" text-muted-foreground text-xs">
                    Your application has been received.
                </div>
            </div>
        </div>
    )
}

export default FormSubmitted