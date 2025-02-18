import { PricingTier } from '@/constants/price-tier';
import { IBillingFrequency } from '@/constants/billing-frequency';
import { FeaturesList } from '@/components/pricing/features-list';
import { PriceAmount } from '@/components/pricing/price-amount';
import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/components/button';
import { PriceTitle } from '@/components/pricing/price-title';
import { Separator } from '@repo/ui/components/separator';
import { FeaturedCardGradient } from './featured-card-gradient';
import Link from 'next/link';

interface Props {
    loading: boolean;
    frequency: IBillingFrequency;
    priceMap: Record<string, string>;
}

export function PriceCards({ loading, frequency, priceMap }: Props) {
    return (
        <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {PricingTier.map((tier) => (
                <div key={tier.id} className={cn(`rounded-lg bg-background/70 backdrop-blur-[6px] overflow-hidden`, {
                    "animate-background-shine dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] transition-colors": tier.featured,
                })}>
                    <div className={cn('flex gap-5 flex-col rounded-lg rounded-b-none pricing-card-border')}>
                        {/* {tier.featured && <FeaturedCardGradient />} */}
                        <PriceTitle tier={tier} />
                        <PriceAmount
                            loading={loading}
                            tier={tier}
                            priceMap={priceMap}
                            value={frequency.value}
                            priceSuffix={frequency.priceSuffix}
                        />
                        <div className={'px-8'}>
                            <Separator className={'bg-border'} />
                        </div>
                        <div className={'px-8 text-[16px] leading-[24px]'}>{tier.description}</div>
                    </div>
                    <div className={'px-8 mt-8'}>
                        <Button className={'w-full'} variant={'default'} asChild={true}>
                            <Link href={`/checkout/${tier.priceId[frequency.value]}`}>Get started</Link>
                        </Button>
                    </div>
                    <FeaturesList tier={tier} />
                </div>
            ))}
        </div>
    );
}