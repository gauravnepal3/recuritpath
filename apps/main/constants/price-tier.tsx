export interface Tier {
    name: string;
    id: 'free' | 'pro' | 'premium';
    description: string;
    feature: any
    featured: boolean;
    priceId: Record<string, string>;
}

export const PricingTier: Tier[] = [
    {
        name: 'Free',
        id: 'free',
        description: 'Ideal for individuals who want to get started with recruitment.',
        feature: [
            {
                name: 'Usage',
                feature: [
                    {
                        name: 'Team Members',
                        value: '1',
                        flag: true,
                    },
                    {
                        name: 'Active Jobs',
                        value: '1',
                        flag: true,
                    },
                    {
                        name: 'Candidates per job',
                        value: '5',
                        flag: true,
                    }
                ],
            },
            {
                name: 'Features',
                feature: [
                    {
                        name: 'Reporting',
                        value: null,
                        flag: true,
                    },
                    {
                        name: 'Analytics',
                        value: null,
                        flag: false,
                    },
                    {
                        name: 'Import and Export',
                        value: null,
                        flag: false,
                    },
                    {
                        name: 'Integrations',
                        value: null,
                        flag: false,
                    }
                ]
            },
            {
                name: 'Support', feature: [
                    {

                        name: 'Priority Support',
                        value: null,
                        flag: false
                    }

                ]
            }
        ],
        featured: false,
        priceId: { month: 'pri_01jm6ytkrvtj49qnhyhmngaqeh' },
    },
    {
        name: 'Pro',
        id: 'pro',
        feature: [
            {
                name: 'Usage',
                feature: [
                    {
                        name: 'Team Members',
                        value: '3',
                        flag: true,
                    },
                    {
                        name: 'Active Jobs',
                        value: '5',
                        flag: true,
                    },
                    {
                        name: 'Candidates per job',
                        value: '50',
                        flag: true,
                    }
                ],
            },
            {
                name: 'Features',
                feature: [
                    {
                        name: 'Reporting',
                        value: null,
                        flag: true,
                    },
                    {
                        name: 'Analytics',
                        value: null,
                        flag: false,
                    },
                    {
                        name: 'Import and Export',
                        value: null,
                        flag: true,
                    },
                    {
                        name: 'Integrations',
                        value: null,
                        flag: false,
                    }
                ]
            },
            {
                name: 'Support', feature: [
                    {

                        name: 'Priority Support',
                        value: null,
                        flag: true
                    }

                ]
            }
        ],

        description: 'Perfect for small teams looking to grow their recruitment efforts.',
        featured: true,
        priceId: { month: 'pri_01jm4gjc1gvqkttcb1axf86617' },
    },
    {
        name: 'Premium',
        id: 'premium',
        description: 'For large teams looking to scale their recruitment efforts.',
        feature: [
            {
                name: 'Usage',
                feature: [
                    {
                        name: 'Team Members',
                        value: '10',
                        flag: true,
                    },
                    {
                        name: 'Active Jobs',
                        value: 'Unlimited',
                        flag: true,
                    },
                    {
                        name: 'Candidates per job',
                        value: '200',
                        flag: true,
                    }
                ],
            },
            {
                name: 'Features',
                feature: [
                    {
                        name: 'Reporting',
                        value: null,
                        flag: true,
                    },
                    {
                        name: 'Analytics',
                        value: null,
                        flag: true,
                    },
                    {
                        name: 'Import and Export',
                        value: null,
                        flag: true,
                    },
                    {
                        name: 'Integrations',
                        value: null,
                        flag: true,
                    }
                ]
            },
            {
                name: 'Support', feature: [
                    {

                        name: 'Priority Support',
                        value: null,
                        flag: true
                    }

                ]
            }
        ],
        featured: false,
        priceId: { month: 'pri_01jm4gm28cyxwhtdajtnv2wz5x' },
    },
];