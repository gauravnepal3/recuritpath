export interface Tier {
    name: string;
    id: 'free' | 'pro' | 'premium';
    description: string;
    features: string[];
    featured: boolean;
    priceId: Record<string, string>;
}

export const PricingTier: Tier[] = [
    {
        name: 'Free',
        id: 'free',
        description: 'Ideal for individuals who want to get started with simple design tasks.',
        features: ['1 workspace', 'Limited collaboration', 'Export to PNG and SVG'],
        featured: false,
        priceId: { month: 'pri_01jm6ytkrvtj49qnhyhmngaqeh' },
    },
    {
        name: 'Pro',
        id: 'pro',
        description: 'Enhanced design tools for scaling teams who need more flexibility.',
        features: ['Integrations', 'Unlimited workspaces', 'Advanced editing tools', 'Everything in Starter'],
        featured: true,
        priceId: { month: 'pri_01jm4gjc1gvqkttcb1axf86617' },
    },
    {
        name: 'Premium',
        id: 'premium',
        description: 'Powerful tools designed for extensive collaboration and customization.',
        features: [
            'Single sign on (SSO)',
            'Advanced version control',
            'Assets library',
            'Guest accounts',
            'Everything in Pro',
        ],
        featured: false,
        priceId: { month: 'pri_01jm4gm28cyxwhtdajtnv2wz5x' },
    },
];