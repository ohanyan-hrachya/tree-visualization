import { useMemo } from 'react'

import { useAllNodes } from '@/entities/tree'
import { ROOT_ID } from '@/entities/tree/model/tree.store'

import { Canvas } from './../canvas/canvas'
import { buildTreeView } from './editor.helper'

export const Editor = () => {
  const nodes = useAllNodes()

  const rootNode = useMemo(() => {
    return buildTreeView(nodes, ROOT_ID)
  }, [nodes])

  if (!rootNode) {
    return (
      <main className="min-h-screen w-full text-slate-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-8 py-10">
          <p>No tree data available</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex-col w-full text-slate-900">
      <Canvas root={rootNode} />
    </main>
  )
}
