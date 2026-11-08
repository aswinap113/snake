package entities

type Snake struct {
	body          []Position
	snakeOccupied map[Position]struct{}
	direction     Direction
}

func NewSnake(start Position) *Snake {
	s := &Snake{
		snakeOccupied: make(map[Position]struct{}),
		direction:     Right,
	}
	s.AddHead(start)
	return s
}

func (s *Snake) Head() Position { return s.body[0] }
func (s *Snake) Tail() Position { return s.body[len(s.body)-1] }
func (s *Snake) Len() int       { return len(s.body) }

func (s *Snake) Direction() Direction { return s.direction }

func (s *Snake) SetDirection(direction Direction) {
	s.direction = direction
}

func (s *Snake) Contains(p Position) bool {
	_, ok := s.snakeOccupied[p]
	return ok
}

func (s *Snake) AddHead(p Position) {
	s.body = append(s.body, Position{})
	copy(s.body[1:], s.body[:len(s.body)-1])
	s.body[0] = p
	s.snakeOccupied[p] = struct{}{}
	// Remove the head if they are present in the FreeCells and FreeCellIndices map
}

func (s *Snake) RemoveTail() {
	tail := s.body[len(s.body)-1]
	s.body = s.body[:len(s.body)-1]
	delete(s.snakeOccupied, tail)
	// ADD the tail in the FreeCells and FreeCellIndices map
}

func (s *Snake) Cells() []Position {
	return append([]Position(nil), s.body...)
}
