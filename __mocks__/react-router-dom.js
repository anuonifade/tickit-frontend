// Mock implementation for react-router-dom
const mockUseParams = jest.fn().mockReturnValue({ id: '1' });
const mockUseNavigate = jest.fn();
const mockNavigate = jest.fn();

const Link = ({ children, to, ...props }) => (
  <a data-testid="mocked-link" href={to} {...props}>
    {children}
  </a>
);

// Export mock functions
module.exports = {
  useParams: () => mockUseParams(),
  useNavigate: () => mockNavigate,
  Link,
  // Add other hooks/components as needed
  useLocation: jest.fn().mockReturnValue({ pathname: '/', search: '', hash: '', state: null }),
  useRouteMatch: jest.fn(),
  useHistory: jest.fn(),
  Route: ({ children }) => children,
  Routes: ({ children }) => children,
  Outlet: () => null,
  Navigate: () => null,
  // Export the mock functions themselves for manipulation in tests
  _mockUseParams: mockUseParams,
  _mockNavigate: mockNavigate,
  _mockUseNavigate: mockUseNavigate
};
