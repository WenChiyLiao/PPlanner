import { createSlice } from "@reduxjs/toolkit"
import { getData, getFsData } from "../../firebase/Config"

export const userSlice = createSlice({
  name: "user",
  initialState: {
    id: "MEvVXSW1Yxkz154mO8lL",
    name: "",
    email: "test",
    picture: "",
    projects: ["mG06SIS2LbvuKWOXdNSE"],
  },
  reducers: {
    getUserData: (state, action) => {
      getFsData("users", "id", "==", action.payload.user_id).then((user) => {
        state = user
      })
    },
  },
})

export const { getUserData } = userSlice.actions

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
// export const incrementAsync = (amount) => (dispatch) => {
//   setTimeout(() => {
//     dispatch(incrementByAmount(amount))
//   }, 1000)
// }

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.user.value)`
// export const selectCount = (state) => state.user.value

export default userSlice.reducer