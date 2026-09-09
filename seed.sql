-- Seed Data for Sports Science Fitness Club Database

-- Clear existing data
TRUNCATE TABLE trainer_certifications, trainers, packages CASCADE;

-- Insert Packages
INSERT INTO packages (id, package_type, name, label, price, unit_label, months_valid, featured, features) VALUES
('1m', 'fitness', 'Fitness 1 เดือน', 'เริ่มต้น', 300, '/ เดือน', 1, FALSE, ARRAY['เข้าใช้ฟิตเนสตามเวลาเปิดบริการ', 'ประเมินสมรรถภาพเบื้องต้น 1 ครั้ง', 'บันทึกการเข้าใช้ผ่าน Dashboard']),
('3m', 'fitness', 'Fitness 3 เดือน', 'ยอดนิยม', 750, '/ 3 เดือน', 3, TRUE, ARRAY['สิทธิ์ทั้งหมดจากแพ็กเกจ 1 เดือน', 'ติดตามผลรายเดือน', 'ประหยัดกว่ารายเดือน 150 บาท']),
('6m', 'fitness', 'Fitness 6 เดือน', 'ต่อเนื่อง', 1400, '/ 6 เดือน', 6, FALSE, ARRAY['สิทธิ์ทั้งหมดจากแพ็กเกจ 3 เดือน', 'ประเมินสมรรถภาพซ้ำ 2 ครั้ง', 'เหมาะสำหรับแผนระยะกลาง']),
('1y', 'fitness', 'Fitness 1 ปี', 'คุ้มที่สุด', 2500, '/ ปี', 12, FALSE, ARRAY['เข้าใช้ฟิตเนสตลอด 12 เดือน', 'ติดตามผลและประเมินสมรรถภาพ', 'ราคาต่อเดือนคุ้มที่สุด']),
('pt1', 'trainer', 'Personal Training 1 ครั้ง', 'ทดลอง', 350, '/ ครั้ง', 1, FALSE, ARRAY['ฝึกส่วนตัว 60 นาที', 'ประเมินเป้าหมายก่อนเริ่ม', 'คำแนะนำหลังการฝึก']),
('pt4', 'trainer', 'Personal Training 4 ครั้ง', 'แนะนำ', 1200, '/ แพ็กเกจ', 1, TRUE, ARRAY['ฝึกส่วนตัว 4 ครั้ง', 'วางโปรแกรมตามเป้าหมาย', 'ติดตามผลตลอดแพ็กเกจ']),
('pt8', 'trainer', 'Personal Training 8 ครั้ง', 'จริงจัง', 2200, '/ แพ็กเกจ', 2, FALSE, ARRAY['ฝึกส่วนตัว 8 ครั้ง', 'ปรับโปรแกรมตามความก้าวหน้า', 'สรุปผลเมื่อจบแพ็กเกจ']);

-- Insert Trainers
INSERT INTO trainers (id, name, initials, gender, role_title, experience_years, rating, bio, color_theme, specialties, goals, tags, schedule) VALUES
('coach-narin', 'โค้ชนรินทร์ วัฒนชัย', 'NR', 'male', 'Strength & Conditioning Coach', 8, 4.9, 'เชี่ยวชาญการสร้างพื้นฐานความแข็งแรงและเพิ่มมวลกล้ามเนื้ออย่างเป็นระบบ เหมาะทั้งผู้เริ่มต้นและผู้ที่ต้องการยกระดับสมรรถภาพ', 'linear-gradient(135deg, #075bd8, #05265c)', ARRAY['strength', 'muscle'], ARRAY['muscle-gain', 'general'], ARRAY['เพิ่มกล้ามเนื้อ', 'เวทเทรนนิ่ง', 'ปรับท่าฝึก'], ARRAY['จ. 16:00–20:00', 'อ. 16:00–20:00', 'พฤ. 16:00–20:00', 'ส. 09:00–15:00']),
('coach-pim', 'โค้ชพิมพ์ชนก ศรีสุข', 'PM', 'female', 'Weight Management Coach', 6, 4.8, 'ดูแลโปรแกรมลดไขมันควบคู่การปรับพฤติกรรม เน้นแผนที่ทำตามได้จริงและติดตามผลอย่างสม่ำเสมอโดยไม่หักโหม', 'linear-gradient(135deg, #12a6c9, #0750a4)', ARRAY['fat-loss', 'nutrition'], ARRAY['weight-loss', 'general'], ARRAY['ลดไขมัน', 'คาร์ดิโอ', 'โภชนาการ'], ARRAY['จ. 09:00–15:00', 'พ. 09:00–18:00', 'ศ. 09:00–18:00', 'ส. 10:00–16:00']),
('coach-ton', 'โค้ชธนกฤต ภูผา', 'TN', 'male', 'Athletic Performance Coach', 10, 4.9, 'ออกแบบโปรแกรมพัฒนาความเร็ว พลัง และความคล่องตัวสำหรับนักกีฬา รวมถึงผู้ที่ต้องการฝึกแบบ Athletic Performance', 'linear-gradient(135deg, #5126a8, #075bd8)', ARRAY['sport', 'strength'], ARRAY['performance', 'muscle-gain'], ARRAY['กีฬาเฉพาะทาง', 'ความเร็ว', 'ความแข็งแรง'], ARRAY['อ. 10:00–18:00', 'พ. 12:00–20:00', 'พฤ. 10:00–18:00', 'ส. 08:00–13:00']),
('coach-may', 'โค้ชเมธาวี อินทร์แก้ว', 'MY', 'female', 'Mobility & Corrective Exercise', 7, 4.8, 'เน้นคุณภาพการเคลื่อนไหว ความยืดหยุ่น และการฝึกแก้ไขท่าทาง เหมาะกับผู้เริ่มต้นหรือผู้ที่ต้องการกลับมาออกกำลังกายอย่างปลอดภัย', 'linear-gradient(135deg, #04a878, #087ca7)', ARRAY['mobility', 'rehab'], ARRAY['rehabilitation', 'general'], ARRAY['ยืดเหยียด', 'แก้ออฟฟิศซินโดรม', 'ฟื้นฟูการเคลื่อนไหว'], ARRAY['จ. 10:00–18:00', 'อ. 12:00–20:00', 'พฤ. 09:00–17:00', 'ศ. 10:00–18:00']),
('coach-beam', 'โค้ชบีม ปารมีชัย', 'BM', 'male', 'Functional Training Coach', 5, 4.7, 'โปรแกรมสนุก กระชับ และปรับระดับได้ ช่วยพัฒนาความฟิตทั่วร่างกาย เหมาะกับคนที่ไม่ชอบการฝึกแบบเดิม ๆ', 'linear-gradient(135deg, #f08025, #bd3c59)', ARRAY['functional', 'fat-loss'], ARRAY['weight-loss', 'performance', 'general'], ARRAY['Functional', 'ลดไขมัน', 'Circuit Training'], ARRAY['จ. 14:00–20:00', 'พ. 14:00–20:00', 'ศ. 14:00–20:00', 'ส. 09:00–14:00']),
('coach-fah', 'โค้ชฟ้า ณัฐกานต์', 'FA', 'female', 'Beginner Fitness Coach', 4, 4.8, 'ดูแลผู้เริ่มต้นอย่างใกล้ชิด สอนใช้อุปกรณ์และวางแผนการฝึกทีละขั้น เพื่อสร้างความมั่นใจและนิสัยออกกำลังกายในระยะยาว', 'linear-gradient(135deg, #e45b94, #6546c7)', ARRAY['beginner', 'functional'], ARRAY['general', 'weight-loss'], ARRAY['ผู้เริ่มต้น', 'สุขภาพทั่วไป', 'สร้างนิสัย'], ARRAY['อ. 08:00–16:00', 'พ. 08:00–16:00', 'พฤ. 12:00–20:00', 'ส. 09:00–16:00']);

-- Insert Trainer Certifications
INSERT INTO trainer_certifications (trainer_id, name, issuer, credential_id, status) VALUES
('coach-narin', 'Certified Personal Trainer (CPT)', 'NSCA', 'CPT-89241', 'อนุมัติแล้ว'),
('coach-narin', 'Strength & Conditioning Fundamentals', 'EXOS', 'SC-1092', 'อนุมัติแล้ว'),
('coach-narin', 'ปฐมพยาบาลและ CPR', 'สมาคมผู้ช่วยชีวิต', 'CPR-2024-001', 'อนุมัติแล้ว'),
('coach-pim', 'Weight Management Specialist', 'ACE', 'WMS-7712', 'อนุมัติแล้ว'),
('coach-pim', 'Nutrition for Exercise', 'NASM', 'NUT-4410', 'อนุมัติแล้ว'),
('coach-pim', 'ปฐมพยาบาลและ CPR', 'สมาคมผู้ช่วยชีวิต', 'CPR-2024-002', 'อนุมัติแล้ว'),
('coach-ton', 'Sports Performance Coach', 'CSCS', 'CSCS-5501', 'อนุมัติแล้ว'),
('coach-ton', 'Speed & Agility Training', 'EXOS', 'SA-2291', 'อนุมัติแล้ว'),
('coach-ton', 'ปฐมพยาบาลและ CPR', 'สมาคมผู้ช่วยชีวิต', 'CPR-2024-003', 'อนุมัติแล้ว'),
('coach-may', 'Corrective Exercise Specialist', 'NASM-CES', 'CES-9912', 'อนุมัติแล้ว'),
('coach-may', 'Mobility Fundamentals', 'FMS', 'FMS-3021', 'อนุมัติแล้ว'),
('coach-may', 'ปฐมพยาบาลและ CPR', 'สมาคมผู้ช่วยชีวิต', 'CPR-2024-004', 'อนุมัติแล้ว'),
('coach-beam', 'Functional Training Specialist', 'TRX / Functional', 'FTS-6612', 'อนุมัติแล้ว'),
('coach-beam', 'Group Exercise Leader', 'FIT', 'GEL-1102', 'อนุมัติแล้ว'),
('coach-beam', 'ปฐมพยาบาลและ CPR', 'สมาคมผู้ช่วยชีวิต', 'CPR-2024-005', 'อนุมัติแล้ว'),
('coach-fah', 'Certified Personal Trainer (CPT)', 'ACE', 'CPT-3391', 'อนุมัติแล้ว'),
('coach-fah', 'Behavior Change Basics', 'NASM', 'BC-8812', 'อนุมัติแล้ว'),
('coach-fah', 'ปฐมพยาบาลและ CPR', 'สมาคมผู้ช่วยชีวิต', 'CPR-2024-006', 'อนุมัติแล้ว');
