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

const Room = () => {
  const [data, setData] = useState<User[]>([]);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const params = useParams();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");

      socketRef.current.on("connect", () => {
        console.log("Connected to socket server.");
        socketRef.current?.on("message", (users) => {
          console.log("Received users list:", users);
          setData(users);
        });
      });

      return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }
  }, []);
  const handleLeave = () => {
    socketRef.current?.emit("leave", params.id);
    socketRef.current?.disconnect();
    router.push("/");
  };
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="text-xl font-semibold">Room users</div>
      <div className="flex flex-col gap-2 w-full items-center">
        {data.map((user, index) => (
          <div
            className="py-1.5 rounded-md border w-full max-w-xs px-3 font-semibold flex justify-between"
            key={index}
          >
            <p>{user.name}</p>
            {params.id === user.name && (
              <small
                className="text-xs text-red-500 cursor-pointer"
                onClick={handleLeave}
              >
                leave
              </small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
