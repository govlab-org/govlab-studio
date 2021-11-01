import { UploadFile } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { ChangeEvent, useRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import { readFileAsync } from "./fileSlice";

const extensions = [
  ".catala_en",
  ".catala_fr",
];

interface FileOpenButtonProps {
}

export const FileOpenButton = (props: FileOpenButtonProps) => {
  const inputFile = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const onFileChanged = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    event.preventDefault();

    const file = event?.target.files![0];

    dispatch(readFileAsync(file));
  }

  return (
    <IconButton size="large" color="inherit" onClick={() => inputFile.current?.click()}>
      <UploadFile />
      <input
        type='file'
        id='file'
        ref={inputFile}
        style={{display: 'none'}}
        accept={extensions.join(",")}
        onChange={onFileChanged}
      />
    </IconButton>
  );
}
