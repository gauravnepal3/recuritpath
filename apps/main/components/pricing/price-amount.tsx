import { Tier } from '@/constants/price-tier';
import { cn } from '@/lib/utils';
import { Skeleton } from '@repo/ui/components/skeleton';

interface Props {
    loading: boolean;
    tier: Tier;
    priceMap: Record<string, string>;
    value: string;
    priceSuffix: string;
}

export function PriceAmount({ loading, priceMap, priceSuffix, tier, value }: Props) {
    return (
        <div className="mt-6 flex flex-col px-8">
            {loading ? (
                <Skeleton className="h-[96px] w-full bg-border" />
            ) : (
                <>
                        <div className={cn('text-[50px] leading-[42px] tracking-[-1.6px] font-medium')}>
                        {tier.priceId[value] && priceMap[tier.priceId[value]]?.replace(/\.00$/, '')}
                    </div>
                    <div className={cn('font-medium leading-[12px] text-[12px]')}>{priceSuffix}</div>
                </>
            )}
        </div>
    );
}