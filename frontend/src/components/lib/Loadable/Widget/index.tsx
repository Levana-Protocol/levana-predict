import { ReactNode } from 'react'
import { SxProps } from '@mui/system'
import { Sheet, Skeleton, Theme } from '@mui/joy'

import { mergeSx } from '@utils/styles'
import { ErrorSkeleton } from '@lib/Error/Skeleton'
import { LoadableComponent } from '..'

interface LoadableWidgetProps<T> {
  useDeps: () => T,
  renderContent: (deps: T) => ReactNode,
  placeholderContent: ReactNode,
  sx?: SxProps<Theme>,
}

const LoadableWidget = <T,>(props: LoadableWidgetProps<T>) => {
  const { useDeps, renderContent, placeholderContent, sx } = props

  return (
    <LoadableComponent
      useDeps={useDeps}
      renderContent={(deps) =>
        <Sheet sx={mergeSx({ p: 3, height: "100%" }, sx)}>
          {renderContent(deps)}
        </Sheet>
      }
      loadingFallback={
        <Skeleton
          variant="rectangular"
          sx={mergeSx({ p: 3, height: "100%" }, sx)}
        >
          {placeholderContent}
        </Skeleton>
      }
      errorFallback={
        <ErrorSkeleton
          sx={mergeSx({ p: 3, height: "100%" }, sx)}
          placeholderContent={placeholderContent}
        />
      }
    />
  )
}

export { LoadableWidget, type LoadableWidgetProps }
