import { useUser } from "@repo/store/useUser";
import { useProfile } from "@repo/store/useProfile";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, formatDistanceToNow } from "date-fns";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { FaChessPawn } from "react-icons/fa";
import { ImStopwatch } from "react-icons/im";

const Profile = () => {
  const user = useUser();
  const navigate = useNavigate();
  const userProfile = useProfile();
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);
  if (!userProfile) {
    return <div>error in fetching</div>;
  }
  return (
    <div className="grid grid-cols-8 scrollbar-custom transition-colors duration-500">
      <div className="col-start-2 col-span-6 p-6 bg-black bg-opacity-20 mt-10 rounded-lg">
        <div className="grid grid-cols-6 gap-6">
          <div className="avatar">
            <div className="w-32 rounded">
              <img src={userProfile.profilePic} alt="user-profile-pic" />
            </div>
          </div>
          <div className="col-span-5">
            <div className="flex items-start flex-col px-2 gap-2">
              <div className="text-3xl font-bold text-stone-200">
                {userProfile.name}
              </div>
              <div className="text-stone-400">{userProfile.email}</div>
              <div className="flex gap-6">
                <div className="tooltip tooltip-bottom" data-tip="Last Login">
                  <div className="text-stone-400 hover:text-white transition-colors flex flex-col justify-center items-center gap-1">
                    <BsFillPersonLinesFill className="text-3xl" />
                    <span className="text-xs">
                      {formatDistanceToNow(userProfile.lastLogin)} ago
                    </span>
                  </div>
                </div>
                <div className="tooltip tooltip-bottom" data-tip="Joined">
                  <div className="text-stone-400 hover:text-white transition-colors flex flex-col justify-center items-center gap-1">
                    <FaChessPawn className="text-3xl" />
                    <div className="text-xs">
                      {formatDate(userProfile.createdAt, "dd MMM yyyy")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-start-2 col-span-6 p-6 bg-black bg-opacity-20 mt-10 rounded-lg">
        <div className="overflow-x-auto">
          <table className="table table-zebra-zebra">
            <thead>
              <tr className="text-stone-400">
                <th></th>
                <th>Game</th>
                <th>Players</th>
                <th>Result</th>
                <th>Moves</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {userProfile.games.map((game, index) => {
                const player =
                  user.id === game.whitePlayerId ? "WHITE" : "BLACK";
                const meWinner =
                  (game.result === "WHITE_WINS" && player === "WHITE") ||
                  (game.result === "BLACK_WINS" && player === "BLACK");
                return (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <th>
                      <ImStopwatch className="text-green-main text-xl" />
                    </th>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className=" size-2 bg-white border border-black"></div>
                        {game.whitePlayer.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className=" size-2 bg-black border border-white"></div>
                        {game.blackPlayer.name}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col justify-between items-center">
                          <div>{game.result === "WHITE_WINS" ? "1" : "0"}</div>
                          <div>{game.result === "BLACK_WINS" ? "1" : "0"}</div>
                        </div>
                        {meWinner ? (
                          <div className="bg-green-500 px-1 rounded-sm font-bold text-stone-300">+</div>
                        ) : (
                          <div className="bg-red-500 px-1 rounded-sm font-bold text-stone-300">-</div>
                        )}
                      </div>
                    </td>
                    <td>{game._count.moves ?? 0}</td>
                    <td>{formatDate(game.startAt, "d-MMM-yyyy")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;
