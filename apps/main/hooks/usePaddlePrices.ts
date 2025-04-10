import { Paddle, PricePreviewParams, PricePreviewResponse } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';
import { PricingTier } from '@/constants/price-tier';

export type PaddlePrices = Record<string, string>;

function getLineItems(): PricePreviewParams['items'] {
  const priceId = PricingTier.map((tier) => [tier.priceId.month, tier.priceId.year]);
  return priceId.flat().filter((priceId): priceId is string => !!priceId).map((priceId) => ({ priceId, quantity: 1 }));
}

function getPriceAmounts(prices: PricePreviewResponse) {
  return prices.data.details.lineItems.reduce((acc, item) => {
    acc[item.price.id] = item.formattedTotals.total;
    return acc;
  }, {} as PaddlePrices);
}

export function usePaddlePrices(
  paddle: Paddle | undefined,
  country: string,
): { prices: PaddlePrices; loading: boolean } {
  const [prices, setPrices] = useState<PaddlePrices>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!paddle) {
      return;
    }

    const paddlePricePreviewRequest: Partial<PricePreviewParams> = {
      items: getLineItems(),
      ...(country !== 'OTHERS' && { address: { countryCode: country } }),
    };

    const fetchPrices = async () => {
      try {
      setLoading(true);
      const prices = await paddle.PricePreview(paddlePricePreviewRequest as PricePreviewParams);
      setPrices(getPriceAmounts(prices));
    } catch (err) {
      console.error("Error fetching prices from Paddle:", err);
    } finally {
      setLoading(false);
      }
    };

    fetchPrices();
  }, [country, paddle]);
  return { prices, loading };
}