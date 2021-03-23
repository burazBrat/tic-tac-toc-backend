import mongoose, { Document, Schema } from 'mongoose';
import { get, isEmpty } from 'lodash';
import { IMultiplayerGameState } from '../models/IMultiplayerGameState';
import { PlayerType } from '../models/PlayerType';
import { IMultiplayerGameStateRepository } from './IMultiplayerGameStateRepository';
import { logger } from '../appbase/logger';

const multiplayerGameStateSchema = new Schema({
  turn: {
    type: String,
    enum: ['X', 'O'],
    default: 'X',
  },
  gameId: String,
});

interface IMultiplayerGameStateModel extends IMultiplayerGameState, Document {
}

const multiplayerGameStateModel = mongoose.model<IMultiplayerGameStateModel>('multiplayerGameStateMode', multiplayerGameStateSchema);

export class MultiplayerGameStateRepository implements IMultiplayerGameStateRepository {

  public async dbCreateMultiplayerGameState(multiplayerGameState: IMultiplayerGameState): Promise<IMultiplayerGameState> {
    logger.debug('Try create multiplayer game state in db.');

    const createdMultiplayerGameState: IMultiplayerGameState = await MultiplayerGameStateRepository.getObject(await multiplayerGameStateModel.create(multiplayerGameState));

    logger.debug(`Return created multiplayer game state from db. GameId=${createdMultiplayerGameState.gameId}`);
    return createdMultiplayerGameState;
  }

  public async dbFindMultiplayerGameState({ gameId }: { gameId: string }): Promise<IMultiplayerGameState> {
    logger.debug('Try find multiplayer game state in db.');

    const multiplayerGameState: IMultiplayerGameState = await MultiplayerGameStateRepository.getObject(await multiplayerGameStateModel.findOne({ gameId }));

    logger.debug(`Return found multiplayer game state from db. GameId=${multiplayerGameState.gameId}`);
    return multiplayerGameState;
  }

  public async dbUpdateMultiplayerGameState(gameId: string, { turn }: { turn: PlayerType }): Promise<IMultiplayerGameState> {
    logger.debug('Try update multiplayer game state in db.');

    const multiplayerGameState: IMultiplayerGameState = await MultiplayerGameStateRepository.getObject(await multiplayerGameStateModel.findOneAndUpdate({ gameId }, { turn }, { new: true }));

    logger.debug(`Return updated multiplayer game state from db. GameId=${multiplayerGameState.gameId}`);
    return multiplayerGameState;
  }

  public async dbDeleteMultiplayerGameState(gameId: string) {
    logger.debug('Try delete multiplayer game state in db.');

    const multiplayerGameState = multiplayerGameStateModel.deleteOne({ gameId });
    if (isEmpty(multiplayerGameState)) {
      logger.debug(`Multiplayer game state not found in db. GameId=${gameId}`);
      return null;
    }

    logger.debug(`Return deleted multiplayer game state from db. GameId=${gameId}`);
    return multiplayerGameState;
  }

  private static async getObject(dbMove: IMultiplayerGameStateModel | null): Promise<IMultiplayerGameState> {
    return get(dbMove, '_doc');
  }
}
