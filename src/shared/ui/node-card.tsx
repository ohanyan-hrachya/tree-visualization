import { useEffect, useRef, useState } from 'react'
import { Blocks, IconButton } from '@/shared/ui'

const NODE_CARD_STYLE = `relative group max-w-[152px] min-h-[64px] h-max border-[2px] border-gray-950 rounded-lg py-[14px] px-[12px] bg-gray-50`
const INPUT_STYLE = `rounded-lg w-full px-[2px] py-[4px] mb-[10px] text-gray-950 border-0 font-inter font-bold text-[15px] leading-[100%] focus:outline-none focus:bg-gray-400 `
const PLUS_STYLE = `absolute bottom-[-12px] left-[50%] translate-x-[-50%] hidden group-hover:flex`
const CLOSE_STYLE = `absolute top-[-12px] right-[-12px]`

export const NodeCard = () => {
  const [isActive, setIsActive] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isActive) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        cardRef.current &&
        event.target instanceof Node &&
        !cardRef.current.contains(event.target)
      ) {
        setIsActive(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isActive])

  return (
    <div
      ref={cardRef}
      className={`${NODE_CARD_STYLE} ${isActive ? 'bg-gray-950!' : ''}`}
      onClick={() => setIsActive(true)}
    >
      <input
        type="text"
        className={`${INPUT_STYLE} ${isActive ? 'text-gray-50!' : ''}`}
        defaultValue="Page"
      />

      {isActive ? <Blocks /> : <IconButton name="plus" className={PLUS_STYLE} />}

      <IconButton name="close" className={`${CLOSE_STYLE} ${isActive ? 'flex' : 'hidden'}`} />
    </div>
  )
}

export default NodeCard
