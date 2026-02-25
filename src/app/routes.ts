import { createBrowserRouter } from "react-router";
import { RootWrapper } from "./components/RootWrapper";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/LoginPage";
import { DashboardPage } from "./components/DashboardPage";
import { CategoryDetailPage } from "./components/CategoryDetailPage";
import { AddFigurePage } from "./components/AddFigurePage";
import { MarketplacePage } from "./components/MarketplacePage";
import { MySalesPage } from "./components/MySalesPage";
import { WishlistPage } from "./components/WishlistPage";
import { FollowedUsersPage } from "./components/FollowedUsersPage";
import { MessagesPage } from "./components/MessagesPage";
import { NotificationsPage } from "./components/NotificationsPage";
import { ProfilePage } from "./components/ProfilePage";
import { FigureDetailPage } from "./components/FigureDetailPage";
import { MyFiguresPage } from "./components/MyFiguresPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootWrapper,
    children: [
      { index: true, Component: LoginPage },
      {
        Component: Layout,
        children: [
          { path: "dashboard", Component: DashboardPage },
          { path: "my-figures", Component: MyFiguresPage },
          { path: "category/:id", Component: CategoryDetailPage },
          { path: "figure/:id", Component: FigureDetailPage },
          { path: "add", Component: AddFigurePage },
          { path: "marketplace", Component: MarketplacePage },
          { path: "my-sales", Component: MySalesPage },
          { path: "wishlist", Component: WishlistPage },
          { path: "followed-users", Component: FollowedUsersPage },
          { path: "messages", Component: MessagesPage },
          { path: "notifications", Component: NotificationsPage },
          { path: "profile", Component: ProfilePage },
        ],
      },
    ],
  },
]);
