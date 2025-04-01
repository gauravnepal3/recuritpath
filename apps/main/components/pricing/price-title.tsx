import { Tier } from '@/constants/price-tier';
import { cn } from '@/lib/utils';
import { Badge } from '@repo/ui/components/badge';

interface Props {
    tier: Tier;
}

export function PriceTitle({ tier }: Props) {
    const { name, featured } = tier;
    return (
        <div
            className={cn('flex justify-between items-center px-8 pt-8', {
                'featured-price-title': featured,
            })}
        >
            <div className={'flex items-center gap-[10px]'}>
                <p className={'text-[20px] leading-[30px] font-semibold'}>{name}</p>
            </div>
            {featured && (
                <Badge
                >
                    Most popular
                </Badge>
            )}
        </div>
    );
}