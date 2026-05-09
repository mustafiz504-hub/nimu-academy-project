export interface Course {
  id: string;
  title: string;
  duration: string;
  mode: string;
  price: string;
  timing: string;
  topics: string[];
  learn: string[];
  instructor: {
    name: string;
    bio: string;
  };
  batches: string[];
  image: string;
}

export const courses: Course[] = [
  {
    id: "basic-baking",
    title: "Basic Baking Course",
    duration: "4 Weeks",
    mode: "Online & Offline",
    price: "₹4,999",
    timing: "10 AM - 12 PM / 5 PM - 7 PM",
    topics: ["Cake Basics", "Frosting Techniques", "Cupcakes", "Cookies"],
    learn: [
      "Master basic cake baking from scratch",
      "Learn professional frosting techniques",
      "Bake perfect cupcakes and cookies",
      "Get hands-on experience in equipped kitchen"
    ],
    instructor: {
      name: "Muskan Naz",
      bio: "Professional baker with 5+ years of teaching experience. Founder of Odisha's No.1 Cooking Class — Nimu Cooking Academy."
    },
    batches: ["Morning Batch (10 AM - 12 PM)", "Evening Batch (5 PM - 7 PM)"],
    image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: "advanced-cake-decorating",
    title: "Advanced Cake Decorating",
    duration: "6 Weeks",
    mode: "Offline Only",
    price: "₹9,999",
    timing: "Sat & Sun 11 AM - 3 PM",
    topics: ["Fondant Art", "Wedding Cake Design", "Tier Cakes", "Chocolate Garnishing"],
    learn: [
      "Master fondant and sugar art",
      "Design professional wedding cakes",
      "Create multi-tier cake structures",
      "Learn chocolate garnishing techniques"
    ],
    instructor: {
      name: "Muskan Naz",
      bio: "Professional baker with 5+ years of teaching experience. Founder of Odisha's No.1 Cooking Class — Nimu Cooking Academy."
    },
    batches: ["Weekend Batch (Sat-Sun 11 AM)"],
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: "eggless-baking",
    title: "Eggless Baking Program",
    duration: "3 Weeks",
    mode: "Online Only",
    price: "₹2,999",
    timing: "Daily 6 PM - 9:30 PM",
    topics: ["Eggless Sponges", "Healthy Alternatives", "Vegan Baking Basics"],
    learn: [
      "Bake perfect eggless cakes",
      "Learn healthy ingredient substitutes",
      "Master vegan baking techniques",
      "Start your own eggless bakery business"
    ],
    instructor: {
      name: "Muskan Naz",
      bio: "Professional baker with 5+ years of teaching experience. Founder of Odisha's No.1 Cooking Class — Nimu Cooking Academy."
    },
    batches: ["Online Live Batch (8 PM - 9:30 PM)"],
    image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=1000"
  }
];
