import { IMove } from "../models/IMove";

export interface IMoveService {
  makeMove(move: IMove) : Promise<IMove>;
}

