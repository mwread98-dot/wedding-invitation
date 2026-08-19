import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomePage } from '../pages/HomePage';

describe('HomePage', () => {
  it('presents the wedding and a clear RSVP action', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Alex.*Morgan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reply to your invitation/i })).toHaveAttribute(
      'href',
      '/rsvp',
    );
  });
});
