import { RootState } from '../../app/store';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import TextEditor from './TextEditor'
import CodeEditor from './CodeEditor'
import { Button, Paper, Typography } from '@mui/material';
import { OpenFileButton } from '../file/OpenFileButton';
import { Box } from '@mui/system';
import Grid from '@mui/material/Grid';
import DialMenu from './DialMenu';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { createNewFile, setCurrentCellIndex } from '../file/fileSlice';
import { createSelector } from 'reselect';

interface Props {
}

const getNumCells = createSelector(
  (state: RootState) => state.file.content,
  (content) => content.length,
);

const Workbench = (props: Props) => {
  const dispatch = useAppDispatch();
  const numCells = useAppSelector(getNumCells);

  if (numCells === 0) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={6}>
            <Paper>
              <Box m={2} p={3} py={6}>
                <Grid container justifyContent="center" alignItems="center">
                  <Grid item md={5} sm={12}>
                    <OpenFileButton />
                  </Grid>
                  <Grid item md={2} sm={12}>
                    <Box py={2}>
                      <Typography style={{textAlign: "center"}} variant="body1">
                        OR
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item md={5} sm={12}>
                    <Button
                      style={{width: "100%"}}
                      variant="outlined"
                      size="large"
                      startIcon={<AddCircleIcon />}
                      onClick={() => dispatch(createNewFile())}>
                        Create a new file
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <DialMenu />
      </Box>

    );
  } else {
    return (
      <div>
      {[...Array(numCells)].map((v, i: number) =>
        <div key={i} onClick={() => dispatch(setCurrentCellIndex(i))}>
          <TextEditor cellIndex={i} />
          <CodeEditor cellIndex={i} />
        </div>
      )}
      <DialMenu />
      </div>
    );
  }
}

export default Workbench;
