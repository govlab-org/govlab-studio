import * as React from 'react';
import styles from './TextEditor.module.css';
import { CatalaCellText, setTextValue } from '../file/fileSlice';
import { useDispatch } from 'react-redux';
import { ReactEditor, Slate, withReact, Editable } from 'slate-react';
import { BaseEditor, createEditor, Descendant, Editor, Element } from 'slate';
import { useAppSelector } from '../../app/hooks';
import { createSelector } from 'reselect';
import { RootState } from '../../app/store';

// https://docs.slatejs.org/concepts/12-typescript#defining-editor-element-and-text-types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
  }
}

type Props = {
  cellIndex: number;
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

const computeGutterLines = (editor: ReactEditor, nodes: Descendant[]) => {
  let lines: Array<GutterLine> = [];

  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i] as Element;
    try {
      const element = ReactEditor.toDOMNode(editor, node);
  
      if (!element) {
        continue;
      }
      
      const numLines = (element.textContent?.match(/\n/gm)?.length ?? 0) + 1;
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
    } catch (e) {
      // nothing
    }
  }

  return lines;
};

const getLineNumberOffset = createSelector(
  [
    (state: RootState) => state.file.content,
    (_, index: number) => index,
  ],
  (content, index) => content.slice(0, index).reduce(
    (acc, c) => acc + c.text.numLines + c.code.numLines, 0
  )
);

const getText = createSelector(
  [
    (state: RootState) => state.file.content,
    (_, index: number) => index,
  ],
  (content, index) => content[index].text
);

const TextEditor = (props: Props) => {

  const renderElement = React.useCallback(({ attributes, children, element }) => {
    switch (element.type) {
      case 'heading_one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading_two':
        return <h2 {...attributes}>{children}</h2>;
      case 'heading_three':
        return <h3 {...attributes}>{children}</h3>;
      case 'heading_four':
        return <h4 {...attributes}>{children}</h4>;  
      case 'heading_five':
        return <h5 {...attributes}>{children}</h5>;  
      case 'heading_six':
        return <h6 {...attributes}>{children}</h6>;  
      case 'block_quote':
        return <blockquote {...attributes}>{children}</blockquote>;  
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);
  
  const dispatch = useDispatch();
  const text: CatalaCellText = useAppSelector((s) => getText(s, props.cellIndex));
  const lineNumberOffset = useAppSelector((s) => getLineNumberOffset(s, props.cellIndex));

  // Workaround for a crash caused by hot reloading.
  // https://github.com/ianstormtaylor/slate/issues/4081#issuecomment-798779414
  const editorRef = React.useRef<Editor>();
  if (!editorRef.current) {
    editorRef.current = withReact(createEditor());
  }
  const editor = editorRef.current;

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle soft breaks (shift + enter)
    if (event.key === 'Enter' && event.shiftKey === true) {
      // Inserting '\n' should be enough, but there is a bug in Firefox:
      //
      // https://github.com/ianstormtaylor/slate/issues/3911
      //
      // Inserting '\n\u2060' instead works, but it causes other issues.
      // Backspace will not remove the extra zero width whitespace.
      //
      // https://github.com/ianstormtaylor/slate/issues/3911#issuecomment-963046142
      //
      // This is a Firefox-only bug and the caret moves to the new line when
      // typing. So we just ignore the problem for now.
      editor.insertText('\n');

      event.preventDefault();
      event.stopPropagation();
    }
  };
  
  const value = text.content;
  const initialGutterLines: Array<GutterLine> = [];
  const [gutterLines, setGutterLines] = React.useState(initialGutterLines);

  // https://github.com/ianstormtaylor/slate/pull/4540#issuecomment-951380551
  editor.children = value;

  React.useEffect(() => {
    setGutterLines(computeGutterLines(editor, value));
    document.fonts.ready.then(() => setGutterLines(computeGutterLines(editor, value)));
  }, [editor, value]);

  const onChange = React.useCallback(v => {
    // Ignore change events related to selections.
    const ops = editor.operations.filter(op => op && op.type !== 'set_selection');
    
    if (ops && Array.isArray(ops) && ops.length > 0) {
      dispatch(setTextValue([props.cellIndex, v]));
    }
  }, [dispatch, editor.operations, props.cellIndex]);

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
            {lineNumberOffset + i + 1}
          </div>
        </div>
      )}
      </div>
      <div style={{ flex: 1 }} className={styles.textEditor}>
        <Slate editor={editor} value={value} onChange={onChange}>
          <Editable renderElement={renderElement} onKeyPress={onKeyDown}/>
        </Slate>
      </div>
    </div>
  );
};

export default TextEditor;
