import { PriceCards } from '@/components/pricing/price-card';
import { useEffect, useState } from 'react';
import { BillingFrequency, IBillingFrequency } from '@/constants/billing-frequency';
import { Environments, initializePaddle, Paddle } from '@paddle/paddle-js';
import { usePaddlePrices } from '@/hooks/usePaddlePrices';

interface Props {
    country: string;
}

export function PricingComponent({ country }: Props) {
    const [frequency, setFrequency] = useState<IBillingFrequency>(BillingFrequency[0] as IBillingFrequency);
    const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

    const { prices, loading } = usePaddlePrices(paddle, country);

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_KEY && process.env.NEXT_PUBLIC_PADDLE_ENV) {
            console.log("Initializing Paddle...");
            initializePaddle({
                token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_KEY,
                environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
            }).then((paddle) => {
                console.log("Paddle initialized", paddle);
                setPaddle(paddle);
            }).catch(console.error);
        } else {
            console.warn("Missing Paddle env vars");
        }
    }, []);

    return (
        <div className="mx-auto relative ">
            <div className="text-5xl font-bold text-center text-primary mb-5">
                {/* Find the perfect plan for your team */}
            </div>
            <PriceCards frequency={frequency} loading={loading} priceMap={prices} />
        </div>
    );
}