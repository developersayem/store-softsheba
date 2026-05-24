export interface Product {
  id: string;
  name: string;
  price: number;
  stock: "in_stock" | "out_of_stock";
  category: string;
  tags: string[];
  date: string;
  brand?: string;
  image: string;
}
