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
  opened: boolean
}

export interface TreeState {
  nodes: Record<NodeId, TreeNode>

  renameNode(id: NodeId, name: string): void
  addNode(parentId: NodeId, name?: string): NodeId | null
  removeNode(id: NodeId): void
  addBlock(nodeId: NodeId, name?: string): NodeId | null
  removeBlock(nodeId: NodeId, blockId: NodeId): void
  renameBlock(nodeId: NodeId, blockId: NodeId, name: string): void
  moveBlock(fromNodeId: NodeId, toNodeId: NodeId, blockId: NodeId, index?: number): void
  toggleOpened(id: NodeId): void
}
