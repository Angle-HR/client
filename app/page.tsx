import { redirect } from 'next/navigation'

// The dashboard is the app's home. Sign-in state lives in sessionStorage, so the
// server can't tell who is signed in; the dashboard layout sends anyone without
// a session on to /login.
export default function RootPage() {
  redirect('/dashboard')
}
