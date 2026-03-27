import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { Sidebar } from '../components/sidebar'

// This is how you setup Tanstack Query... Yes, simple like this...
const queryClient = new QueryClient()

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <div className="h-screen bg-zinc-900">
      <Group>
        <Panel defaultSize="20%" minSize="15%" maxSize="40%">
          <Sidebar />
        </Panel>

        <Separator className="w-px bg-zinc-700 hover:bg-zinc-600 transition-colors duration-150" />

        <Panel defaultSize="80%" minSize="60%">
          <Outlet />
        </Panel>
      </Group>
    </div>
  </QueryClientProvider>
)

export const Route = createRootRoute({ component: RootLayout })
