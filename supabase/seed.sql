-- ==============================================================================
-- GAJJAR HUB - SEED DATA
-- Default initial records for Wings, Mess Menus, Leaders, Notices & Polls
-- ==============================================================================

-- 1. SEED WINGS
insert into public.wings (name) values
  ('Wing A'),
  ('Wing B'),
  ('Wing C'),
  ('Wing D')
on conflict (name) do nothing;

-- 2. SEED HOSTEL LEADERS (HS)
insert into public.hostel_leaders (name, post, phone, email, sort_order) values
  ('Aarav Sharma', 'HOSTEL CAPTAIN', '+919876543210', 'aarav.sharma@hostel.edu', 1),
  ('Rohan Verma', 'VICE CAPTAIN', '+919876543211', 'rohan.verma@hostel.edu', 2),
  ('Kavya Patel', 'MESS CONVENER (MESS 1)', '+919876543212', 'kavya.mess1@hostel.edu', 3),
  ('Nikhil Deshmukh', 'MESS CONVENER (MESS 2)', '+919876543213', 'nikhil.mess2@hostel.edu', 4),
  ('Pooja Nair', 'MAINTENANCE HEAD', '+919876543214', 'pooja.maintenance@hostel.edu', 5),
  ('Devansh Mehta', 'SPORTS & CULTURAL REP', '+919876543215', 'devansh.sports@hostel.edu', 6)
on conflict do nothing;

-- 3. SEED MESS MENU (Mess 1 & 2, Days 1-7: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun)
-- Mess 1 Menus
insert into public.mess_menu (mess, day_of_week, meal, items) values
  -- Monday
  (1, 1, 'breakfast', array['Poha', 'Sprouts', 'Boiled Eggs', 'Tea / Coffee', 'Banana']),
  (1, 1, 'lunch', array['Dal Tadka', 'Jeera Rice', 'Aloo Gobi', 'Roti', 'Curd', 'Salad']),
  (1, 1, 'snacks', array['Veg Cutlet', 'Green Chutney', 'Tea / Coffee']),
  (1, 1, 'dinner', array['Paneer Butter Masala', 'Tandoori Roti', 'Veg Pulao', 'Dal Fry', 'Gulab Jamun']),

  -- Tuesday
  (1, 2, 'breakfast', array['Idli Sambhar', 'Coconut Chutney', 'Boiled Eggs', 'Tea / Coffee']),
  (1, 2, 'lunch', array['Rajma Masala', 'Steamed Rice', 'Bhindi Masala', 'Chapati', 'Boondi Raita']),
  (1, 2, 'snacks', array['Samosa', 'Tamarind Chutney', 'Tea']),
  (1, 2, 'dinner', array['Mix Veg Kolhapuri', 'Dal Makhani', 'Jeera Rice', 'Roti', 'Fruit Custard']),

  -- Wednesday
  (1, 3, 'breakfast', array['Aloo Paratha', 'Curd', 'Pickle', 'Tea / Coffee']),
  (1, 3, 'lunch', array['Chole Bhature', 'Pulao Rice', 'Cucumber Salad', 'Fried Chillies']),
  (1, 3, 'snacks', array['Onion Pakoda', 'Masala Chai']),
  (1, 3, 'dinner', array['Egg Curry / Mushroom Masala', 'Plain Rice', 'Tawa Roti', 'Dal Tadka', 'Ice Cream']),

  -- Thursday
  (1, 4, 'breakfast', array['Upma', 'Sambhar', 'Boiled Eggs', 'Bread Butter', 'Tea']),
  (1, 4, 'lunch', array['Kadhi Pakoda', 'Khichdi', 'Aloo Methi', 'Roti', 'Papad']),
  (1, 4, 'snacks', array['Sweet Corn Chaat', 'Lemonade / Tea']),
  (1, 4, 'dinner', array['Dum Aloo Kashmiri', 'Yellow Dal', 'Peas Pulao', 'Chapati', 'Kheer']),

  -- Friday
  (1, 5, 'breakfast', array['Masala Dosa', 'Sambhar', 'Tomato Chutney', 'Tea / Coffee']),
  (1, 5, 'lunch', array['Palak Paneer', 'Dal Fry', 'Steamed Basmati Rice', 'Roti', 'Salad']),
  (1, 5, 'snacks', array['Bread Pakoda', 'Mint Chutney', 'Tea']),
  (1, 5, 'dinner', array['Veg Biryani', 'Chicken Curry (Special)', 'Mirchi Ka Salan', 'Raita', 'Rasgulla']),

  -- Saturday
  (1, 6, 'breakfast', array['Methi Thepla', 'Chhunda', 'Curd', 'Boiled Eggs', 'Tea']),
  (1, 6, 'lunch', array['Sev Tameta', 'Gujarati Dal', 'Rice', 'Rotli', 'Chaas']),
  (1, 6, 'snacks', array['Dhokla', 'Green Chutney', 'Tea / Coffee']),
  (1, 6, 'dinner', array['Pav Bhaji', 'Butter Pav', 'Chopped Onions', 'Lemon', 'Gulab Jamun']),

  -- Sunday
  (1, 7, 'breakfast', array['Puri Bhaji', 'Halwa', 'Boiled Eggs', 'Tea / Coffee']),
  (1, 7, 'lunch', array['Special Thali', 'Paneer Tikka', 'Dal Makhani', 'Naan', 'Jeera Rice', 'Sweet Lassi']),
  (1, 7, 'snacks', array['Bhelpuri', 'Juice / Tea']),
  (1, 7, 'dinner', array['Special Veg Fried Rice', 'Manchurian Gravy', 'Spring Rolls', 'Brownie with Ice Cream'])
on conflict (mess, day_of_week, meal) do update set items = excluded.items;

-- Mess 2 Menus (South & Continental Twist)
insert into public.mess_menu (mess, day_of_week, meal, items) values
  (2, 1, 'breakfast', array['Medu Vada', 'Sambhar', 'Coconut Chutney', 'Filter Coffee']),
  (2, 1, 'lunch', array['Tomato Rasam', 'Beans Poriyal', 'Steamed Rice', 'Curd', 'Appalam']),
  (2, 1, 'snacks', array['Banana Fritters', 'Filter Coffee / Tea']),
  (2, 1, 'dinner', array['Malai Kofta', 'Chapati', 'Ghee Rice', 'Dal Tadka', 'Payasam']),

  (2, 2, 'breakfast', array['Uttapam', 'Kara Chutney', 'Boiled Eggs', 'Coffee / Tea']),
  (2, 2, 'lunch', array['Sambar Rice', 'Potato Roast', 'Curd Rice', 'Pickle', 'Papad']),
  (2, 2, 'snacks', array['Veg Sandwich', 'Hot Tea / Coffee']),
  (2, 2, 'dinner', array['Veg Hakka Noodles', 'Chilli Paneer', 'Hot & Sour Soup', 'Fruit Salad']),

  (2, 3, 'breakfast', array['Poha', 'Sev', 'Boiled Eggs', 'Fresh Fruits', 'Tea']),
  (2, 3, 'lunch', array['Dal Maharani', 'Steamed Rice', 'Bhindi Fry', 'Phulka', 'Boondi Raita']),
  (2, 3, 'snacks', array['Punugulu', 'Chutney', 'Ginger Tea']),
  (2, 3, 'dinner', array['Shahi Paneer', 'Butter Naan', 'Jeera Rice', 'Moong Dal Halwa']),

  (2, 4, 'breakfast', array['Rava Dosa', 'Coconut Chutney', 'Sambhar', 'Tea / Coffee']),
  (2, 4, 'lunch', array['Kashmiri Dum Aloo', 'Pulao', 'Tawa Paratha', 'Dal Fry', 'Curd']),
  (2, 4, 'snacks', array['Masala Vada', 'Filter Coffee']),
  (2, 4, 'dinner', array['Mix Vegetable Kurma', 'Malabar Parotta', 'Curd Rice', 'Gulab Jamun']),

  (2, 5, 'breakfast', array['Appam with Vegetable Stew', 'Boiled Eggs', 'Tea / Coffee']),
  (2, 5, 'lunch', array['Hyderabadi Veg Biryani', 'Mirchi Salan', 'Onion Raita', 'Sweet Boondi']),
  (2, 5, 'snacks', array['Aloo Bonda', 'Chutney', 'Tea']),
  (2, 5, 'dinner', array['Paneer Do Pyaza', 'Yellow Dal', 'Rice', 'Chapati', 'Ice Cream']),

  (2, 6, 'breakfast', array['Poori Masala', 'Kesari Bath', 'Tea / Coffee']),
  (2, 6, 'lunch', array['Bisi Bele Bath', 'Boondi', 'Potato Chips', 'Curd Rice']),
  (2, 6, 'snacks', array['Mirchi Bajji', 'Masala Chai']),
  (2, 6, 'dinner', array['Veg Pulao', 'Dal Tadka', 'Chapati', 'Aloo Capsicum', 'Rasmalai']),

  (2, 7, 'breakfast', array['Chole Bhature', 'Sweet Lassi', 'Fresh Fruits']),
  (2, 7, 'lunch', array['Special Feast', 'Paneer Pasanda', 'Dal Makhani', 'Butter Naan', 'Biryani Rice', 'Gulab Jamun']),
  (2, 7, 'snacks', array['Dahi Puri', 'Tea / Cold Drink']),
  (2, 7, 'dinner', array['Pasta in Alfredo Sauce', 'Garlic Bread', 'Tomato Soup', 'Choco Lava Cake'])
on conflict (mess, day_of_week, meal) do update set items = excluded.items;

-- 4. SEED SAMPLE NOTICES
insert into public.notices (title, body, category, created_at) values
  ('Mess 1 & 2 Survey for Festival Dinner', 'Residents are requested to vote in the mess polls regarding the Diwali Special Feast menu options before Wednesday 6:00 PM.', 'Mess', now() - interval '2 hours'),
  ('Water Tank Cleaning - Schedule for Wing A & B', 'Water supply will be temporarily paused between 10:00 AM and 2:00 PM this coming Tuesday for scheduled overhead tank maintenance.', 'Maintenance', now() - interval '1 day'),
  ('Wi-Fi Bandwidth Upgrade Across All Wings', 'New access points have been installed on the 2nd and 3rd floors of all wings. Please reconnect to Hostel_HighSpeed_5G.', 'General', now() - interval '3 days'),
  ('Hostel Badminton & Table Tennis Tournament', 'Registrations are open for the intra-hostel sports meet starting this Saturday. Contact Devansh Mehta (Sports Rep) to register your teams.', 'Event', now() - interval '5 days'),
  ('Urgent: Quiet Hours During Mid-Semester Exams', 'Strict quiet hours will be observed from 11:00 PM to 6:00 AM starting tonight. Please refrain from playing loud speakers in corridors.', 'Urgent', now() - interval '6 days')
on conflict do nothing;
