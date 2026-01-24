import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode'; 

const token = localStorage.getItem("speak_token");

const decodeToken = (token) => {
  if (token) {
    try {
      return jwtDecode(token);
    } catch (e) {
      console.error('Invalid token:', e);
      localStorage.removeItem('speak_token');
      return null;
    }
  }
  return null;
};

const initialState = {
  token: token || null,
  user: decodeToken(token), 
  isError: false,
  isLoading: false, 
  message: "",
};

// signup
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        userData
      );
      toast.success("Account created successfully");
      return response.data;
    } catch (error) {
      toast.error("Registration falied")
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Signin
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        userData
      );

      if (response.data) {
        localStorage.setItem("speak_token", response.data.token);
      }
      toast.success("Login successfully");
      return response.data;
    } catch (error) {
      toast.error("Login faliled")
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/profile/update`,
        profileData,
        config
      );

      if (response.data) {
        localStorage.setItem('speak_token', response.data.token);
      }
      toast.success("Profile updated successfully!")
      return response.data; 
    } catch (error) {
      toast.error("Profile updation failed")
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Logout
    logout: (state) => {
      localStorage.removeItem("speak_token");
      state.token = null;
      state.user = null;
      state.isError = false;
      state.isLoading = false;
      state.message = "";
      toast.success("Logout successful");
    },
    clearError: (state) => {
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; 
      })

      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false; 
        state.message = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = decodeToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; 
        state.token = null;
        state.user = null;
      })

      
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token; 
        state.user = decodeToken(action.payload.token); 
        state.isError = false;
        state.message = "Profile updated successfully!"; 
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; 
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
