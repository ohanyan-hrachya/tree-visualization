import { IconButton, NodeCard } from '@/shared/ui'

function App() {
  return (
    <>
      <IconButton name="plus" />
      <IconButton name="plusLarge" />
      <IconButton name="close" />
      <IconButton name="arrowUp" />
      <IconButton name="arrowDown" />
      <hr className="my-5" />
      <NodeCard />
    </>
  )
}

export default App
