import { useEffect, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { CatalaCell } from "../file/fileSlice";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../app/store";

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
  const minHeight = 0;
  const [height, setHeight] = useState(minHeight);

  const monaco = useMonaco();
  
  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: "catala_en" });

      // Register a tokens provider for the language
      monaco.languages.setMonarchTokensProvider("catala_en", {
        keywords: [
          // expression
          "match",
          "with", "pattern",
          "fixed",
          "by",
          "decreasing",
          "increasing",
          "varies",
          "with",
          "we", "have",
          "in",
          "such", "that",
          "exists",
          "for",
          "all",
          "of",
          "if",
          "then",
          "else",
          "initial",

          // rule
          "scope",
          "depends", "on",
          "declaration",
          "includes",
          "collection",
          "content",
          "optional",
          "structure",
          "enumeration",
          "context",
          "rule",
          "under", "condition",
          "condition",
          "data",
          "consequence",
          "fulfilled",
          "equals",
          "assertion",
          "definition",
          "label",
          "exception",
        ],
        typeKeywords: [
          "integer",
          "boolean",
          "date",
          "duration",
          "money",
          "text",
          "decimal",
          "number",
          "sum",
        ],
        operators: [
          "=", ">", "<", "!",
          "==", "<=", ">=", "!=",
          "==$", "<=$", ">=$", "!=$",
          "+", "-", "*", "/",
          "+$", "-$", "*$", "/$"
        ],
        comments: {
          lineComment: "#",
        },
        tokenizer: {
          root: [
            { include: "@whitespace" },
            [/[a-z_$][\w$]*/, {
              cases: {
                "@keywords": "keyword",
                "@default": "identifier"
              }
            }],
          ],
          whitespace: [
            [/[ \t\r\n]+/, "white"],
            [/(^#.*$)/, "comment"],
          ],
        }
      });
    }
  }, [monaco]);

  const updateHeight = (editor: editor.IStandaloneCodeEditor) => {
    const contentHeight = Math.max(minHeight, editor.getContentHeight());

    setHeight(contentHeight);
  };

  const cell: CatalaCell = props.fileContent![props.cellIndex];

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <Editor
        height={height}
        language="catala_en"
        value={cell?.code?.code}
        theme="vs-dark"
        options={{
          fontSize: 15,
          fontFamily: "Roboto Mono, sans-serif",
          minimap: {enabled: false},
          overviewRulerLanes: 0,
          lineNumbers: (lineNumber) => (props.lineNumberOffset + lineNumber).toString(),
          scrollBeyondLastLine: false,
          padding: {
            top: 20,
            bottom: 20,
          },
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
          renderLineHighlight: "none",
        }}
        onMount={(editor) => {
          editor.onDidContentSizeChange(() => {
            updateHeight(editor);
          });
        }}
      />
    </div>
  );
}
  
export default connector(CodeEditor);
