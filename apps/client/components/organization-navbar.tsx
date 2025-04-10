import { Button, buttonVariants } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const OrganizationNavbar = ({ organizationName, organizationLogo, organizationURL }) => {
    return (
        <div className="border-b flex justify-between py-3">
            <div className="">

                {organizationLogo ? (
                    <div className="relative h-10 w-20 p-1">
                        <Image
                            src={`${process.env.S3_PUBLIC_URL}/${organizationLogo}`}
                            alt={`${organizationName} Logo`}
                            fill
                            className="object-contain"
                        />
                    </div>
                ) : (
                    <span className="text-xl font-semibold">{organizationName}</span>
                )}

            </div>
            <div className="">
                <Link className={cn(buttonVariants({ variant: 'link' }), 'text-xs')} href={`https://${organizationURL}`} target="_blank" rel="noopener noreferrer">
                    Visit Website
                </Link>
                <Button className='font-light text-xs'>
                    Subscribe
                </Button>
            </div>
        </div>
    )
}

export default OrganizationNavbar