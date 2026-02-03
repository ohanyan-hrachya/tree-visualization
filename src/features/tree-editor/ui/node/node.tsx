import type { DragEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Blocks } from '@/features/tree-editor'
import { IconButton } from '@/shared/ui'

import type { DragPayload, NodeCardProps } from './node.types'
import {
  CLOSE_STYLE,
  DROP_ACTIVE_STYLE,
  INPUT_STYLE,
  LINE_PLUS_STYLE,
  NODE_CARD_STYLE,
  PLUS_STYLE,
  STACK_STYLE,
} from './node.constants'

export const Node = ({
  nodeId,
  isActive,
  onActiveChange,
  onClick,
  className,
  style,
  inputProps,
  canAddChild = true,
  onAddChild,
  canDelete = true,
  onDelete,
  canCollapse = false,
  isExpanded = true,
  onToggleExpand,
  blocks = [],
  onAddBlock,
  onRemoveBlock,
  onRenameBlock,
  onMoveBlock,
}: NodeCardProps) => {
  const [internalActive, setInternalActive] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const active = isActive ?? internalActive
  const isControlled = isActive !== undefined

  const setActive = (next: boolean) => {
    if (!isControlled) {
      setInternalActive(next)
    }
    onActiveChange?.(next)
  }

  useEffect(() => {
    if (!active) return

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
  }, [active])

  const {
    className: inputClassName,
    defaultValue: inputDefaultValue,
    value: inputValue,
    ...restInputProps
  } = inputProps ?? {}

  const inputControlProps =
    inputValue !== undefined ? { value: inputValue } : { defaultValue: inputDefaultValue ?? 'Page' }

  const showInactiveAdd = canAddChild && !active
  const showDelete = canDelete && active
  const showCollapse = canCollapse
  const showLinePlus = showInactiveAdd && showCollapse
  const showCollapsedStack = showCollapse && !isExpanded

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!onMoveBlock || !nodeId) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
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
  }

  return (
    <div
      ref={cardRef}
      style={style}
      className={`${NODE_CARD_STYLE} ${active ? 'bg-gray-950!' : ''} ${className ?? ''}`}
      onClick={(event) => {
        setActive(true)
        onClick?.(event)
      }}
    >
      {showCollapsedStack ? (
        <>
          <div className={`${STACK_STYLE} translate-y-[4px] z-[-1]`} />
          <div className={`${STACK_STYLE} translate-y-[8px] z-[-2]`} />
        </>
      ) : null}
      {showCollapse ? (
        <IconButton
          name={isExpanded ? 'arrowUp' : 'arrowDown'}
          className={PLUS_STYLE}
          onClick={(event) => {
            event.stopPropagation()
            onToggleExpand?.()
          }}
          aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
        />
      ) : null}

      <input
        type="text"
        {...restInputProps}
        {...inputControlProps}
        className={`${INPUT_STYLE} ${active ? 'text-gray-50!' : ''} ${inputClassName ?? ''}`}
      />

      <div
        className={`${isDragOver ? DROP_ACTIVE_STYLE : ''} rounded-md min-h-[12px]`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Blocks
          items={blocks}
          isActive={active}
          onAdd={onAddBlock}
          onRemove={onRemoveBlock}
          onRename={onRenameBlock}
          onMove={onMoveBlock}
          dragContextId={nodeId}
        />
      </div>

      {showInactiveAdd ? (
        <IconButton
          name="plus"
          className={showLinePlus ? LINE_PLUS_STYLE : PLUS_STYLE}
          onClick={(event) => {
            event.stopPropagation()
            onAddChild?.()
          }}
          aria-label="Add child"
        />
      ) : null}

      {showDelete ? (
        <IconButton
          name="close"
          className={CLOSE_STYLE}
          onClick={(event) => {
            event.stopPropagation()
            onDelete?.()
          }}
          aria-label="Delete node"
        />
      ) : null}
    </div>
  )
}
