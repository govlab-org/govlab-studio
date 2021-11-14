import './App.css';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import TextEditor from './features/editor/TextEditor'
import CodeEditor from './features/editor/CodeEditor'
import { OpenFileButton } from './features/file/OpenFileButton'
import { SaveFileButton } from './features/file/SaveFileButton'
import { useAppSelector } from './app/hooks';
import { RootState } from './app/store';

const getNumCells = (state: RootState) => state.file.content.length;

const App = () => {
  const numCells = useAppSelector(getNumCells);

  console.log("App");

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
            <SaveFileButton />
            <OpenFileButton />
          </Box>
        </Toolbar>
      </AppBar>
      <div>
        {[...Array(numCells)].map((v, i: number) =>
            <div key={i}>
              <TextEditor cellIndex={i} />
              <CodeEditor cellIndex={i} />
            </div>
        )}
      </div>
    </div>
  );
}

export default App;
