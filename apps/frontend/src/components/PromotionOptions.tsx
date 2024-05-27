import { pieceMapping } from "@/utils/pieceMapping";

type Props = {
  select: (value: "q" | "b" | "r" | "n") => void;
  color: string;
};

const PromotionOptions = ({ select, color }: Props) => {
  return (
    <div
      className={`flex w-16 flex-col items-center gap-4 absolute z-10 ${color === "w" ? "bg-stone-600" : "bg-gray-300"} -top-16 -right-full p-2 `}
    >
      <div onClick={() => select("q")}>
        <img
          className="size-10"
          src={pieceMapping[("q" + color) as keyof typeof pieceMapping]}
          alt={"qw"}
        />
      </div>
      <div onClick={() => select("b")}>
        <img
          className="size-10"
          src={pieceMapping[("b" + color) as keyof typeof pieceMapping]}
          alt={"bw"}
        />
      </div>
      <div onClick={() => select("r")}>
        <img
          className="size-10"
          src={pieceMapping[("r" + color) as keyof typeof pieceMapping]}
          alt={"rw"}
        />
      </div>
      <div onClick={() => select("n")}>
        <img
          className="size-10"
          src={pieceMapping[("n" + color) as keyof typeof pieceMapping]}
          alt={"nw"}
        />
      </div>
    </div>
  );
};

export default PromotionOptions;
