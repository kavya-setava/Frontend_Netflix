import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  projectspageNum:1,
  projectspageSize:10,
  projectssearchText:'',
};


export const ProjectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
   
    setProjectsSearchText: (state, action) => {
      state.projectssearchText = action.payload;
    },
    setProjectsPageNum: (state, action) => {
      state.projectspageNum = action.payload;
    },
    setProjectsPageSize: (state, action) => {
      state.projectspageSize = action.payload;
    },
 
   
    
    },
  
});


export const { setProjectsPageNum,setProjectsPageSize,setProjectsSearchText} = ProjectsSlice.actions;

export default ProjectsSlice.reducer;