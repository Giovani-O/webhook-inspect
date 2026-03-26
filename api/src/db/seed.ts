import { faker } from '@faker-js/faker'
import { db } from '@/db'
import { webhooks } from '@/db/schema/webhooks'

const STRIPE_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.created',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'charge.dispute.created',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'invoice.created',
  'invoice.paid',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'invoice.updated',
  'invoice.finalized',
  'invoice.voided',
  'checkout.session.completed',
  'checkout.session.expired',
  'payment_method.attached',
  'payment_method.detached',
  'refund.created',
  'refund.updated',
]

function generateStripePayload(eventType: string): Record<string, unknown> {
  const paymentIntentId = `pi_${faker.string.alphanumeric(24)}`
  const chargeId = `ch_${faker.string.alphanumeric(24)}`
  const customerId = `cus_${faker.string.alphanumeric(14)}`
  const invoiceId = `in_${faker.string.alphanumeric(14)}`
  const refundId = `re_${faker.string.alphanumeric(24)}`

  const baseObject = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2024-04-10',
    created: Math.floor(Date.now() / 1000),
    data: {} as Record<string, unknown>,
    livemode: faker.datatype.boolean(),
    pending_webhooks: faker.number.int({ min: 0, max: 5 }),
    request: {
      id: `req_${faker.string.alphanumeric(16)}`,
      idempotency_key: faker.string.uuid(),
    },
    type: eventType,
  }

  const currency = faker.helpers.arrayElement(['usd', 'eur', 'gbp', 'brl'])
  const amount = faker.number.int({ min: 100, max: 100000 })

  if (eventType.startsWith('payment_intent')) {
    baseObject.data = {
      object: {
        id: paymentIntentId,
        object: 'payment_intent',
        amount,
        amount_capturable: 0,
        amount_received: eventType.includes('succeeded') ? amount : 0,
        currency,
        customer: customerId,
        description: faker.commerce.productDescription(),
        metadata: {},
        status: eventType.includes('succeeded')
          ? 'succeeded'
          : eventType.includes('failed')
            ? 'requires_payment_method'
            : 'requires_payment_method',
        created: Math.floor(Date.now() / 1000),
      },
    }
  } else if (eventType.startsWith('charge')) {
    baseObject.data = {
      object: {
        id: chargeId,
        object: 'charge',
        amount,
        currency,
        customer: customerId,
        description: faker.commerce.productDescription(),
        paid: eventType === 'charge.succeeded',
        refunded: eventType === 'charge.refunded',
        status: eventType === 'charge.succeeded' ? 'succeeded' : 'failed',
        failure_message:
          eventType === 'charge.failed' ? 'Card was declined' : null,
        created: Math.floor(Date.now() / 1000),
      },
    }
  } else if (eventType.startsWith('customer')) {
    baseObject.data = {
      object: {
        id: customerId,
        object: 'customer',
        email: faker.internet.email(),
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        address: {
          line1: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postal_code: faker.location.zipCode(),
          country: faker.location.countryCode(),
        },
        created: Math.floor(Date.now() / 1000),
      },
    }
  } else if (eventType.startsWith('invoice')) {
    baseObject.data = {
      object: {
        id: invoiceId,
        object: 'invoice',
        account_country: faker.location.countryCode(),
        amount_due: amount,
        amount_paid: eventType.includes('paid') ? amount : 0,
        amount_remaining: eventType.includes('paid') ? 0 : amount,
        currency,
        customer: customerId,
        customer_email: faker.internet.email(),
        customer_name: faker.person.fullName(),
        status:
          eventType === 'invoice.paid' ||
          eventType === 'invoice.payment_succeeded'
            ? 'paid'
            : eventType === 'invoice.voided'
              ? 'void'
              : eventType === 'invoice.payment_failed'
                ? 'open'
                : 'draft',
        created: Math.floor(Date.now() / 1000),
      },
    }
  } else if (eventType.startsWith('checkout.session')) {
    baseObject.data = {
      object: {
        id: `cs_${faker.string.alphanumeric(64)}`,
        object: 'checkout.session',
        mode: 'payment',
        customer: customerId,
        payment_intent: paymentIntentId,
        amount_total: amount,
        currency,
        status:
          eventType === 'checkout.session.completed' ? 'complete' : 'expired',
        customer_email: faker.internet.email(),
        created: Math.floor(Date.now() / 1000),
      },
    }
  } else if (eventType.startsWith('payment_method')) {
    baseObject.data = {
      object: {
        id: `pm_${faker.string.alphanumeric(24)}`,
        object: 'payment_method',
        customer: customerId,
        type: 'card',
        card: {
          brand: faker.helpers.arrayElement(['visa', 'mastercard', 'amex']),
          last4: faker.finance.creditCardNumber('############').slice(-4),
          exp_month: faker.number.int({ min: 1, max: 12 }),
          exp_year: faker.number.int({ min: 2025, max: 2030 }),
        },
        created: Math.floor(Date.now() / 1000),
      },
    }
  } else if (eventType.startsWith('refund')) {
    baseObject.data = {
      object: {
        id: refundId,
        object: 'refund',
        amount,
        currency,
        charge: chargeId,
        payment_intent: paymentIntentId,
        reason: faker.helpers.arrayElement([
          'duplicate',
          'fraudulent',
          'requested_by_customer',
        ]),
        status: eventType === 'refund.created' ? 'pending' : 'succeeded',
        created: Math.floor(Date.now() / 1000),
      },
    }
  }

  return baseObject
}

async function main() {
  console.log('Seeding database with 60 Stripe webhooks...')

  const webhookRecords = Array.from({ length: 60 }, () => {
    const eventType = faker.helpers.arrayElement(STRIPE_EVENTS)
    const payload = generateStripePayload(eventType)

    return {
      method: 'POST',
      pathname: '/webhook/stripe',
      ip: faker.internet.ipv4(),
      statusCode: 200,
      contentType: 'application/json',
      contentLength: JSON.stringify(payload).length,
      queryParams: {},
      headers: {
        'content-type': 'application/json',
        'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.alphanumeric(64)}`,
        'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
        accept: '*/*',
        'stripe-version': '2024-04-10',
      },
      body: JSON.stringify(payload),
      createdAt: faker.date.recent({ days: 30 }),
    }
  })

  await db.insert(webhooks).values(webhookRecords)

  console.log('Seeding completed!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
