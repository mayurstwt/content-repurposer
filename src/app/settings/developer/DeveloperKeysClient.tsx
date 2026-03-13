"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lock, Trash2, KeyRound, AlertTriangle, EyeOff, Eye, Terminal } from "lucide-react";

interface ApiKey {
    _id: string;
    name: string;
    lastUsed?: string;
    createdAt: string;
}

export default function DeveloperKeysClient() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [revealedKey, setRevealedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await fetch("/api/developer/keys");
            if (!res.ok) {
                if (res.status === 403) {
                    toast.error("Agency plan required for API access.");
                }
                setKeys([]);
                return;
            }
            const data = await res.json();
            setKeys(data);
        } catch (e) {
            toast.error("Failed to load API keys.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        setCreating(true);

        try {
            const res = await fetch("/api/developer/keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newKeyName }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Creation failed");

            setRevealedKey(data.key);
            setNewKeyName("");
            toast.success("API Key generated!");
            fetchKeys();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Revoke API Key "${name}"? This action cannot be undone and integrations will instantly break.`)) return;

        try {
            const res = await fetch(`/api/developer/keys/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Revocation failed");
            toast.success("Key revoked successfully.");
            fetchKeys(); // refresh
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    if (loading) {
        return <div className="text-sm text-muted-foreground animate-pulse">Loading developer settings...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Developer API Keys</h1>
                <p className="text-muted-foreground mt-2">Generate secret keys to natively integrate the AI video repurposer into your apps and workflows.</p>
            </div>

            {revealedKey && (
                <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20 shadow-md animate-in slide-in-from-top-2">
                    <CardHeader>
                        <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Save your new secret key!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-4">You will only be able to see this API key once. Please copy it and store it in a secure location.</p>
                        <div className="flex items-center space-x-2">
                            <code className="relative rounded bg-muted font-mono p-3 text-sm flex-1 break-all select-all font-bold">
                                {revealedKey}
                            </code>
                            <Button onClick={() => {
                                navigator.clipboard.writeText(revealedKey);
                                toast.success("Secret copied to clipboard!");
                            }}>
                                Copy Secret
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full text-green-700 hover:text-green-800 hover:bg-green-100 border-green-200" onClick={() => setRevealedKey(null)}>
                            I have safely stored my key
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {!revealedKey && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Key</CardTitle>
                        <CardDescription>Give this API key a recognizable label to track its usage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="flex gap-2 items-center max-w-md">
                            <Input
                                placeholder="e.g. Production Automations Worker"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                disabled={creating}
                                required
                            />
                            <Button type="submit" disabled={creating || !newKeyName.trim()}>
                                Generate Key
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <KeyRound className="w-5 h-5" /> Active Keys ({keys.length}/10)
                </h3>

                {keys.length === 0 ? (
                    <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-6 text-center border border-dashed">
                        You don't have any active API keys yet.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {keys.map((k) => (
                            <Card key={k._id} className="bg-card">
                                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div>
                                        <div className="font-semibold mb-1 flex items-center gap-2">
                                            {k.name} <Badge variant="secondary" className="text-[10px] font-mono">rp_••••••••</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-x-4">
                                            <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                                            <span>Last Used: {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Never'}</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(k._id, k.name)} className="text-destructive hover:bg-destructive/10 shrink-0">
                                        <Trash2 className="w-4 h-4 mr-2" /> Revoke
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-8">
                <h3 className="text-md font-medium text-foreground mb-3 flex items-center gap-2"><Terminal className="w-4 h-4" /> API Blueprint</h3>
                <div className="bg-indigo-950 text-indigo-100 p-4 rounded-lg overflow-x-auto text-xs font-mono space-y-4 max-w-full">
                    <div>
                        <span className="text-green-400">POST</span> {process.env.NEXT_PUBLIC_APP_URL || 'https://repurposer.app'}/api/v1/repurpose
                    </div>
                    <div>
                        Authorization: Bearer <span className="opacity-50">&lt;YOUR_SECRET_KEY&gt;</span>
                    </div>
                    <div>
                        {`{
  "url": "https://youtube.com/watch?v=...",
  "webhookUrl": "https://your-server.com/callback" 
}`}
                    </div>
                </div>
            </div>
        </div>
    );
}
