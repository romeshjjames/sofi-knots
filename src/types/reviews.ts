export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewSummary = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerInitials: string;
  customerImageUrl: string | null;
  productId: string;
  productName: string;
  productSlug: string;
  rating: number;
  title: string;
  message: string;
  reviewDate: string;
  status: ReviewStatus;
  featuredReview: boolean;
  homepageFeature: boolean;
  highlightedReview: boolean;
  updatedAt: string | null;
};

export type ReviewDetail = ReviewSummary;

export type ReviewSupportOption = {
  id: string;
  label: string;
  slug: string;
};

export type ProductReview = {
  id: string;
  customerName: string;
  customerInitials: string;
  customerImageUrl: string | null;
  rating: number;
  title: string;
  message: string;
  reviewDate: string;
  featuredReview: boolean;
};
