import { SaveAlt } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { saveAs } from 'file-saver';
import { useAppSelector } from "../../app/hooks";
import { FileStatus } from "./fileSlice";
import { serialize } from "remark-slate";
import { RootState } from "../../app/store";

// https://github.com/hanford/remark-slate/issues/25#issuecomment-903805837
type Chunk = Parameters<typeof serialize>[0];

interface Props {
}

export const SaveFileButton = (props: Props) => {
  const file = useAppSelector((state: RootState) => state.file);

  const onClick = () => {
    const data = new Blob(
      file.content!.map(value => serialize(value as Chunk)!),
      {type: "text/plain;charset=utf-8"},
    );

    saveAs(data, file.name ?? "");
  };

  if (file.status === FileStatus.NOT_LOADED) {
    return (
      <div></div>
    );
  }

  const enabled = file.status === FileStatus.CHANGED;

  return (
    <IconButton
      size="large"
      color="inherit"
      onClick={onClick}
      disabled={!enabled}>
      <SaveAlt />
    </IconButton>
  );
}
