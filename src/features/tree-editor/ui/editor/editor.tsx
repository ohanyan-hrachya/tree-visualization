import { useEffect, useMemo, useState } from 'react'
import type { NodeId } from '@/entities/tree'
import { useTreeStore } from '@/entities/tree'
import { Canvas } from './../canvas/canvas'
import { buildTreeView } from './editor.helper'

export const Editor = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null)
  const nodes = useTreeStore((state) => state.nodes)
  const expanded = useTreeStore((state) => state.expanded)
  const addNode = useTreeStore((state) => state.addNode)
  const removeNode = useTreeStore((state) => state.removeNode)
  const renameNode = useTreeStore((state) => state.renameNode)
  const toggleExpand = useTreeStore((state) => state.toggleExpand)
  const addBlock = useTreeStore((state) => state.addBlock)
  const removeBlock = useTreeStore((state) => state.removeBlock)
  const renameBlock = useTreeStore((state) => state.renameBlock)
  const moveBlock = useTreeStore((state) => state.moveBlock)

  const rootNode = useMemo(() => {
    const rootId = Object.values(nodes).find((node) => node.type === 'root')?.id
    if (!rootId) return null
    return buildTreeView(nodes, expanded, rootId)
  }, [nodes, expanded])

  useEffect(() => {
    if (selectedNodeId && !nodes[selectedNodeId]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedNodeId(null)
    }
  }, [nodes, selectedNodeId])

  if (!rootNode) {
    return (
      <main className="min-h-screen w-full text-slate-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-8 py-10">
          <p>No tree data available</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full bg-[#c6d9ea] text-slate-900">
      <div className="flex w-full flex-col px-0 py-4">
        <Canvas
          root={rootNode}
          selectedNodeId={selectedNodeId}
          onNodeActiveChange={(node, active) =>
            setSelectedNodeId((prev) => (active ? node.id : prev === node.id ? null : prev))
          }
          onNodeAddChild={(id) => {
            const nextId = addNode(id)
            if (nextId) {
              setSelectedNodeId(nextId)
            }
          }}
          onNodeAddBlock={(id) => {
            addBlock(id)
          }}
          onNodeRemoveBlock={(id, blockId) => {
            removeBlock(id, blockId)
          }}
          onNodeRenameBlock={(id, blockId, name) => {
            renameBlock(id, blockId, name)
          }}
          onNodeMoveBlock={(fromId, toId, blockId, index) => {
            moveBlock(fromId, toId, blockId, index)
          }}
          onNodeDelete={(id) => {
            removeNode(id)
            setSelectedNodeId((prev) => (prev === id ? null : prev))
          }}
          onNodeRename={(id, name) => renameNode(id, name)}
          onNodeToggleExpand={(id) => toggleExpand(id)}
          className="h-[calc(100vh-32px)] w-full rounded-xl border border-slate-300 bg-transparent"
        />
      </div>
    </main>
  )
}
