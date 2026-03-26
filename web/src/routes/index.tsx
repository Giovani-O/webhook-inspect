import { createFileRoute } from '@tanstack/react-router'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { Sidebar } from '../components/sidebar'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="h-screen bg-zinc-900">
      <Group>
        <Panel defaultSize="20%" minSize="15%" maxSize="40%">
          <Sidebar />
        </Panel>

        <Separator className="w-px bg-zinc-700 hover:bg-zinc-600 transition-colors duration-150" />

        <Panel defaultSize="80%" minSize="60%">
          Conteudo
        </Panel>
      </Group>
    </div>
  )
}
