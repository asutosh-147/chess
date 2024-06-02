import { useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { PieceSymbol, Square } from "chess.js";
import React from "react";

type Props = {
  square: Square;
  onDrop: (from: Square, to: Square) => void;
  children: React.ReactNode;
};
type Item = {
  piece: PieceSymbol;
  from: Square;
};

const DroppableSquare = ({ square, onDrop, children }: Props) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.PIECE,
    drop: (item: Item) => {
      if (item.from === square) return;
      onDrop(item.from, square);
    }, 
  }));

  return (
    <div
      ref={drop}
      className="w-full h-full flex justify-center items-center"
    >
      {children}
    </div>
  );
};

export default DroppableSquare;
