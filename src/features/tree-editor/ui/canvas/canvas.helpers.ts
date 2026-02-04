import type { NodeId } from '@/entities/tree'

import type { Point } from '../line/line.types'
import type { NodeSize, TNode } from '../node/node.types'
import { BLOCK_GAP, BLOCK_ROW_HEIGHT, H_GAP, PADDING, V_GAP } from './canvas.constants'
import type { LayoutEdge, LayoutNode, LayoutResult } from './canvas.types'

export const layoutTree = (
  root: TNode,
  nodeSize: NodeSize,
  canvasWidth: number,
  selectedNodeId: NodeId | null
): LayoutResult => {
  if (!root) return { nodes: [], edges: [], width: canvasWidth, height: 0 }

  const nodes: LayoutNode[] = []
  const edges: LayoutEdge[] = []

  const widths = new Map<string, number>()
  const heights = new Map<string, number>()
  const visiting = new Set<string>()

  const measure = (node: TNode): number => {
    if (visiting.has(node.id)) return nodeSize.width
    visiting.add(node.id)

    const h = getNodeHeight(node, nodeSize, selectedNodeId)
    heights.set(node.id, h)

    let childrenWidth = 0
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      childrenWidth += measure(child)
      if (i > 0) childrenWidth += H_GAP
    }

    const w = Math.max(nodeSize.width, childrenWidth)
    widths.set(node.id, w)

    visiting.delete(node.id)
    return w
  }

  const treeWidth = measure(root)

  let maxY = 0

  const position = (node: TNode, left: number, top: number) => {
    const subtreeW = widths.get(node.id)!
    const nodeH = heights.get(node.id)!
    const nodeX = left + (subtreeW - nodeSize.width) / 2

    nodes.push({
      ...node,
      position: { x: Math.round(nodeX), y: Math.round(top) },
      height: nodeH,
    })

    maxY = Math.max(maxY, top + nodeH)

    if (!node.children.length) return

    let childrenRowW = 0
    for (let i = 0; i < node.children.length; i++) {
      const c = node.children[i]
      childrenRowW += widths.get(c.id)!
      if (i > 0) childrenRowW += H_GAP
    }

    let childLeft = left + Math.max(0, (subtreeW - childrenRowW) / 2)
    const childTop = top + nodeH + V_GAP

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      if (i === 0) child.isFirst = true

      edges.push({ fromId: node.id, toId: child.id })
      position(child, childLeft, childTop)
      childLeft += widths.get(child.id)! + H_GAP
    }
  }

  const startLeft = treeWidth < canvasWidth ? (canvasWidth - treeWidth) / 2 : PADDING
  const startTop = PADDING

  position(root, startLeft, startTop)

  return {
    nodes,
    edges,
    width: Math.max(treeWidth + PADDING * 2, canvasWidth),
    height: maxY + PADDING,
  }
}

export const getNodeHeight = (node: TNode, nodeSize: NodeSize, selectedNodeId: NodeId | null) => {
  const blockCount = node.blocks.length
  const listHeight =
    blockCount > 0 ? blockCount * BLOCK_ROW_HEIGHT + (blockCount - 1) * BLOCK_GAP : 0
  const selectedSpace = selectedNodeId === node.id ? BLOCK_ROW_HEIGHT + BLOCK_GAP : 0

  return nodeSize.height + listHeight + selectedSpace
}

export const getTopAnchor = (node: LayoutNode, nodeSize: NodeSize): Point => ({
  x: node.position.x + nodeSize.width / 2,
  y: node.position.y,
})

export const getBottomAnchor = (node: LayoutNode, nodeSize: NodeSize): Point => ({
  x: node.position.x + nodeSize.width / 2,
  y: node.position.y + node.height,
})
