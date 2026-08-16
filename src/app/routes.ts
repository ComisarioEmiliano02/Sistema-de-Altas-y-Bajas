import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { LoginPage } from "./components/LoginPage";
import { StudentView } from "./components/StudentView";
import { AdminView } from "./components/AdminView";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LoginPage },
      { path: "estudiante", Component: StudentView },
      { path: "admin", Component: AdminView },
    ],
  },
]);
