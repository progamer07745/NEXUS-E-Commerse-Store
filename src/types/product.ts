export interface IVariantOption {
  name: string; //like color or stock
  value: string; //the value of the name like "red", or "10 items"
}

export interface IVariant {
  options: IVariantOption[];
  price: number;
  stock: number;
  images: string[];
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  images: string[]; //url
  image: string; // for productCard
  category: { _id: string; name: string; slug: string };
  variants: IVariant[];
  price: number;
  stock: number;
  slug: string;
  brand: string;
  status: string;
  ratingsAverage: number;
  ratingsQuantity: number;
}
