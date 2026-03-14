/** @jest-environment node */

import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderToStaticMarkup } from 'react-dom/server';

describe('PricingPage', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders public pricing content for signed-out visitors', async () => {
    let PricingPage!: () => Promise<JSX.Element>;

    await jest.isolateModulesAsync(async () => {
      jest.doMock('@clerk/nextjs/server', () => ({
        auth: jest.fn().mockResolvedValue({ userId: null }),
      }));
      jest.doMock('@clerk/nextjs', () => ({
        SignUpButton: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
      }));
      jest.doMock('next/link', () => ({
        __esModule: true,
        default: ({ href, children }: { href: string; children: React.ReactNode }) =>
          React.createElement('a', { href }, children),
      }));
      PricingPage = (await import('@/app/pricing/page')).default;
    });

    const page = await PricingPage();
    const html = renderToStaticMarkup(page);

    expect(html).toContain('Choose the plan that matches your content operation.');
    expect(html).toContain('Simple tiers, clear operational boundaries');
    expect(html).toContain('Start Free');
  });
});
