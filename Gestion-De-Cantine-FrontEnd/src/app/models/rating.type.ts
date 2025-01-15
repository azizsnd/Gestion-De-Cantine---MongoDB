import { Dish } from "./dish.type";
import { User } from "./user.type";

export type Rating = {
    _id: string;
    iDish: Dish;
    idUser: User;
    nbStars: number;
    feedback: string;
};
