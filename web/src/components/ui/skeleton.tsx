import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface SkeletonProps extends ComponentProps<'div'> {}

export function Skeleton({ className, ...props }: Readonly<SkeletonProps>) {
  return (
    <div
      className={twMerge('animate-pulse rounded bg-zinc-700/50', className)}
      {...props}
    />
  )
}
