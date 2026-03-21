import productBag from "@/assets/product-bag.jpeg";
import productPillow from "@/assets/product-pillow.jpeg";
import productWallhanging from "@/assets/product-wallhanging.jpeg";
import productBottleholder from "@/assets/product-bottleholder.jpeg";
import productWallart from "@/assets/product-wallart.jpg";
import productCarhanger from "@/assets/product-carhanger.jpeg";
import productBabydress from "@/assets/product-babydress.jpeg";
import productKeychain from "@/assets/product-keychain.jpeg";
import productHeadband from "@/assets/product-headband.jpeg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  collection: string;
  badge?: string;
  description: string;
  rating: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Bohemian Tote Bag",
    price: 2450,
    originalPrice: 2950,
    image: productBag,
    category: "Bags",
    collection: "Bohemian Living",
    badge: "Bestseller",
    description: "Hand-knotted macrame tote with vibrant geometric patterns. Perfect for beach days and casual outings.",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Terracotta Cushion Cover",
    price: 1650,
    image: productPillow,
    category: "Home Decor",
    collection: "Earth & Texture",
    badge: "New",
    description: "Rustic macrame cushion cover with tassels in warm terracotta tones. Adds artisan charm to any space.",
    rating: 4.9,
  },
  {
    id: "3",
    name: "Natural Wall Hanging",
    price: 1850,
    image: productWallhanging,
    category: "Wall Art",
    collection: "Minimalist Knots",
    description: "Delicate macrame wall hanging in natural cotton. Brings warmth and texture to your walls.",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Bottle Holder Net",
    price: 450,
    image: productBottleholder,
    category: "Accessories",
    collection: "Everyday Essentials",
    description: "Practical macrame bottle holder for your on-the-go lifestyle. Eco-friendly and handcrafted.",
    rating: 4.6,
  },
  {
    id: "5",
    name: "Mandala Wall Art",
    price: 3200,
    image: productWallart,
    category: "Wall Art",
    collection: "Bohemian Living",
    badge: "Bestseller",
    description: "Stunning large mandala wall art with intricate knotwork and golden tassels. A true statement piece.",
    rating: 5.0,
  },
  {
    id: "6",
    name: "Mini Car Charm",
    price: 350,
    image: productCarhanger,
    category: "Accessories",
    collection: "Everyday Essentials",
    description: "Adorable mini macrame charm for your car mirror. Handmade with love.",
    rating: 4.5,
  },
  {
    id: "7",
    name: "Baby Fringe Dress",
    price: 1950,
    image: productBabydress,
    category: "Baby Collection",
    collection: "Little Knots",
    badge: "New",
    description: "Handmade macrame baby dress with pink tassel details and matching headband.",
    rating: 4.9,
  },
  {
    id: "8",
    name: "Daisy Keychain",
    price: 280,
    image: productKeychain,
    category: "Accessories",
    collection: "Everyday Essentials",
    description: "Charming floral macrame keychain with mint and red accents. A perfect little gift.",
    rating: 4.7,
  },
  {
    id: "9",
    name: "Floral Headband",
    price: 550,
    image: productHeadband,
    category: "Accessories",
    collection: "Little Knots",
    description: "Soft macrame headband with delicate pink flower details. Comfortable and stylish.",
    rating: 4.8,
  },
];

export const categories = ["All", "Bags", "Home Decor", "Wall Art", "Accessories", "Baby Collection"];
export const collections = ["Bohemian Living", "Earth & Texture", "Minimalist Knots", "Everyday Essentials", "Little Knots"];
