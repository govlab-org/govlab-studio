import { CatalaCellCode, setCodeValue } from "../file/fileSlice";
import { lineNumbers } from "@codemirror/gutter";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import CodeMirror from "@uiw/react-codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Catala } from "codemirror-lang-catala";
import { createSelector } from "reselect";
import { RootState } from "../../app/store";

type Props = {
  cellIndex: number;
}

const getLineNumberOffset = createSelector(
  [
    (state: RootState) => state.file.content,
    (_, index: number) => index,
  ],
  (content, index) => content.slice(0, index).reduce(
      (acc, c) => acc + c.text.numLines + c.code.numLines, 0
    ) + content[index].text.numLines
);

const getCode = createSelector(
  [
    (state: RootState) => state.file.content,
    (_, index: number) => index,
  ],
  (content, index) => content[index].code
);

const CodeEditor = (props: Props) => {
  const dispatch = useAppDispatch();
  const code: CatalaCellCode = useAppSelector((s) => getCode(s, props.cellIndex));
  const lineNumberOffset = useAppSelector((s) => getLineNumberOffset(s, props.cellIndex));

  let theme = EditorView.theme({
    "&.cm-editor": {
      padding: "10px 0 10px 0",
      fontSize: ".9em",
      fontFamily: "Roboto Mono, sans-serif",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      minWidth: "45px",
      paddingRight: "0px",
      fontSize: "15px",
      lineHeight: "24px",
      marginRight: "18px",
      fontFamily: "Roboto Mono, sans-serif",
    },
    /* Disable CodeMirror's active line highlighting. */
    "& .cm-activeLineGutter, & .cm-activeLine": {
      backgroundColor: "transparent !important",
    },
    /* Disable CodeMirror's focused editor outline. */
    "&.cm-editor.cm-focused": {
      outline: "none",
    },
  }, {dark: true});

  const extensions = [
    theme,
    Catala(),
    lineNumbers({ formatNumber: (n: number, s: EditorState) =>
      (n + lineNumberOffset).toString()
    }),
  ];

  return (
    <div style={{ marginTop: 10, marginBottom: 10 }}>
      <CodeMirror
        value={code.code}
        onChange={(value, viewUpdate) => {
          dispatch(setCodeValue([props.cellIndex, value]));
        }}
        extensions={extensions}
        theme="dark"
      />
    </div>
  );
}

export default CodeEditor;
