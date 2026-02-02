import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { nanoid } from '@/shared/lib/nanoid'
import type {
  HistoryState,
  TreeSnapshot,
  TreeState,
  BlockType,
  NodeId,
  TreeNode,
} from './tree.types'

const canHaveChildren = (type: BlockType) => type !== 'subblock'

const childTypeForParent = (type: BlockType): Exclude<BlockType, 'root'> | null => {
  if (type === 'root') return 'block'
  if (type === 'block') return 'subblock'
  return null
}

const ROOT_ID: NodeId = 'root'
const MAX_HISTORY = 50

const createRootNode = (): TreeNode => ({
  id: ROOT_ID,
  name: 'Main Block',
  type: 'root',
  parentId: null,
  children: [],
})

const defaultNameForType = (type: Exclude<BlockType, 'root'>) =>
  type === 'block' ? 'New Block' : 'New Subblock'

const snapshot = (state: TreeState): TreeSnapshot => ({
  nodes: state.nodes,
  expanded: state.expanded,
})

const pushHistory = (state: TreeState): HistoryState => {
  const trimmedPast =
    state.history.past.length >= MAX_HISTORY ? state.history.past.slice(1) : state.history.past

  return {
    past: [...trimmedPast, snapshot(state)],
    future: [],
  }
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

const isDescendant = (
  nodes: Record<NodeId, TreeNode>,
  maybeAncestorId: NodeId,
  maybeChildId: NodeId
) => {
  let current: NodeId | null = maybeChildId
  while (current) {
    if (current === maybeAncestorId) return true
    current = nodes[current]?.parentId ?? null
  }
  return false
}

export const useTreeStore = create<TreeState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        nodes: {
          [ROOT_ID]: createRootNode(),
        },
        expanded: {
          [ROOT_ID]: true,
        },
        history: {
          past: [],
          future: [],
        },

        renameNode: (id, name) => {
          const state = get()
          const node = state.nodes[id]
          if (!node || node.name === name) return

          set({
            nodes: {
              ...state.nodes,
              [id]: { ...node, name },
            },
            history: pushHistory(state),
          })
        },

        addNode: (parentId, name) => {
          const state = get()
          const parent = state.nodes[parentId]
          if (!parent) return null

          const childType = childTypeForParent(parent.type)
          if (!childType) return null

          const id = nanoid()
          const node: TreeNode = {
            id,
            name: name ?? defaultNameForType(childType),
            type: childType,
            parentId,
            children: [],
          }

          set({
            nodes: {
              ...state.nodes,
              [id]: node,
              [parentId]: {
                ...parent,
                children: [...parent.children, id],
              },
            },
            expanded: {
              ...state.expanded,
              [parentId]: true,
            },
            history: pushHistory(state),
          })

          return id
        },

        removeNode: (id) => {
          const state = get()
          const node = state.nodes[id]
          if (!node || node.type === 'root') return

          const toDelete: NodeId[] = []
          const stack: NodeId[] = [id]
          while (stack.length) {
            const current = stack.pop()
            if (!current) continue
            toDelete.push(current)
            const currentNode = state.nodes[current]
            if (currentNode?.children?.length) {
              stack.push(...currentNode.children)
            }
          }

          const nextNodes = { ...state.nodes }
          const nextExpanded = { ...state.expanded }

          if (node.parentId && nextNodes[node.parentId]) {
            nextNodes[node.parentId] = {
              ...nextNodes[node.parentId],
              children: nextNodes[node.parentId].children.filter((childId) => childId !== id),
            }
          }

          for (const deleteId of toDelete) {
            delete nextNodes[deleteId]
            delete nextExpanded[deleteId]
          }

          set({
            nodes: nextNodes,
            expanded: nextExpanded,
            history: pushHistory(state),
          })
        },

        moveNode: (id, nextParentId, index) => {
          const state = get()
          const node = state.nodes[id]
          const nextParent = state.nodes[nextParentId]
          if (!node || !nextParent) return
          if (node.type === 'root') return

          const allowedChildType = childTypeForParent(nextParent.type)
          if (!allowedChildType || allowedChildType !== node.type) return
          if (isDescendant(state.nodes, id, nextParentId)) return

          const prevParentId = node.parentId
          if (!prevParentId) return
          const prevParent = state.nodes[prevParentId]
          if (!prevParent) return

          const prevChildren = prevParent.children.filter((childId) => childId !== id)
          const nextChildren =
            prevParentId === nextParentId ? prevChildren : [...nextParent.children]

          const insertAt =
            index == null ? nextChildren.length : clamp(index, 0, nextChildren.length)

          nextChildren.splice(insertAt, 0, id)

          const nextNodes = {
            ...state.nodes,
            [id]: { ...node, parentId: nextParentId },
            [prevParentId]: {
              ...prevParent,
              children: prevParentId === nextParentId ? nextChildren : prevChildren,
            },
            [nextParentId]: {
              ...nextParent,
              children: nextChildren,
            },
          }

          set({
            nodes: nextNodes,
            expanded: canHaveChildren(nextParent.type)
              ? { ...state.expanded, [nextParentId]: true }
              : state.expanded,
            history: pushHistory(state),
          })
        },

        toggleExpand: (id) => {
          const state = get()
          if (!state.nodes[id]) return

          const nextExpanded = { ...state.expanded }
          if (nextExpanded[id]) {
            delete nextExpanded[id]
          } else {
            nextExpanded[id] = true
          }

          set({
            expanded: nextExpanded,
            history: pushHistory(state),
          })
        },

        undo: () => {
          const state = get()
          if (state.history.past.length === 0) return

          const previous = state.history.past[state.history.past.length - 1]
          const nextPast = state.history.past.slice(0, -1)
          const nextFuture: TreeSnapshot[] = [
            { nodes: state.nodes, expanded: state.expanded },
            ...state.history.future,
          ]

          set({
            nodes: previous.nodes,
            expanded: previous.expanded,
            history: {
              past: nextPast,
              future: nextFuture,
            },
          })
        },

        redo: () => {
          const state = get()
          if (state.history.future.length === 0) return

          const next = state.history.future[0]
          const nextFuture = state.history.future.slice(1)
          const nextPast: TreeSnapshot[] = [
            ...state.history.past,
            { nodes: state.nodes, expanded: state.expanded },
          ]

          set({
            nodes: next.nodes,
            expanded: next.expanded,
            history: {
              past: nextPast,
              future: nextFuture,
            },
          })
        },
      }),
      {
        name: 'tree-store',
        partialize: (state) => ({
          nodes: state.nodes,
          expanded: state.expanded,
        }),
      }
    )
  )
)
