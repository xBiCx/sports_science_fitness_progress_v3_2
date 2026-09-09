-- SQL Schema for Sports Science Fitness Club
-- Database: ssf_db

DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS trainer_certifications CASCADE;
DROP TABLE IF EXISTS health_profiles CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS trainers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    student_id VARCHAR(50),
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(255),
    provider VARCHAR(20) DEFAULT 'local',
    google_sub VARCHAR(255),
    role VARCHAR(20) DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Health Profiles Table
CREATE TABLE health_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    sex VARCHAR(10) NOT NULL,
    age INT NOT NULL,
    height NUMERIC(5, 2) NOT NULL,
    weight NUMERIC(5, 2) NOT NULL,
    body_fat NUMERIC(4, 1),
    activity_level NUMERIC(3, 2) NOT NULL,
    goal VARCHAR(50) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    limitations TEXT,
    bmi NUMERIC(4, 1) NOT NULL,
    bmi_category VARCHAR(50) NOT NULL,
    bmr INT NOT NULL,
    tdee INT NOT NULL,
    target_calories INT NOT NULL,
    protein_grams INT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Trainers Table
CREATE TABLE trainers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    initials VARCHAR(5) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    role_title VARCHAR(150) NOT NULL,
    experience_years INT NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    bio TEXT,
    color_theme VARCHAR(100),
    specialties TEXT[],
    goals TEXT[],
    tags TEXT[],
    schedule TEXT[]
);

-- 4. Trainer Certifications Table
CREATE TABLE trainer_certifications (
    id SERIAL PRIMARY KEY,
    trainer_id VARCHAR(50) REFERENCES trainers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) DEFAULT 'ยังไม่ได้ระบุ',
    credential_id VARCHAR(100) DEFAULT 'ยังไม่ได้แนบข้อมูล',
    status VARCHAR(50) DEFAULT 'รอผู้ดูแลตรวจสอบ'
);

-- 5. Packages Table
CREATE TABLE packages (
    id VARCHAR(50) PRIMARY KEY,
    package_type VARCHAR(20) NOT NULL, -- 'fitness' หรือ 'trainer'
    name VARCHAR(150) NOT NULL,
    label VARCHAR(50),
    price NUMERIC(10, 2) NOT NULL,
    unit_label VARCHAR(50),
    months_valid INT DEFAULT 1,
    featured BOOLEAN DEFAULT FALSE,
    features TEXT[]
);

-- 6. Subscriptions Table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    package_id VARCHAR(50) REFERENCES packages(id),
    trainer_id VARCHAR(50) REFERENCES trainers(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    expire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bookings Table
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(20) NOT NULL,
    service VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'รอตรวจสอบ',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Checkins Table
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_daily_checkin UNIQUE(user_id, checkin_date)
);
