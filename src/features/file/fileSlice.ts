import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import markdown from 'remark-parse';
import slate from 'remark-slate';
import { unified } from 'unified';
import { Descendant, Node } from "slate";

export enum FileStatus {
  NOT_LOADED,
  LOADING,
  LOADED,
  CHANGED,
  ERROR,
}

export interface FileState {
  status: FileStatus | undefined,
  name: string | undefined,
  content: Node[];
}

const initialState: FileState = {
  status: FileStatus.NOT_LOADED,
  name: "",
  content: [],
}

export const readFileAsync = createAsyncThunk(
  'file/readFile',
  async (file: File) => new Promise<[string, string]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function(e: any) {
      resolve([file.name, e.target.result]);
    };
    reader.onerror = function(e: any) {
      reject(e);
    };
    reader.readAsText(file);
  })
);

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    createNewFile: (state) => {
      state.content = [{ type: "paragraph", children: [{ text: "" }] } as any];
      state.status = FileStatus.LOADED;
    },
    setFileContent: (state, action: PayloadAction<Descendant[]>) => {
      const value = action.payload;

      state.status = FileStatus.CHANGED;
      state.content = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(readFileAsync.pending, (state) => {
        state.content = [];
        state.status = FileStatus.LOADING;
      })
      .addCase(readFileAsync.fulfilled, (state, action) => {
        // ! FIXME: handle parser errors
        state.status = FileStatus.LOADED;
        state.name = action.payload[0];
        state.content = unified()
          .use(markdown)
          .use(slate)
          .processSync(action.payload[1])
          // ! FIXME: use an interface
          .result as any[];
      })
      .addCase(readFileAsync.rejected, (state) => {
        state.status = FileStatus.ERROR;
      })
  },
});

export const {
  createNewFile,
  setFileContent,
} = fileSlice.actions;

export default fileSlice.reducer;
