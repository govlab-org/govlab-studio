import './App.css';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Workbench from './features/editor/Workbench'

const App = () => {
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
        </Toolbar>
      </AppBar>
      <Workbench />
    </div>
  );
}

export default App;
