import Chat from "./Component/Chat";
import Header from "./Component/Header";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [file, setFile] = useState(null);
  return (
    <>
    <Header file={file} setFile={setFile} />
    <div className="flex justify-center items-center min-w-[350px]">
      <Chat file={file} />
    </div>
    </>
  )
}