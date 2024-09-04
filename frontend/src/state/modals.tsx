import { PropsWithChildren, ReactNode } from 'react'
import { Modal } from '@mui/joy'
import { Store, useStore } from '@tanstack/react-store'

type ModalData = { key: string, dialog: ReactNode }

const modalsStore = new Store<ModalData[]>([])

const present = (key: string, dialog: ReactNode) => {
  modalsStore.setState(_state => {
    const modals = [..._state]
    const index = modals.findIndex(modal => modal.key === key)

    if (index >= 0) {
      const modal = modals.splice(index, 1)[0]
      modal.dialog = dialog

      return [modal, ...modals]
    } else {
      const modal = { key, dialog }
      return [modal, ...modals]
    }
  })
}

const dismiss = (key: string) => {
  modalsStore.setState(_state => {
    const modals = [..._state]
    const index = modals.findIndex(modal => modal.key === key)

    if (index >= 0) {
      modals.splice(index, 1)[0]
    }

    return modals
  })
}

const ModalsProvider = (props: PropsWithChildren) => {
  const { children } = props
  const modals = useStore(modalsStore)

  return (
    <>
      {children}

      {modals.map(modal =>
        <Modal
          key={modal.key}
          open={true}
          onClose={() => { dismiss(modal.key) }}
        >
          <>{modal.dialog}</>
        </Modal>
      )}
    </>
  )
}

export { ModalsProvider, present, dismiss }
