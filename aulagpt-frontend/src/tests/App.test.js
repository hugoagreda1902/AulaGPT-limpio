import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

test('sends user data on form submit', async () => {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Juan' } });
  fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'juan@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
  fireEvent.click(screen.getByText('Agregar Usuario'));
  
  // Verificar que el mensaje de éxito se muestra
  expect(await screen.findByText(/Usuario agregado con ID/i)).toBeInTheDocument();
});
