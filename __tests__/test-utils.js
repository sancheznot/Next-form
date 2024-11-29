const { render } = require('@testing-library/react');
const React = require('react');

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn()
};

let currentPathname = '/login';

const setPathname = (newPathname) => {
  currentPathname = newPathname;
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => currentPathname
}));

const customRender = (ui, options = {}) => {
  return render(ui, {
    wrapper: ({ children }) => React.createElement(React.Fragment, null, children),
    ...options,
  });
};

module.exports = {
  render: customRender,
  mockRouter,
  setPathname,
  ...require('@testing-library/react')
};