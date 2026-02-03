export type Point = {
  x: number
  y: number
}

export type TreeLineProps = {
  from: Point
  to: Point
  stroke?: string
  strokeWidth?: number
  radius?: number
  className?: string
}
