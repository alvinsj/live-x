export const addAndRemoveEventListener = (
  eventTarget: EventTarget,
  eventName: string,
  fn: EventListener,
  shouldRemove?: (...args: any[]) => boolean,
  done?: (...args: any[]) => void
) => {
  const listener: EventListener = (...args) => {
    fn(...args)

    if (shouldRemove ? shouldRemove(...args) : true) {
      eventTarget.removeEventListener(eventName, listener)
      if (done) done(...args)
    }
  }

  if (eventTarget) eventTarget.addEventListener(eventName, listener)
}

const addEventListenerOnce = (
  eventTarget: EventTarget,
  eventName: string,
  fn: EventListener,
  done?: (...args: any[]) => void
) => addAndRemoveEventListener(eventTarget, eventName, fn, undefined, done)
export default addEventListenerOnce
