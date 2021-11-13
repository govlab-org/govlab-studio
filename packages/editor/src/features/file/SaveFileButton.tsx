import { SaveAlt } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { saveAs } from 'file-saver';
import { useAppSelector } from "../../app/hooks";
import { FileStatus, selectFile, selectFileContent } from "./fileSlice";
import { serialize } from 'remark-slate';

// https://github.com/hanford/remark-slate/issues/25#issuecomment-903805837
type Chunk = Parameters<typeof serialize>[0];

interface Props {
}

export const SaveFileButton = (props: Props) => {
  const file = useAppSelector(selectFile);
  const content = useAppSelector(selectFileContent);

  const onClick = () => {
    const data = new Blob(
      content!.map(cell => 
        cell.text.content.map(value => serialize(value as Chunk)).join('\n')
        + "\n```catala_en\n"
        + cell.code.code
        + "\n```\n\n"
      ),
      {type: "text/plain;charset=utf-8"},
    );

    saveAs(data, file.name ?? "");
  };

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
