import * as React from 'react';
import { ContentBlock, convertFromRaw, Editor, EditorState } from 'draft-js';
import styles from './TextEditor.module.css';
import { CatalaCell, selectFileContent } from '../file/fileSlice';
import { useAppSelector } from '../../app/hooks';

interface TextEditorProps {
  cellIndex: number;
  lineNumberOffset: number;
}

class GutterLine {
  marginTop: number = 0;
  height: number = 0;
  marginBottom: number = 0;

  constructor(marginTop: number, height: number, marginBottom: number) {
    this.marginTop = marginTop;
    this.height = height;
    this.marginBottom = marginBottom;
  }
}

const TextEditor = (props: TextEditorProps) => {
  const fileContent = useAppSelector(selectFileContent);
  const cell: CatalaCell | undefined = fileContent?.[props.cellIndex];
  const [editorState, setEditorState] = React.useState(
    EditorState.createWithContent(convertFromRaw({
      blocks: cell?.text?.blocks ?? [],
      entityMap: {},
    }))
  );
  const initialGutterLines: Array<GutterLine> = [];
  const [gutterLines, setGutterLines] = React.useState(initialGutterLines);

  // There is no way to have access to the underlying DOM elements generated
  // by the Draft JS editor. To workaround this, we use native DOM functions.
  const updateGutterlines = (editorState: EditorState) => {
    // Use `data-offset-key` and `data-block` attributes to find rendered
    // block elements for any changed blocks, measure their heights,
    // and set height values in state to update your gutter.
    let lines: Array<GutterLine> = [];
    editorState.getCurrentContent().getBlockMap().forEach((block?: ContentBlock, key?: string) => {
      // const numLines = block?.getText().split("\n").length ?? 1;
      const numLines = (block?.getText().match(/\n/gm)?.length ?? 0) + 1;
      const element = document.querySelectorAll(
          `[data-offset-key="${key}-0-0"][data-block="true"]`
        )[0] as HTMLElement;
      const style = window.getComputedStyle(element);
      const height = element.offsetHeight;
      const marginBottom = parseFloat(style.marginBottom);
      const marginTop = parseFloat(style.marginTop);

      if (numLines === 1) {
        lines.push(new GutterLine(marginTop, height, marginBottom));
      } else {
        lines.push(new GutterLine(marginTop, height / numLines, 0.));
        if (numLines >= 3) {
          lines = lines.concat(Array(numLines - 2).fill(
            new GutterLine(0., height / numLines, 0.)
          ));
        }
        lines.push(new GutterLine(0., height / numLines, marginBottom));
      }
    })

    setGutterLines(lines);
  };

  React.useEffect(() => {
    updateGutterlines(editorState);

    // If the font family is changed during development, hot reloading will not
    // trigger a call to updateGutterlines(). To fix this we listen to the web
    // fonts ready promise.
    document.fonts.ready.then(() => updateGutterlines(editorState));
  }, [editorState]);
  
  const handleChange = (e: EditorState) => {
    setEditorState(e);

    if (e.getCurrentContent() !== editorState.getCurrentContent()) {
      // ! FIXME: find any `ContentBlock` objects that differs
      requestAnimationFrame(() => updateGutterlines(e));
    }
  }

  const blockStyleFn = (contentBlock: ContentBlock) => {
    return styles.textEditorBlock
  }

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: 68 }}>
      {gutterLines.map((line, i) =>
        <div key={i} className={styles.lineNumbers} style={{
            marginTop: line.marginTop + "px",
            height: line.height + "px",
            lineHeight: line.height + "px",
            marginBottom: line.marginBottom + "px",
          }}>
          <div>
            {props.lineNumberOffset + i + 1}
          </div>
        </div>
      )}
      </div>
      <div style={{flex: 1 }}>
        <Editor
          blockStyleFn={blockStyleFn}
          editorState={editorState}
          onChange={handleChange}/>
      </div>
    </div>
  );
};

export { TextEditor }
