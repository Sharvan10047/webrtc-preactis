import { render, screen, logRoles } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

jest.mock("./pages/home", () => {
  return {
    HomePage: () => <div data-testid="home-page-render">Test</div>
  }
})

test('renders when user in (/) url then render login page', () => {
  window.history.pushState({}, "", "/");
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // const homePage = screen.getByTestId("home-page-render")
  expect(screen.getByTestId("home-page-render")).toBeInTheDocument();
});





