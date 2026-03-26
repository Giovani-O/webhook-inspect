import { useSuspenseQuery } from '@tanstack/react-query'
import { webhookListSchema } from '../http/schemas/webhooks'
import { WebhooksListItem } from './webhooks-list-item'

export function WebhooksList() {
  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3333/api/webhooks')
      const data = await response.json()

      return webhookListSchema.parse(data)
    },
  })

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {data.webhooks.map((webhook) => {
          return <WebhooksListItem key={webhook.id} webhook={webhook} />
        })}
      </div>
    </div>
  )
}
