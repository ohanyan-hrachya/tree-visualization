import type { NodeId } from '@/entities/tree'
import type { NodeSize, TNode } from '../node/node.types'
import type { Point } from '../line/line.types'

export type LayoutEdge = {
  fromId: NodeId
  toId: NodeId
}

export type LayoutNode = TNode & {
  position: Point
  height: number
}

export type LayoutResult = {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  width: number
  height: number
}

export type TreeCanvasProps = {
  root: TNode
  nodeSize?: NodeSize
  className?: string
  selectedNodeId?: string | null
  onNodeActiveChange?: (node: TNode, active: boolean) => void
  onNodeAddChild?: (id: NodeId) => void
  onNodeAddBlock?: (id: NodeId) => void
  onNodeRemoveBlock?: (id: NodeId, blockId: NodeId) => void
  onNodeRenameBlock?: (id: NodeId, blockId: NodeId, name: string) => void
  onNodeMoveBlock?: (fromNodeId: NodeId, toNodeId: NodeId, blockId: NodeId, index?: number) => void
  onNodeDelete?: (id: NodeId) => void
  onNodeRename?: (id: NodeId, name: string) => void
  onNodeToggleExpand?: (id: NodeId) => void
  lineColor?: string
}
