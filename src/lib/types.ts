export type UserRole = "student" | "captain";

export interface Wing {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  full_name: string;
  room_no: string;
  wing_id: string;
  wing_name?: string;
  mess: 1 | 2;
  role: UserRole;
  created_at?: string;
}

export type NoticeCategory = "General" | "Mess" | "Maintenance" | "Event" | "Urgent";

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  created_by?: string;
  created_at: string;
}

export type ComplaintCategory = "Room" | "Water" | "Power" | "Wi-Fi" | "Other";
export type ComplaintStatus = "open" | "in_progress" | "resolved";

export interface Complaint {
  id: string;
  user_id: string;
  wing_id: string;
  wing_name?: string;
  author_name?: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  created_at: string;
  like_count: number;
  dislike_count: number;
  user_vote?: 1 | -1 | 0; // 1 = like, -1 = dislike, 0 = none
}

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MessMenuItem {
  id?: string;
  mess: 1 | 2;
  day_of_week: number; // 1 (Mon) to 7 (Sun)
  meal: MealType;
  items: string[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  label: string;
  sort_order: number;
  vote_count: number;
  percentage?: number;
}

export interface Poll {
  id: string;
  mess: 1 | 2;
  title: string;
  closes_at: string;
  is_closed: boolean;
  created_by?: string;
  created_at: string;
  options: PollOption[];
  user_voted_option_id?: string;
  total_votes?: number;
}

export interface HostelLeader {
  id: string;
  name: string;
  post: string;
  phone?: string;
  email?: string;
  sort_order: number;
}
