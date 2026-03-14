import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InputForm from '@/components/InputForm';
import DashboardControls from '@/components/DashboardControls';
import JobCard from '@/components/JobCard';

const mockRefresh = jest.fn();
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();
const mockPathname = '/dashboard';
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockConfetti = jest.fn();
const mockPrint = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock('canvas-confetti', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockConfetti(...args),
}));

jest.mock('react-to-print', () => ({
  useReactToPrint: () => mockPrint,
}));

describe('Dashboard E2E flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));

    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: jest.fn(() => true),
    });

    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: {
        readText: jest.fn().mockResolvedValue('https://youtu.be/from-clipboard'),
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    global.fetch = jest.fn();
  });

  it('submits a valid URL, refreshes the dashboard, and resets the form', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, count: 1 }),
    });

    render(<InputForm />);

    const input = screen.getByPlaceholderText(/youtube\.com\/watch/i);
    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=abc123' } });
    fireEvent.click(screen.getByRole('button', { name: /repurpose video/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/process', expect.objectContaining({
        method: 'POST',
      }));
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Job created! 🎉', expect.any(Object));
      expect(mockRefresh).toHaveBeenCalled();
    });

    expect(input).toHaveValue('');
  });

  it('shows the upgrade prompt when the API returns quota exceeded', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 402,
      json: async () => ({ code: 'quota_exceeded', limit: 10, plan: 'free' }),
    });

    render(<InputForm />);

    fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch/i), {
      target: { value: 'https://youtube.com/watch?v=quota-hit' },
    });
    fireEvent.click(screen.getByRole('button', { name: /repurpose video/i }));

    expect(await screen.findByText(/you've reached your free plan limit/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upgrade to pro/i })).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('updates search, sort, and pagination through the dashboard controls', async () => {
    mockSearchParams.set('q', 'alpha');
    mockSearchParams.set('sort', 'newest');
    mockSearchParams.set('page', '2');

    render(<DashboardControls hasJobs={true} totalPages={4} />);

    const search = screen.getByPlaceholderText(/search titles or urls/i);
    fireEvent.change(search, { target: { value: 'beta' } });
    fireEvent.submit(search.closest('form')!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard?q=beta&sort=newest&page=1');
    });

    fireEvent.click(screen.getByRole('button', { name: /by status/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard?q=alpha&sort=status&page=1');
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard?q=alpha&sort=newest&page=3');
    });
  });

  it('reveals generated outputs for a completed job and copies a share link', async () => {
    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith('/api/oembed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            title: 'How to scale content',
            author: 'Creator',
            thumbnail: 'https://example.com/thumb.jpg',
          }),
        });
      }

      if (url === '/api/jobs/job-1/share') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ shareSlug: 'public-job' }),
        });
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });

    const { rerender } = render(
      <JobCard
        job={{
          _id: 'job-1',
          inputUrl: 'https://youtube.com/watch?v=abc123',
          status: 'processing',
          pinned: false,
          isPublic: false,
          createdAt: new Date().toISOString(),
          outputs: {
            tiktok: {
              hook: 'Hook line',
              script: 'Script body',
              caption: 'Caption copy',
              cta: 'Follow for more',
            },
          },
        }}
      />
    );

    expect(await screen.findByText('How to scale content')).toBeInTheDocument();
    expect(screen.queryByText(/hook line/i)).not.toBeInTheDocument();

    rerender(
      <JobCard
        job={{
          _id: 'job-1',
          inputUrl: 'https://youtube.com/watch?v=abc123',
          status: 'completed',
          pinned: false,
          isPublic: false,
          createdAt: new Date().toISOString(),
          outputs: {
            tiktok: {
              hook: 'Hook line',
              script: 'Script body',
              caption: 'Caption copy',
              cta: 'Follow for more',
            },
          },
        }}
      />
    );

    await waitFor(() => {
      expect(mockConfetti).toHaveBeenCalled();
    });

    expect(screen.getAllByText('Hook line').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTitle(/share public link/i));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost/share/public-job');
      expect(mockToastSuccess).toHaveBeenCalledWith('Public link copied to clipboard!');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('retries a failed job from the card action', async () => {
    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith('/api/oembed')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ title: 'Broken job', author: 'Creator' }),
        });
      }

      if (url === '/api/jobs/job-2/retry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });

    render(
      <JobCard
        job={{
          _id: 'job-2',
          inputUrl: 'https://youtube.com/watch?v=retry-me',
          status: 'failed',
          error: 'Transcript extraction failed',
          createdAt: new Date().toISOString(),
        }}
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: /retry job/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/jobs/job-2/retry', { method: 'POST' });
      expect(mockToastSuccess).toHaveBeenCalledWith('Job queued for retry');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
