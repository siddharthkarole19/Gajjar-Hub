import { Wing, Profile, Notice, Complaint, MessMenuItem, Poll, HostelLeader } from "./types";

export const MOCK_WINGS: Wing[] = [
  { id: "c0000000-0000-0000-0000-000000000001", name: "Wing A" },
  { id: "c0000000-0000-0000-0000-000000000002", name: "Wing B" },
  { id: "c0000000-0000-0000-0000-000000000003", name: "Wing C" },
  { id: "c0000000-0000-0000-0000-000000000004", name: "Wing D" },
];

export const MOCK_STUDENT: Profile = {
  id: "student-1",
  full_name: "Rahul Verma",
  room_no: "A-304",
  wing_id: "c0000000-0000-0000-0000-000000000001",
  wing_name: "Wing A",
  mess: 1,
  role: "student",
};

export const MOCK_CAPTAIN: Profile = {
  id: "captain-1",
  full_name: "Aarav Sharma",
  room_no: "B-101",
  wing_id: "c0000000-0000-0000-0000-000000000002",
  wing_name: "Wing B",
  mess: 1,
  role: "captain",
};

export const MOCK_NOTICES: Notice[] = [
  {
    id: "notice-1",
    title: "Mess 1 & 2 Survey for Festival Dinner",
    body: "Residents are requested to vote in the mess polls regarding the Diwali Special Feast menu options before Wednesday 6:00 PM. Results will be reflected in next week's menu.",
    category: "Mess",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notice-2",
    title: "Water Tank Cleaning - Schedule for Wing A & B",
    body: "Water supply will be temporarily paused between 10:00 AM and 2:00 PM this coming Tuesday for scheduled overhead tank maintenance and chlorination.",
    category: "Maintenance",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notice-3",
    title: "Wi-Fi Bandwidth Upgrade Across All Wings",
    body: "New high-density access points have been deployed across floors 1 to 4. Please report any dead spots using the Complaints tab.",
    category: "General",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notice-4",
    title: "Hostel Badminton & Table Tennis Tournament",
    body: "Registrations are open for the annual intra-hostel championship. Inter-wing matches commence this weekend. Contact sports rep Devansh Mehta.",
    category: "Event",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notice-5",
    title: "Urgent: Quiet Hours During Mid-Semester Exams",
    body: "Strict quiet hours will be observed from 11:00 PM to 6:00 AM across all corridors. Playing loud speakers or disruptive noise is strictly prohibited.",
    category: "Urgent",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "complaint-1",
    user_id: "student-1",
    author_name: "Rahul Verma",
    wing_id: "wing-a",
    wing_name: "Wing A",
    category: "Wi-Fi",
    title: "Frequent packet loss and disconnects on 3rd floor corridor",
    description: "Wi-Fi signal drops completely every 15 minutes near room A-304 and A-308. Unable to attend online lab sessions.",
    status: "in_progress",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    like_count: 14,
    dislike_count: 1,
    user_vote: 1,
  },
  {
    id: "complaint-2",
    user_id: "student-2",
    author_name: "Tanmay Deshmukh",
    wing_id: "wing-a",
    wing_name: "Wing A",
    category: "Water",
    title: "Low pressure in 2nd floor washroom geysers",
    description: "Water pressure from the geyser tap is very low in morning hours (7am-9am). Requires valve adjustment.",
    status: "open",
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    like_count: 8,
    dislike_count: 0,
    user_vote: 0,
  },
  {
    id: "complaint-3",
    user_id: "student-3",
    author_name: "Sameer Joshi",
    wing_id: "wing-b",
    wing_name: "Wing B",
    category: "Power",
    title: "Flickering tube light in study room",
    description: "Tube light in B-Wing Ground Floor reading room keeps flickering continuously, causing strain.",
    status: "resolved",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    like_count: 5,
    dislike_count: 0,
    user_vote: 0,
  },
  {
    id: "complaint-4",
    user_id: "student-4",
    author_name: "Vikram Sen",
    wing_id: "wing-c",
    wing_name: "Wing C",
    category: "Room",
    title: "Broken window latch in room C-112",
    description: "The window lock mechanism is broken and rattles heavily in the wind.",
    status: "open",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    like_count: 2,
    dislike_count: 0,
    user_vote: 0,
  },
];

export const MOCK_MESS_MENUS: MessMenuItem[] = [
  // Mess 1 - Day 1 to 7
  { mess: 1, day_of_week: 1, meal: "breakfast", items: ["Poha", "Sprouts", "Boiled Eggs", "Tea / Coffee", "Banana"] },
  { mess: 1, day_of_week: 1, meal: "lunch", items: ["Dal Tadka", "Jeera Rice", "Aloo Gobi", "Roti", "Curd", "Salad"] },
  { mess: 1, day_of_week: 1, meal: "dinner", items: ["Paneer Butter Masala", "Tandoori Roti", "Veg Pulao", "Dal Fry", "Gulab Jamun"] },

  { mess: 1, day_of_week: 2, meal: "breakfast", items: ["Idli Sambhar", "Coconut Chutney", "Boiled Eggs", "Tea / Coffee"] },
  { mess: 1, day_of_week: 2, meal: "lunch", items: ["Rajma Masala", "Steamed Rice", "Bhindi Masala", "Chapati", "Boondi Raita"] },
  { mess: 1, day_of_week: 2, meal: "dinner", items: ["Mix Veg Kolhapuri", "Dal Makhani", "Jeera Rice", "Roti", "Fruit Custard"] },

  { mess: 1, day_of_week: 3, meal: "breakfast", items: ["Aloo Paratha", "Curd", "Pickle", "Tea / Coffee"] },
  { mess: 1, day_of_week: 3, meal: "lunch", items: ["Chole Bhature", "Pulao Rice", "Cucumber Salad", "Fried Chillies"] },
  { mess: 1, day_of_week: 3, meal: "dinner", items: ["Mushroom Masala / Egg Curry", "Plain Rice", "Tawa Roti", "Dal Tadka", "Ice Cream"] },

  { mess: 1, day_of_week: 4, meal: "breakfast", items: ["Upma", "Sambhar", "Boiled Eggs", "Bread Butter", "Tea"] },
  { mess: 1, day_of_week: 4, meal: "lunch", items: ["Kadhi Pakoda", "Khichdi", "Aloo Methi", "Roti", "Papad"] },
  { mess: 1, day_of_week: 4, meal: "dinner", items: ["Dum Aloo Kashmiri", "Yellow Dal", "Peas Pulao", "Chapati", "Kheer"] },

  { mess: 1, day_of_week: 5, meal: "breakfast", items: ["Masala Dosa", "Sambhar", "Tomato Chutney", "Tea / Coffee"] },
  { mess: 1, day_of_week: 5, meal: "lunch", items: ["Palak Paneer", "Dal Fry", "Steamed Basmati Rice", "Roti", "Salad"] },
  { mess: 1, day_of_week: 5, meal: "dinner", items: ["Veg Biryani", "Mirchi Ka Salan", "Raita", "Rasgulla"] },

  { mess: 1, day_of_week: 6, meal: "breakfast", items: ["Methi Thepla", "Chhunda", "Curd", "Boiled Eggs", "Tea"] },
  { mess: 1, day_of_week: 6, meal: "lunch", items: ["Sev Tameta", "Gujarati Dal", "Rice", "Rotli", "Chaas"] },
  { mess: 1, day_of_week: 6, meal: "dinner", items: ["Pav Bhaji", "Butter Pav", "Chopped Onions", "Lemon", "Gulab Jamun"] },

  { mess: 1, day_of_week: 7, meal: "breakfast", items: ["Puri Bhaji", "Halwa", "Boiled Eggs", "Tea / Coffee"] },
  { mess: 1, day_of_week: 7, meal: "lunch", items: ["Special Thali", "Paneer Tikka", "Dal Makhani", "Naan", "Jeera Rice", "Sweet Lassi"] },
  { mess: 1, day_of_week: 7, meal: "dinner", items: ["Special Veg Fried Rice", "Manchurian Gravy", "Spring Rolls", "Brownie with Ice Cream"] },

  // Mess 2 - Day 1 to 7
  { mess: 2, day_of_week: 1, meal: "breakfast", items: ["Medu Vada", "Sambhar", "Coconut Chutney", "Filter Coffee"] },
  { mess: 2, day_of_week: 1, meal: "lunch", items: ["Tomato Rasam", "Beans Poriyal", "Steamed Rice", "Curd", "Appalam"] },
  { mess: 2, day_of_week: 1, meal: "dinner", items: ["Malai Kofta", "Chapati", "Ghee Rice", "Dal Tadka", "Payasam"] },

  { mess: 2, day_of_week: 2, meal: "breakfast", items: ["Uttapam", "Kara Chutney", "Boiled Eggs", "Coffee / Tea"] },
  { mess: 2, day_of_week: 2, meal: "lunch", items: ["Sambar Rice", "Potato Roast", "Curd Rice", "Pickle", "Papad"] },
  { mess: 2, day_of_week: 2, meal: "dinner", items: ["Veg Hakka Noodles", "Chilli Paneer", "Hot & Sour Soup", "Fruit Salad"] },

  { mess: 2, day_of_week: 3, meal: "breakfast", items: ["Poha", "Sev", "Boiled Eggs", "Fresh Fruits", "Tea"] },
  { mess: 2, day_of_week: 3, meal: "lunch", items: ["Dal Maharani", "Steamed Rice", "Bhindi Fry", "Phulka", "Boondi Raita"] },
  { mess: 2, day_of_week: 3, meal: "dinner", items: ["Shahi Paneer", "Butter Naan", "Jeera Rice", "Moong Dal Halwa"] },

  { mess: 2, day_of_week: 4, meal: "breakfast", items: ["Rava Dosa", "Coconut Chutney", "Sambhar", "Tea / Coffee"] },
  { mess: 2, day_of_week: 4, meal: "lunch", items: ["Kashmiri Dum Aloo", "Pulao", "Tawa Paratha", "Dal Fry", "Curd"] },
  { mess: 2, day_of_week: 4, meal: "dinner", items: ["Mix Vegetable Kurma", "Malabar Parotta", "Curd Rice", "Gulab Jamun"] },

  { mess: 2, day_of_week: 5, meal: "breakfast", items: ["Appam with Veg Stew", "Boiled Eggs", "Tea / Coffee"] },
  { mess: 2, day_of_week: 5, meal: "lunch", items: ["Hyderabadi Veg Biryani", "Mirchi Salan", "Onion Raita", "Sweet Boondi"] },
  { mess: 2, day_of_week: 5, meal: "dinner", items: ["Paneer Do Pyaza", "Yellow Dal", "Rice", "Chapati", "Ice Cream"] },

  { mess: 2, day_of_week: 6, meal: "breakfast", items: ["Poori Masala", "Kesari Bath", "Tea / Coffee"] },
  { mess: 2, day_of_week: 6, meal: "lunch", items: ["Bisi Bele Bath", "Boondi", "Potato Chips", "Curd Rice"] },
  { mess: 2, day_of_week: 6, meal: "dinner", items: ["Veg Pulao", "Dal Tadka", "Chapati", "Aloo Capsicum", "Rasmalai"] },

  { mess: 2, day_of_week: 7, meal: "breakfast", items: ["Chole Bhature", "Sweet Lassi", "Fresh Fruits"] },
  { mess: 2, day_of_week: 7, meal: "lunch", items: ["Special Feast", "Paneer Pasanda", "Dal Makhani", "Butter Naan", "Biryani Rice"] },
  { mess: 2, day_of_week: 7, meal: "dinner", items: ["Pasta in Alfredo Sauce", "Garlic Bread", "Tomato Soup", "Choco Lava Cake"] },
];

export const MOCK_POLLS: Poll[] = [
  {
    id: "poll-1",
    mess: 1,
    title: "Sunday Dinner Special, Next Week",
    closes_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // ~2d 4h
    is_closed: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    total_votes: 142,
    options: [
      { id: "opt-1", poll_id: "poll-1", label: "Special Hyderabadi Veg Biryani + Gulab Jamun", sort_order: 1, vote_count: 68, percentage: 48 },
      { id: "opt-2", poll_id: "poll-1", label: "Paneer Butter Masala + Garlic Butter Naan", sort_order: 2, vote_count: 46, percentage: 32 },
      { id: "opt-3", poll_id: "poll-1", label: "Chinese Combo: Fried Rice + Veg Manchurian Gravy", sort_order: 3, vote_count: 22, percentage: 15 },
      { id: "opt-4", poll_id: "poll-1", label: "Chole Bhature + Sweet Lassi", sort_order: 4, vote_count: 6, percentage: 5 },
    ],
  },
  {
    id: "poll-2",
    mess: 1,
    title: "Wednesday Dinner Special Option",
    closes_at: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    is_closed: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    total_votes: 95,
    options: [
      { id: "opt-21", poll_id: "poll-2", label: "Paneer Lababdar with Butter Naan", sort_order: 1, vote_count: 52, percentage: 55 },
      { id: "opt-22", poll_id: "poll-2", label: "Dal Makhani with Jeera Rice", sort_order: 2, vote_count: 31, percentage: 33 },
      { id: "opt-23", poll_id: "poll-2", label: "Kadhai Paneer with Tawa Roti", sort_order: 3, vote_count: 12, percentage: 12 },
    ],
  },
  {
    id: "poll-3",
    mess: 2,
    title: "Saturday South Indian Weekend Special",
    closes_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_closed: false,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    total_votes: 80,
    options: [
      { id: "opt-31", poll_id: "poll-3", label: "Mysore Masala Dosa + Kesari Bath", sort_order: 1, vote_count: 48, percentage: 60 },
      { id: "opt-32", poll_id: "poll-3", label: "Poori Saagu + Badam Milk", sort_order: 2, vote_count: 24, percentage: 30 },
      { id: "opt-33", poll_id: "poll-3", label: "Set Dosa + Vada Combo", sort_order: 3, vote_count: 8, percentage: 10 },
    ],
  },
  {
    id: "poll-4",
    mess: 1,
    title: "Last Week's Sunday Lunch Special (Closed)",
    closes_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_closed: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    total_votes: 184,
    options: [
      { id: "opt-41", poll_id: "poll-4", label: "Paneer Lababdar + Butter Naan (Winner)", sort_order: 1, vote_count: 112, percentage: 61 },
      { id: "opt-42", poll_id: "poll-4", label: "Kaju Curry + Jeera Rice", sort_order: 2, vote_count: 48, percentage: 26 },
      { id: "opt-43", poll_id: "poll-4", label: "Dal Makhani Special Thali", sort_order: 3, vote_count: 24, percentage: 13 },
    ],
  },
];

export const MOCK_LEADERS: HostelLeader[] = [
  {
    id: "leader-1",
    name: "Aarav Sharma",
    post: "HOSTEL CAPTAIN",
    phone: "+919876543210",
    email: "aarav.sharma@hostel.edu",
    sort_order: 1,
  },
  {
    id: "leader-2",
    name: "Rohan Verma",
    post: "VICE CAPTAIN",
    phone: "+919876543211",
    email: "rohan.verma@hostel.edu",
    sort_order: 2,
  },
  {
    id: "leader-3",
    name: "Kavya Patel",
    post: "MESS CONVENER (MESS 1)",
    phone: "+919876543212",
    email: "kavya.mess1@hostel.edu",
    sort_order: 3,
  },
  {
    id: "leader-4",
    name: "Nikhil Deshmukh",
    post: "MESS CONVENER (MESS 2)",
    phone: "+919876543213",
    email: "nikhil.mess2@hostel.edu",
    sort_order: 4,
  },
  {
    id: "leader-5",
    name: "Pooja Nair",
    post: "MAINTENANCE HEAD",
    phone: "+919876543214",
    email: "pooja.maintenance@hostel.edu",
    sort_order: 5,
  },
  {
    id: "leader-6",
    name: "Devansh Mehta",
    post: "SPORTS & CULTURAL REP",
    phone: "+919876543215",
    email: "devansh.sports@hostel.edu",
    sort_order: 6,
  },
];
