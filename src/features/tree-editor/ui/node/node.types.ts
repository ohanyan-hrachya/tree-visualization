import type { BlockType, NodeId } from '@/entities/tree'
import type { CSSProperties, InputHTMLAttributes, MouseEventHandler } from 'react'

export type TNode = {
  id: NodeId
  label: string
  type: BlockType
  children: TNode[]
  hasChildren: boolean
  isExpanded: boolean
  blocks: BlockItem[]
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
  nodeId?: string
  isActive?: boolean
  onActiveChange?: (active: boolean) => void
  onClick?: MouseEventHandler<HTMLDivElement>
  className?: string
  style?: CSSProperties
  inputProps?: InputHTMLAttributes<HTMLInputElement>
  canAddChild?: boolean
  onAddChild?: () => void
  canDelete?: boolean
  onDelete?: () => void
  canCollapse?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
  blocks?: BlockItem[]
  onAddBlock?: () => void
  onRemoveBlock?: (id: string) => void
  onRenameBlock?: (id: string, name: string) => void
  onMoveBlock?: (fromNodeId: string, toNodeId: string, blockId: string, index?: number) => void
}
