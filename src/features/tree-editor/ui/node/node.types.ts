import type { BlockType, NodeId } from '@/entities/tree'

export type TNode = {
  id: NodeId
  label: string
  type: BlockType
  children: TNode[]
  hasChildren: boolean
  isOpened: boolean
  blocks: BlockItem[]
  isFirst?: boolean
  parentId?: NodeId | null
}

export type NodeSize = {
  width: number
  height: number
}

export type BlockItem = {
  id: string
  name: string
}

export type DragPayload = {
  blockId: string
  fromNodeId: string
}

export type NodeCardProps = {
  node: TNode
  setSelect: (active: boolean) => void
}
