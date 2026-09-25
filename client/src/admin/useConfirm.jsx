import { useCallback, useState } from 'react';
import ConfirmModal from './ConfirmModal.jsx';

// Promise-based, so call sites read almost exactly like the old
// window.confirm() they're replacing:
//   const { confirm, modal } = useConfirm();
//   if (await confirm({ title: '...', message: '...', danger: true })) { ... }
//   return <div>...{modal}</div>;
export function useConfirm() {
  const [state, setState] = useState(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  function handleConfirm() {
    state?.resolve(true);
    setState(null);
  }

  function handleCancel() {
    state?.resolve(false);
    setState(null);
  }

  const modal = (
    <ConfirmModal
      open={!!state}
      title={state?.title}
      message={state?.message}
      confirmLabel={state?.confirmLabel}
      cancelLabel={state?.cancelLabel}
      danger={state?.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, modal };
}
