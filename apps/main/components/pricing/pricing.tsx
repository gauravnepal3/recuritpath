'use client';

import { useState } from 'react';
import { LocalizationBanner } from './localization-banner';
import { PricingComponent } from './PricingComponent';

export function Pricing() {
    const [country, setCountry] = useState('US');

    return (
        <>
            {/* <LocalizationBanner country={country} onCountryChange={setCountry} /> */}
            <div className='min-h-screen w-full grid place-items-center'>
                <PricingComponent country={country} />
            </div>
        </>
    );
}