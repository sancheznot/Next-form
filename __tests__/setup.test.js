import { render, screen, React } from '@test-utils'

test('basic test setup', () => {
  render(React.createElement('div', null, 'Test Setup'))
  expect(screen.getByText('Test Setup')).toBeInTheDocument()
})