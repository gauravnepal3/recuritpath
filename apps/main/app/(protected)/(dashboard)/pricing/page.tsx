import { Pricing } from '@/components/pricing/pricing'
import React from 'react'
import '@/styles/pricing.css';
import { prisma } from '@repo/database'
import { getOrganizationTier } from '@/lib/subscription';
const getCurrentPlan = async () => {

}
const PricingPage = async () => {
    const currentPlan = await getOrganizationTier()
    return (
        <Pricing currentPlan={currentPlan} />
    )
}

export default PricingPage