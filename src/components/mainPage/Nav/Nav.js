// Code for the navigation bar at the top of the page
// ./src/components/MainPage/Nav/Nav.js
// This is the main file for the navigation bar at the top of the page.
import NavClient from "@/components/mainPage/Nav/NavClient";
import { auth } from "@/auth";

export default async function Nav() {
  const session = await auth();

  return <NavClient initialSession={session} />;
}
