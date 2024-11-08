import { checkAuth } from "@/utils/auth"

export default async function DashboardPage() {
  const session = await checkAuth()
    console.log(session)
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.user.email}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
