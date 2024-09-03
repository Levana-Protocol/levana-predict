import { Stack } from '@mui/joy'

import { LevanaIcon } from './LevanaIcon'
import { PredictName } from './PredictName'

const PredictLogo = () => {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <LevanaIcon />
      <PredictName sx={{ color: "text.primary" }} />
    </Stack>
  )
}

export { PredictLogo }
