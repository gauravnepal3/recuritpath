'use client'
import React from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

const CaptchaProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}>
            {children}
        </GoogleReCaptchaProvider>
    )
}

export default CaptchaProvider