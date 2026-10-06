export interface RestaurantLocation {
  id: string;
  /** Branch name without the brand (brand name is prefixed at render time) */
  name: string;
  slug: string;
  area: string;
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
  phone: string;
  hours: string;
  isOpenNow: boolean;
  is24HoursDelivery: boolean;
  features: string[];
  rating: number;
  reviewsCount: number;
  googleMapsUrl: string;
  popularDish: string;
}

export const RESTAURANT_LOCATIONS: RestaurantLocation[] = [
  {
    id: 'gulshan-flagship',
    name: 'Gulshan Flagship',
    slug: 'gulshan-flagship',
    area: 'Gulshan 2',
    address: 'Plot 12, Road 71, Gulshan 2, Dhaka 1212',
    coordinates: [23.7925, 90.4167],
    phone: '+880 1711-001122',
    hours: '10:00 AM – 02:00 AM (24/7 Delivery)',
    isOpenNow: true,
    is24HoursDelivery: true,
    features: ['Dine-in', 'Drive-thru', '24/7 Delivery', 'Takeaway', 'Outdoor Seating'],
    rating: 4.9,
    reviewsCount: 384,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=23.7925,90.4167',
    popularDish: 'Double Patty Smash Burger',
  },
  {
    id: 'dhanmondi-hub',
    name: 'Dhanmondi',
    slug: 'dhanmondi',
    area: 'Dhanmondi',
    address: 'House 44, Satmasjid Road (Near Dhanmondi 27), Dhaka 1209',
    coordinates: [23.7516, 90.3725],
    phone: '+880 1711-002233',
    hours: '11:00 AM – 12:00 AM',
    isOpenNow: true,
    is24HoursDelivery: false,
    features: ['Dine-in', 'Rooftop Lounge', 'Takeaway', 'Fast Delivery'],
    rating: 4.8,
    reviewsCount: 295,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=23.7516,90.3725',
    popularDish: 'BBQ Chicken Pizza',
  },
  {
    id: 'banani-express',
    name: 'Banani 11',
    slug: 'banani',
    area: 'Banani',
    address: 'Road 11, Block D, Banani, Dhaka 1213',
    coordinates: [23.7937, 90.4043],
    phone: '+880 1711-003344',
    hours: '11:00 AM – 01:00 AM (Late Night Delivery)',
    isOpenNow: true,
    is24HoursDelivery: false,
    features: ['Dine-in', 'Late Night Delivery', 'Takeaway', 'WiFi & Workspaces'],
    rating: 4.9,
    reviewsCount: 240,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=23.7937,90.4043',
    popularDish: 'Chicken Shawarma Wrap',
  },
  {
    id: 'uttara-sector7',
    name: 'Uttara',
    slug: 'uttara',
    area: 'Uttara',
    address: 'Sector 7, Rabindra Sarani, Uttara Model Town, Dhaka 1230',
    coordinates: [23.8681, 90.3984],
    phone: '+880 1711-004455',
    hours: '11:00 AM – 11:30 PM',
    isOpenNow: true,
    is24HoursDelivery: false,
    features: ['Dine-in', 'Family Zone', 'Takeaway', 'Delivery'],
    rating: 4.7,
    reviewsCount: 182,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=23.8681,90.3984',
    popularDish: 'Pepperoni Feast Pizza',
  },
  {
    id: 'mirpur-10',
    name: 'Mirpur 10',
    slug: 'mirpur',
    area: 'Mirpur',
    address: 'Mirpur 10 Roundabout (Opposite Fire Service), Dhaka 1216',
    coordinates: [23.8069, 90.3687],
    phone: '+880 1711-005566',
    hours: '11:00 AM – 12:00 AM',
    isOpenNow: true,
    is24HoursDelivery: false,
    features: ['Dine-in', 'Takeaway', 'Express Counter', 'Fast Delivery Hub'],
    rating: 4.8,
    reviewsCount: 215,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=23.8069,90.3687',
    popularDish: 'Beef Kathi Roll & Borhani',
  },
];
