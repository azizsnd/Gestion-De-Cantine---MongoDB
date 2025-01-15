import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Dish } from '../models/dish.type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  http=inject(HttpClient);
  private baseUrl ="http://localhost:3000/dish/";

  getDishes():Observable<Dish []>{ 
    return this.http.get<Dish[]>(this.baseUrl);
  } 
  getDailyMenu():Observable<Dish []>{ 
    return this.http.get<Dish[]>(this.baseUrl+"dailyMenu");
  }
  getDish(id: string):Observable<Dish>{
    return this.http.get<Dish>(this.baseUrl+id);
  }
  
  addDish(dish: Omit<Dish, '_id'>):Observable<Dish>{
    const dishWithoutId: Omit<Dish, '_id'> = {
      name: dish.name,
      quantity: dish.quantity,
      checked: dish.checked,
      imageUrl: dish.imageUrl,
      type: dish.type,
      ratingAverage: dish.ratingAverage,
      isEditing: dish.isEditing,
    };  
   return this.http.post<Dish>(this.baseUrl,dishWithoutId);
  }
  deleteDish(id: string):Observable<Dish>{
    return this.http.delete<Dish>(this.baseUrl+id);
  }

  modifyDish(dish: Dish):Observable<Dish>{
    return this.http.patch<Dish>(this.baseUrl+dish._id,dish);
  }
}