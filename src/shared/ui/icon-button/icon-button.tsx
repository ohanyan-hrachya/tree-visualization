import Plus from '@/shared/assets/icons/plus.svg?react'
import Close from '@/shared/assets/icons/close.svg?react'
import ArrowUp from '@/shared/assets/icons/arrow-up.svg?react'
import ArrowDown from '@/shared/assets/icons/arrow-down.svg?react'

import type { IconButtonProps } from './icon-button.types'
import { ICON_BUTTON_STYLE, STYLE_MAP } from './icon-button.constants'

const ICON_MAP = {
  plus: <Plus />,
  plusLarge: <Plus />,
  close: <Close />,
  arrowUp: <ArrowUp />,
  arrowDown: <ArrowDown />,
}

const IconButton = ({ className, name, ...props }: IconButtonProps) => {
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
