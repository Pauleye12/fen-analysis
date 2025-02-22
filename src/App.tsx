import React, { useState, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { Brain } from "lucide-react";
// import { EvaluationBar } from "./components/EvaluationBar";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { MoveHistory } from "./components/MoveHistory";
import type {
  AnalysisResponse,
  ChessPosition,
  MoveHistory as MoveHistoryType,
} from "./types";
import AnalysisChat from "./components/AnalysisChat";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function App() {
  const [game] = useState(new Chess(INITIAL_FEN));
  const [position, setPosition] = useState<ChessPosition>({
    fen: INITIAL_FEN,
    isValid: true,
  });
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveHistoryType[]>([]);

  const validateFen = useCallback(
    (fen: string): boolean => {
      try {
        // const tempGame = new Chess(fen);
        game.load(fen);
        return true;
      } catch {
        return false;
      }
    },
    [game]
  );

  const handleFenChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newFen = event.target.value;
      const isValid = validateFen(newFen);
      setPosition({ fen: newFen, isValid });
      if (!isValid) {
        setError("Invalid FEN position");
        setAnalysis(null);
      } else {
        setError(null);
      }
    },
    [validateFen]
  );

  const analyzePosition = useCallback(async () => {
    if (!position.isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://fastapi-app-652057693890.us-central1.run.app/analyze-position",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fen: position.fen,
            depth: 15,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, [position.isValid, position.fen]);

  // Automatically analyze position after each move
  useEffect(() => {
    if (position.isValid && position.fen !== INITIAL_FEN) {
      analyzePosition();
    }
  }, [position.fen, position.isValid, analyzePosition]);

  // Get valid moves for the selected square
  const getValidMoves = useCallback(
    (square: Square): Square[] => {
      try {
        const moves = game.moves({
          square,
          verbose: true,
        });
        return moves.map((move) => move.to as Square);
      } catch {
        return [];
      }
    },
    [game]
  );

  // Handle move history navigation
  const handleMoveClick = useCallback(
    (fen: string) => {
      game.load(fen);
      setPosition({
        fen,
        isValid: true,
      });
    },
    [game]
  );

  // Handle piece selection
  const onSquareClick = useCallback(
    (square: Square) => {
      const piece = game.get(square);

      if (selectedSquare === square) {
        // Deselect if clicking the same square
        setSelectedSquare(null);
        return;
      }

      if (piece && piece.color === game.turn()) {
        // Select the square if it has a piece of the current turn
        setSelectedSquare(square);
        return;
      }

      if (selectedSquare) {
        // Try to make a move if we have a selected square
        try {
          const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: "q",
          });

          if (move) {
            const newPosition = {
              fen: game.fen(),
              isValid: true,
            };
            setPosition(newPosition);

            // Add move to history
            setMoveHistory((prev) => [
              ...prev,
              {
                san: move.san,
                color: move.color,
                fen: newPosition.fen,
              },
            ]);
          }
        } catch (e) {
          console.log(e);
          // Invalid move
        }
        setSelectedSquare(null);
      }
    },
    [game, selectedSquare]
  );

  // Handle piece drops
  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        if (move === null) return false;

        const newPosition = {
          fen: game.fen(),
          isValid: true,
        };
        setPosition(newPosition);

        // Add move to history
        setMoveHistory((prev) => [
          ...prev,
          {
            san: move.san,
            color: move.color,
            fen: newPosition.fen,
          },
        ]);

        setSelectedSquare(null);

        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
    [game]
  );

  // Calculate square styles including valid moves
  const customSquareStyles = useCallback(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Add styles for valid moves of selected piece
    if (selectedSquare) {
      const validMoves = getValidMoves(selectedSquare as Square);

      // Highlight selected square
      styles[selectedSquare.toString()] = {
        backgroundColor: "rgba(255, 255, 0, 0.4)",
      };

      // Highlight valid target squares
      validMoves.forEach((square) => {
        styles[square.toString()] = {
          backgroundColor: "rgba(0, 255, 0, 0.2)",
          borderRadius: "50%",
          boxShadow: "inset 0 0 1px 2px rgba(0, 255, 0, 0.4)",
        };
      });
    }

    // Add style for king in check
    if (game.inCheck()) {
      const pieces = game
        .board()
        .flat()
        .filter(
          (piece) => piece && piece.type === "k" && piece.color === game.turn()
        );
      const kingSquare = pieces[0] ? pieces[0].square : null;

      if (kingSquare) {
        styles[kingSquare.toString()] = {
          backgroundColor: "rgba(255, 0, 0, 0.2)",
        };
      }
    }

    return styles;
  }, [game, selectedSquare, getValidMoves]);

  return (
    <div className="min-h-screen pt-[70px] bg-gray-50">
      <header className="bg-white fixed z-50 top-0 w-full left-0 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Chess Analysis</h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <label htmlFor="fen" className="block font-medium text-blue-700">
              FEN Position
            </label>
            <div className="mt-1 flex space-x-4">
              <input
                type="text"
                id="fen"
                value={position.fen}
                onChange={handleFenChange}
                className={`flex-1 block w-full py-2 px-2 bg-gray-50 rounded-md ${
                  position.isValid ? "border-gray-300" : "border-red-300"
                } shadow-sm outline-none border border-solid focus-within:border-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter FEN notation..."
              />
              <button
                onClick={analyzePosition}
                disabled={!position.isValid || isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
            {/* <div className="flex-none">
              <EvaluationBar evaluation={analysis?.evaluation.value ?? 0} />
            </div> */}
            <AnalysisChat />

            <div className="flex-none hidden lg:block lg:w-[500px] w-full ">
              <Chessboard
                position={position.fen}
                boardWidth={500}
                onPieceDrop={onDrop}
                onSquareClick={onSquareClick}
                customBoardStyle={{
                  borderRadius: "4px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                customSquareStyles={customSquareStyles()}
              />
            </div>
            <div className="flex-none lg:hidden w-full ">
              <Chessboard
                position={position.fen}
                boardWidth={330}
                onPieceDrop={onDrop}
                onSquareClick={onSquareClick}
                customBoardStyle={{
                  borderRadius: "4px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                customSquareStyles={customSquareStyles()}
              />
            </div>

            <div className="flex-1 w-full space-y-6">
              <div className="bg-gray-100 rounded-lg">
                <AnalysisPanel
                  analysis={analysis}
                  isLoading={isLoading}
                  error={error}
                />
                <MoveHistory
                  moves={moveHistory}
                  currentFen={position.fen}
                  onMoveClick={handleMoveClick}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
