import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { WebhookDetailSkeleton } from '../components/skeletons/webhook-detail-skeleton'
import { WebhookDetails } from '../components/webhook-details'

export const Route = createFileRoute('/webhooks/$id')({
  component: () => (
    <Suspense fallback={<WebhookDetailSkeleton />}>
      <RouteComponent />
    </Suspense>
  ),
})

function RouteComponent() {
  const { id } = Route.useParams()

  return <WebhookDetails id={id} />
}
