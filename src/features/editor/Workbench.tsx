import { RootState } from '../../app/store';
import { useAppSelector } from '../../app/hooks';
import { Paper, Typography } from '@mui/material';
import { OpenFileButton } from '../file/OpenFileButton';
import { CreateNewFileButton } from '../file/CreateNewFileButton';
import { Box } from '@mui/system';
import Grid from '@mui/material/Grid';
import DialMenu from './DialMenu';
import CatalaEditor from './CatalaEditor';
import { FileStatus } from '../file/fileSlice';

interface Props {
}

const Workbench = (props: Props) => {
  const fileStatus = useAppSelector((state: RootState) => state.file.status);

  if (fileStatus === FileStatus.NOT_LOADED) {
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
                    <CreateNewFileButton />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  } else {
    return (
      <div>
        <CatalaEditor />
        <DialMenu />
      </div>
    );
  }
}

export default Workbench;
