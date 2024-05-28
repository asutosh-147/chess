import { toast } from "sonner";
import { IoCopy } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import Button from "./ui/Button";
import { DELETE_ROOM } from "@repo/utils/messages";
type Props = {
  roomId: string;
  socket: WebSocket;
};

const RoomDetails = ({ roomId, socket }: Props) => {
  const handleDeleteRoom = () =>{
    socket.send(JSON.stringify({
      type:DELETE_ROOM,
      payload:{
        message:"delete the room"  
      }
    }))
  }
  const handleCopy = () => {
    window.navigator.clipboard.writeText(
      import.meta.env.VITE_APP_FRONTEND_URL + "/play/" + roomId
    );
    toast.success("copied successfully");
  };
  return (
    <div className="flex flex-col justify-center items-center gap-10 mt-10 p-2">
      <div className="text-lg capitalize font-semibold text-stone-200">
        Now
        <span className="text-red-500 font-bold text-lg"> checkmate </span>
        your Room mate
      </div>
      <div className="flex items-center justify-between gap-2 bg-stone-900 p-2 rounded-lg shadow-xl">
        <div className="truncate w-72 font-semibold">
          {import.meta.env.VITE_APP_FRONTEND_URL + "/play/" + roomId}
        </div>
        <button
          onClick={handleCopy}
          className="flex-1 p-2 rounded-md bg-blackSquare-brown text-white shadow-lg"
        >
          <IoCopy />
        </button>
      </div>
      <div className="text-center tracking-wide capitalize font-medium text-stone-200 ">
        wait for the opponent to join......you'll be redirected automatically
      </div>
      <Button onClick={handleDeleteRoom} className="flex items-center p-2 gap-2 font-bold">
        <MdDelete/>
        <p>Room</p>
      </Button>
    </div>
  );
};

export default RoomDetails;
