import mongoose, { Document, Schema } from 'mongoose';
import { get, map } from 'lodash';
import { IMove } from '../models/IMove';
import { ALL_GAME_POSITIONS } from '../config/constants';
import { PlayerType } from '../models/PlayerType';
import { IMoveRepository } from './IMoveRepository';
import { logger } from '../appbase/logger';

const moveSchema = new Schema({
  player: {
    type: String,
    enum: ['X', 'O'],
  },
  position: {
    type: Number,
    enum: ALL_GAME_POSITIONS,
  },
  gameId: String,
});

interface IMoveModel extends IMove, Document {
}

const moveModel = mongoose.model<IMoveModel>('move', moveSchema);

export class MoveRepository implements IMoveRepository {

  public async dbCreateMove(move: IMove): Promise<IMove> {
    logger.debug(`Try create move in db. GameId=${move.gameId}`);

    const createdMove: IMove = await MoveRepository.getObject(await moveModel.create(move));

    logger.debug(`Return created move from db. GameId=${createdMove.gameId}`);
    return createdMove;
  }

  public async dbFindMoves(gameId: string): Promise<IMove[]> {
    logger.debug(`Try find moves from db. GameId=${gameId}`);

    const moves: IMove[] = await MoveRepository.getObjects(await moveModel.find({ gameId }));

    logger.debug(`Return found moves from db. GameId=${gameId}`);
    return moves;
  }

  public async dbFindMoveByPosition({ gameId, position }: { gameId: string, position: number }): Promise<IMove> {
    logger.debug(`Try find move from db. GameId=${gameId}`);

    const move: IMove = await MoveRepository.getObject(await moveModel.findOne({ gameId, position }));

    logger.debug(`Return found move from db. GameId=${gameId}`);
    return move;
  }

  public async dbFindMovesByPlayer({ gameId, player }: { gameId: string, player: PlayerType }): Promise<IMove[]> {
    logger.debug(`Try find moves from db by player type. GameId=${gameId}`);

    const moves: IMove[] = await MoveRepository.getObjects(await moveModel.find({ gameId, player }));

    logger.debug(`Return found moves from db by player type. GameId=${gameId}`);
    return moves;
  }

  private static async getObject(dbMove: IMoveModel | null): Promise<IMove> {
    return get(dbMove, '_doc');
  }

  private static async getObjects(dbMoves: IMoveModel[]): Promise<IMove[]> {
    return map(dbMoves, '_doc');
  }
}

