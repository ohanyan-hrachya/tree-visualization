import type { TreeLineProps } from './line.types'

export const Line = ({
  from,
  to,
  stroke = '#0f172a',
  strokeWidth = 2,
  radius = 8,
  className,
}: TreeLineProps) => {
  const midY = (from.y + to.y) / 2
  const deltaX = to.x - from.x
  const deltaY1 = midY - from.y
  const deltaY2 = to.y - midY

  const r = Math.max(
    0,
    Math.min(radius, Math.abs(deltaX) / 2, Math.abs(deltaY1), Math.abs(deltaY2))
  )

  if (r === 0) {
    const d = `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`
    return (
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      />
    )
  }

  const dirX = deltaX >= 0 ? 1 : -1
  const dirY1 = deltaY1 >= 0 ? 1 : -1
  const dirY2 = deltaY2 >= 0 ? 1 : -1

  const d = [
    `M ${from.x} ${from.y}`,
    `L ${from.x} ${midY - dirY1 * r}`,
    `Q ${from.x} ${midY} ${from.x + dirX * r} ${midY}`,
    `L ${to.x - dirX * r} ${midY}`,
    `Q ${to.x} ${midY} ${to.x} ${midY + dirY2 * r}`,
    `L ${to.x} ${to.y}`,
  ].join(' ')

  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    />
  )
}
