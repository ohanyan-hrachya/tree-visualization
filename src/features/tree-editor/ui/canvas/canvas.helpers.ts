import type { NodeId } from '@/entities/tree'
import type { Point } from '../line/line.types'
import type { NodeSize, TNode } from '../node/node.types'
import {
  ACTIVE_ADD_HEIGHT,
  BLOCK_GAP,
  BLOCK_LIST_PADDING,
  BLOCK_ROW_HEIGHT,
  PADDING,
  H_GAP,
  V_GAP,
} from './canvas.constants'
import type { LayoutEdge, LayoutNode, LayoutResult } from './canvas.types'

export const layoutTree = (
  root: TNode,
  nodeSize: NodeSize,
  canvasWidth: number,
  selectedNodeId?: string | null
): LayoutResult => {
  const nodes: LayoutNode[] = []
  const edges: LayoutEdge[] = []
  const widths = new Map<NodeId, number>()
  const heights = new Map<NodeId, number>()
  const levelHeights = new Map<number, number>()

  const treeWidth = measureSubtreeWidth(root, nodeSize, widths)

  const measureHeights = (node: TNode, depth: number) => {
    const height = getNodeHeight(node, nodeSize, node.id === selectedNodeId)
    heights.set(node.id, height)
    levelHeights.set(depth, Math.max(levelHeights.get(depth) ?? 0, height))
    node.children.forEach((child) => measureHeights(child, depth + 1))
  }

  measureHeights(root, 0)

  const maxDepth = Math.max(...levelHeights.keys())
  const levelOffsets: number[] = []
  let currentOffset = PADDING
  for (let depth = 0; depth <= maxDepth; depth += 1) {
    levelOffsets[depth] = currentOffset
    currentOffset += (levelHeights.get(depth) ?? nodeSize.height) + V_GAP
  }

  const startLeft = Math.max(PADDING, (canvasWidth - treeWidth) / 2)

  const layoutNode = (node: TNode, depth: number, left: number) => {
    const subtreeWidth = widths.get(node.id) ?? nodeSize.width
    const childrenWidth = node.children.length
      ? node.children.reduce((total, child, index) => {
          const childWidth = widths.get(child.id) ?? nodeSize.width
          return total + childWidth + (index > 0 ? H_GAP : 0)
        }, 0)
      : 0

    const nodeX = left + (subtreeWidth - nodeSize.width) / 2
    const nodeY = levelOffsets[depth] ?? PADDING
    const nodeHeight = heights.get(node.id) ?? nodeSize.height

    nodes.push({ ...node, position: { x: nodeX, y: nodeY }, height: nodeHeight })

    let childLeft = left
    if (node.children.length) {
      childLeft = left + Math.max(0, (subtreeWidth - childrenWidth) / 2)
    }

    node.children.forEach((child) => {
      edges.push({ fromId: node.id, toId: child.id })
      layoutNode(child, depth + 1, childLeft)
      childLeft += (widths.get(child.id) ?? nodeSize.width) + H_GAP
    })
  }

  layoutNode(root, 0, startLeft)

  return {
    nodes,
    edges,
    width: Math.max(treeWidth + PADDING * 2, canvasWidth),
    height: Math.max(currentOffset - V_GAP + PADDING, nodeSize.height + PADDING * 2),
  }
}

export const getTopAnchor = (node: LayoutNode, nodeSize: NodeSize): Point => ({
  x: node.position.x + nodeSize.width / 2,
  y: node.position.y,
})

export const getBottomAnchor = (node: LayoutNode, nodeSize: NodeSize): Point => ({
  x: node.position.x + nodeSize.width / 2,
  y: node.position.y + node.height,
})

export const measureSubtreeWidth = (
  node: TNode,
  nodeSize: NodeSize,
  widths: Map<NodeId, number>
): number => {
  if (node.children.length === 0) {
    widths.set(node.id, nodeSize.width)
    return nodeSize.width
  }

  const childrenWidth = node.children.reduce((total, child, index) => {
    const childWidth = measureSubtreeWidth(child, nodeSize, widths)
    return total + childWidth + (index > 0 ? H_GAP : 0)
  }, 0)

  const width = Math.max(nodeSize.width, childrenWidth)
  widths.set(node.id, width)
  return width
}

export const getNodeHeight = (node: TNode, nodeSize: NodeSize, isActive: boolean) => {
  const blockCount = node.blocks.length
  const listHeight =
    blockCount > 0 ? blockCount * BLOCK_ROW_HEIGHT + (blockCount - 1) * BLOCK_GAP : 0
  const listPadding = blockCount > 0 ? BLOCK_LIST_PADDING : 0
  const activeAdd = isActive ? ACTIVE_ADD_HEIGHT : 0

  return nodeSize.height + listHeight + listPadding + activeAdd
}
