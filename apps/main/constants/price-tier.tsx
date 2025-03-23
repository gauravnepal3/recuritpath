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
        description: 'Ideal for individuals who want to get started with recruitment.',
        features: ['1 Active Job', '5 Candidates per job', 'Limited messaging with candidates'],
        featured: false,
        priceId: { month: 'pri_01jm6ytkrvtj49qnhyhmngaqeh' },
    },
    {
        name: 'Pro',
        id: 'pro',
        description: 'Perfect for small teams looking to grow their recruitment efforts.',
        features: ['5 Active Jobs', '50 Candidates per job', 'AI-Powered Resume Screening', 'Automated Email Responses to Candidates', 'Custom Branding', 'Interview Scheduling Tool', 'Team Collaboration'],
        featured: true,
        priceId: { month: 'pri_01jm4gjc1gvqkttcb1axf86617' },
    },
    {
        name: 'Premium',
        id: 'premium',
        description: 'For large teams looking to scale their recruitment efforts.',
        features: [
            '10 Active Jobs',
            '200 Candidates per job',
            'All Pro Plan Features',
            'LinkedIn Job Posting',
            'AI Resume Screening & Candidate Scoring',
            'Advanced Analytics & Reports',
            'Unlimited Team Collaboration'
        ],
        featured: false,
        priceId: { month: 'pri_01jm4gm28cyxwhtdajtnv2wz5x' },
    },
];