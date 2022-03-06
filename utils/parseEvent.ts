const parseEvent = (event: MessageEvent) => {
  let msg
  try {
    msg = JSON.parse(event.data)
  } catch (e) {
    throw new Error('Invalid JSON')
  }
  return msg
}
export default parseEvent
