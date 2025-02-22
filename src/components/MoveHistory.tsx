import type { MoveHistory } from "../types";
import clsx from "clsx";

interface MoveHistoryProps {
  moves: MoveHistory[];
  currentFen: string;
  onMoveClick: (fen: string) => void;
}

export function MoveHistory({
  moves,
  currentFen,
  onMoveClick,
}: MoveHistoryProps) {
  // Group moves by pairs (white and black)
  const movesPaired = moves.reduce<Array<[MoveHistory, MoveHistory | null]>>(
    (acc, move, i) => {
      if (i % 2 === 0) {
        acc.push([move, moves[i + 1] || null]);
      }
      return acc;
    },
    []
  );

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="text-lg font-medium mb-4">Move History</h3>
      <div className=" flex items-center gap-3 flex-wrap ">
        {movesPaired.map(([white, black], index) => (
          <div key={index} className="flex items-center text-sm">
            <span className=" text-gray-500">{index + 1}.</span>
            <button
              onClick={() => onMoveClick(white.fen)}
              className={clsx(
                "px-1 py-1 rounded hover:bg-gray-100",
                currentFen === white.fen && "bg-blue-100 hover:bg-blue-200"
              )}
            >
              {white.san}
            </button>
            {black && (
              <button
                onClick={() => onMoveClick(black.fen)}
                className={clsx(
                  "px-1 py-1 rounded hover:bg-gray-100 ml-1",
                  currentFen === black.fen && "bg-blue-100 hover:bg-blue-200"
                )}
              >
                {black.san}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
