import { FieldValues, UseFormReturn } from 'react-hook-form'

/**
 * Utility to get the latest values in a form. Helpful when a field's state changes after the render cycle.
 * Note: unchanged (and even unregistered) fields will return their default values.
 *
 * @see https://github.com/react-hook-form/react-hook-form/issues/6548
 * @see https://github.com/react-hook-form/react-hook-form/issues/6482
 */
const useLatestFormValues = <T extends FieldValues>(form: UseFormReturn<T>) => {
  return {
    ...form.watch(), // This causes a re-render when a field input changes by a direct action, but fields can change afterwards
    ...form.getValues(), // This gets the absolute latest values, but alone wouldn't cause a re-render
  }
}

export { useLatestFormValues }
