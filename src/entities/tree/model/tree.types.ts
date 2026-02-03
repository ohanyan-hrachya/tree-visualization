export type NodeId = string

export type BlockType = 'root' | 'block'

export type BlockItem = {
  id: string
  name: string
}

export interface TreeNode {
  id: NodeId
  name: string
  type: BlockType
  parentId: NodeId | null
  children: NodeId[]
  blocks: BlockItem[]
}

export type TreeSnapshot = {
  nodes: Record<NodeId, TreeNode>
  expanded: Record<NodeId, true>
}

export type HistoryState = {
  past: TreeSnapshot[]
  future: TreeSnapshot[]
}

export interface TreeState {
  nodes: Record<NodeId, TreeNode>
  expanded: Record<NodeId, true>
  history: HistoryState

  renameNode(id: NodeId, name: string): void
  addNode(parentId: NodeId, name?: string): NodeId | null
  removeNode(id: NodeId): void
  addBlock(nodeId: NodeId, name?: string): NodeId | null
  removeBlock(nodeId: NodeId, blockId: NodeId): void
  renameBlock(nodeId: NodeId, blockId: NodeId, name: string): void
  moveBlock(fromNodeId: NodeId, toNodeId: NodeId, blockId: NodeId, index?: number): void
  moveNode(id: NodeId, nextParentId: NodeId, index?: number): void
  toggleExpand(id: NodeId): void
  undo(): void
  redo(): void
}
