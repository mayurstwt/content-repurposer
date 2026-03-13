"use client";

import { UserButton } from "@clerk/nextjs";
import { CreditCard, Terminal, Users } from "lucide-react";

export function UserDropdown() {
    return (
        <UserButton>
            <UserButton.MenuItems>
                <UserButton.Link
                    label="Billing & Subscription"
                    labelIcon={<CreditCard className="w-4 h-4" />}
                    href="/settings/billing"
                />
                <UserButton.Link
                    label="Developer APIs"
                    labelIcon={<Terminal className="w-4 h-4" />}
                    href="/settings/developer"
                />
                <UserButton.Link
                    label="Team Workspaces"
                    labelIcon={<Users className="w-4 h-4" />}
                    href="/settings/team"
                />
            </UserButton.MenuItems>
        </UserButton>
    );
}
