import { ReactNode, Suspense } from "react"
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithFallback,
} from "react-error-boundary"

interface LoadableComponentProps<T> {
  useDeps: () => T
  renderContent: (deps: T) => ReactNode
  loadingFallback?: ReactNode
  errorFallback?: ErrorBoundaryPropsWithFallback["fallback"]
}

const LoadableComponent = <T,>(props: LoadableComponentProps<T>) => {
  const { useDeps, renderContent, loadingFallback, errorFallback } = props

  return (
    <ErrorBoundary fallback={errorFallback ?? <></>}>
      <Suspense fallback={loadingFallback ?? <></>}>
        <LoadableComponentInner
          useDeps={useDeps}
          renderContent={renderContent}
        />
      </Suspense>
    </ErrorBoundary>
  )
}

const LoadableComponentInner = <T,>(
  props: Pick<LoadableComponentProps<T>, "useDeps" | "renderContent">,
) => {
  const { useDeps, renderContent } = props
  const deps = useDeps()

  return renderContent(deps)
}

export { LoadableComponent, type LoadableComponentProps }
