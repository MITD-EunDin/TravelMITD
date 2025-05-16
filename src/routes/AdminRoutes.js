
import NotificationManagement from "../views/PageAdmin/Notification";
import EmployeeManagement from "../views/PageAdmin/Employee";
import PaymentsPage from "../views/PageAdmin/Payment";
import { ReviewsPage } from "../views/PageAdmin/Review";
import AddTour from "../views/PageAdmin/AddTour";
import Tour from "../views/PageAdmin/Tour";
import CustomerManagement from "../views/PageAdmin/Customer";
import Overview from "../views/PageAdmin/Main";
import Setting from "../views/PageAdmin/Setting";
import AdminOrders from "../views/PageAdmin/Orders";
import OrderDetail from "../views/PageAdmin/OrderDetail";

export const adminRoutes = [
    { path: "dashboard", element: <Overview /> },
    { path: "notifications", element: <NotificationManagement /> },
    { path: "employees", element: <EmployeeManagement /> },
    { path: "customers", element: <CustomerManagement /> },
    { path: "orders", element: <AdminOrders /> },
    { path: "orders/:id", element: <OrderDetail /> },
    { path: "payments", element: <PaymentsPage /> },
    { path: "reviews", element: <ReviewsPage /> },
    { path: "tours", element: <Tour /> },
    { path: "settings", element: <Setting /> },
];
