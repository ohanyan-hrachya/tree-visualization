import type { NodeId } from '@/entities/tree'

import type { Point } from '../line/line.types'
import type { TNode } from '../node/node.types'

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
}
