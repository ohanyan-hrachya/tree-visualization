import { __resetNanoid } from '@/test/__mocks__/nanoid'

import { ROOT_ID, useTreeStore } from './tree.store'
import type { TreeNode } from './tree.types'

const createRootNode = (): TreeNode => ({
  id: ROOT_ID,
  name: 'Root',
  type: 'root',
  parentId: null,
  children: [],
  blocks: [],
  opened: true,
})

const resetStore = () => {
  if (!globalThis.localStorage) {
    const store = new Map<string, string>()
    globalThis.localStorage = {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size
      },
    }
  }

  globalThis.localStorage.removeItem('tree-store')
  __resetNanoid()
  useTreeStore.setState({ nodes: { [ROOT_ID]: createRootNode() } })
}

describe('tree.store', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renames an existing node', () => {
    const { renameNode } = useTreeStore.getState()

    renameNode(ROOT_ID, 'New Root')

    expect(useTreeStore.getState().nodes[ROOT_ID].name).toBe('New Root')
  })

  it('ignores rename when node is missing or unchanged', () => {
    const { renameNode } = useTreeStore.getState()

    renameNode('missing', 'Nope')
    renameNode(ROOT_ID, 'Root')

    expect(Object.keys(useTreeStore.getState().nodes)).toHaveLength(1)
    expect(useTreeStore.getState().nodes[ROOT_ID].name).toBe('Root')
  })

  it('adds a child node and opens parent', () => {
    const { addNode } = useTreeStore.getState()

    const childId = addNode(ROOT_ID, 'Child')

    expect(childId).toBeTruthy()

    const { nodes } = useTreeStore.getState()
    expect(nodes[ROOT_ID].children).toEqual([childId])
    expect(nodes[ROOT_ID].opened).toBe(true)
    expect(nodes[childId!]).toMatchObject({
      id: childId,
      name: 'Child',
      parentId: ROOT_ID,
      type: 'block',
    })
  })

  it('does not add a node when parent is missing', () => {
    const { addNode } = useTreeStore.getState()

    const result = addNode('missing', 'Child')

    expect(result).toBeNull()
    expect(Object.keys(useTreeStore.getState().nodes)).toHaveLength(1)
  })

  it('removes a node subtree and cleans up parent children', () => {
    const { addNode, removeNode } = useTreeStore.getState()

    const childId = addNode(ROOT_ID, 'Child')!
    const grandId = addNode(childId, 'Grand')!

    removeNode(childId)

    const { nodes } = useTreeStore.getState()
    expect(nodes[ROOT_ID].children).toEqual([])
    expect(nodes[childId]).toBeUndefined()
    expect(nodes[grandId]).toBeUndefined()
  })

  it('does not remove the root node', () => {
    const { removeNode } = useTreeStore.getState()

    removeNode(ROOT_ID)

    expect(useTreeStore.getState().nodes[ROOT_ID]).toBeDefined()
  })

  it('adds, renames, and removes blocks', () => {
    const { addBlock, renameBlock, removeBlock } = useTreeStore.getState()

    const blockId = addBlock(ROOT_ID, 'Block A')!

    renameBlock(ROOT_ID, blockId, 'Block B')

    expect(useTreeStore.getState().nodes[ROOT_ID].blocks).toEqual([
      { id: blockId, name: 'Block B' },
    ])

    removeBlock(ROOT_ID, blockId)

    expect(useTreeStore.getState().nodes[ROOT_ID].blocks).toEqual([])
  })

  it('returns null when adding a block to a missing node', () => {
    const { addBlock } = useTreeStore.getState()

    expect(addBlock('missing', 'Block')).toBeNull()
  })

  it('does nothing when removing a missing block', () => {
    const { removeBlock } = useTreeStore.getState()

    removeBlock(ROOT_ID, 'missing')

    expect(useTreeStore.getState().nodes[ROOT_ID].blocks).toEqual([])
  })

  it('reorders blocks within the same node', () => {
    const { addBlock, moveBlock } = useTreeStore.getState()

    const blockA = addBlock(ROOT_ID, 'A')!
    const blockB = addBlock(ROOT_ID, 'B')!
    const blockC = addBlock(ROOT_ID, 'C')!

    moveBlock(ROOT_ID, ROOT_ID, blockC, 0)

    expect(useTreeStore.getState().nodes[ROOT_ID].blocks.map((block) => block.id)).toEqual([
      blockC,
      blockA,
      blockB,
    ])
  })

  it('reorders blocks with index clamping', () => {
    const { addBlock, moveBlock } = useTreeStore.getState()

    const blockA = addBlock(ROOT_ID, 'A')!
    const blockB = addBlock(ROOT_ID, 'B')!

    moveBlock(ROOT_ID, ROOT_ID, blockA, -5)
    expect(useTreeStore.getState().nodes[ROOT_ID].blocks.map((block) => block.id)).toEqual([
      blockA,
      blockB,
    ])

    moveBlock(ROOT_ID, ROOT_ID, blockA, 99)
    expect(useTreeStore.getState().nodes[ROOT_ID].blocks.map((block) => block.id)).toEqual([
      blockB,
      blockA,
    ])
  })

  it('ignores moves for missing blocks or nodes', () => {
    const { moveBlock } = useTreeStore.getState()

    moveBlock(ROOT_ID, ROOT_ID, 'missing', 0)
    moveBlock('missing', ROOT_ID, 'missing', 0)

    expect(useTreeStore.getState().nodes[ROOT_ID].blocks).toEqual([])
  })

  it('moves a block across nodes', () => {
    const { addNode, addBlock, moveBlock } = useTreeStore.getState()

    const childId = addNode(ROOT_ID, 'Child')!
    const blockId = addBlock(ROOT_ID, 'Block')!

    moveBlock(ROOT_ID, childId, blockId, 0)

    const { nodes } = useTreeStore.getState()
    expect(nodes[ROOT_ID].blocks).toEqual([])
    expect(nodes[childId].blocks).toEqual([{ id: blockId, name: 'Block' }])
  })

  it('toggles open state', () => {
    const { toggleOpened } = useTreeStore.getState()

    toggleOpened(ROOT_ID)
    expect(useTreeStore.getState().nodes[ROOT_ID].opened).toBe(false)

    toggleOpened(ROOT_ID)
    expect(useTreeStore.getState().nodes[ROOT_ID].opened).toBe(true)
  })

  it('ignores toggle for missing nodes', () => {
    const { toggleOpened } = useTreeStore.getState()

    toggleOpened('missing')

    expect(useTreeStore.getState().nodes[ROOT_ID].opened).toBe(true)
  })
})
