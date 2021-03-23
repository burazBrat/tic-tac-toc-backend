# Backend Server for Tic-Tac-Toe game

It is based on Typescript, Apollo Express, GraphQL and MongoDB memory server.

# Quickstart

```bash
yarn install
yarn start
```

To test GraphQL queries in your local environment open a browser and connect to GraphQL Playground 
> http://localhost:3000/graphql

To test GraphQL subscriptions in your local environment use Altair GraphQL client.
Open a Altair extension or Altair desktop application and connect to GraphQL Playground
> http://localhost:3000/graphql

# Mongoose CRUD Samples for GraphQL Request
You can test GraphQL Server with Mongoose without MongoDB installation.
It uses MongoDB memory server.

## Tic-Tac-Toe CRUD GraphQL queries samples

### Create a new game
```bash
gameId: string
type: enum(string), values = ["SINGLE", "MULTIPLAYER"]
```

```gql
mutation create {
  createGame(game: { gameId: "gameTest", type: "SINGLE"}) {
    gameId
    type
    stateMULTIPLAYER
  }
}
```

### Join an existing game

```bash
gameId: string
```

```gql
mutation joinGame {
  joinGame(game: { gameId: "gameTest"}) {
    gameId
    state
  }
}
```

### Make a new move

```bash
player: enum(string), values = ["SINGLE", "MULTIPLAYER"]
position: enum(number), values = [0, 1, 2, 3, 4, 5, 6, 7, 8]
gameId: string
```

```gql
mutation makeNewMove {
  makeNewMove(move: { player: "X", position:0, gameId: "gameTest"}) {
    player
    position
    gameId
  }
}
```

### Get live results via subscription

```bash
gameId: string
```

```gql
subscription joinGame {
  gameResult(game: { gameId: "gameTest"}) {
    gameId
    state
    moves {
      player
      position
    }
  }
}
```

### Get history for a game by id

```bash
gameId: string
```

```gql
query {
  gameHistory (game: {gameId: "gameTest"}) {
    gameId
    winner
    moves {
      player
      position
    }
  }
}
```
