import { gql } from "apollo-server-express";

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
    type: String
    state: String
    winner: String
  }
  
  input GameInput {
    gameId: String
    type: String
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
    player: String
    position: Int
    gameId: String
  }
  
  input MoveInput {
    player: String
    position: Int
    gameId: String
  }
  
  type GameResult {
    gameId: String
    state: String
    winner: String
    moves: [Move]
  }
`;

export { typeDefs };
