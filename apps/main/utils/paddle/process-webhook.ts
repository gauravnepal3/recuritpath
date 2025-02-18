import {
    CustomerCreatedEvent,
    CustomerUpdatedEvent,
    EventEntity,
    EventName,
    SubscriptionCreatedEvent,
    SubscriptionCanceledEvent,
    SubscriptionPausedEvent,
    SubscriptionUpdatedEvent,
    TransactionCreatedEvent,
    TransactionUpdatedEvent,
    TransactionCompletedEvent,
    TransactionPaymentFailedEvent,
} from '@paddle/paddle-node-sdk';
import { prisma } from '@repo/database';

// Terminal Command to run requro
// cloudflared tunnel run my-tunnel
export class ProcessWebhook {
    async processEvent(eventData: EventEntity & { data: { customData?: { user_id?: string } | null } }) {
        switch (eventData.eventType) {
            case EventName.SubscriptionCreated:
            case EventName.SubscriptionUpdated:
            case EventName.SubscriptionPaused:
            case EventName.SubscriptionCanceled:
                await this.addSubscriptionData(eventData);
                break;
            case EventName.TransactionCompleted:
            case EventName.TransactionPaymentFailed:
                await this.addTransaction(eventData)
        }
    }

    private async addSubscriptionData(eventData: (SubscriptionCreatedEvent | SubscriptionUpdatedEvent | SubscriptionCanceledEvent | SubscriptionPausedEvent) & { data: { customData?: { user_id?: string, organization_id?: string } | null } }) {
        try {
            const response = await prisma.organizationSubscription.create({
                data: {
                    referalId: eventData.data.id,
                    expiresOn: eventData.data.nextBilledAt ? new Date(eventData.data.nextBilledAt) : new Date(),
                    paymentHandler: 'PADDLE',
                    subscriptionType: eventData.data.items[0]?.product?.name ?? '',
                    userId: eventData.data.customData ? eventData.data.customData['user_id'] ?? '' : '',
                    organizationId: eventData.data.customData ? eventData.data.customData['organization_id'] ?? '' : '',

                }
            });
            console.log(response);
        } catch (e) {
            console.error(e);
        }
    }

    private async addTransaction(eventData: (TransactionCompletedEvent | TransactionPaymentFailedEvent) & { data: { customData?: { user_id?: string, organization_id?: string } | null } }) {
        try {
            const response = await prisma.payment.create({
                data: {
                    // Amount in penny
                    amount: Number(eventData.data.details?.totals?.grandTotal),
                    currency: eventData.data.details?.totals?.currencyCode ?? 'USD',
                    paddlePaymentId: eventData.data.id,
                    status: eventData.data.status === "completed" ? 'SUCCESS' : 'FAILED',
                    organizationId: eventData.data.customData ? eventData.data.customData['organization_id'] ?? '' : '',
                }
            })
            console.log(response)
        } catch (e) {
            console.error(e);
        }
    }

}