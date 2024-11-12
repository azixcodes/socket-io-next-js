"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface User {
  id: string;
  name: string;
  age: number;
}

interface MessageProps {
  id: string;
  name: string;
  message: string;
}

const Room = () => {
  const messageRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<User[]>([]);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [message, setMessage] = useState("");
  const params = useParams();

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTo({
        top: messageRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");

      socketRef.current.on("connect", () => {
        console.log("Connected to socket server.");

        socketRef.current?.on("message", (users) => {
          console.log("Received users list:", users);
          setData(users);
        });
        // listen for chat event
        socketRef.current?.on("chat", (data) => {
          setMessages((prevMessages) => [...prevMessages, data]); // Append new message to the state
          console.log("Received chat message:", data);
        });

        // listen for stored messages
        socketRef.current?.on("chatHistory", (chatHistory) => {
          setMessages(chatHistory);
          console.log("Received chat history:", chatHistory);
        });
      });
    }

    return () => {
      // Ensure the cleanup function disconnects the socket properly on component unmount
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleLeave = () => {
    socketRef.current?.emit("leave", params.id);
    socketRef.current?.disconnect();
    router.push("/");
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const messageData = {
      id: params.id,
      name: params.id, // Replace with the actual user's name
      message, // Example message; replace with dynamic message content
    };
    socketRef.current?.emit("sendMessage", messageData);
    setMessage("");
  };

  return (
    <div className="grid grid-cols-12 h-screen flex-col gap-4 px-20 py-20">
      <div className="border col-span-6 flex flex-col h-full gap-3">
        <div className="flex-1 p-2 border rounded overflow-y-auto">
          <h4 className="font-semibold mb-2">Chat Messages:</h4>
          <button
            className="bg-red-500 rounded-md px-2 py-1.5"
            onClick={() => setMessages([])}
          >
            clear chats
          </button>
          <hr className="my-2" />
          <div className="max-h-96 overflow-y-auto" ref={messageRef}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-auto flex-row  items-start gap-2 mt-2  p-2 rounded-md ${
                  msg.name !== params.id && "flex-row-reverse"
                }`}
              >
                <div className="h-10 min-w-10 flex items-center justify-center cursor-pointer rounded-full border bg-green-700 text-white border-slate-800 text-center uppercase">
                  {msg.name.slice(0, 2)}
                </div>
                <div
                  className={`border px-2 py-1.5 shadow-sm rounded-lg ${
                    msg.name !== params.id
                      ? "bg-[#6580B8] text-white"
                      : "bg-white"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        </div>
        <form
          className="mt-auto flex items-center gap-2 p-2 border-t"
          onSubmit={sendMessage}
        >
          <textarea
            rows={1}
            className="flex-1 resize-none p-2 border rounded-md outline-none focus:ring-1"
            placeholder="Type your message..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          ></textarea>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Send Message
          </button>
        </form>
      </div>

      <div className="border col-span-4 rounded-md p-3 shadow-md flex flex-col gap-3">
        <h4 className="font-semibold text-center text-lg">
          Users in this Room : {data.length}
        </h4>
        {data.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 flex items-center justify-center cursor-pointer rounded-full border bg-green-700 text-white border-slate-800 text-center uppercase">
                {user.name.slice(0, 2)}
              </div>
              <div className="flex flex-col -space-y-1">
                <label className="font-semibold">{user.name}</label>
                <p> {user.id}</p>
              </div>
            </div>
            {user.name === params.id && (
              <button
                className="bg-red-500 px-2 py-1.5 rounded-md text-white"
                onClick={handleLeave}
              >
                Leave
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
