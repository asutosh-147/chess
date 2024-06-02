import React from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { PieceSymbol, Square } from "chess.js";

type Props = {
  piece: PieceSymbol;
  square: Square;
  children: React.ReactNode;
};

const DraggablePiece = ({ piece, square, children }: Props) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PIECE,
    item: { piece, from: square },
    collect: (monitor:DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0 : 1,
        cursor: "",
      }}
    >
      {children}
    </div>
  );
};

export default DraggablePiece;
