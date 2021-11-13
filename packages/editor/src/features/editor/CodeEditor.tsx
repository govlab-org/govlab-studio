import { CatalaCell, setCodeValue } from "../file/fileSlice";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../app/store";
import { lineNumbers } from "@codemirror/gutter";
import { useAppDispatch } from "../../app/hooks";
import CodeMirror from "@uiw/react-codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Catala } from "codemirror-lang-catala";

const mapState = (state: RootState) => ({
  fileContent: state.file.content,
});

const mapDispatch = {
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  cellIndex: number;
  lineNumberOffset: number;
}

const CodeEditor = (props: Props) => {
  const dispatch = useAppDispatch();
  const cell: CatalaCell = props.fileContent![props.cellIndex];

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
      (n + props.lineNumberOffset).toString()
    }),
  ];

  return (
    <div style={{ marginTop: 10, marginBottom: 10 }}>
      <CodeMirror
        value={cell?.code?.code}
        onChange={(value, viewUpdate) => {
          dispatch(setCodeValue([props.cellIndex, value]));
        }}
        extensions={extensions}
        theme="dark"
      />
    </div>
  );
}
  
export default connector(CodeEditor);
