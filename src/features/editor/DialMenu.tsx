import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import FlipIcon from '@mui/icons-material/Flip';
import { useAppDispatch } from '../../app/hooks';
import { addCellAbove, addCellBellow } from "../file/fileSlice";

interface Props {
}

const DialMenu = (props: Props) => {
  const dispatch = useAppDispatch();
  const actions = [
    {
      icon: <FlipIcon sx={{transform: "rotate(90deg)"}} />,
      name: 'Add cell below',
      onClick: () => dispatch(addCellBellow()),
    },
    {
      icon: <FlipIcon sx={{transform: "rotate(-90deg)"}} />,
      name: 'Add cell above',
      onClick: () => dispatch(addCellAbove()),
    },
  ];

  return (
    <SpeedDial
      ariaLabel="SpeedDial basic example"
      sx={{
        position: "fixed",
        bottom: (theme) => theme.spacing(2),
        right: (theme) => theme.spacing(2),
      }}
      icon={<SpeedDialIcon />}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  );
}

export default DialMenu;
