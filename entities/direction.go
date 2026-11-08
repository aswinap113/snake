package entities

type Direction int

const (
	Up Direction = iota
	Down
	Left
	Right
)

func (d Direction) Move() (dr, dc int) {
	switch d {
	case Up:
		return -1, 0
	case Down:
		return 1, 0
	case Left:
		return 0, -1
	default:
		return 0, 1
	}
}
