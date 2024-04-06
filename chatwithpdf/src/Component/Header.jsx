import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export default function Header({ file, setFile }) {
  const fileInputRef = useRef(null);
  const [isLoading, setLoading] = useState(false);

  const [substringLength, setSubstringLength] = useState(20);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setSubstringLength(5);
      } else if (window.innerWidth <= 1024) {
        setSubstringLength(20);
      } else {
        setSubstringLength(30);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDrop = (event) => {
    event.preventDefault();
    const { files: droppedFiles } = event.dataTransfer;
    handleFile(droppedFiles[0]);
  };

  console.log(file);
  const handleFile = async (uploadedFile) => {
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      if (uploadedFile.size <= 10 * 1024 * 1024) {
        await sendFileToBackend(uploadedFile);
      } else {
        toast.success("File size exceeds 10MB!", {});
      }
    } else {
      toast.warning("Please drop/select only PDF files.", {});
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/plain", event.target.id);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = (event) => {
    const uploadedFile = event.target.files[0];
    handleFile(uploadedFile);
  };
  const sendFileToBackend = async (file) => {
    if (file) {
      const formData = new FormData();
      formData.append("pdf", file);

      setFile(file);
      const uuid = uuidv4();
      localStorage.setItem("uuid", uuid);

      try {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload/${uuid}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("File uploaded successfully", {});
        // console.log("File uploaded successfully:", response.data);
      } catch (error) {
        setFile(null);
        toast.error(error?.message, {});
        console.error("Error uploading file:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <header>
      <ToastContainer position="bottom-right" />
      <div className="max-w sm:px-6 sm:py-5 px-3 py-2 lg:px-8 shadow-md">
        <div className="flex items-center justify-between">
          <div className="">
            <div className="flex justify-center">
              <img
                className="mt-1 mr-[2px] flex h-8 w-8 sm:h-10 sm:w-10 sm:rounded-full"
                src="https://framerusercontent.com/images/JxfsrNbOZ4bzVLkgTU6rWWVAFiI.png"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  PDFChat
                </h1>
{/*                 <p className="ml-2 sm:ml-5 text-xs sm:text-sm text-gray-900">
                  formerly{" "}
                  <span className="font-bold text-sm text-green-600">
                    {" "}
                    DPhi
                  </span>
                </p> */}
              </div>
            </div>
          </div>

          <div className=" flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
            <div
              className="flex justify-center items-center gap-5"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="file-upload-div text-green-600 text-md font-medium">
                {file && (
                  <ul
                    className="flex justify-center items-center cursor-pointer gap-2"
                    title={file.name}
                    onClick={() => window.open(file.url, "_blank")}
                  >
                    <span className="rounded-md border border-green-300 px-1 py-2 transition">
                      <svg
                        width="24"
                        height="24"
                        fill="#16a34a"
                        xmlns="http://www.w3.org/2000/svg"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      >
                        <path d="M22 24h-20v-24h14l6 6v18zm-7-23h-12v22h18v-16h-6v-6zm1 5h4.586l-4.586-4.586v4.586z" />
                      </svg>
                    </span>
                    {isLoading ? (
                      <Box sx={{ width: 100 }}>
                        <Skeleton height={25} />
                        <Skeleton animation="wave" height={20} width={80} />
                      </Box>
                    ) : (
                      <li className=" sm:block">
                        {file.name.length > substringLength
                          ? `${file.name.substring(
                              0,
                              Math.floor(substringLength / 2)
                            )}...${file.name.substring(
                              file.name.length - Math.ceil(substringLength / 2)
                            )}`
                          : file.name}
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <button
                className="inline-flex items-center justify-center gap-3 rounded-lg border border-gray-900 md:px-8 md:py-2 px-3 py-3 transition hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring file-upload"
                type="button"
                draggable="true"
                onDragStart={handleDragStart}
                onClick={handleUploadButtonClick}
                disabled={isLoading}
                title="Drag & Drop or click to upload pdf!"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path d="M11.5 0c6.347 0 11.5 5.153 11.5 11.5s-5.153 11.5-11.5 11.5-11.5-5.153-11.5-11.5 5.153-11.5 11.5-11.5zm0 1c5.795 0 10.5 4.705 10.5 10.5s-4.705 10.5-10.5 10.5-10.5-4.705-10.5-10.5 4.705-10.5 10.5-10.5zm.5 10h6v1h-6v6h-1v-6h-6v-1h6v-6h1v6z" />
                </svg>
                <span className="text-md font-bold hidden md:block">
                  {" "}
                  Upload PDF{" "}
                </span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".pdf"
                onChange={handleFileInputChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
