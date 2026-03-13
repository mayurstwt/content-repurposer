// src/components/InputForm.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProcessInputSchema, ProcessInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, ClipboardPaste, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function UpgradePrompt({ limit, plan }: { limit: number, plan: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (productId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/polar/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url; // Redirect to Polar
    } catch (e: any) {
      toast.error('Failed to start checkout', { description: e.message });
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-2 mb-4 animate-in slide-in-from-top-2">
      <h3 className="font-semibold text-sm mb-1">
        You've reached your {plan} plan limit ({limit} jobs).
      </h3>
      <p className="text-muted-foreground text-xs mb-4">
        Upgrade to unlock more video repurposing capabilities and priority queueing.
      </p>

      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={loading}
          onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID || '')}
        >
          {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
          Upgrade to Pro ($19/mo)
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_POLAR_AGENCY_PRODUCT_ID || '')}
        >
          Agency ($99/mo)
        </Button>
      </div>
    </div>
  );
}

export default function InputForm() {
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState<{ limit: number, plan: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<ProcessInput>({
    resolver: zodResolver(ProcessInputSchema),
    defaultValues: { url: '', tone: '', audience: '', webhookUrl: '' },
  });

  // #5 — Cmd/Ctrl+Enter keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        form.handleSubmit(onSubmit)();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // #16 — Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const current = form.getValues('url');
      const newVal = current ? `${current}\n${text}` : text;
      form.setValue('url', newVal, { shouldValidate: true });
      inputRef.current?.focus();
    } catch {
      toast.error('Cannot read clipboard', { description: 'Allow clipboard access and try again.' });
    }
  };

  const onSubmit = async (data: ProcessInput) => {
    setLoading(true);
    setQuotaExceeded(null); // Reset on new attempt

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.status === 402 && json.code === 'quota_exceeded') {
        setQuotaExceeded({ limit: json.limit, plan: json.plan });
        return; // Stop flow and show prompt
      }

      if (!res.ok) throw new Error(json.error || 'Failed to process');

      toast.success(json.count > 1 ? `${json.count} jobs created! 🎉` : 'Job created! 🎉', {
        description: 'Your videos are being processed. Usually ~1 minute.',
      });

      form.reset();
      router.refresh();

    } catch (err: any) {
      toast.error('Something went wrong', {
        description: err.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {quotaExceeded && <UpgradePrompt limit={quotaExceeded.limit} plan={quotaExceeded.plan} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube URL(s)</FormLabel>
                <FormControl>
                  <div className="flex gap-2 items-start">
                    <Textarea
                      placeholder={"https://www.youtube.com/watch?v=...\nhttps://youtu.be/..."}
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        (inputRef as any).current = e;
                      }}
                      disabled={loading}
                      className="min-h-[80px] resize-y"
                    />
                    {/* #16 — Clipboard paste button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handlePaste}
                      disabled={loading}
                      title="Paste from clipboard"
                    >
                      <ClipboardPaste className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs font-mono">⌘ Enter</kbd> to submit
                </p>
              </FormItem>
            )}
          />

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tone <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Gen Z slang, Professional" {...field} value={field.value || ''} disabled={loading} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Target Audience <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Tech founders, Students" {...field} value={field.value || ''} disabled={loading} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel className="text-xs">Webhook URL <span className="text-muted-foreground font-normal">(optional JSON POST on completion)</span></FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://your-server.com/webhook" {...field} value={field.value || ''} disabled={loading} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Repurpose Video'
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}