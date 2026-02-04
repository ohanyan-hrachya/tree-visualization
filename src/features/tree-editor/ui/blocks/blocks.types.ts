import type { TNode } from '../node'

export type BlockItem = {
  id: string
  name: string
}

export type BlocksProps = {
  node: TNode
  isActive?: boolean
  onMove?: (fromNodeId: string, toNodeId: string, blockId: string, index?: number) => void
}
