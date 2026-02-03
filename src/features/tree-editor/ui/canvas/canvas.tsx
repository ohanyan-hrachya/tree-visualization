import { useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Node } from '../node'
import { DEFAULT_NODE_SIZE } from './canvas.constants'
import type { TreeCanvasProps } from './canvas.types'
import { Line } from '../line'
import { getBottomAnchor, layoutTree, getTopAnchor } from './canvas.helpers'

export const Canvas = ({
  root,
  nodeSize = DEFAULT_NODE_SIZE,
  className,
  selectedNodeId,
  onNodeActiveChange,
  onNodeAddChild,
  onNodeAddBlock,
  onNodeRemoveBlock,
  onNodeRenameBlock,
  onNodeMoveBlock,
  onNodeDelete,
  onNodeRename,
  onNodeToggleExpand,
  lineColor = '#0f172a',
}: TreeCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(720)

  useLayoutEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width)
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const layout = useMemo(
    () => layoutTree(root, nodeSize, canvasWidth, selectedNodeId),
    [root, nodeSize, canvasWidth, selectedNodeId]
  )
  const nodesById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout.nodes]
  )

  return (
    <div ref={containerRef} className={`relative overflow-auto ${className ?? ''}`}>
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
              from={getBottomAnchor(fromNode, nodeSize)}
              to={getTopAnchor(toNode, nodeSize)}
              stroke={lineColor}
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
            nodeId={node.id}
            isActive={node.id === selectedNodeId}
            onActiveChange={(active) => onNodeActiveChange?.(node, active)}
            canAddChild={true}
            onAddChild={() => onNodeAddChild?.(node.id)}
            canDelete={node.type !== 'root'}
            onDelete={() => onNodeDelete?.(node.id)}
            canCollapse={node.hasChildren}
            isExpanded={node.isExpanded}
            onToggleExpand={() => onNodeToggleExpand?.(node.id)}
            blocks={node.blocks}
            onAddBlock={() => onNodeAddBlock?.(node.id)}
            onRemoveBlock={(blockId) => onNodeRemoveBlock?.(node.id, blockId)}
            onRenameBlock={(blockId, name) => onNodeRenameBlock?.(node.id, blockId, name)}
            onMoveBlock={(fromNodeId, toNodeId, blockId, index) =>
              onNodeMoveBlock?.(fromNodeId, toNodeId, blockId, index)
            }
            style={{ width: nodeSize.width, minHeight: nodeSize.height }}
            inputProps={{
              value: node.label,
              onChange: (event) => onNodeRename?.(node.id, event.currentTarget.value),
            }}
          />
        </div>
      ))}
    </div>
  )
}
