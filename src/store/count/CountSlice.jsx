import { createSlice } from '@reduxjs/toolkit';

// Define proper initial state structure
const initialState = {
  counts: {
    projectCount: 0,
    practiceHeadsCount: 0,
    teamLeadsCount: 0,
    assignedProjectsCount: 0,
    auditorsCount: 0
  },
  status: 'idle',
  error: null
};

export const CountSlice = createSlice({
  name: 'counts',
  initialState,
  reducers: {
    setProjectCount: (state, action) => {
      state.counts.projectCount = action.payload;
      state.status = 'succeeded';
    },
    setPracticeHeadsCount: (state, action) => {
      state.counts.practiceHeadsCount = action.payload;
      state.status = 'succeeded';
    },
    setTeamLeadsCount: (state, action) => {
      state.counts.teamLeadsCount = action.payload;
      state.status = 'succeeded';
    },
    setAssignedProjectsCount: (state, action) => {
      state.counts.assignedProjectsCount = action.payload;
      state.status = 'succeeded';
    },
    setAuditorsCount: (state, action) => {
      state.counts.auditorsCount = action.payload;
      state.status = 'succeeded';
    },
    resetCounts: () => {
      return initialState;
    },
    setLoading: (state) => {
      state.status = 'loading';
    },
    setError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    }
  },
});

// Export actions
export const {
  setProjectCount,
  setPracticeHeadsCount,
  setTeamLeadsCount,
  setAssignedProjectsCount,
  setAuditorsCount,
  resetCounts,
  setLoading,
  setError
} = CountSlice.actions;

// Export selectors
export const selectProjectCount = (state) => state.counts.counts.projectCount;
export const selectPracticeHeadsCount = (state) => state.counts.counts.practiceHeadsCount;
export const selectTeamLeadsCount = (state) => state.counts.counts.teamLeadsCount;
export const selectAssignedProjectsCount = (state) => state.counts.counts.assignedProjectsCount;
export const selectAuditorsCount = (state) => state.counts.counts.auditorsCount;
export const selectCountsStatus = (state) => state.counts.status;
export const selectCountsError = (state) => state.counts.error;

export default CountSlice.reducer;