package main

import (
	"snake/entities"
	"snake/enums"
)

type Game struct {
	Board *entities.Board

	Snake *entities.Snake

	Food entities.Position

	Score int
	State enums.Status
}

func NewGame(height, width int) (*Game, error) {
	board, err := entities.NewBoard(height, width)
	if err != nil {
		return nil, err
	}

	spawner := NewFoodSpawner()
	food, _ := spawner.Spawn(board, entities.NewSnake(entities.Position{Row: 0, Col: 0}))
	return &Game{
		Board: board,
		Snake: entities.NewSnake(entities.Position{Row: 0, Col: 0}),
		Food:  food,
		Score: 0,
		State: enums.RUNNING,
	}, nil
}

func (g *Game) Move() {
	//Capture the move
	//Check if the move is valid
}
