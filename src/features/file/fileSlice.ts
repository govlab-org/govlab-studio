import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import markdown from 'remark-parse';
import slate from 'remark-slate';
import { unified } from 'unified';
import { Descendant, Element, Node, Text } from "slate";

export enum FileStatus {
  NOT_LOADED,
  LOADING,
  LOADED,
  CHANGED,
  ERROR,
}

export interface FileState {
  status: FileStatus | undefined,
  currentCellindex: number,
  name: string | undefined,
  content: Array<CatalaCell>;
}

export interface CatalaCell {
  text: CatalaCellText;
  code: CatalaCellCode;
}

export interface CatalaCellText {
  content: Node[];
  numLines: number;
}

export interface CatalaCellCode {
  code: string;
  numLines: number;
}

const initialState: FileState = {
  status: FileStatus.NOT_LOADED,
  currentCellindex: 0,
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
      let child = el.children[j];

      if ((child as Object).hasOwnProperty("text")) {
        numLines += ((child as Text).text.match(/\n/gm)?.length ?? 0) + 1;
      } else {
        numLines += computeTextNumLines([child]);
      }
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

    let textBlocks: Array<Node> = [];
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

const createEmptyCell = () => ({
  text: {
    content: [{
      children: [{ text: "" }]
    } as Node],
    numLines: 1,
  },
  code: { code: "", numLines: 1 },
});

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    createNewFile: (state) => {
      state.content = [createEmptyCell()];
      state.status = FileStatus.LOADED;
    },
    setCurrentCellIndex: (state, action: PayloadAction<number>) => {
      state.currentCellindex = action.payload;
    },
    addCellAbove: (state) => {
      state.content = [
        ...state.content.slice(0, state.currentCellindex),
        createEmptyCell(),
        ...state.content.slice(state.currentCellindex),
      ];
    },
    addCellBellow: (state) => {
      state.content = [
        ...state.content.slice(0, state.currentCellindex + 1),
        createEmptyCell(),
        ...state.content.slice(state.currentCellindex + 1),
      ];
      state.currentCellindex += 1;
    },
    setTextValue: (state, action: PayloadAction<[number, Descendant[]]>) => {
      const value = action.payload[1];

      state.status = FileStatus.CHANGED;

      (state.content![action.payload[0]] as CatalaCell).text = {
        content: value,
        numLines: computeTextNumLines(value),
      };
    },
    setCodeValue: (state, action: PayloadAction<[number, string]>) => {
      const value = action.payload[1];

      state.status = FileStatus.CHANGED;

      (state.content![action.payload[0]] as CatalaCell).code = {
        code: value,
        numLines: computeCodeNumLines(value),
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

export const {
  createNewFile,
  setTextValue,
  setCodeValue,
  setCurrentCellIndex,
  addCellAbove,
  addCellBellow,
} = fileSlice.actions;

export default fileSlice.reducer;
