# Luminous Hand — Firestore Security Specification

## 1. Data Invariants
1. A user document at `/users/{userId}` can only be read, created, or updated by the verified authenticated owner (`request.auth.uid == userId`), and `role` is restricted to `'parent' | 'educator'` (never self-escalated to admin).
2. Subcollections under `/users/{userId}` (`workflows`, `ragFiles`, `aslVideos`) enforce the Master Gate (`exists(/databases/$(database)/documents/users/$(userId))`) plus strict `ownerId == request.auth.uid` and `userId == request.auth.uid` checks.
3. All document IDs (`userId`, `workflowId`, `ragId`, `videoId`, `ticketId`) must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
4. All timestamps (`createdAt`, `updatedAt`) must match `request.time` on write, and `createdAt` and `ownerId`/`uid` are immutable on update.
5. `SupportTicket` documents contain PII (`name`, `email`, `message`) and are strictly readable only by `ownerId == request.auth.uid` or the verified admin (`bmn2179@gmail.com` with `email_verified == true`).
6. Terminal state locking: once a `LearningWorkflow` reaches `status == 'completed'`, non-admin clients cannot reopen or alter it.

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read of `/users/user123`**: Rejected (`isSignedIn()` fails).
2. **Unverified email write on `/users/user123`**: Rejected (`email_verified == true` fails).
3. **Cross-user profile read `/users/otherUser` by `user123`**: Rejected (`isOwner(userId)` fails).
4. **Shadow field injection on `/users/user123` create (`{ ..., isAdmin: true }`)**: Rejected (`hasOnly` check fails).
5. **Privilege escalation role `'admin'` on `/users/user123`**: Rejected (`role in ['parent', 'educator']` fails).
6. **Oversized string (> 35 chars) in `learnerName`**: Rejected (`size() <= 35` fails).
7. **Unbounded `completedLessons` array (> 60 items)**: Rejected (`size() <= 60` fails).
8. **Client-spoofed `createdAt` timestamp != `request.time`**: Rejected (`createdAt == request.time` fails).
9. **Identity spoofing (`ownerId: "victim"`) on `/users/user123/workflows/wf1`**: Rejected (`ownerId == request.auth.uid` fails).
10. **Poisoned long document ID (> 128 chars or containing `/`)**: Rejected (`isValidId()` fails).
11. **Updating immutable `ownerId` or reopening a `'completed'` workflow**: Rejected (terminal lock & immutability gate fail).
12. **Reading someone else's `supportTickets` PII document via `list` or `get`**: Rejected (`resource.data.ownerId == request.auth.uid || isAdmin()` fails).
