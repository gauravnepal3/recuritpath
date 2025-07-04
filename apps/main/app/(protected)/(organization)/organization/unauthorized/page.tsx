import { Button, buttonVariants } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const page = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {/* 403 Number with Lock Icon */}
            <p className="mt-4 text-lg font-semibold">Error: 403 Forbidden</p>
            <div className="relative flex items-center text-[120px] font-bold">
                <span>4</span>
                <span>
                    <svg className='fill-primary' xmlns="http://www.w3.org/2000/svg" width="124" height="124" viewBox="0 0 24 24"><path d="M17 9.761v-4.761c0-2.761-2.238-5-5-5-2.763 0-5 2.239-5 5v4.761c-1.827 1.466-3 3.714-3 6.239 0 4.418 3.582 8 8 8s8-3.582 8-8c0-2.525-1.173-4.773-3-6.239zm-8-4.761c0-1.654 1.346-3 3-3s3 1.346 3 3v3.587c-.927-.376-1.938-.587-3-.587s-2.073.211-3 .587v-3.587zm3 17c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zm2-6c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z" /></svg>


                </span>
                <span>3</span>
            </div>

            {/* Error Message */}
            <p className="mt-2 text-sm text-muted-foreground text-center">
                Sorry, you don&apos;t have permission to perform this action.<br /> Please contact organization owner.
            </p>

            {/* Go Back Button */}
            <Link

                href={'/organization/manage'}
                // onClick={() => window.history.back()}
                className={cn(buttonVariants({ variant: "default" }), "mt-6 px-6 py-3")}
            >
                Go Back
            </Link>
        </div>
    )
}

export default page