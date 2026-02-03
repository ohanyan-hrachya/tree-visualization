import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { nanoid } from '@/shared/lib/nanoid'
import type { HistoryState, TreeSnapshot, TreeState, NodeId, TreeNode } from './tree.types'

const ROOT_ID: NodeId = 'root'
const MAX_HISTORY = 50

const createRootNode = (): TreeNode => ({
  id: ROOT_ID,
  name: 'Main Block',
  type: 'root',
  parentId: null,
  children: [],
  blocks: [],
})

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

          const id = nanoid()
          const node: TreeNode = {
            id,
            name: name ?? 'New Block',
            type: 'block',
            parentId,
            children: [],
            blocks: [],
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

        addBlock: (nodeId, name) => {
          const state = get()
          const node = state.nodes[nodeId]
          if (!node) return null

          const id = nanoid()
          const nextBlocks = [...(node.blocks ?? []), { id, name: name ?? 'New Block' }]

          set({
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                blocks: nextBlocks,
              },
            },
            history: pushHistory(state),
          })

          return id
        },

        removeBlock: (nodeId, blockId) => {
          const state = get()
          const node = state.nodes[nodeId]
          if (!node) return

          const nextBlocks = (node.blocks ?? []).filter((block) => block.id !== blockId)
          if (nextBlocks.length === (node.blocks ?? []).length) return

          set({
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                blocks: nextBlocks,
              },
            },
            history: pushHistory(state),
          })
        },

        renameBlock: (nodeId, blockId, name) => {
          const state = get()
          const node = state.nodes[nodeId]
          if (!node) return

          const nextBlocks = (node.blocks ?? []).map((block) =>
            block.id === blockId ? { ...block, name } : block
          )

          set({
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                blocks: nextBlocks,
              },
            },
            history: pushHistory(state),
          })
        },

        moveBlock: (fromNodeId, toNodeId, blockId, index) => {
          const state = get()
          const fromNode = state.nodes[fromNodeId]
          const toNode = state.nodes[toNodeId]
          if (!fromNode || !toNode) return

          const fromBlocks = fromNode.blocks ?? []
          const fromIndex = fromBlocks.findIndex((item) => item.id === blockId)
          if (fromIndex === -1) return

          const block = fromBlocks[fromIndex]

          if (fromNodeId === toNodeId) {
            const nextBlocks = [...fromBlocks]
            nextBlocks.splice(fromIndex, 1)

            let insertAt = index ?? nextBlocks.length
            if (fromIndex < insertAt) {
              insertAt -= 1
            }
            insertAt = Math.max(0, Math.min(insertAt, nextBlocks.length))
            nextBlocks.splice(insertAt, 0, block)

            set({
              nodes: {
                ...state.nodes,
                [fromNodeId]: {
                  ...fromNode,
                  blocks: nextBlocks,
                },
              },
              history: pushHistory(state),
            })

            return
          }

          const nextFromBlocks = fromBlocks.filter((item) => item.id !== blockId)
          const toBlocks = [...(toNode.blocks ?? [])]
          const insertAt = Math.max(0, Math.min(index ?? toBlocks.length, toBlocks.length))
          toBlocks.splice(insertAt, 0, block)

          set({
            nodes: {
              ...state.nodes,
              [fromNodeId]: {
                ...fromNode,
                blocks: nextFromBlocks,
              },
              [toNodeId]: {
                ...toNode,
                blocks: toBlocks,
              },
            },
            history: pushHistory(state),
          })
        },

        moveNode: (id, nextParentId, index) => {
          const state = get()
          const node = state.nodes[id]
          const nextParent = state.nodes[nextParentId]
          if (!node || !nextParent) return
          if (node.type === 'root') return

          const allowedChildType = 'block'
          if (!allowedChildType) return
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
            expanded:
              prevParentId === nextParentId
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
