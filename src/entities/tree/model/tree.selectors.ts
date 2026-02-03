import { useTreeStore } from './tree.store'
import type { NodeId } from './tree.types'

// Selectors - Data Access

export const useNode = (id: NodeId) => useTreeStore((state) => state.nodes[id])

export const useChildren = (id: NodeId) => useTreeStore((state) => state.nodes[id]?.children ?? [])

export const useExpanded = (id: NodeId) => useTreeStore((state) => Boolean(state.expanded[id]))

export const useAllNodes = () => useTreeStore((state) => state.nodes)

export const useHistory = () => useTreeStore((state) => state.history)

// Actions - State Mutations

export const useRenameNode = () => useTreeStore((state) => state.renameNode)

export const useAddNode = () => useTreeStore((state) => state.addNode)

export const useRemoveNode = () => useTreeStore((state) => state.removeNode)

export const useAddBlock = () => useTreeStore((state) => state.addBlock)

export const useRemoveBlock = () => useTreeStore((state) => state.removeBlock)

export const useRenameBlock = () => useTreeStore((state) => state.renameBlock)

export const useMoveBlock = () => useTreeStore((state) => state.moveBlock)

export const useMoveNode = () => useTreeStore((state) => state.moveNode)

export const useToggleExpand = () => useTreeStore((state) => state.toggleExpand)

export const useUndo = () => useTreeStore((state) => state.undo)

export const useRedo = () => useTreeStore((state) => state.redo)

// Combined Actions - Use only when you need multiple actions together

export const useTreeActions = () =>
  useTreeStore((state) => ({
    renameNode: state.renameNode,
    addNode: state.addNode,
    removeNode: state.removeNode,
    addBlock: state.addBlock,
    removeBlock: state.removeBlock,
    renameBlock: state.renameBlock,
    moveBlock: state.moveBlock,
    moveNode: state.moveNode,
    toggleExpand: state.toggleExpand,
    undo: state.undo,
    redo: state.redo,
  }))

// History State

export const useCanUndo = () => useTreeStore((state) => state.history.past.length > 0)

export const useCanRedo = () => useTreeStore((state) => state.history.future.length > 0)
