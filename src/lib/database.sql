-- This is an example SQL schema generated from the application's data structures.
-- It is normalized and optimized for a relational database like SQLite.

-- -----------------------------------------------------
-- Core User & Staff Tables
-- -----------------------------------------------------

CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    signature TEXT, -- Store as base64 data URI
    is_super_admin BOOLEAN NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('active', 'frozen')) DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_no TEXT NOT NULL UNIQUE,
    user_id INTEGER UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    other_name TEXT,
    phone TEXT NOT NULL,
    id_type TEXT NOT NULL,
    id_no TEXT NOT NULL UNIQUE,
    snnit_no TEXT UNIQUE,
    date_of_joining DATE NOT NULL,
    employment_status TEXT NOT NULL CHECK(employment_status IN ('Active', 'On-leave', 'Inactive')) DEFAULT 'Active',
    address_residence TEXT,
    address_hometown TEXT,
    address_city TEXT,
    address_country TEXT,
    address_gps TEXT,
    base_salary REAL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE staff_roles (
    staff_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (staff_id, role_id),
    FOREIGN KEY (staff_id) REFERENCES staff (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

CREATE TABLE staff_academic_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    school TEXT NOT NULL,
    qualification TEXT NOT NULL,
    program_offered TEXT,
    year_completed INTEGER,
    FOREIGN KEY (staff_id) REFERENCES staff (id) ON DELETE CASCADE
);

CREATE TABLE staff_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    document_name TEXT NOT NULL,
    file_content BLOB NOT NULL, -- Store file content directly
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff (id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Student & Academic Tables
-- -----------------------------------------------------

CREATE TABLE classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    school_level TEXT -- e.g., 'Pre-School', 'JHS'
);

CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_no TEXT NOT NULL UNIQUE,
    admission_no TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    other_name TEXT,
    dob DATE NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('Male', 'Female', 'Other')),
    admission_status TEXT NOT NULL DEFAULT 'Admitted',
    enrollment_date DATE NOT NULL,
    class_id INTEGER,
    avatar_url TEXT,
    created_by_user_id INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes (id),
    FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE student_contact_details (
    student_id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT,
    residence TEXT,
    hometown TEXT,
    house_no TEXT,
    gps_no TEXT,
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
);

CREATE TABLE student_guardian_info (
    student_id INTEGER PRIMARY KEY,
    guardian_name TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    guardian_relationship TEXT,
    guardian_email TEXT,
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Academic Structure
-- -----------------------------------------------------

CREATE TABLE academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_name TEXT NOT NULL UNIQUE, -- e.g., "2023/2024"
    status TEXT NOT NULL CHECK(status IN ('Active', 'Completed', 'Upcoming'))
);

CREATE TABLE terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academic_year_id INTEGER NOT NULL,
    name TEXT NOT NULL, -- "First Term", "Second Term"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Upcoming', 'Active', 'Completed')),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE CASCADE
);

CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE class_subjects (
    class_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    PRIMARY KEY (class_id, subject_id),
    FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Records & Logs
-- -----------------------------------------------------

CREATE TABLE attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    staff_id INTEGER,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late', 'Excused', 'On Leave')),
    recorded_by_user_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff (id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE assignment_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    term_id INTEGER NOT NULL,
    assignment_name TEXT NOT NULL,
    score REAL NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES terms (id) ON DELETE CASCADE
);

CREATE TABLE disciplinary_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date DATE NOT NULL,
    incident TEXT NOT NULL,
    action_taken TEXT,
    reported_by_user_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Financials
-- -----------------------------------------------------

CREATE TABLE fee_structure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_miscellaneous BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE fee_amounts (
    fee_item_id INTEGER NOT NULL,
    school_level TEXT NOT NULL,
    amount REAL NOT NULL,
    PRIMARY KEY (fee_item_id, school_level),
    FOREIGN KEY (fee_item_id) REFERENCES fee_structure (id) ON DELETE CASCADE
);

CREATE TABLE termly_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    total_billed REAL NOT NULL,
    total_paid REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('Paid', 'Partially Paid', 'Unpaid')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (term_id) REFERENCES terms (id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    termly_bill_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method TEXT NOT NULL,
    receipt_number TEXT,
    recorded_by_user_id INTEGER,
    FOREIGN KEY (termly_bill_id) REFERENCES termly_bills (id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Indexes for Performance Optimization
-- -----------------------------------------------------

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_staff_staff_no ON staff (staff_no);
CREATE INDEX idx_students_student_no ON students (student_no);
CREATE INDEX idx_students_class_id ON students (class_id);
CREATE INDEX idx_attendance_student_date ON attendance_records (student_id, date);
CREATE INDEX idx_attendance_staff_date ON attendance_records (staff_id, date);
CREATE INDEX idx_scores_student_term ON assignment_scores (student_id, term_id);
CREATE INDEX idx_payments_bill_id ON payments (termly_bill_id);
CREATE INDEX idx_bills_student_term ON termly_bills (student_id, term_id);
