import { Link } from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import { Checkbox } from './ui/checkbox'
import { IconButton } from './ui/icon-button'
import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface WebhookListItemProps extends ComponentProps<'div'> {
  webhook: {
    id: string
    method: string
    pathname: string
    createdAt: Date
  }
}

export function WebhooksListItem({
  className,
  webhook,
  ...props
}: WebhookListItemProps) {
  const queryClient = useQueryClient()

  const { mutate: deleteWebhook } = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`http://localhost:3333/api/webhooks/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['webhooks'],
      })
    },
  })

  return (
    <div
      className={twMerge(
        'group rounded-lg transition-colors duration-150 hover:bg-zinc-700/30',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3 px-4 py-2.5">
        <Checkbox />

        <Link
          to="/webhooks/$id"
          params={{ id: webhook.id }}
          className="flex flex-1 min-w-0 items-start gap-3"
        >
          <span className="w-12 shrink-0 font-mono text-xs font-semibold text-zinc-400 text-right">
            {webhook.method}
          </span>
          <div className="flex-1 min-w-0 ">
            <p className="truncate text-sm text-zinc-200 leading-tight font-mono">
              {webhook.pathname}
            </p>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              {formatDistanceToNow(webhook.createdAt, { addSuffix: true })}
            </p>
          </div>
        </Link>

        <IconButton
          icon={<Trash2Icon className="size-3.5 text-zinc-400" />}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          onClick={() => deleteWebhook(webhook.id)}
        />
      </div>
    </div>
  )
}
