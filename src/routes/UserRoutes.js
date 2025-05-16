
import MainPage from "../views/PageUser/MainPage/MainPage";
import PageTour from "../views/PageUser/PageTour/PageTour";
import Introduce from "../views/PageUser/introduce/index";
import DetailTour from "../views/PageUser/detailTour/index";
import Booking from "../views/PageUser/booking/index";
import RSSNews from "../views/PageUser/RSSNews";
import AccountLayout from "../views/PageUser/Account/AccountLayout";
import DetailService from "../views/PageUser/detailservice/index";

export const userRoutes = [
    { path: "/", element: <MainPage /> },
    { path: "/tours", element: <PageTour /> },
    { path: "/introduce", element: <Introduce /> },
    { path: "/news", element: <RSSNews /> },
    { path: "/tours/:id", element: <DetailTour /> },
    { path: "/booking", element: <Booking /> },
    { path: "/detailservice", element: <DetailService /> },

];
