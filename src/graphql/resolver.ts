import { withFilter } from "graphql-subscriptions";
import { SubscriptionType } from "../models/SubscriptionType";
import { pubsub } from "../appbase/apolloExpress";
import { IGame } from "../models/IGame";
import { IMove } from "../models/IMove";
import { GameService } from "../services/GameService";
import { GameHistoryService } from "../services/GameHistoryService";
import { GameRepository } from "../repositories/GameRepository";
import { MultiplayerGameStateRepository } from "../repositories/MultiplayerGameStateRepository";
import { IGameHistoryService } from "../services/IGameHistoryService";
import { IGameService } from "../services/IGameService";
import { MoveService } from "../services/MoveService";
import { IMoveService } from "../services/IMoveService";
import { MoveRepository } from "../repositories/MoveRepository";

const gameHistoryService: IGameHistoryService = new GameHistoryService(new GameRepository(), new MoveRepository());
const gameService: IGameService = new GameService(new GameRepository(), new MultiplayerGameStateRepository());
const moveService: IMoveService = new MoveService(new GameRepository(), new MoveRepository(), new MultiplayerGameStateRepository());

const resolvers = {
  Subscription: {
    gameResult: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SubscriptionType.GAME_RESULT),
        ({ gameResult }: any, { game }: any) => gameResult.gameId === game.gameId
      )
    }
  },
  Query: {
    gameHistory: (_: any, { game }: { game: IGame }) => gameHistoryService.getGameHistory(game)
  },

  Mutation: {
    createGame: (_: any, { game }: { game: IGame }) => gameService.createGame(game),
    joinGame: (_: any, { game }: { game: IGame }) => gameService.joinGame(game),

    makeNewMove: (_: any, { move }: { move: IMove }) => moveService.makeMove(move)
  }
};

export { resolvers };
