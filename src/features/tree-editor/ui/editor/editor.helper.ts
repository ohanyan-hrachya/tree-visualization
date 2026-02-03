import type { NodeId, TreeNode } from '@/entities/tree'
import type { TNode } from '../node/node.types'

export const buildTreeView = (
  nodes: Record<NodeId, TreeNode>,
  expanded: Record<NodeId, true>,
  nodeId: NodeId
): TNode | null => {
  const node = nodes[nodeId]
  if (!node) return null

  const isExpanded = Boolean(expanded[nodeId])
  const children = isExpanded
    ? node.children.map((childId) => buildTreeView(nodes, expanded, childId)).filter(Boolean)
    : []

  return {
    id: node.id,
    label: node.name,
    type: node.type,
    hasChildren: node.children.length > 0,
    isExpanded,
    blocks: node.blocks ?? [],
    children: children as TNode[],
  }
}
