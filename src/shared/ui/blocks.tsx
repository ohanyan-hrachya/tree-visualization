// import { useState } from 'react'
import { IconButton } from '@/shared/ui'

const Blocks = () => {
  //   const [blocks, setBlocks] = useState<string[]>([])

  return (
    <div className="w-full flex flex-col gap-2">
      {/* {blocks.map((block, index) => (
            <div key={index} className="w-full p-2 bg-gray-200 rounded">
                {block}
            </div>
        ))} */}
      <IconButton name="plusLarge" />
    </div>
  )
}

export default Blocks
