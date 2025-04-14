import { Router } from "express";
import user from "./user.route";
import product from "./product.route";
import category from "./category.route";

const router = Router();
interface IRoutes {
    path: string;
    route: Router;
}

const ProductionRoutes: IRoutes[] = [
    {
        path: "/user",
        route: user
    },
    {
        path: "/product",
        route: product
    },
    {
        path: "/category",
        route: category
    }
];

ProductionRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;