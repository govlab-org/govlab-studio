import * as React from 'react';
import styles from './CatalaEditor.module.css';
import { setFileContent } from '../file/fileSlice';
import { useDispatch } from 'react-redux';
import { ReactEditor, Slate, withReact, Editable } from 'slate-react';
import { BaseEditor, createEditor, Descendant, Editor, Element, NodeEntry, Range } from 'slate';
import { useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import Prism from 'prismjs';
import { css } from '@emotion/css';

(function() {
  Prism.languages.catala_en = {
    comment: {
      pattern: /(^|[^\\])#.*/,
      lookbehind: true,
      greedy: true,
    },
    operator: /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
    keyword: /\b(?:_(?=\s*:)|match|with\s+pattern|fixed|by|decreasing|increasing|varies|with|we\s+have|in|such\s+that|exists|for|all|of|if|then|else|initial|scope|depends\s+on|declaration|includes|collection|content|optional|structure|enumeration|context|rule|under\s+condition|condition|data|consequence|fulfilled|equals|assertion|definition|label|exception)\b/,
  };
}());

// https://docs.slatejs.org/concepts/12-typescript#defining-editor-element-and-text-types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
  }
}

type Props = {
}

class GutterLine {
  style: React.CSSProperties = {};
  classNames: string[] = [];
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
      const marginBottom = style.marginBottom;
      const marginTop = style.marginTop;
      const paddingBottom = style.paddingBottom;
      const paddingTop = style.paddingTop;
      const height = parseFloat(style.getPropertyValue("height")) / numLines;
      const classNames = [styles.lineNumber];

      if (element.tagName === "CODE") {
        classNames.push(styles.codeLineNumber);
      }

      if (numLines === 1) {
        lines.push({style: {marginTop, marginBottom, paddingTop, paddingBottom, height}, classNames});
      } else {
        lines.push({style: {marginTop, paddingTop, height}, classNames});
        if (numLines >= 3) {
          lines = lines.concat(Array(numLines - 2).fill(
            {style: {height}, classNames}
          ));
        }
        lines.push({style: {marginBottom, paddingBottom, height}, classNames});
      }
    } catch (e) {
      // nothing
    }
  }

  return lines;
};


const decorateCode = function([node, path]: NodeEntry): Range[] {
  const ranges: Range[] = [];

  if ((node as any).type !== 'code_block') {
    return ranges;
  }

  const getLength = (token: string | Prism.Token): number => {
    if (typeof token === 'string') {
      return token.length;
    } else if (typeof token.content === 'string') {
      return token.content.length;
    } else {
      return (token.content as (string | Prism.Token)[]).reduce((l, t) => l + getLength(t), 0);
    }
  };

  let child = (node as any).children[0];
  let childPath = path.concat(0);

  const tokens = Prism.tokenize(child.text, Prism.languages.catala_en);
  let start = 0;

  for (const token of tokens) {
    const length = getLength(token);
    const end = start + length;

    if (typeof token !== 'string') {
      ranges.push({
        [token.type]: true,
        anchor: { path: childPath, offset: start },
        focus: { path: childPath, offset: end },
      });
    }

    start = end;
  }

  return ranges;
}

const CatalaEditor = (props: Props) => {

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
      case 'code_block':
        return <code {...attributes}>{children}</code>;  
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = React.useCallback(({ attributes, children, leaf }) => {
    return (
      <span
        {...attributes}
        className={css`
          ${leaf.comment &&
            css`
              color: slategray;
          `}
          ${leaf.keyword &&
            css`
              color: #07a;
          `}
          ${leaf.operator &&
            css`
              color: #3af;
          `}
        `}
      >
        {children}
      </span>
    )
  }, []);

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
  
  const dispatch = useDispatch();
  const value = useAppSelector((state: RootState) => state.file.content);

  // Workaround for a crash caused by hot reloading.
  // https://github.com/ianstormtaylor/slate/issues/4081#issuecomment-798779414
  const editorRef = React.useRef<Editor>();
  if (!editorRef.current) {
    editorRef.current = withReact(createEditor());
  }
  const editor = editorRef.current;
  
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
        dispatch(setFileContent(v));
    }
  }, [dispatch, editor.operations]);

  return (
    <div style={{ display: 'flex' }}>
      <div>
      {gutterLines.map((line, i) =>
        <div
          key={i}
          className={line.classNames.join(" ")}
          style={line.style}
        >
          <span>
            {i + 1}
          </span>
        </div>
      )}
      </div>
      <div style={{ flex: 1 }} className={styles.catalaEditor}>
        <Slate editor={editor} value={value} onChange={onChange}>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyPress={onKeyDown}
            decorate={decorateCode}
          />
        </Slate>
      </div>
    </div>
  );
};

export default CatalaEditor;
