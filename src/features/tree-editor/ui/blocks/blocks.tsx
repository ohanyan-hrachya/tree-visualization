import type { DragEvent } from 'react'
import { memo, useCallback, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { useAddBlock, useRemoveBlock, useRenameBlock } from '@/entities/tree'
import { IconButton } from '@/shared/ui'

import type { BlocksProps } from './blocks.types'

export const Blocks = memo(({ node, isActive = false, onMove }: BlocksProps) => {
  const onAdd = useAddBlock()
  const onRemove = useRemoveBlock()
  const onRename = useRenameBlock()
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const nodeId = node.id
  const items = node.blocks

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLLIElement>, blockId: string) => {
      if (!nodeId) return
      event.dataTransfer.setData(
        'application/x-tree-block',
        JSON.stringify({ blockId, fromNodeId: nodeId })
      )
      event.dataTransfer.effectAllowed = 'move'
    },
    [nodeId]
  )

  const handleDragOverItem = useCallback(
    (event: DragEvent<HTMLLIElement>, index: number) => {
      if (!nodeId || !onMove) return
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'move'
      setDropIndex(index)
    },
    [nodeId, onMove]
  )

  const handleDragOverList = useCallback(
    (event: DragEvent<HTMLUListElement | HTMLDivElement>) => {
      if (!nodeId || !onMove) return
      if (event.target !== event.currentTarget) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setDropIndex(items.length)
    },
    [nodeId, onMove, items.length]
  )

  const handleDragLeave = useCallback(() => {
    setDropIndex(null)
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>, index?: number) => {
      if (!nodeId || !onMove) return
      event.preventDefault()
      event.stopPropagation()
      setDropIndex(null)

      const payload = event.dataTransfer.getData('application/x-tree-block')
      if (!payload) return

      try {
        const data = JSON.parse(payload) as { blockId: string; fromNodeId: string }
        if (!data.blockId || !data.fromNodeId) return
        onMove(data.fromNodeId, nodeId, data.blockId, index)
      } catch {
        return
      }
    },
    [nodeId, onMove]
  )

  const handleNameChange = useDebouncedCallback((value: string, blockId: string) => {
    onRename(nodeId, blockId, value)
  }, 180)

  const handleAdd = useCallback(() => onAdd(nodeId), [nodeId, onAdd])

  const handleRemoveBlock = useCallback(
    (blockId: string) => {
      onRemove(nodeId, blockId)
    },
    [nodeId, onRemove]
  )

  return (
    <div className="flex w-full flex-col gap-2">
      {items.length > 0 ? (
        <ul
          className="flex flex-col gap-[6px]"
          onDragOver={handleDragOverList}
          onDragLeave={handleDragLeave}
          onDrop={(event) => {
            if (event.target !== event.currentTarget) return
            handleDrop(event, items.length)
          }}
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable={Boolean(nodeId)}
              onDragStart={(event) => handleDragStart(event, item.id)}
              onDragOver={(event) => handleDragOverItem(event, index)}
              onDrop={(event) => handleDrop(event, index)}
              className={`overflow-hidden relative flex items-center justify-between gap-2 rounded-full bg-gray-950 px-0 py-[0px] text-[10px] font-semibold text-gray-50 ${
                dropIndex === index ? 'opacity-1' : ''
              }`}
            >
              <input
                type="text"
                defaultValue={item.name}
                onChange={(event) => handleNameChange(event.target.value, item.id)}
                readOnly={!isActive}
                draggable={false}
                className={`${isActive ? 'bg-gray-50 text-gray-950' : 'cursor-grab bg-gray-950 text-gray-50'} rounded-full w-full h-[30px] px-[10px] py-[6px]  border-0 font-inter font-bold text-[14px] leading-[100%] focus:outline-none focus:bg-gray-400 focus:text-gray-50`}
              />

              {isActive ? (
                <IconButton
                  name="close"
                  aria-label="Remove block"
                  onClick={() => handleRemoveBlock(item.id)}
                  className="z-10 absolute right-2 top-1/2 -translate-y-1/2 size-[18px] border-0!"
                  draggable={false}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : isActive ? null : (
        <div
          className="h-4"
          onDragOver={handleDragOverList}
          onDragLeave={handleDragLeave}
          onDrop={(event) => handleDrop(event, 0)}
        />
      )}

      {isActive ? (
        <IconButton
          name="plusLarge"
          onClick={handleAdd}
          aria-label="Add block"
          className="cursor-pointer"
        />
      ) : null}
    </div>
  )
})
