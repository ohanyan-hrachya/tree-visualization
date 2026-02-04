import ArrowDown from '@/shared/assets/icons/arrow-down.svg?react'
import ArrowUp from '@/shared/assets/icons/arrow-up.svg?react'
import Close from '@/shared/assets/icons/close.svg?react'
import Plus from '@/shared/assets/icons/plus.svg?react'

import { ICON_BUTTON_STYLE, STYLE_MAP } from './icon-button.constants'
import type { IconButtonProps } from './icon-button.types'

const ICON_MAP = {
  plus: <Plus />,
  plusLarge: <Plus />,
  close: <Close />,
  arrowUp: <ArrowUp />,
  arrowDown: <ArrowDown />,
}

const IconButton = ({ className, name, ...props }: IconButtonProps) => (
  <button
    type="button"
    className={`${className ?? ''} ${ICON_BUTTON_STYLE} ${STYLE_MAP[name] ?? ''}`}
    {...props}
  >
    {ICON_MAP[name]}
  </button>
)

export default IconButton
