import { Link } from "react-router-dom"
import { IconButton, Typography, type TypographyProps } from "@mui/joy"

import { ArrowBackIcon } from "@assets/icons/ArrowBack"
import { mergeSx, stylesUpTo } from "@utils/styles"

interface PageTitleProps extends TypographyProps {
  backTo?: { route: string; name: string }
}

const PageTitle = (props: PageTitleProps) => {
  const { backTo, ...typographyProps } = props

  return (
    <Typography
      level="h1"
      {...typographyProps}
      sx={mergeSx(
        { mb: 1 },
        stylesUpTo("sm", { flexDirection: "column", alignItems: "flex-start" }),
        typographyProps.sx,
      )}
      {...(backTo && {
        startDecorator: (
          <Link to={backTo.route} aria-label={`Back to ${backTo.name}`}>
            <IconButton variant="outlined" size="lg">
              <ArrowBackIcon />
            </IconButton>
          </Link>
        ),
      })}
    />
  )
}

export { PageTitle, type PageTitleProps }
