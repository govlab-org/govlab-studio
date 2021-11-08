import './App.css';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import TextEditor from './features/editor/TextEditor'
import CodeEditor from './features/editor/CodeEditor'
import { FileOpenButton } from './features/file/FileOpenButton'
import { useAppSelector } from './app/hooks';
import { CatalaCell, selectFileContent } from './features/file/fileSlice';

const App = () => {
  const fileContent = useAppSelector(selectFileContent);
  let offset = 0;
  const lineOffsets: Array<[number, number]> = fileContent?.map((cell: CatalaCell) => {
    const numTextLines = cell.text?.numLines ?? 0;
    const numCodeLines = cell.code?.numLines ?? 0;
    const values: [number, number] = [offset, offset + numTextLines];

    offset += numTextLines + numCodeLines;

    return values;
  }) ?? [];

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            GovLab Studio
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <FileOpenButton />
          </Box>
        </Toolbar>
      </AppBar>
      <div>
        {fileContent?.map((cell: CatalaCell, i: number) =>
            <div key={i}>
              <TextEditor cellIndex={i} lineNumberOffset={lineOffsets[i][0]} />
              <CodeEditor cellIndex={i} lineNumberOffset={lineOffsets[i][1]} />
            </div>
        )}
      </div>
    </div>
  );
}

export default App;
