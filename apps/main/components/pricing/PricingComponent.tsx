'use client'
import { PriceCards } from '@/components/pricing/price-card';
import { useEffect, useState } from 'react';
import { BillingFrequency, IBillingFrequency } from '@/constants/billing-frequency';
import { Environments, initializePaddle, Paddle } from '@paddle/paddle-js';
import { usePaddlePrices } from '@/hooks/usePaddlePrices';
import { Switch } from "@repo/ui/components/switch"
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs';

interface Props {
    country: string;
    currentPlan: string
}

export function PricingComponent({ country, currentPlan }: Props) {
    const [frequency, setFrequency] = useState<IBillingFrequency>(BillingFrequency[0] as IBillingFrequency);
    const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

    const { prices, loading } = usePaddlePrices(paddle, country);
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_KEY && process.env.NEXT_PUBLIC_PADDLE_ENV) {
            initializePaddle({
                token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_KEY,
                environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
            }).then((paddle) => {
                if (paddle) {
                    setPaddle(paddle);
                }
            });
        }
    }, []);

    return (
        <div className="mx-auto relative ">
            <div className="flex justify-center">
                <div className="flex justify-center mb-8">
                    <Tabs
                        value={frequency.value}
                        onValueChange={(value) =>
                            setFrequency(BillingFrequency.find((billingFrequency) => value === billingFrequency.value)!)
                        }
                    >
                        <TabsList>
                            {BillingFrequency.map((billingFrequency) => (
                                <TabsTrigger key={billingFrequency.value} value={billingFrequency.value}>
                                    {billingFrequency.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="text-5xl font-bold text-center text-primary mb-5">
                {/* Find the perfect plan for your team */}
            </div>
            <PriceCards currentPlan={currentPlan} frequency={frequency} loading={loading} priceMap={prices} />
        </div>
    );
}