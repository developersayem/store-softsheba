export interface SoftwareDetail {
  detail: string;
}

export interface ProductDetail {
  image: string;
  name: string;
  licenseType: string;
  version: string;
  link: string;
  extraDetails?: string;
}

export interface ProductEntry {
  productDetails: ProductDetail[];
  softwareDetails: SoftwareDetail[];
}

export type ProductList = ProductEntry[];
