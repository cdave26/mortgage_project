import device from '~/store/device/type'

const initialState = {
  ip: null,
  trusted: false,
}

export default (state = initialState, {type, payload}) => {
  switch (type) {
    case device.trusted:
      return {
        ...state,
        ...payload,
      }
    default:
      return state
  }
}
