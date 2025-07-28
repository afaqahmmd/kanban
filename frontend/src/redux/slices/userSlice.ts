import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";

// Load initial auth state from localStorage
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

interface UserState {
  users: User[];
  currentUser?: User | null;
  token: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: user ? JSON.parse(user) : null,
  token: token || null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // list of users (for search/filter)
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    authSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      // store to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setUsers,setCurrentUser, addUser, authSuccess, logout } = userSlice.actions;

export default userSlice.reducer;
