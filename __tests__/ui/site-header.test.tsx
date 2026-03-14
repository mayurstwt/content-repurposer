import type React from 'react';
import { render, screen } from '@testing-library/react';
import { SiteHeader } from '@/components/SiteHeader';
import { PricingSection } from '@/components/PricingSection';

jest.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

jest.mock('@/components/UserDropdown', () => ({
  UserDropdown: () => <div data-testid="user-dropdown" />,
}));

describe('SiteHeader', () => {
  it('shows public navigation for signed-out users', () => {
    render(<SiteHeader userId={null} />);

    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pricing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sign in').length).toBeGreaterThan(0);
    expect(screen.getByText('Start Free')).toBeInTheDocument();
    expect(screen.queryByTestId('user-dropdown')).not.toBeInTheDocument();
  });

  it('shows app navigation for signed-in users', () => {
    render(<SiteHeader userId="user_123" />);

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pricing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Billing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Team').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Developer').length).toBeGreaterThan(0);
    expect(screen.getByTestId('user-dropdown')).toBeInTheDocument();
  });
});

describe('PricingSection', () => {
  it('renders all plan tiers and call to actions', () => {
    render(<PricingSection />);

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Agency')).toBeInTheDocument();
    expect(screen.getByText('Start Free')).toBeInTheDocument();
    expect(screen.getByText('Go Pro')).toBeInTheDocument();
    expect(screen.getByText('Scale With Agency')).toBeInTheDocument();
  });
});
