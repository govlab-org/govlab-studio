import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { classToPlain, plainToClass, Type } from "class-transformer";
import { RawDraftContentBlock } from "draft-js";
import { markdownToDraft } from "markdown-draft-js";
import { RootState } from "../../app/store";

// requited to use the decorators such as @Type
import 'reflect-metadata';

export enum FileOpenStatus {
  LOADING,
  LOADED,
  ERROR,
}

export interface FileOpenButtonState {
  status: FileOpenStatus | null,
  content: Array<Object> | null;
}

const initialState: FileOpenButtonState = {
  status: null,
  content: [],
}

export const readFileAsync = createAsyncThunk(
  'fileOpenButton/readFile',
  async (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function(e: any) {
      resolve(e.target.result);
    };
    reader.onerror = function(e: any) {
      reject(e);
    };
    reader.readAsText(file);
  })
);


export class CatalaCellText {
  private _blocks: RawDraftContentBlock[] = [];
  private _numLines: number = 0;

  get blocks() {
    return this._blocks;
  }

  set blocks(blocks: RawDraftContentBlock[]) {
    this._blocks = blocks;
    this._numLines = this.computeNumLines();
  }

  get numLines() {
    return this._numLines;
  }
  
  private computeNumLines() {
    let numLines = 0;
    for (let i = 0; i < this._blocks.length; ++i) {
      const block = this._blocks[i];

      numLines += (block.text.match(/\n/gm)?.length ?? 0) + 1
    }
    return numLines;
  }

  public toObject() {
    return Object.assign({}, this);
  }
}

export class CatalaCellCode {
  private _code: string = "";
  private _numLines: number = 1;

  get code() {
    return this._code;
  }

  set code(code: string) {
    this._code = code;
    this._numLines = (code.match(/\n/gm)?.length ?? 0) + 1;
  }

  get numLines() {
    return this._numLines;
  }
}

export class CatalaCell {
  @Type(() => CatalaCellText)
  text: CatalaCellText | undefined;
  @Type(() => CatalaCellCode)
  code: CatalaCellCode | undefined;
}

const stripCodeBlock = (block: string) => {
  let regexp = new RegExp("^```catala$(.*)^```$", "gms");

  return block.replace(regexp, "$1").trim();
}

const parseCatalaCode = (code: string) => {
  const parsed = markdownToDraft(code, { preserveNewlines: true });
  let cells: Array<CatalaCell> = [];

  let i = 0;
  while (i < parsed.blocks.length) {
    let block = parsed.blocks[i];

    let textBlocks = [];
    while (block && block.type !== "code-block") {
      textBlocks.push(block);
      block = parsed.blocks[++i];
    }

    let code = "";
    while (block && block.type === "code-block") {
      code += stripCodeBlock(block.text);
      block = parsed.blocks[++i];
    }

    const cellText = new CatalaCellText();
    cellText.blocks = textBlocks;
    const cellCode = new CatalaCellCode();
    cellCode.code = code;
    const cell = new CatalaCell();
    cell.text = cellText;
    cell.code = cellCode;

    cells.push(cell);
  }

  return cells;
}

export const fileSlice = createSlice({
  name: 'FileOpenButton',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(readFileAsync.pending, (state) => {
        state.content = [];
        state.status = FileOpenStatus.LOADING;
      })
      .addCase(readFileAsync.fulfilled, (state, action) => {
        // ! FIXME: handle parser errors
        state.status = FileOpenStatus.LOADED;
        state.content = parseCatalaCode(action.payload).map((cell: CatalaCell) => classToPlain(cell));
      })
      .addCase(readFileAsync.rejected, (state) => {
        state.status = FileOpenStatus.ERROR;
      })
  },
});

export const selectFileContent = (state: RootState) => state.file.content?.map((v) => plainToClass(CatalaCell, v));

export default fileSlice.reducer;
