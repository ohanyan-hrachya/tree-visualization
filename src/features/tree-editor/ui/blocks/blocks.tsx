import type { DragEvent, ChangeEvent } from 'react'
import { useState } from 'react'
import { IconButton } from '@/shared/ui'
import type { BlocksProps } from './blocks.types'

export const Blocks = ({
  items = [],
  isActive = false,
  onAdd,
  onRemove,
  onRename,
  onMove,
  dragContextId,
  className,
}: BlocksProps) => {
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const handleDragStart = (event: DragEvent<HTMLLIElement>, blockId: string) => {
    if (!dragContextId) return
    event.dataTransfer.setData(
      'application/x-tree-block',
      JSON.stringify({ blockId, fromNodeId: dragContextId })
    )
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>, blockId: string) => {
    onRename?.(blockId, event.currentTarget.value)
  }

  const handleDragOverItem = (event: DragEvent<HTMLLIElement>, index: number) => {
    if (!dragContextId || !onMove) return
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'move'
    setDropIndex(index)
  }

  const handleDragOverList = (event: DragEvent<HTMLUListElement | HTMLDivElement>) => {
    if (!dragContextId || !onMove) return
    if (event.target !== event.currentTarget) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropIndex(items.length)
  }

  const handleDragLeave = () => {
    setDropIndex(null)
  }

  const handleDrop = (event: DragEvent<HTMLElement>, index?: number) => {
    if (!dragContextId || !onMove) return
    event.preventDefault()
    event.stopPropagation()
    setDropIndex(null)

    const payload = event.dataTransfer.getData('application/x-tree-block')
    if (!payload) return

    try {
      const data = JSON.parse(payload) as { blockId: string; fromNodeId: string }
      if (!data.blockId || !data.fromNodeId) return
      onMove(data.fromNodeId, dragContextId, data.blockId, index)
    } catch {
      return
    }
  }

  return (
    <div className={`flex w-full flex-col gap-2 ${className ?? ''}`}>
      {items.length > 0 ? (
        <ul
          className="flex flex-col gap-1"
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
              draggable={Boolean(dragContextId)}
              onDragStart={(event) => handleDragStart(event, item.id)}
              onDragOver={(event) => handleDragOverItem(event, index)}
              onDrop={(event) => handleDrop(event, index)}
              className={`relative flex items-center justify-between gap-2 rounded-full bg-gray-950 px-0 py-[2px] text-[10px] font-semibold text-gray-50 cursor-grab ${
                dropIndex === index ? 'outline outline-1 outline-gray-200' : ''
              }`}
            >
              <input
                type="text"
                value={item.name}
                onChange={(event) => handleNameChange(event, item.id)}
                readOnly={!isActive}
                draggable={false}
                className={`rounded-full w-full px-[10px] py-[6px] text-gray-50 border-0 font-inter font-bold text-[14px] leading-[100%] focus:outline-none focus:bg-gray-400`}
              />
              {isActive ? (
                <IconButton
                  name="close"
                  onClick={() => onRemove?.(item.id)}
                  className="z-10 absolute right-2 top-1/2 -translate-y-1/2 size-[18px] border-0!"
                  draggable={false}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
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
          onClick={onAdd}
          aria-label="Add block"
          className="cursor-pointer"
        />
      ) : null}
    </div>
  )
}
