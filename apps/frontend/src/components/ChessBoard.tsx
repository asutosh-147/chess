import { Color, Move, PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import { pieceMapping } from "../utils/pieceMapping";
import { toast } from "sonner";
import { useRecoilState } from "recoil";
import { isBoardFlipped } from "@repo/store/chessBoard";
import { useParams } from "react-router-dom";
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
type Props = {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  chess:any;
  setBoard:any;
  playerColor:string;
  play:any;
  started:boolean;
};
const ChessBoard = ({ board,socket,setBoard,chess,playerColor,play,started }: Props) => {
  const {roomId:gameId} = useParams();
  const [from, setFrom] = useState<null | Square>(null);
  const [isFlipped, setIsFlipped] = useRecoilState(isBoardFlipped);
  const isMyTurn = playerColor === chess.turn();
  useEffect(() => {
    if(playerColor === 'b'){
      setIsFlipped(true);
    }else{
      setIsFlipped(false);
    }
  }, [playerColor])
  

  const handleMakeMove = (from : Square, squareRep : Square) =>{
    
    console.log(from, squareRep);
    try {
      let moveResult:Move;
      moveResult = chess.move({
        from,
        to: squareRep
      })
      if(moveResult){
        play({id:"moveMade"})
        console.log("local move is made")
        socket.send(JSON.stringify({
          type: MOVE,
          payload: {
            gameId,
            move:moveResult
          }
        }))
        setBoard(chess.board());
        setFrom(null);
      }
    }catch(e:any){
      setFrom(null);
      toast.error("Invalid move",{
        description: e.message
      })
    }
  }
  return (
    <div className="text-white shadow-xl">
      {(isFlipped?[...board].reverse():board).map((row, i) => {
        i = isFlipped ? i+1 : 8-i;
        return (
          <div key={i} className="flex">
            {(isFlipped ? [...row].reverse() : row).map((square, j) => {
              j = isFlipped ? 7-j : j;
              const squareRep =  String.fromCharCode(97+j) + i as Square;
              return(
                <div
                  key={j}
                  className={`w-16 h-16 flex justify-center items-center ${
                    (i + j) % 2 === 0 ? "bg-gray-300" : "bg-gray-500"
                  }`}
                  onClick={() => {
                    if(!started) return;
                    if(!isMyTurn) return;
                    if(!square && from === null) return;
                    if(!from && square?.color !== chess.turn()) return;

                    if(!from){
                      if(square){
                        if(square.color === playerColor){
                          setFrom(squareRep)
                        }
                      }
                    }else{
                      handleMakeMove(from, squareRep);
                    }
                  }} 
                >
                  {
                    square ? (
                      square.color==='w'? (
                        <div className="text-white piece ">
                          {pieceMapping[square.type]}
                        </div>
                      ):(
                        <div className="text-black piece">
                          {pieceMapping[square.type]}
                        </div>
                      )
                    ): ""
                  }
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ChessBoard;
