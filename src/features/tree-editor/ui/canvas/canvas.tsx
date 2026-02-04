import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import type { NodeId } from '@/entities/tree'

import { Line } from '../line'
import { Node } from '../node'
import { DEFAULT_NODE_SIZE } from './canvas.constants'
import { getBottomAnchor, getTopAnchor, layoutTree } from './canvas.helpers'
import type { TreeCanvasProps } from './canvas.types'

export const Canvas = ({ root }: TreeCanvasProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(340)

  useLayoutEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width - 20)
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const layout = useMemo(
    () => layoutTree(root, DEFAULT_NODE_SIZE, canvasWidth, selectedNodeId),
    [root, canvasWidth, selectedNodeId]
  )
  const nodesById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout.nodes]
  )

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-screen w-screen rounded-xl border border-slate-300 bg-transparent"
    >
      <svg
        className="absolute inset-0 pointer-events-none"
        width={layout.width}
        height={layout.height}
        aria-hidden="true"
      >
        {layout.edges.map((edge) => {
          const fromNode = nodesById.get(edge.fromId)
          const toNode = nodesById.get(edge.toId)

          if (!fromNode || !toNode) return null

          return (
            <Line
              key={`${edge.fromId}-${edge.toId}`}
              from={getBottomAnchor(fromNode, DEFAULT_NODE_SIZE)}
              to={getTopAnchor(toNode, DEFAULT_NODE_SIZE)}
            />
          )
        })}
      </svg>

      {layout.nodes.map((node) => (
        <div
          key={node.id}
          className="absolute z-10"
          style={{ left: node.position.x, top: node.position.y }}
        >
          <Node
            node={node}
            setSelect={(active) =>
              setSelectedNodeId((prev) => (active ? node.id : prev === node.id ? null : prev))
            }
          />
        </div>
      ))}
    </div>
  )
}
