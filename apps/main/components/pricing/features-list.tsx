import { Tier } from '@/constants/price-tier';
import { Check, CircleCheck } from 'lucide-react';

interface Props {
    tier: Tier;
}

export function FeaturesList({ tier }: Props) {
    return (
        <ul className={'p-8 flex flex-col gap-4'}>
            {tier.features.map((feature: string) => (
                <li key={feature} className="flex items-center gap-x-3">
                    <Check className={'h-4 w-4 text-muted-foreground'} />
                    <span className={'text-base'}>{feature}</span>
                </li>
            ))}
        </ul>
    );
}