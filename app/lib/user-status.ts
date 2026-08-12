import type { User, UserStatus } from "wle-core";

export function getCurrentUserStatus(user: User): UserStatus | null {
    return user.status ?? null; // API should compute the latest status
}

export function isUserApproved(user: User): boolean {
    const status = getCurrentUserStatus(user);
    return status?.status === 'approved';
}

export function isUserBlocked(user: User): boolean {
    const status = getCurrentUserStatus(user);
    return status?.status === 'blocked';
}

export function isUserSuspended(user: User): boolean {
    const status = getCurrentUserStatus(user);
    return status?.status === 'suspended';
}