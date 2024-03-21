import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { toast } from "react-toastify";

export default function Chat({ file }) {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastQuestionRef = useRef(null);
  const [newQuestion, setNewQuesion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  useEffect(() => {
    if (lastQuestionRef.current) {
      lastQuestionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [questions]);

  function Animations() {
    return (
      <Box sx={{ width: 280 }}>
        <Skeleton />
        <Skeleton animation="wave" width={250} />
        <Skeleton animation={false} width={200} />
      </Box>
    );
  }
  let newQues = "";
  const handleSubmit = async (event) => {
    event.preventDefault();
    newQues = newQuestion;
    if (newQues !== "") {
      setLastQuestion(newQues);
      setNewQuesion("");
      setIsLoading(true);
      if (lastQuestionRef.current) {
        lastQuestionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
      try {
        const uuid = localStorage.getItem("uuid");
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/question/${uuid}`,
          {
            question: newQues,
          }
        );
        const answer = response.data.answer;
        setQuestions([...questions, { question: newQues, answer }]);
      } catch (error) {
        setNewQuesion(newQues);
        // console.error("Error:", error);
        toast.error(error?.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      {/* Prompt Messages Container - Modify the height according to your need */}
      <div className="flex h-[84vh] w-full md:w-[80vw] min-w-[370px] flex-col pb-3 overflow-hidden">
        {/* Prompt Messages */}
        <div className="chat flex-1 overflow-y-auto w-full p-4 text-sm leading-6 text-gray-900 sm:text-base sm:leading-7">
          {questions.map((item, index) => (
            <div
              key={index}
              className="mb-4 flex flex-col px-2 pt-2 sm:px-4"
              // ref={index === questions.length - 1 ? lastQuestionRef : null}
            >
              <div className="flex flex-row px-2 py-4 sm:px-4">
                <img
                  className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                  src="https://dummyimage.com/256x256/363536/ffffff&text=U"
                />

                <div className="flex max-w-3xl items-center">
                  <p> {item.question}</p>
                </div>
              </div>

              <div className="mb-4 flex px-2 py-6 sm:px-4">
                <img
                  className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                  src="https://framerusercontent.com/images/JxfsrNbOZ4bzVLkgTU6rWWVAFiI.png"
                />

                <div className="flex items-center">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex flex-col px-2 py-2 sm:px-4">
              <div className="flex flex-row px-2 py-4 sm:px-4">
                <img
                  className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                  src="https://dummyimage.com/256x256/363536/ffffff&text=U"
                />

                <div className="flex max-w-3xl items-center">
                  <p> {lastQuestion}</p>
                </div>
              </div>

              <div className="mb-4 flex px-2 py-6 sm:px-4">
                <img
                  className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                  src="https://framerusercontent.com/images/JxfsrNbOZ4bzVLkgTU6rWWVAFiI.png"
                />

                <div className="flex items-center">
                  <Animations />
                </div>
              </div>
            </div>
          )}
          <div ref={lastQuestionRef}></div>
        </div>

        {/* Prompt message input */}
        <form
          className="p-4"
          onSubmit={handleSubmit}
          title={
            !file
              ? "Upload the PDF to chat!"
              : isLoading
              ? "Wait, generating the answer!"
              : ""
          }
        >
          <label htmlFor="chat-input" className="sr-only">
            Enter your prompt
          </label>
          <div className="relative shadow-md">
            <textarea
              id="chat-input"
              className="block w-full shadow-xl leading-20 rounded-md border border-gray-500 p-4 pr-16 text-sm text-gray-900 focus:outline-none focus:ring-gray-800 sm:text-base"
              placeholder="Send a message..."
              rows="1"
              onChange={(e) => setNewQuesion(e.target.value)}
              value={newQuestion}
              required
              disabled={isLoading | !file}
            ></textarea>
            <button
              type="submit"
              className="absolute bottom-3 right-2.5 rounded-lg p-2 text-sm font-medium text-gray-800 hover:bg-gray-200 focus:outline-none sm:text-base"
              disabled={isLoading | !file}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                aria-hidden="true"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M10 14l11 -11"></path>
                <path d="M21 3l-6.5 18a.55 .5 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"></path>
              </svg>
              <span className="sr-only">Send message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
