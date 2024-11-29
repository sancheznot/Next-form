import { render, screen } from '@test-utils'
import React from 'react'

test('basic test setup', () => {
  render(React.createElement('div', null, 'Test Setup'))
  expect(screen.getByText('Test Setup')).toBeInTheDocument()
})