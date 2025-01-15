export type Dish = {
    _id: string;
    name: string;
    quantity: number;
    checked: boolean;
    imageUrl: string;
    type: string;
    ratingAverage?: number;
    isEditing?: boolean; 
};
