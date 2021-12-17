import { SpeedDial, SpeedDialIcon } from "@mui/material";

interface Props {
}

const DialMenu = (props: Props) => {
  // const actions = [
    // {
    //   icon: <FlipIcon sx={{transform: "rotate(90deg)"}} />,
    //   name: 'Add cell below',
    //   onClick: () => (),
    // },
    // {
    //   icon: <FlipIcon sx={{transform: "rotate(-90deg)"}} />,
    //   name: 'Add cell above',
    //   onClick: () => dispatch(addCellAbove()),
    // },
  // ];

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
      {/* {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onClick}
        />
      ))} */}
    </SpeedDial>
  );
}

export default DialMenu;
