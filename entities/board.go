package entities

import (
	"fmt"
)

type Board struct {
	height, width   int
	Food            Position
	FreeCells       []Position
	FreeCellIndices map[Position]int
}

func NewBoard(height, width int) (*Board, error) {
	if height < 1 || width < 1 {
		return nil, fmt.Errorf("height and width must be positive ")
	}
	if height*width < 2 {
		return nil, fmt.Errorf("board needs at least 2 cells")
	}
	return &Board{height: height, width: width}, nil
}

func (b *Board) Height() int { return b.height }
func (b *Board) Width() int  { return b.width }

func (b *Board) Cells() int { return b.height * b.width }

func (b *Board) Next(p Position, d Direction) Position {
	dr, dc := d.Move()
	return Position{
		Row: (p.Row + dr + b.height) % b.height,
		Col: (p.Col + dc + b.width) % b.width,
	}
}
