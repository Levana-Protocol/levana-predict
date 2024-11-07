import { Button, Checkbox, FormControl, Link } from "@mui/joy"
import { Link as RouterLink } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import NavigationModal, {
  NavigationModalDynamicItem,
} from "@levana-protocol/ui/NavigationModal"

const DISCLAIMER_URL = "https://static.levana.finance/legal/disclaimer.pdf"
export const TERMS_ACCEPTED_KEY = "terms_accepted"
export const TERMS_ACCEPTED_VALUE = "true"

interface DisclaimerFormValues {
  readTerms: boolean
  agreeTerms: boolean
}

const TermsDisclaimerModal = () => {
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
      return Promise.resolve()
    } else {
      return Promise.reject()
    }
  }

  const canSubmit = form.formState.isValid

  return (
    <NavigationModal rootId={TermsDisclaimerModal.name}>
      {(modal) => (
        <>
          <NavigationModalDynamicItem
            id={TermsDisclaimerModal.name}
            title="Terms of Service"
            canClose={false}
          >
            <form
              onSubmit={form.handleSubmit((values) =>
                onSubmit(values)?.then(() => modal.close()),
              )}
            >
              <Controller
                name="readTerms"
                control={form.control}
                rules={{
                  required: "This field is required",
                }}
                render={({ field, fieldState }) => (
                  <FormControl error={!!fieldState.error} sx={{ mb: 1 }}>
                    <Checkbox
                      size="sm"
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
                      sx={{ ml: 3 }}
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
                      size="sm"
                      value={`${field.value}`}
                      onChange={(e) => {
                        field.onChange(e.currentTarget.checked)
                      }}
                      label={
                        <>
                          I agree to the terms of service and I live in a
                          country where I'm allowed to participate in Prediction
                          markets.
                        </>
                      }
                      variant="solid"
                    />
                  </FormControl>
                )}
              />

              <Button
                type="submit"
                color="primary"
                size="lg"
                aria-label="Agree to the terms stated"
                disabled={!canSubmit}
                fullWidth
                sx={{ mt: 3 }}
              >
                Accept
              </Button>
            </form>
          </NavigationModalDynamicItem>
        </>
      )}
    </NavigationModal>
  )
}

export { TermsDisclaimerModal }
