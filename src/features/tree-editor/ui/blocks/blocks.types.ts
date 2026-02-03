export type BlockItem = {
  id: string
  name: string
}

export type BlocksProps = {
  items?: BlockItem[]
  isActive?: boolean
  onAdd?: () => void
  onRemove?: (id: string) => void
  onRename?: (id: string, name: string) => void
  onMove?: (fromNodeId: string, toNodeId: string, blockId: string, index?: number) => void
  dragContextId?: string
  className?: string
}
