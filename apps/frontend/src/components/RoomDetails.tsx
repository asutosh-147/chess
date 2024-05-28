import { toast } from "sonner";
import { IoCopy } from "react-icons/io5";
type Props = {
  roomId: string;
};

const RoomDetails = ({ roomId }: Props) => {
    const handleCopy = () =>{
        window.navigator.clipboard.writeText(roomId);
        toast.success("copied successfully");
    }
  return (
    <div className="w-full flex flex-col items-center">
      <p>
        Greate now
        <span className="bg-red-500 font-bold text-lg">checkmate</span>
        your Room mate
      </p>
      <div className="flex justify-between">
      <p className="truncate">{roomId}</p>
        <button onClick={handleCopy} className="flex-1 p-2 bg-stone-800 text-white shadow-lg">
            <IoCopy/>
        </button>
      </div>
      <p>
        wait for opponent to join you'll be redirected automatically
      </p>
    </div>
  );
};

export default RoomDetails;
