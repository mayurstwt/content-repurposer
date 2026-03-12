// src/components/InputForm.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProcessInputSchema, ProcessInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, ClipboardPaste } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function InputForm() {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<ProcessInput>({
    resolver: zodResolver(ProcessInputSchema),
    defaultValues: { url: '' },
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
      form.setValue('url', text, { shouldValidate: true });
      inputRef.current?.focus();
    } catch {
      toast.error('Cannot read clipboard', { description: 'Allow clipboard access and try again.' });
    }
  };

  const onSubmit = async (data: ProcessInput) => {
    setLoading(true);

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to process');

      toast.success('Job created! 🎉', {
        description: 'Your video is being processed. Usually ~1 minute.',
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube URL</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      (inputRef as any).current = e;
                    }}
                    disabled={loading}
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
  );
}