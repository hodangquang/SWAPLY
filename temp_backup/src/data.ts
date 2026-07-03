import { Property, Review } from "./types";

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Sophie Dubois",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    date: "June 2026",
    rating: 5,
    content: "Absolutely unforgettable! The host was extremely kind and shared deep historical insights. The atmosphere was magical. Highly recommend to anyone visiting!"
  },
  {
    id: "r2",
    author: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    date: "May 2026",
    rating: 5,
    content: "Stunning attention to detail. The food/setting was perfect and we made friends from all over the world. Worth every penny!"
  },
  {
    id: "r3",
    author: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
    date: "April 2026",
    rating: 4,
    content: "Very beautiful experience. The photography was high quality, and the host gave wonderful posing tips. A little bit crowded but still a great memory."
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  // SECTION 1: Popular experiences nearby
  {
    id: "exp1",
    title: "Step inside the Sagrada Familia with a guide",
    hostType: "Business host",
    hostName: "Gothic Tours S.L.",
    hostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 59,
    rating: 4.79,
    reviewsCount: 1240,
    images: [
      "https://images.unsplash.com/photo-1583779457094-0cfcf360089e?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1610448721566-47369c768e70?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Skip the lines and unlock the secrets of Antoni Gaudí’s masterpiece with an official architectural historian. Experience how sunlight transforms the majestic stained-glass forest inside.",
    amenities: ["Official Entry Ticket", "Whisper Audio Guide", "Certified Historian Host", "Small Group Setting"],
    location: "Eixample, Barcelona",
    isGuestFavorite: true,
    maxGuests: 15,
    isExperience: true,
    dateRange: "From € 59 / guest"
  },
  {
    id: "exp2",
    title: "Paella in my secret garden",
    hostType: "Business host",
    hostName: "Chef Alberto",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 69,
    rating: 4.98,
    reviewsCount: 842,
    images: [
      "https://images.unsplash.com/photo-1534080391025-347b4c985929?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1515443961218-152367888be4?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Indulge in a sensory culinary masterclass set in a gorgeous hidden garden oasis in Gràcia. Learn the generational secrets of proper Valencian paella while sipping infinite artisan Sangria.",
    amenities: ["Full 3-course Dinner", "Authentic Sangria Tasting", "Cooking Masterclass", "Recipe E-Book"],
    location: "Gràcia, Barcelona",
    isGuestFavorite: true,
    maxGuests: 10,
    isExperience: true,
    dateRange: "From € 69 / guest"
  },
  {
    id: "exp3",
    title: "Sunset Sail in Barcelona w/ young & local captain",
    hostType: "Individual host",
    hostName: "Captain Marc",
    hostAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 49,
    rating: 4.91,
    reviewsCount: 2130,
    images: [
      "https://images.unsplash.com/photo-1505080856163-267d49b3026a?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Step aboard our custom 12m sailing yacht. Feel the sea breeze as we navigate along the gold-lined skyline of Barcelona. Toast with premium cava as the sun sets behind Mount Tibidabo.",
    amenities: ["Premium Catalan Cava", "Gourmet Tapas", "Sailing Instruction", "Music & Towels"],
    location: "Port Vell, Barcelona",
    isGuestFavorite: false,
    maxGuests: 8,
    isExperience: true,
    dateRange: "From € 49 / guest"
  },
  {
    id: "exp4",
    title: "Intro to Barcelona: Old Town Gothic Quarter Tour",
    hostType: "Business host",
    hostName: "La Rambla Chronicles",
    hostAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 36,
    rating: 4.96,
    reviewsCount: 310,
    images: [
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Wander through thousands of years of Roman, Medieval, and Jewish heritage. Explore hidden passageways, structural marvels, and hear legends that standard tour books entirely skip.",
    amenities: ["Professional Historian", "Coffee or Tea break", "Detailed Gothic Map", "City Tips Sheet"],
    location: "Gothic Quarter, Barcelona",
    isGuestFavorite: false,
    maxGuests: 20,
    isExperience: true,
    dateRange: "From € 36 / guest"
  },
  {
    id: "exp5",
    title: "Champagne on a sailboat during the day or sunset",
    hostType: "Individual host",
    hostName: "Alejandro",
    hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 39,
    rating: 4.92,
    reviewsCount: 1475,
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "An intimate, budget-friendly yet deeply stylish marine cruise. Perfect for couples or single travelers looking to sip fine French champagne while witnessing Barcelona's coastal grandeur.",
    amenities: ["Moët & Chandon Glass", "Artisanal Cheese Board", "Life Jacket & Gear", "Sunset Backdrop"],
    location: "Port Olímpic, Barcelona",
    isGuestFavorite: true,
    maxGuests: 12,
    isExperience: true,
    dateRange: "From € 39 / guest"
  },
  {
    id: "exp6",
    title: "Taste Spanish wine and tapas as a real local",
    hostType: "Business host",
    hostName: "Sabor Barcelona",
    hostAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 72,
    rating: 4.95,
    reviewsCount: 1680,
    images: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Skip the generic tourist spots! Let's tour 3 authentic, family-run bodegas. Taste premium Riojas, high-altitude Priorats, paired with handmade Iberico ham, local cheese, and anchovies.",
    amenities: ["4 Premium Wines", "8 Handcrafted Tapas", "Sommelier-level Guide", "Exclusive Gastronomy Guide"],
    location: "El Born, Barcelona",
    isGuestFavorite: true,
    maxGuests: 8,
    isExperience: true,
    dateRange: "From € 72 / guest"
  },
  {
    id: "exp7",
    title: "Montserrat Hiking Off the Beaten Path & Monastery",
    hostType: "Individual host",
    hostName: "Guido",
    hostAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80",
    category: "experiences",
    price: 70,
    rating: 4.98,
    reviewsCount: 923,
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Get away from the tourist buses. Hike the majestic, tooth-shaped peaks of Montserrat through secret medieval tracks, then visit the remote Benedictine Abbey and hear the boys' choir.",
    amenities: ["Roundtrip Airconditioned Transport", "Premium Hiking Sticks", "Organic Mountain Picnic", "Monastery Tickets"],
    location: "Montserrat Nature Park",
    isGuestFavorite: false,
    maxGuests: 6,
    isExperience: true,
    dateRange: "From € 70 / guest"
  },

  // SECTION 2: Capture memories nearby
  {
    id: "mem1",
    title: "Your Stunning Photoshoot in Barcelona",
    hostType: "Business host",
    hostName: "Mireia & Team",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80",
    category: "memories",
    price: 22,
    rating: 4.94,
    reviewsCount: 540,
    images: [
      "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "A professional photoshoot targeting hidden gems of Barcelona. Walk past secret arches and get captured under magnificent soft natural light. High-resolution raw and edited copies included.",
    amenities: ["40 Edited Photos", "2-hour Guided Walking Route", "Pose Coaching", "1-week Digital Delivery"],
    location: "El Raval, Barcelona",
    isGuestFavorite: true,
    maxGuests: 4,
    isExperience: true,
    dateRange: "From € 22 / guest • Minimum € 110 to book"
  },
  {
    id: "mem2",
    title: "Shine in Barcelona Streets cinematic-candid photos",
    hostType: "Individual host",
    hostName: "Luka",
    hostAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80",
    category: "memories",
    price: 25,
    rating: 4.99,
    reviewsCount: 382,
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Get captured looking like a movie star in retro cinematic style. Utilizing anamorphic lens setups, I specialize in capturing beautiful, candid, emotional moments against neon or medieval backdrops.",
    amenities: ["30 Cinematic Color Graded Photos", "All Raw Files", "Styling Advice", "Express 72-hour Delivery"],
    location: "Ciutat Vella, Barcelona",
    isGuestFavorite: true,
    maxGuests: 2,
    isExperience: true,
    dateRange: "From € 25 / guest • Minimum € 62 to book"
  },
  {
    id: "mem3",
    title: "Sunny Barcelona photoshoot by Mabel",
    hostType: "Individual host",
    hostName: "Mabel",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
    category: "memories",
    price: 35,
    rating: 4.97,
    reviewsCount: 167,
    images: [
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Let's capture your natural, warm beachside or city look under the warm golden Spanish sunshine. Perfect for solo travelers, families, and couples looking for joyful, bright portraits.",
    amenities: ["50 High-Res Bright Photos", "Beach & Palm Trees locations", "Props (sun hats, glasses)", "Fast Delivery"],
    location: "Barconeta Beach, Barcelona",
    isGuestFavorite: false,
    maxGuests: 6,
    isExperience: true,
    dateRange: "From € 35 / guest • Minimum € 69 to book"
  },
  {
    id: "mem4",
    title: "Stunning insta-worthy photoshoot in Barcelona",
    hostType: "Individual host",
    hostName: "Elena",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80",
    category: "memories",
    price: 24,
    rating: 4.95,
    reviewsCount: 420,
    images: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Designed strictly for your social media. We will hit the most visually stunning, colorful spots in Barcelona with perfectly timed lighting. Stand out on your feed!",
    amenities: ["25 Insta-optimized edits", "Video reels assistance", "Multiple outfit changes", "Location mapping"],
    location: "Park Güell Area, Barcelona",
    isGuestFavorite: false,
    maxGuests: 3,
    isExperience: true,
    dateRange: "From € 24 / guest • Minimum € 56 to book"
  },

  // SECTION 3: Homes in Seville
  {
    id: "sev1",
    title: "Apartment in Seville Historical Center",
    hostType: "Individual host",
    hostName: "Manuel",
    hostAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=100&h=100&q=80",
    category: "seville",
    price: 110,
    rating: 4.92,
    reviewsCount: 310,
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "A gorgeous, authentic Spanish flat featuring traditional hand-painted tiles, tall wooden shutter windows, and an incredible private terrace overlooking the Giralda Cathedral tower.",
    amenities: ["Rooftop Terrace", "Full Kitchen", "High-speed WiFi", "Air Conditioning", "Nespresso Machine"],
    location: "Seville Center, Spain",
    isGuestFavorite: true,
    maxGuests: 4,
    isExperience: false,
    dateRange: "June 25 – 30"
  },
  {
    id: "sev2",
    title: "Apartment in Alfalfa - Elegant Patio Loft",
    hostType: "Business host",
    hostName: "Sevilla Premium Rentals",
    hostAvatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=100&h=100&q=80",
    category: "seville",
    price: 135,
    rating: 4.97,
    reviewsCount: 184,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Nestled in the upscale Alfalfa district, this design-focused loft sits within a preserved 17th-century Andalusian palace courtyard with towering columns, flowing fountains, and elegant quietude.",
    amenities: ["Historic Palace Courtyard", "Modernist Furnishings", "Luxury linens", "Smart TV", "Washer & Dryer"],
    location: "Alfalfa, Seville",
    isGuestFavorite: true,
    maxGuests: 2,
    isExperience: false,
    dateRange: "July 02 – 07"
  },
  {
    id: "sev3",
    title: "Apartment in Feria - Contemporary Oasis",
    hostType: "Individual host",
    hostName: "Carmen",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80",
    category: "seville",
    price: 95,
    rating: 4.88,
    reviewsCount: 220,
    images: [
      "https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Located right by the bustling Feria market, this bright and airy apartment pairs contemporary design with rustic wooden beams. Step out directly into Seville's finest tapas street.",
    amenities: ["Step-free access", "Bicycles Provided", "Espresso Bar", "Rain Shower", "Dedicated Workspace"],
    location: "Feria, Seville",
    isGuestFavorite: true,
    maxGuests: 3,
    isExperience: false,
    dateRange: "June 28 – July 03"
  },
  {
    id: "sev4",
    title: "Charming Attic with Giralda Views",
    hostType: "Individual host",
    hostName: "Rafa",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    category: "seville",
    price: 150,
    rating: 4.95,
    reviewsCount: 412,
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Perched high above the narrow streets, this penthouse attic apartment is a sun-drenched marvel. Includes a spectacular private lounge terrace with premium double sunbeds directly facing the Cathedral spire.",
    amenities: ["Private Penthouse Deck", "Cathedral View", "Dishwasher", "Wine Fridge", "Air Conditioning"],
    location: "Santa Cruz, Seville",
    isGuestFavorite: false,
    maxGuests: 2,
    isExperience: false,
    dateRange: "July 12 – 17"
  },

  // FILTER CATEGORIES STAYS (For the categories bar: Beach, Cabins, Mansions, Farm)
  {
    id: "f_beach1",
    title: "Stunning Oceanfront Luxury Villa",
    hostType: "Business host",
    hostName: "Exclusive Hideaways",
    hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80",
    category: "Beach",
    price: 420,
    rating: 4.98,
    reviewsCount: 88,
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "An architectural tour de force sitting literally feet from white sand. Zero-edge infinity pool seamlessly blends with the turquoise marine horizon. Pure, unadulterated luxury.",
    amenities: ["Direct Private Beach", "Infinity Pool", "Chef Service", "Cinema Room", "Gym"],
    location: "Malibu, California",
    isGuestFavorite: true,
    maxGuests: 8,
    isExperience: false,
    dateRange: "Sep 14 – 19"
  },
  {
    id: "f_cabin1",
    title: "The Mirror A-Frame in Deep Pine Forest",
    hostType: "Individual host",
    hostName: "Kristoffer",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    category: "Cabins",
    price: 280,
    rating: 4.96,
    reviewsCount: 145,
    images: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "A breathtaking mirrored glass cabin that reflects the surrounding pine forest, disappearing into nature. Featuring a copper hot tub and stargazing sunroof.",
    amenities: ["Woodfired Hot Tub", "Glass Sunroof", "Indoor Fireplace", "Snowshoes provided", "Heated Floors"],
    location: "Svolvær, Norway",
    isGuestFavorite: true,
    maxGuests: 2,
    isExperience: false,
    dateRange: "Oct 05 – 10"
  },
  {
    id: "f_mansion1",
    title: "16th-Century Renaissance Palazzo",
    hostType: "Business host",
    hostName: "Marchesa Barberini",
    hostAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80",
    category: "Mansions",
    price: 850,
    rating: 4.99,
    reviewsCount: 42,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&h=600&q=80"
    ],
    description: "Live like high royalty in this incredibly preserved Renaissance masterpiece. Towering fresco ceilings painted by master pupils, private manicured maze gardens, and Olympic-sized thermal pool.",
    amenities: ["Private Italian Maze", "Historical Frescos", "Butler service", "Grand piano", "Wine Cellar Access"],
    location: "Tuscany, Italy",
    isGuestFavorite: true,
    maxGuests: 12,
    isExperience: false,
    dateRange: "Aug 10 – 17"
  }
];

export const CATEGORIES_LIST = [
  { name: "Beach", icon: "Palmtree" },
  { name: "Cabins", icon: "Cabin" },
  { name: "Mansions", icon: "Castle" },
  { name: "Historic", icon: "Compass" },
  { name: "Experiences", icon: "Sparkles" },
  { name: "Memories", icon: "Camera" },
  { name: "Seville", icon: "MapPin" },
];
