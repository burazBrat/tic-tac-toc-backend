import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Query {
    game(gameId: String!): Game
    games: [Game]
    
    gameHistory(game: GameHistoryInput!): GameResult
  }

  type Mutation {
    createGame(game: GameInput!): Game
    joinGame(game: GameJoinInput!): Game
    
    makeNewMove(move: MoveInput!): Move
  }
  
  type Subscription {
    gameResult(game: GameResultInput!): GameResult
  }
  
  type Game {
    gameId: String
    type: GameType
    state: GameStateType
    winner: GameWinnerType
  }
  
  input GameInput {
    gameId: String!
    type: GameType!
  }
  
  input GameJoinInput {
    gameId: String
  }
  
  input GameHistoryInput {
    gameId: String
  }
    
  input GameResultInput {
    gameId: String
  }
  
  type Move {
    _id: ID!
    player: PlayerType
    position: Int
    gameId: String
  }
  
  input MoveInput {
    player: PlayerType
    position: Int
    gameId: String
  }
  
  type GameResult {
    gameId: String
    state: GameStateType
    winner: GameWinnerType
    moves: [Move]
  }
  
  enum GameType {
    SINGLE
    MULTIPLAYER
  }
  
  enum GameStateType {
    CREATED
    WAITING_FOR_SECOND_PLAYER
    PLAYING
    FINISHED
  }
  
  enum GameWinnerType {
    X
    O
    DRAW
  }
  
  enum PlayerType {
    X
    O
  }
`;

export { typeDefs };
