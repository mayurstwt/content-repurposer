"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, Link as LinkIcon, Copy } from "lucide-react";

export default function TeamClient() {
    const [workspace, setWorkspace] = useState<any>(null);
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [name, setName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");

    const fetchWorkspace = async () => {
        try {
            const res = await fetch("/api/workspaces");
            if (!res.ok) {
                if (res.status === 403) toast.error("Agency plan required for Team Workspaces.");
                return;
            }
            const data = await res.json();
            setWorkspace(data);
            setName(data.name);
            setLogoUrl(data.branding?.logo || "");

            const invRes = await fetch("/api/workspaces/invites");
            if (invRes.ok) setInvites(await invRes.json());
        } catch (e) {
            toast.error("Failed to load workspace.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspace();
    }, []);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/workspaces", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    branding: { logo: logoUrl }
                }),
            });
            if (!res.ok) throw new Error("Update failed");
            toast.success("Workspace settings updated!");
            fetchWorkspace();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleGenerateInvite = async () => {
        setGenerating(true);
        try {
            const res = await fetch("/api/workspaces/invites", { method: "POST" });
            if (!res.ok) throw new Error("Failed to generate invite link");
            const data = await res.json();
            fetchWorkspace();
            toast.success("Invite link generated!");

            const url = `${window.location.origin}/invite/${data.token}`;
            await navigator.clipboard.writeText(url);
            toast.info("Link copied to clipboard!");
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return <div className="text-sm text-muted-foreground animate-pulse">Loading team settings...</div>;
    }

    if (!workspace) {
        return null; // The server page component handles the fallback UI
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Workspaces</h1>
                <p className="text-muted-foreground mt-2">Manage your agency team. Members invited to your workspace will share your unlimited quota.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Workspace Settings</CardTitle>
                    <CardDescription>Update your team's name and white-label branding.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Workspace Name</label>
                            <Input
                                placeholder="e.g. Acme Marketing"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex justify-between">
                                <span>Custom Logo URL</span>
                                <span className="text-primary text-xs">White-label feature</span>
                            </label>
                            <Input
                                placeholder="https://example.com/logo.png"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">This logo will replace the "Repurposer" title on any public links you or your team shares.</p>
                        </div>
                        <Button type="submit">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invite Team Members</CardTitle>
                    <CardDescription>Generate secure URLs to onboard your colleagues directly into "{workspace.name}".</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button onClick={handleGenerateInvite} disabled={generating} className="gap-2">
                        <LinkIcon className="w-4 h-4" /> Generate Invite Link
                    </Button>

                    {invites.length > 0 && (
                        <div className="border rounded-lg divide-y">
                            {invites.map((inv) => {
                                const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${inv.token}`;
                                return (
                                    <div key={inv._id} className="p-4 flex items-center justify-between text-sm">
                                        <div>
                                            <div className="font-mono text-xs bg-muted p-1 px-2 rounded mb-1">{url}</div>
                                            <span className="text-muted-foreground text-xs">Expires: {new Date(inv.expiresAt).toLocaleDateString()}</span>
                                        </div>
                                        <Button size="icon" variant="outline" onClick={() => {
                                            navigator.clipboard.writeText(url);
                                            toast.success("Copied!");
                                        }}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/30 border-t py-4 text-xs text-muted-foreground flex gap-2 items-center">
                    <Users className="w-4 h-4" /> You currently have {workspace.memberIds.length} team member(s) enrolled.
                </CardFooter>
            </Card>
        </div>
    );
}
