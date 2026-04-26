# Authentication Coding Standards

## Provider: Clerk

**This app uses [Clerk](https://clerk.com/) exclusively for authentication.** Do not introduce any other auth library (NextAuth, Auth.js, Lucia, etc.).

## Rule: Wrap the App in `<ClerkProvider>`

`<ClerkProvider>` must wrap the entire application. It is placed in `src/app/layout.tsx` — do not move or duplicate it.

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

## Rule: Resolve the Current User with `auth()` in Server Components

**Always use `auth()` from `@clerk/nextjs/server` to get the authenticated user's ID in Server Components and `/data` helpers.**

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- `auth()` is server-only — never import it in a client component
- `userId` will be `null` when the user is not signed in; guard accordingly
- Never trust a `userId` arriving from the client (query params, request body, etc.) — always derive it from `auth()`

## Rule: Protect Routes with Clerk Middleware

Route protection is enforced via `middleware.ts` at the project root using Clerk's `clerkMiddleware` helper.

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

- All routes are private by default — only explicitly listed public routes bypass the auth check
- Never disable `auth.protect()` on routes that return user-specific data

## Rule: UI Auth Components

Use Clerk's built-in components for all sign-in/sign-up/user UI. Do not build custom auth forms.

| Use case | Component |
|---|---|
| Sign-in button | `<SignInButton mode="modal" />` |
| Sign-up button | `<SignUpButton mode="modal" />` |
| User avatar / account menu | `<UserButton />` |
| Conditionally render by auth state | `<Show when="signed-in">` / `<Show when="signed-out">` |

All components are imported from `@clerk/nextjs`.

```tsx
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";

<Show when="signed-out">
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Summary

| Concern | Required approach |
|---|---|
| Auth provider | Clerk only |
| App wrapper | `<ClerkProvider>` in `layout.tsx` |
| Get current user (server) | `auth()` from `@clerk/nextjs/server` |
| Route protection | Clerk middleware (`middleware.ts`) |
| Sign-in / sign-up UI | `<SignInButton>`, `<SignUpButton>` (modal mode) |
| User menu | `<UserButton>` |
| Conditional auth UI | `<Show when="signed-in/out">` |
| Custom auth forms | Never |
