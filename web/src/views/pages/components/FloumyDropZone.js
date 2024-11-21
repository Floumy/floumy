import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./FloumyDropZone.scss";
import { trimText } from "../../../services/utils/utils";
import { Spinner } from "reactstrap";
import { deleteFile, downloadFile, uploadFile } from "../../../services/files/uploads.service";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";

export function FloumyDropZone({ onFilesChanged, initialFiles = [] }) {
  const { orgId, projectId } = useParams();

  const [files, setFiles] = useState(initialFiles.map(file => ({
    name: file.name,
    uploading: false,
    uploadedFile: file
  })));

  const uploadFileSafely = async (file) => {
    try {
      const uploadedFile = await uploadFile(orgId, projectId, file);
      setFiles(prevFiles => prevFiles.map(f => f.name === file.name ? { ...f, uploading: false, uploadedFile } : f));
    } catch (e) {
      toast.error("An error occurred while uploading the file");
      setFiles(prevFiles => prevFiles.filter(f => f.name !== file.name));
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const getUniqueFiles = (acceptedFiles) => {
      return acceptedFiles.filter(file => !files.some(f => f.name === file.name));
    };

    const newFiles = getUniqueFiles(acceptedFiles);
    prepareFilesForUploading(newFiles);

    for (const file of newFiles) {
      if (isFileTooLarge(file)) {
        handleLargeFile(file);
        continue;
      }
      // Do not await here, we want to upload all files at the same time
      uploadFileSafely(file);
    }
  }, [files]);

  const prepareFilesForUploading = (filesToPrepare) => {
    setFiles(prevFiles => [...prevFiles, ...filesToPrepare.map(file => ({ name: file.name, uploading: true }))]);
  };

  const isFileTooLarge = (file) => {
    return file.size > 50000000;
  };

  const handleLargeFile = (file) => {
    toast.error("There are files that are too large to be uploaded (50MB max)");
    setTimeout(() => {
      setFiles(prevFiles => prevFiles.filter(f => f.name !== file.name));
    }, 3000); // Delete the error message after 3 seconds
  };

  const removeFile = async fileId => {
    try {
      await deleteFile(orgId, projectId, fileId);
      setFiles(prevFiles => prevFiles.filter(file => file.uploadedFile.id !== fileId));
    } catch (e) {
      toast.error("An error occurred while deleting the file");
    }
  };

  useEffect(() => {
    onFilesChanged(files.filter(file => !file.uploading).map(file => file.uploadedFile));
  }, [files, onFilesChanged]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 5,
    onDropRejected: () => {
      toast.error("You can only upload 5 files at a time");
    }
  });

  function formatFilename(filename) {
    if (!filename) return "";
    if (filename.length <= 20) return filename;
    return trimText(filename, 10) + "" + filename.substring(filename.lastIndexOf("."));
  }

  async function downloadUploadedFile(file) {
    if (file.uploadedFile) await downloadFile(orgId, projectId, file.uploadedFile.id);
  }

  return (
    <>
      <div className="floumy-drop-zone" {...getRootProps()}>
        <div>
          <input {...getInputProps()} />
          <p><i className="fa fa-upload" /> Drag 'n' drop some files here, or click to select files</p>
        </div>
      </div>
      <div className="floumy-files-list">
        <ul>
          {files.map(file => (
            <li key={file.name}>
              <div className="filename-container" onClick={() => downloadUploadedFile(file)}
                   onKeyDown={() => downloadUploadedFile(file)}>
                {file.uploading && <Spinner size="sm" className="mr-2" />}
                {!file.uploading &&
                  <button className="btn btn-link btn-remove m-0 p-0 mr-2"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await removeFile(file.uploadedFile.id);
                          }} type={"button"}>
                    <i className="fas fa-trash" />
                  </button>}
                <span className="filename">{formatFilename(file.name)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

FloumyDropZone.propTypes = {
  onFilesChanged: PropTypes.func.isRequired,
  initialFiles: PropTypes.array
};

export default FloumyDropZone;
