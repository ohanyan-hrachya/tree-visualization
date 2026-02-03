import Plus from '@/assets/svgs/plus.svg?react'
import Close from '@/assets/svgs/close.svg?react'
import ArrowUp from '@/assets/svgs/arrow-up.svg?react'
import ArrowDown from '@/assets/svgs/arrow-down.svg?react'

type IProps = {
  className?: string
  name: 'plus' | 'plusLarge' | 'close' | 'arrowUp' | 'arrowDown'
  props?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

const ICON_BUTTON_STYLE = `cursor-pointer flex items-center justify-center rounded-full border-[2px] p-0 size-[24px]`

const ICON_MAP = {
  plus: <Plus />,
  plusLarge: <Plus />,
  close: <Close />,
  arrowUp: <ArrowUp />,
  arrowDown: <ArrowDown />,
}

const STYLE_FOR_PLUSE_ARROWS = `text-gray-950 hover:text-gray-50 bg-gray-50 hover:bg-gray-950 border-gray-950`

const STYLE_MAP = {
  plus: STYLE_FOR_PLUSE_ARROWS,
  plusLarge: `text-gray-50 hover:text-gray-950 bg-gray-950 hover:bg-gray-50 border-gray-50 hover:border-gray-950 w-[128px] h-[26px]`,
  close: 'text-red-600 hover:text-gray-50 bg-gray-50 hover:bg-red-600 border-gray-950',
  arrowUp: STYLE_FOR_PLUSE_ARROWS,
  arrowDown: STYLE_FOR_PLUSE_ARROWS,
}

const IconButton = ({ className, name, ...props }: IProps) => {
  return (
    <button
      type="button"
      className={`${className ?? ''} ${ICON_BUTTON_STYLE} ${STYLE_MAP[name] ?? ''}`}
      {...props}
    >
      {ICON_MAP[name]}
    </button>
  )
}

export default IconButton
