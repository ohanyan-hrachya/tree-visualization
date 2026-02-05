import { useShallow } from 'zustand/react/shallow'

import { useTreeStore } from './tree.store'
import type { NodeId } from './tree.types'

// Selectors - Data Access

export const useNode = (id: NodeId) => useTreeStore((state) => state.nodes[id])

export const useChildren = (id: NodeId) => useTreeStore((state) => state.nodes[id]?.children ?? [])

export const useOpened = (id: NodeId) => useTreeStore((state) => Boolean(state.nodes[id]?.opened))

export const useAllNodes = () => useTreeStore((state) => state.nodes)

// Actions - State Mutations

export const useRenameNode = () => useTreeStore((state) => state.renameNode)

export const useAddNode = () => useTreeStore((state) => state.addNode)

export const useRemoveNode = () => useTreeStore((state) => state.removeNode)

export const useAddBlock = () => useTreeStore((state) => state.addBlock)

export const useRemoveBlock = () => useTreeStore((state) => state.removeBlock)

export const useRenameBlock = () => useTreeStore((state) => state.renameBlock)

export const useMoveBlock = () => useTreeStore((state) => state.moveBlock)

export const useToggleOpened = () => useTreeStore((state) => state.toggleOpened)

// Combined Actions - Use only when you need multiple actions together

export const useTreeActions = () =>
  useTreeStore(
    useShallow((state) => ({
      renameNode: state.renameNode,
      addNode: state.addNode,
      removeNode: state.removeNode,
      addBlock: state.addBlock,
      removeBlock: state.removeBlock,
      renameBlock: state.renameBlock,
      moveBlock: state.moveBlock,
      toggleOpened: state.toggleOpened,
    }))
  )
