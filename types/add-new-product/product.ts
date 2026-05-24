export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface ProductVariation {
  name: string;
  price: number;
  stock: number;
}

export interface ProductFormData {
  name: string;
  price: number;
  regularPrice: number;
  salePrice: number;
  category: string;
  tags: string[];
  stock: "in_stock" | "out_of_stock";
  brand: string;
  description: string;
  licenseType: "single" | "multiple" | "lifetime";
  faqs: ProductFAQ[];
  variations: ProductVariation[];   
  imageFile?: File;
}
