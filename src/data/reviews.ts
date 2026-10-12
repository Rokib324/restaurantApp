export interface ReviewItem {
  _id?: string;
  reviewerName: string;
  reviewerTitle: string;
  reviewerImage: string;
  platform: 'facebook' | 'google';
  rating: number;
  reviewText: string;
  foodMentioned: string;
  sourceUrl?: string;
  reviewDate: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    reviewerName: 'Tanvir Ahmed',
    reviewerTitle: 'Level 6 Google Local Guide · Dhaka',
    reviewerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    platform: 'google',
    rating: 5,
    reviewText:
      'Hands down the juiciest artisan smash burger in Gulshan! The double beef patty with caramelised onions and secret sauce was packed with bold flavour. Delivered to our office in 22 minutes steaming hot.',
    foodMentioned: 'Double Beef Smash Burger & Truffle Parmesan Fries',
    sourceUrl: 'https://maps.google.com',
    reviewDate: '2 days ago',
    isFeatured: true,
    isActive: true,
    order: 1,
  },
  {
    reviewerName: 'Nusrat Jahan Chowdhury',
    reviewerTitle: 'Foodie & Content Creator · Foodies of Dhaka',
    reviewerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    platform: 'facebook',
    rating: 5,
    reviewText:
      'Ordered their Truffle Mushroom Pizza and crispy Naga Wings for our late-night family gathering in Dhanmondi. The sourdough crust was blistering perfection and the cheese pull was unreal. Recommending this page to all my friends!',
    foodMentioned: 'Truffle Mushroom Pizza, Naga Fire Wings',
    sourceUrl: 'https://facebook.com',
    reviewDate: '3 days ago',
    isFeatured: true,
    isActive: true,
    order: 2,
  },
  {
    reviewerName: 'Shahriar Kabir',
    reviewerTitle: 'Verified Google Diner · Banani',
    reviewerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    platform: 'google',
    rating: 5,
    reviewText:
      'The Smoky Chicken Kathi Roll is an absolute masterpiece. Packed with chargrilled chicken thigh, crunchy onions, and a fresh zesty mint chutney. Seamless payment through Nagad right upon doorstep handover.',
    foodMentioned: 'Smoky Chicken Kathi Roll, Desi Borhani',
    sourceUrl: 'https://maps.google.com',
    reviewDate: '1 week ago',
    isFeatured: true,
    isActive: true,
    order: 3,
  },
  {
    reviewerName: 'Ayesha Siddiqua',
    reviewerTitle: 'Facebook Community Member',
    reviewerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    platform: 'facebook',
    rating: 5,
    reviewText:
      'Super impressive packaging and presentation. The peri-peri fries stayed crunchy even in traffic, and the smash patties were clearly freshly ground premium beef. Love their prompt updates on WhatsApp too!',
    foodMentioned: 'Classic Cheeseburger, Peri-Peri Loaded Fries',
    sourceUrl: 'https://facebook.com',
    reviewDate: '1 week ago',
    isFeatured: true,
    isActive: true,
    order: 4,
  },
  {
    reviewerName: 'Dr. Mahbubur Rahman',
    reviewerTitle: 'Google Reviewer · Uttara Hub',
    reviewerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    platform: 'google',
    rating: 5,
    reviewText:
      'Finally a fast-food brand in Dhaka that maintains hospital-grade kitchen hygiene and clean eco-friendly boxes. The Beef Bacon Beast Burger lived up to the hype — smoky, melt-in-mouth tender, and huge portions.',
    foodMentioned: 'Beef Bacon Beast Burger & Classic Cold Coffee',
    sourceUrl: 'https://maps.google.com',
    reviewDate: '2 weeks ago',
    isFeatured: true,
    isActive: true,
    order: 5,
  },
  {
    reviewerName: 'Farhan Al-Mamun',
    reviewerTitle: 'Verified Facebook Recommendation',
    reviewerImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    platform: 'facebook',
    rating: 5,
    reviewText:
      'Our go-to late-night craving saver. Ordered at 1:15 AM on a Friday and rider arrived in 25 mins. The loaded cheese melt and garlic mayo dips are addictive. Easily the top delivery burger brand in town!',
    foodMentioned: 'Midnight Double Melt Smash, Garlic Mayo Wedges',
    sourceUrl: 'https://facebook.com',
    reviewDate: '3 weeks ago',
    isFeatured: true,
    isActive: true,
    order: 6,
  },
];
