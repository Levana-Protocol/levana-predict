import { Stack } from "@mui/joy"

import { LevanaIcon } from "./LevanaIcon"
import { LevanaName } from "./LevanaName"

const LevanaLogo = () => {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <LevanaIcon />
      <LevanaName sx={{ color: "text.primary" }} />
    </Stack>
  )
}

export { LevanaLogo }
