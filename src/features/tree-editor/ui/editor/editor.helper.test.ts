import type { NodeId, TreeNode } from '@/entities/tree'

import { buildTreeView } from './editor.helper'

const makeNode = (overrides: Partial<TreeNode>): TreeNode => ({
  id: overrides.id ?? 'node',
  name: overrides.name ?? 'Node',
  type: overrides.type ?? 'block',
  parentId: overrides.parentId ?? null,
  children: overrides.children ?? [],
  blocks: overrides.blocks ?? [],
  opened: overrides.opened ?? true,
})

describe('editor.helper', () => {
  it('returns null when node is missing', () => {
    const nodes: Record<NodeId, TreeNode> = {}

    expect(buildTreeView(nodes, 'missing')).toBeNull()
  })

  it('builds a tree view with children when opened', () => {
    const nodes: Record<NodeId, TreeNode> = {
      root: makeNode({ id: 'root', name: 'Root', type: 'root', children: ['child'] }),
      child: makeNode({
        id: 'child',
        name: 'Child',
        parentId: 'root',
        blocks: [{ id: 'b1', name: 'Block 1' }],
      }),
    }

    const result = buildTreeView(nodes, 'root')

    expect(result).toMatchObject({
      id: 'root',
      label: 'Root',
      type: 'root',
      hasChildren: true,
      isOpened: true,
      parentId: null,
    })
    expect(result?.children).toHaveLength(1)
    expect(result?.children[0]).toMatchObject({
      id: 'child',
      label: 'Child',
      parentId: 'root',
      hasChildren: false,
      isOpened: true,
    })
    expect(result?.children[0].blocks).toEqual([{ id: 'b1', name: 'Block 1' }])
  })

  it('omits children when node is closed but preserves hasChildren', () => {
    const nodes: Record<NodeId, TreeNode> = {
      root: makeNode({
        id: 'root',
        name: 'Root',
        type: 'root',
        children: ['child'],
        opened: false,
      }),
      child: makeNode({ id: 'child', name: 'Child', parentId: 'root' }),
    }

    const result = buildTreeView(nodes, 'root')

    expect(result?.hasChildren).toBe(true)
    expect(result?.isOpened).toBe(false)
    expect(result?.children).toEqual([])
  })
})
