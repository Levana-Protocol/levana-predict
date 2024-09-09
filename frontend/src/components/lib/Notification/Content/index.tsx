import { forwardRef } from 'react'
import { match } from 'ts-pattern'
import { Box, IconButton, Sheet, Stack, Typography } from '@mui/joy'
import { CustomContentProps, SnackbarContent } from 'notistack'

import { CloseIcon } from '@assets/icons/Close'
import { SuccessNotificationIcon } from '@assets/icons/SuccessNotification'
import { WarningNotificationIcon } from '@assets/icons/WarningNotification'
import { ErrorNotificationIcon } from '@assets/icons/ErrorNotification'
import { useNotifications } from '@config/notifications'
import { useScreenSmallerThan } from '@utils/styles'

interface NotificationContentProps extends CustomContentProps {
  extraInfo?: string,
}

const NotificationContent = forwardRef<HTMLDivElement, NotificationContentProps>((props, ref) => {
  const { id, message, variant, action, extraInfo } = props
  const notifications = useNotifications()
  const isSmallScreen = useScreenSmallerThan("md")

  return (
    <Box
      component={SnackbarContent}
      ref={ref}
      role="alert"
      sx={{
        width: { xs: "100%", sm: "unset" },
        maxWidth: { sm: "25rem", md: "30rem", lg: "35rem" },
      }}
    >
      <Sheet
        sx={{
          pl: 2,
          pr: 2.25,
          py: 1.5,
          backgroundColor: (theme) => theme.palette.background.level3,
          width: "100%",
        }}
      >
        <Stack direction="row" alignItems="center" columnGap={1.5}>
          {match(variant)
            .with("success", () => <SuccessNotificationIcon sx={{ fontSize: "3.25rem" }} />)
            .with("warning", () => <WarningNotificationIcon sx={{ fontSize: "3.25rem" }} />)
            .with("error", () => <ErrorNotificationIcon sx={{ fontSize: "3.25rem" }} />)
            .exhaustive()
          }

          <Box>
            <Typography
              level={isSmallScreen ? "title-md" : "title-lg" }
              fontWeight={600}
              overflow="auto"
              textColor="text.primary"
              sx={{ maxHeight: "3rem" }}
            >
              {message}
            </Typography>

            {extraInfo &&
              <Typography
                level={isSmallScreen ? "body-sm" : "body-md" }
                fontWeight={500}
                overflow="auto"
                textColor="text.secondary"
                sx={{ maxHeight: "8rem" }}
              >
                {extraInfo}
              </Typography>
            }

            {typeof action === "function" ? action(id) : action}
          </Box>
        </Stack>
      </Sheet>

      <Box>
        <IconButton
          color="neutral"
          variant="soft"
          aria-label="Close notification"
          sx={{
            "--IconButton-size": "1.2rem",
            paddingInline: 0,
            position: "absolute",
            top: { xs: "calc(-0.4 * var(--IconButton-size))", sm: "calc(-0.9 * var(--IconButton-size))" },
            right: { xs: "calc(-0.4 * var(--IconButton-size))", sm: "calc(-1 * var(--IconButton-size))" },
          }}
          onClick={() => notifications.dismiss(id)}
        >
          <CloseIcon fontSize="xs" />
        </IconButton>
      </Box>
    </Box>
  )
})

export { NotificationContent }
