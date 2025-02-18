'use client';

import { PriceSection } from './price-section';
import { Environments, initializePaddle, Paddle } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';

interface PathParams {
    priceId: string;
    [key: string]: string | string[];
}

interface Props {
    userEmail?: string;
    organizationId: string
    userId: string
}

export function CheckoutContents({ userEmail, organizationId, userId }: Props) {
    const { priceId } = useParams<PathParams>();
    const [quantity, setQuantity] = useState<number>(1);
    const [paddle, setPaddle] = useState<Paddle | null>(null);
    const [checkoutData, setCheckoutData] = useState<CheckoutEventsData | null>(null);

    const handleCheckoutEvents = (event: CheckoutEventsData) => {
        setCheckoutData(event);
    };

    useEffect(() => {
        if (!paddle?.Initialized && process.env.NEXT_PUBLIC_PADDLE_CLIENT_KEY && process.env.NEXT_PUBLIC_PADDLE_ENV) {
            initializePaddle({
                token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_KEY,
                environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
                eventCallback: (event) => {
                    if (event.data && event.name) {
                        handleCheckoutEvents(event.data);
                    }
                },
                checkout: {
                    settings: {
                        variant: 'one-page',
                        displayMode: 'inline',
                        theme: 'light',
                        allowLogout: !userEmail,
                        frameTarget: 'paddle-checkout-frame',
                        frameInitialHeight: 450,
                        frameStyle: 'width: 100%; background-color: transparent; border: none',
                        successUrl: '/checkout/success',
                    },
                },

            }).then(async (paddle) => {
                if (paddle && priceId) {
                    setPaddle(paddle);
                    paddle.Checkout.open({
                        ...(userEmail && { customer: { email: userEmail } }),
                        items: [{ priceId: priceId, quantity: 1 }],
                        customData: {
                            'organization_id': organizationId,
                            'user_id': userId
                        }
                        ,
                    });
                }
            });
        }
    }, [paddle?.Initialized, priceId, userEmail]);

    useEffect(() => {
        if (paddle && priceId && paddle.Initialized) {
            paddle.Checkout.updateItems([{ priceId: priceId, quantity: quantity }]);
        }
    }, [paddle, priceId, quantity]);

    return (
        <div
            className={
                'rounded-lg md:bg-background/80 md:backdrop-blur-[24px] md:p-10 md:pl-16 md:pt-4 md:min-h-[400px] flex flex-col justify-between relative'
            }
        >
            <div className={'flex flex-col md:flex-row gap-8 md:gap-16'}>
                <div className={'w-full md:w-[400px]'}>
                    <PriceSection checkoutData={checkoutData} quantity={quantity} handleQuantityChange={setQuantity} />
                </div>
                <div className={'min-w-[375px] lg:min-w-[535px]'}>
                    <div className={'text-base leading-[20px] font-semibold mb-3'}>Payment details</div>
                    <div className={'paddle-checkout-frame'} />
                </div>
            </div>
        </div>
    );
}