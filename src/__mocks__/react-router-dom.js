const React = require('react');

// Mock components
const Link = ({ children, to, ...props }) => (
  React.createElement('a', { 
    'data-testid': 'mocked-link', 
    href: to, 
    ...props 
  }, children)
);

const MemoryRouter = ({ children }) => React.createElement('div', { 'data-testid': 'memory-router' }, children);
const Routes = ({ children }) => React.createElement('div', { 'data-testid': 'routes' }, children);
const Route = ({ children }) => React.createElement('div', { 'data-testid': 'route' }, children);
const Navigate = () => React.createElement('div', { 'data-testid': 'navigate' });
const Outlet = () => React.createElement('div', { 'data-testid': 'outlet' });
const BrowserRouter = MemoryRouter;

// Mock hooks
const useNavigate = () => jest.fn();
const useParams = () => ({ id: '1' });
const useLocation = () => ({ pathname: '/', search: '', hash: '', state: null });
const useRouteMatch = () => ({ path: '/', url: '/' });
const useHistory = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  listen: jest.fn()
});

module.exports = {
  BrowserRouter,
  MemoryRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
  useNavigate,
  useParams,
  useLocation,
  useRouteMatch,
  useHistory
};
