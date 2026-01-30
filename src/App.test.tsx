import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza el título del inventario', () => {
  render(<App />);
  expect(screen.getByText(/inventario/i)).toBeInTheDocument();
});

