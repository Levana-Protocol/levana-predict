import {
  DialogContent,
  DialogTitle,
  IconButton,
  type IconButtonProps,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy"

import { QuestionMarkIcon } from "@assets/icons/QuestionMark"
import { mergeSx } from "@utils/styles"
import { dismiss, present } from "@state/modals"

interface MoreInfoButtonProps
  extends Omit<IconButtonProps, "children" | "onClick"> {
  infoTitle?: string
  infoContent: string
}

/**
 * An info button that displays an explanation dialog with the given text when clicked.
 *
 * @param infoTitle The title for the dialog displayed on click
 * @param infoContent The description for the dialog displayed on click
 * @returns
 */
const MoreInfoButton = (props: MoreInfoButtonProps) => {
  const { infoTitle, infoContent, ...iconButtonProps } = props

  return (
    <IconButton
      color="neutral"
      variant="soft"
      aria-label={`More info about ${infoTitle}`}
      {...iconButtonProps}
      sx={mergeSx(
        {
          "--IconButton-size": "1rem",
          paddingInline: 0,
        },
        iconButtonProps.sx,
      )}
      onClick={() => {
        presentMoreInfoModal({ title: infoTitle, content: infoContent })
      }}
    >
      <QuestionMarkIcon />
    </IconButton>
  )
}

interface MoreInfoModalProps {
  title?: string
  content: string
}

const MORE_INFO_MODAL_KEY = "more_info_modal" as const

const presentMoreInfoModal = (props: MoreInfoModalProps) => {
  present(MORE_INFO_MODAL_KEY, <MoreInfoModal {...props} />)
}

const dismissMoreInfoModal = () => {
  dismiss(MORE_INFO_MODAL_KEY)
}

const MoreInfoModal = (props: MoreInfoModalProps) => {
  const { title, content } = props

  return (
    <ModalDialog size="lg" sx={{ pt: { sm: 6 } }}>
      <ModalClose color="neutral" variant="outlined" aria-label="Close" />
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography level="body-md" textColor="text.primary">
          {content}
        </Typography>
      </DialogContent>
    </ModalDialog>
  )
}

export {
  MoreInfoButton,
  type MoreInfoButtonProps,
  presentMoreInfoModal,
  dismissMoreInfoModal,
}
