//image pieces
import whiteKing from "/pieces/king_w.svg";
import whiteQueen from "/pieces/queen_w.svg";
import whiteRook from "/pieces/rook_w.svg";
import whiteBishop from "/pieces/bishop_w.svg";
import whiteKnight from "/pieces/knight_w.svg";
import whitePawn from "/pieces/pawn_w.svg";
import blackKing from "/pieces/king_b.svg";
import blackQueen from "/pieces/queen_b.svg";
import blackRook from "/pieces/rook_b.svg";
import blackBishop from "/pieces/bishop_b.svg";
import blackKnight from "/pieces/knight_b.svg";
import blackPawn from "/pieces/pawn_b.svg";

//icons
import { FaChessKnight } from "react-icons/fa";
import { FaChessKing } from "react-icons/fa";
import { FaChessPawn } from "react-icons/fa";
import { FaChessRook } from "react-icons/fa";
import { FaChessQueen } from "react-icons/fa";
import { FaChessBishop } from "react-icons/fa6";

export const pieceMapping = {
  kw: whiteKing,
  qw: whiteQueen,
  rw: whiteRook,
  bw: whiteBishop,
  nw: whiteKnight,
  pw: whitePawn,
  kb: blackKing,
  qb: blackQueen,
  rb: blackRook,
  bb: blackBishop,
  nb: blackKnight,
  pb: blackPawn,
};


export const iconPieceMapping = {
  k: <FaChessKing />,
  q: <FaChessQueen />,
  r: <FaChessRook />,
  b: <FaChessBishop />,
  n: <FaChessKnight />,
  p: <FaChessPawn />,
};
