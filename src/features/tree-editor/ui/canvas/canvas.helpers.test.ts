import type { NodeSize, TNode } from '../node/node.types'
import { BLOCK_GAP, BLOCK_ROW_HEIGHT, H_GAP, PADDING, V_GAP } from './canvas.constants'
import { getBottomAnchor, getNodeHeight, getTopAnchor, layoutTree } from './canvas.helpers'

const makeNode = (overrides: Partial<TNode> = {}): TNode => ({
  id: overrides.id ?? 'node',
  label: overrides.label ?? 'Node',
  type: overrides.type ?? 'block',
  children: overrides.children ?? [],
  hasChildren: overrides.hasChildren ?? (overrides.children?.length ?? 0) > 0,
  isOpened: overrides.isOpened ?? true,
  blocks: overrides.blocks ?? [],
  parentId: overrides.parentId ?? null,
})

describe('canvas.helpers', () => {
  it('calculates node height with blocks and selected space', () => {
    const nodeSize: NodeSize = { width: 100, height: 50 }
    const node = makeNode({
      id: 'root',
      blocks: [
        { id: 'b1', name: 'First' },
        { id: 'b2', name: 'Second' },
      ],
    })

    const base = nodeSize.height + 2 * BLOCK_ROW_HEIGHT + BLOCK_GAP
    expect(getNodeHeight(node, nodeSize, null)).toBe(base)
    expect(getNodeHeight(node, nodeSize, 'root')).toBe(base + BLOCK_ROW_HEIGHT + BLOCK_GAP)
  })

  it('lays out a simple tree centered in the canvas', () => {
    const nodeSize: NodeSize = { width: 100, height: 50 }
    const childA = makeNode({ id: 'child-a', label: 'Child A' })
    const childB = makeNode({ id: 'child-b', label: 'Child B' })
    const root = makeNode({
      id: 'root',
      label: 'Root',
      type: 'root',
      children: [childA, childB],
      hasChildren: true,
    })

    const result = layoutTree(root, nodeSize, 400, null)

    expect(result.width).toBe(400)
    expect(result.height).toBe(220)
    expect(result.edges).toEqual([
      { fromId: 'root', toId: 'child-a' },
      { fromId: 'root', toId: 'child-b' },
    ])

    const rootNode = result.nodes.find((node) => node.id === 'root')
    const firstChild = result.nodes.find((node) => node.id === 'child-a')
    const secondChild = result.nodes.find((node) => node.id === 'child-b')

    expect(rootNode?.position).toEqual({ x: 150, y: PADDING })
    expect(firstChild?.position).toEqual({ x: 76, y: PADDING + nodeSize.height + V_GAP })
    expect(secondChild?.position).toEqual({ x: 224, y: PADDING + nodeSize.height + V_GAP })

    const expectedTreeWidth = 100 + H_GAP + 100
    expect(result.width).toBe(Math.max(expectedTreeWidth + PADDING * 2, 400))
  })

  it('provides top and bottom anchors for a node', () => {
    const nodeSize: NodeSize = { width: 100, height: 50 }
    const node = makeNode({ id: 'root' })
    const result = layoutTree(node, nodeSize, 300, null)

    const layoutNode = result.nodes[0]
    expect(layoutNode).toBeDefined()

    expect(getTopAnchor(layoutNode, nodeSize)).toEqual({
      x: layoutNode.position.x + nodeSize.width / 2,
      y: layoutNode.position.y,
    })
    expect(getBottomAnchor(layoutNode, nodeSize)).toEqual({
      x: layoutNode.position.x + nodeSize.width / 2,
      y: layoutNode.position.y + layoutNode.height,
    })
  })
})
