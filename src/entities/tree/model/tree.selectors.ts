import { useTreeStore } from './tree.store'
import type { NodeId } from './tree.types'

export const useNode = (id: NodeId) => useTreeStore((state) => state.nodes[id])

export const useChildren = (id: NodeId) => useTreeStore((state) => state.nodes[id]?.children ?? [])

export const useExpanded = (id: NodeId) => useTreeStore((state) => Boolean(state.expanded[id]))

export const useTreeActions = () =>
  useTreeStore((state) => ({
    renameNode: state.renameNode,
    addNode: state.addNode,
    removeNode: state.removeNode,
    moveNode: state.moveNode,
    toggleExpand: state.toggleExpand,
    undo: state.undo,
    redo: state.redo,
  }))

export const useCanUndo = () => useTreeStore((state) => state.history.past.length > 0)
export const useCanRedo = () => useTreeStore((state) => state.history.future.length > 0)
