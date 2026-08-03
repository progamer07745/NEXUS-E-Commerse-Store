export interface IProduct {
  _id: string;
  name: string;
  description: string;
  images: string[]; //url
  image: string; // for productCard
  category: { _id: string; name: string; slug: string };
  price: number;
  stock: number;
  slug: string;
  brand: string;
  status: string;
  ratingsAverage: number;
  ratingsQuantity: number;
}