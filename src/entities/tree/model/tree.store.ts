import { create } from 'zustand'
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware'

import { nanoid } from '@/shared/lib/nanoid'

import type { NodeId, TreeNode, TreeState } from './tree.types'

export const ROOT_ID: NodeId = 'root'

const createRootNode = (): TreeNode => ({
  id: ROOT_ID,
  name: 'Root',
  type: 'root',
  parentId: null,
  children: [],
  blocks: [],
  opened: true,
})

export const useTreeStore = create<TreeState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        nodes: {
          [ROOT_ID]: createRootNode(),
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
          })
        },
        addNode: (parentId, name) => {
          const state = get()
          const parent = state.nodes[parentId]
          if (!parent) return null

          const id = nanoid()
          const node: TreeNode = {
            id,
            name: name ?? 'Page',
            type: 'block',
            parentId,
            children: [],
            blocks: [],
            opened: true,
          }

          set({
            nodes: {
              ...state.nodes,
              [id]: node,
              [parentId]: {
                ...parent,
                children: [...parent.children, id],
                opened: true,
              },
            },
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

          if (node.parentId && nextNodes[node.parentId]) {
            nextNodes[node.parentId] = {
              ...nextNodes[node.parentId],
              children: nextNodes[node.parentId].children.filter((childId) => childId !== id),
            }
          }

          for (const deleteId of toDelete) {
            delete nextNodes[deleteId]
          }

          set({
            nodes: nextNodes,
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
          })
        },
        toggleOpened: (id) => {
          const state = get()
          if (!state.nodes[id]) return

          const nodes = { ...state.nodes }
          if (nodes[id]?.opened) {
            nodes[id].opened = false
          } else {
            nodes[id].opened = true
          }

          set({
            nodes,
          })
        },
      }),
      {
        name: 'tree-store',
        storage: createJSONStorage(() => {
          if (typeof localStorage !== 'undefined') {
            return localStorage
          }
          // Fallback for non-browser environments (tests/SSR)
          const memory = new Map<string, string>()
          return {
            getItem: (key) => (memory.has(key) ? memory.get(key)! : null),
            setItem: (key, value) => {
              memory.set(key, value)
            },
            removeItem: (key) => {
              memory.delete(key)
            },
          }
        }),
        partialize: (state) => ({
          nodes: state.nodes,
        }),
      }
    )
  )
)
