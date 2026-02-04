import { lazy, Suspense } from 'react'

const Editor = lazy(() =>
  import('@/features/tree-editor').then((module) => ({ default: module.Editor }))
)

function App() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen w-full text-slate-900">
          <div className="flex w-full flex-col px-6 py-6">
            <div className="h-[calc(100vh-32px)] w-full rounded-xl border border-slate-300 bg-transparent" />
          </div>
        </main>
      }
    >
      <Editor />
    </Suspense>
  )
}

export default App
