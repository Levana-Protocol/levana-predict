import { useState } from "react"
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Link,
  Modal,
  ModalDialog,
} from "@mui/joy"
import { Link as RouterLink } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"

import { stylesOnlyAt } from "@utils/styles"

const DISCLAIMER_URL = "https://static.levana.finance/legal/disclaimer.pdf"
const TERMS_ACCEPTED_KEY = "terms_accepted"
const TERMS_ACCEPTED_VALUE = "true"

interface DisclaimerFormValues {
  readTerms: boolean
  agreeTerms: boolean
}

const TermsDisclaimer = () => {
  const [accepted, setAccepted] = useState(
    localStorage.getItem(TERMS_ACCEPTED_KEY) === TERMS_ACCEPTED_VALUE,
  )

  const form = useForm<DisclaimerFormValues>({
    defaultValues: {
      readTerms: false,
      agreeTerms: false,
    },
  })

  const onSubmit = (formValues: DisclaimerFormValues) => {
    const readTerms = formValues.readTerms
    const agreeTerms = formValues.agreeTerms

    if (readTerms && agreeTerms) {
      localStorage.setItem(TERMS_ACCEPTED_KEY, TERMS_ACCEPTED_VALUE)
      setAccepted(true)
    } else {
      return Promise.reject()
    }
  }

  const canSubmit = form.formState.isValid

  return (
    <Modal open={!accepted}>
      <ModalDialog component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTitle sx={stylesOnlyAt("xs", { mb: 4 })}>
          Terms of Service
        </DialogTitle>

        <DialogContent>
          <Controller
            name="readTerms"
            control={form.control}
            rules={{
              required: "This field is required",
            }}
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error} sx={{ mb: 1 }}>
                <Checkbox
                  value={`${field.value}`}
                  onChange={(e) => {
                    field.onChange(e.currentTarget.checked)
                  }}
                  label={
                    <>
                      I have read the complete disclaimer in the terms of
                      service.
                    </>
                  }
                  variant="solid"
                />
                <Link
                  component={RouterLink}
                  to={DISCLAIMER_URL}
                  title="Disclaimer document"
                  aria-label="Open disclaimer document"
                  target="_blank"
                  rel="noreferrer"
                  sx={{ ml: 3.75 }}
                >
                  Read disclaimer
                </Link>
              </FormControl>
            )}
          />
          <Controller
            name="agreeTerms"
            control={form.control}
            rules={{
              required: "This field is required",
            }}
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error}>
                <Checkbox
                  value={`${field.value}`}
                  onChange={(e) => {
                    field.onChange(e.currentTarget.checked)
                  }}
                  label={
                    <>
                      I agree to the terms of service and I live in a country
                      where I'm allowed to participate in Prediction markets.
                    </>
                  }
                  variant="solid"
                />
              </FormControl>
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button
            type="submit"
            color="primary"
            size="lg"
            aria-label="Agree to the terms stated"
            disabled={!canSubmit}
          >
            Accept
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}

export { TermsDisclaimer }
