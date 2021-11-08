import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store";
import markdown from 'remark-parse';
import slate from 'remark-slate';
import { unified } from 'unified';
import { Descendant, Element, Text } from "slate";

export enum FileStatus {
  LOADING,
  LOADED,
  CHANGED,
  ERROR,
}

export interface FileState {
  status: FileStatus | undefined,
  name: string | undefined,
  content: Array<CatalaCell>;
}

export interface CatalaCell {
  text: CatalaCellText;
  code: CatalaCellCode;
}

export interface CatalaCellText {
  content: Descendant[];
  numLines: number;
}

export interface CatalaCellCode {
  code: string;
  numLines: number;
}

const initialState: FileState = {
  status: undefined,
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

const computeTextNumLines = (nodes: Descendant[]) => {
  let numLines = 0;
  for (let i = 0; i < nodes.length; ++i) {
    let el = nodes[i] as Element;

    for (let j = 0; j < el.children.length; ++j) {
      numLines += ((el.children[j] as Text).text.match(/\n/gm)?.length ?? 0) + 1;
    }
  }
  return numLines;
}

const computeCodeNumLines = (code: string) => {
  return (code.match(/\n/gm)?.length ?? 0) + 1;
}

const stripCodeBlock = (block: string) => {
  let regexp = new RegExp("^```catala$(.*)^```$", "gms");

  return block.replace(regexp, "$1").trim();
}

const parseCatalaCode = (code: string) => {
  // const slateTransformer = new SlateTransformer();
  // const parsed = slateTransformer.fromMarkdown(code);
  const parsed = unified()
    .use(markdown)
    .use(slate)
    .processSync(code)
    // ! FIXME: use an interface
    .result as any[];
  const cells: Array<CatalaCell> = [];

  let i = 0;
  while (i < parsed.length) {
    let child = parsed[i];

    let textBlocks = [];
    while (child && child["type"] !== "code_block") {
      textBlocks.push(child);
      child = parsed[++i];
    }

    let code = "";
    while (child && child["type"] === "code_block") {
      code += stripCodeBlock(child["children"][0]["text"]);
      child = parsed[++i];
    }

    cells.push({
      text: {
        content: textBlocks,
        numLines: computeTextNumLines(textBlocks),
      } as CatalaCellText,
      code: {
        code,
        numLines: computeCodeNumLines(code),
      } as CatalaCellCode
    } as CatalaCell);
  }

  return cells;
}

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setTextValue: (state, action: PayloadAction<[number, Descendant[]]>) => {
      const value = action.payload[1];

      state.status = FileStatus.CHANGED;

      (state.content![action.payload[0]] as CatalaCell).text = {
        content: value,
        numLines: computeTextNumLines(value),
      };
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
        state.content = parseCatalaCode(action.payload[1]);
      })
      .addCase(readFileAsync.rejected, (state) => {
        state.status = FileStatus.ERROR;
      })
  },
});

export const { setTextValue } = fileSlice.actions;

export const selectFile = (state: RootState) => state.file as FileState;

export const selectFileContent = (state: RootState) => state.file.content?.map((v) => v as CatalaCell);

export default fileSlice.reducer;
