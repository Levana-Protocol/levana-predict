import { useMemo } from 'react'
import jdenticon from 'jdenticon/standalone'
import { Avatar, AvatarProps, Box } from '@mui/joy'

interface WalletAvatarProps extends Omit<AvatarProps, "children"> {
  address: string,
}

const WalletAvatar = (props: WalletAvatarProps) => {
  const { address, ...avatarProps } = props

  const svg = useMemo(() => {
    return jdenticon.toSvg(
      address,
      100,
      { hues: [7, 29, 148, 234, 277] },
    )
  }, [address])

  return (
    <Avatar size="sm" {...avatarProps}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          "& > svg": {
            width: "100%",
            height: "100%",
          },
        }}
        dangerouslySetInnerHTML={{
          __html: svg,
        }}
      />
    </Avatar>
  )
}

export { WalletAvatar, type WalletAvatarProps }
