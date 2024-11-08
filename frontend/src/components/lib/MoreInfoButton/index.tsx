import { IconButton, type IconButtonProps, Typography } from "@mui/joy"
import NavigationModal, {
  NavigationModalDynamicItem,
} from "@levana-protocol/ui/NavigationModal"
import { useModal } from "@levana-protocol/utils/modal"

import { QuestionMarkIcon } from "@assets/icons/QuestionMark"
import { mergeSx } from "@utils/styles"

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
  const { present } = useModal()

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
        present(<MoreInfoModal title={infoTitle} content={infoContent} />)
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

const MoreInfoModal = (props: MoreInfoModalProps) => {
  const { title, content } = props

  return (
    <NavigationModal rootId={MoreInfoModal.name}>
      {() => (
        <>
          <NavigationModalDynamicItem
            id={MoreInfoModal.name}
            title={title}
            canClose
          >
            <Typography
              level="body-md"
              textColor="text.primary"
              textAlign="center"
            >
              {content}
            </Typography>
          </NavigationModalDynamicItem>
        </>
      )}
    </NavigationModal>
  )
}

export { MoreInfoButton, type MoreInfoButtonProps }
