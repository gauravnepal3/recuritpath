import { PricingTier } from '@/constants/price-tier';
import { IBillingFrequency } from '@/constants/billing-frequency';
import { PriceAmount } from '@/components/pricing/price-amount';
import { Button } from '@repo/ui/components/button';
import React from 'react';
import Link from 'next/link';

interface Props {
    loading: boolean;
    frequency: IBillingFrequency;
    priceMap: Record<string, string>;
}

export function PriceCards({ loading, frequency, priceMap }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="w-full">
                        <th className=" px-4"></th>
                        {PricingTier.map((tier) => (
                            <th key={tier.id} className=" px-4 py-2 text-center">
                                <h2 className="text-3xl font-semibold">{tier.name}</h2>
                                <PriceAmount
                                    loading={loading}
                                    tier={tier}
                                    priceMap={priceMap}
                                    value={frequency.value}
                                    priceSuffix={frequency.priceSuffix}
                                />
                                <Link href={`/checkout/${tier.priceId.month}`} className="mt-2">
                                    Get started
                                </Link>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {PricingTier[0]?.feature?.map((category: any, categoryIndex: number) => (
                        <React.Fragment key={categoryIndex}>
                            <tr className="border-b">
                                <td colSpan={PricingTier.length + 1} className="px-4 py-5 text-3xl font-bold">{category.name}</td>
                            </tr>
                            {category.feature.map((feature: any, featureIndex: number) => (
                                <tr key={`${categoryIndex}-${featureIndex}`}>
                                    <td className=" px-4 py-5">{feature.name}</td>
                                    {PricingTier.map((tier) => {
                                        const tierFeature = tier.feature.find((cat: any) => cat.name === category.name)?.feature.find((f: any) => f.name === feature.name);
                                        return (
                                            <td key={tier.id} className="border-primary border-dashed border-y  px-4 py-2 text-center">
                                                {tierFeature?.flag ? (tierFeature.value ? tierFeature.value : "✔") : "-"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}

                </tbody>
            </table>
        </div>
    );
}