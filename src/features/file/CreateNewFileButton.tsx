import { Button } from '@mui/material';
import { useAppDispatch } from '../../app/hooks';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { createNewFile } from '../file/fileSlice';

export const CreateNewFileButton = () => {
  const dispatch = useAppDispatch();

  return (
    <Button
      style={{width: "100%"}}
      variant="outlined"
      size="large"
      startIcon={<AddCircleIcon />}
      onClick={() => dispatch(createNewFile())}>
      Create a new file
    </Button>
  );
};
