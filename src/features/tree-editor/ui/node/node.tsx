import type { DragEvent } from 'react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import {
  useAddNode,
  useMoveBlock,
  useRemoveNode,
  useRenameNode,
  useToggleOpened,
} from '@/entities/tree'
import { Blocks } from '@/features/tree-editor'
import { IconButton } from '@/shared/ui'

import {
  CLOSE_STYLE,
  DROP_ACTIVE_STYLE,
  INPUT_STYLE,
  NODE_CARD_STYLE,
  PLUS_STYLE,
  STACK_STYLE,
} from './node.constants'
import type { DragPayload, NodeCardProps } from './node.types'

export const Node = memo(({ node, setSelect }: NodeCardProps) => {
  const onAddChild = useAddNode()
  const onRename = useRenameNode()
  const onToggleOpened = useToggleOpened()
  const onDelete = useRemoveNode()
  const onMoveBlock = useMoveBlock()
  const [isActive, setIsActive] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const nodeId = node.id
  const isOpened = node.isOpened
  const showCollapse = node.hasChildren

  const setActive = useCallback(
    (next: boolean) => {
      setIsActive(next)
      setSelect(next)
    },
    [setSelect, setIsActive]
  )

  useEffect(() => {
    if (!isActive) return

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && event?.target && !cardRef.current?.contains(event.target as Node)) {
        setActive(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!onMoveBlock || !nodeId) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setIsDragOver(true)
    },
    [onMoveBlock, nodeId]
  )

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!onMoveBlock || !nodeId) return
      event.preventDefault()
      setIsDragOver(false)

      const payload = event.dataTransfer.getData('application/x-tree-block')
      if (!payload) return

      try {
        const data = JSON.parse(payload) as DragPayload
        if (!data.blockId || !data.fromNodeId) return
        if (data.fromNodeId === nodeId) return
        onMoveBlock(data.fromNodeId, nodeId, data.blockId)
      } catch {
        return
      }
    },
    [onMoveBlock, nodeId]
  )

  const handleNameChange = useDebouncedCallback((value: string) => {
    onRename(nodeId, value)
  }, 180)

  return (
    <div
      ref={cardRef}
      className={`${NODE_CARD_STYLE} ${isActive ? 'bg-gray-950!' : ''}`}
      onClick={() => {
        setActive(true)
      }}
    >
      {showCollapse && !isOpened ? (
        <>
          <div className={`${STACK_STYLE} translate-y-[7px] z-[-1]`} />
          <div className={`${STACK_STYLE} translate-y-[12px] z-[-2]`} />
        </>
      ) : null}
      {showCollapse ? (
        <IconButton
          name={isOpened ? 'arrowUp' : 'arrowDown'}
          className={PLUS_STYLE}
          onClick={(event) => {
            event.stopPropagation()
            onToggleOpened(nodeId)
          }}
          aria-label={isOpened ? 'Collapse node' : 'Expand node'}
        />
      ) : null}

      <input
        type="text"
        defaultValue={node.label}
        onChange={(event) => handleNameChange(event.target.value)}
        className={`${INPUT_STYLE} ${isActive ? 'text-gray-50!' : ''}`}
      />

      <div
        className={`${isDragOver ? DROP_ACTIVE_STYLE : ''} ${!isActive && node.blocks?.length === 0 ? 'absolute z-20 left-0 top-0 w-full h-full' : ''} rounded-md min-h-[12px]`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Blocks node={node} isActive={isActive} onMove={onMoveBlock} />
      </div>

      {nodeId !== 'root' && node?.parentId && node?.isFirst ? (
        <div className="w-full h-[50px] absolute top-[-55px] left-0">
          <IconButton
            name="plus"
            className={`${PLUS_STYLE} bottom-[100%]! mb-[-30px]!`}
            onClick={(event) => {
              event.stopPropagation()
              onAddChild(node.parentId!)
            }}
            aria-label="Add child"
          />
        </div>
      ) : null}

      {!showCollapse && !isActive ? (
        <IconButton
          name="plus"
          className={PLUS_STYLE}
          onClick={(event) => {
            event.stopPropagation()
            onAddChild(nodeId)
          }}
          aria-label="Add child"
        />
      ) : null}

      {nodeId !== 'root' && isActive ? (
        <IconButton
          name="close"
          className={CLOSE_STYLE}
          onClick={(event) => {
            event.stopPropagation()
            onDelete(node.id)
          }}
          aria-label="Delete node"
        />
      ) : null}
    </div>
  )
})
