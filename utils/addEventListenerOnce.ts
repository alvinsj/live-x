/* eslint-disable @typescript-eslint/no-explicit-any */
// FIXME fix WebSocket Event types

export const addEventListenerOnce = (
  eventTarget: EventTarget,
  eventName: string,
  fn: (evt: any) => void,
  shouldRemove?: (...args: any[]) => boolean,
  done?: (...args: any[]) => void
): void => {
  const listener: EventListener = (...args) => {
    fn(...args)

    if (shouldRemove ? shouldRemove(...args) : true) {
      eventTarget.removeEventListener(eventName, listener)
      if (done) done(...args)
    }
  }

  if (eventTarget) eventTarget.addEventListener(eventName, listener)
}

export const addErrorListenerOnce = (
  eventTarget: EventTarget,
  eventName: string,
  fn: (evt: any) => void
): void => addEventListenerOnce(eventTarget, eventName, fn, () => true)

export default addEventListenerOnce
