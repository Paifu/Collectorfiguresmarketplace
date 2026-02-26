import { createHashRouter, RouterProvider } from "react-router-dom";
import Home from "./Home"; // ajusta imports si hace falta

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
