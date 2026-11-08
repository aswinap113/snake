package main

import "snake/entities"

type FoodSpawner struct {
}

func NewFoodSpawner() *FoodSpawner {
	return &FoodSpawner{}
}

func (r *FoodSpawner) Spawn(b *entities.Board, s *entities.Snake) (entities.Position, bool) {
	free := b.Cells() - s.Len()
	if free <= 0 {
		return entities.Position{}, false
	}
	k := 2 //RANDOEM Int
	for row := 0; row < b.Height(); row++ {
		for col := 0; col < b.Width(); col++ {
			p := entities.Position{Row: row, Col: col}
			if s.Contains(p) {
				continue
			}
			if k == 0 {
				return p, true
			}
			k--
		}
	}
	return entities.Position{}, false
}
