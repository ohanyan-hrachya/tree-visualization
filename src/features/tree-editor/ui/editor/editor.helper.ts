import type { NodeId, TreeNode } from '@/entities/tree'

import type { TNode } from '../node/node.types'

export const buildTreeView = (nodes: Record<NodeId, TreeNode>, nodeId: NodeId): TNode | null => {
  const node = nodes[nodeId]
  if (!node) return null

  const isOpened = Boolean(node.opened)
  const children = isOpened
    ? node.children.map((childId) => buildTreeView(nodes, childId)).filter(Boolean)
    : []

  return {
    id: node.id,
    label: node.name,
    type: node.type,
    hasChildren: node.children.length > 0,
    parentId: node.parentId,
    isOpened,
    blocks: node.blocks ?? [],
    children: children as TNode[],
  }
}
