'use client';

import { useState } from 'react';
import { PricingComponent } from './PricingComponent';

export function Pricing() {
    const [country, setCountry] = useState('US');

    return (
        <>
            {/* <LocalizationBanner country={country} onCountryChange={setCountry} /> */}
            <div className='w-full p-5'>
                <PricingComponent country={country} />
            </div>
        </>
    );
}