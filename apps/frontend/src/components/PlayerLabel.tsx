import React from "react";

type Props = {
  PlayerData: {
    id: string;
    name: string;
    profilePic:string;
  };
};
const PlayerLabel = ({PlayerData}:Props) => {
  return (
    <div className="flex gap-3 justify-start items-center my-3">
      <img src={PlayerData.profilePic} className="rounded-full size-8"/>
      <div className="font-semibold">{PlayerData.name}</div>
    </div>
  );
};

export default PlayerLabel;
