import { createAsyncThunk } from "@reduxjs/toolkit";

import { userApi } from "../../services/userAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { ProfileSummary, UIStateProps } from "../types";

type FetchProfileSummaryArgs = {
  forceRefresh?: boolean;
} | void;

export const fetchProfileSummary = createAsyncThunk(
  "sneakyState/fetchProfileSummary",
  async (_: FetchProfileSummaryArgs, { rejectWithValue }) => {
    try {
      const summary = await userApi.getProfileSummary();
      return summary satisfies ProfileSummary;
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't load your profile activity.",
        ),
      );
    }
  },
  {
    condition: (args, { getState }) => {
      if (args?.forceRefresh) {
        return true;
      }

      const { sneakyState } = getState() as { sneakyState: UIStateProps };
      return sneakyState.profileSummaryStatus === "idle";
    },
  },
);
