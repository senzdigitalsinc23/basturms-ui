-- This SQL schema represents the data structures currently stored in localStorage for the CampusConnect application.

-- =============================================
-- Core & Authentication
-- =============================================

CREATE TABLE Roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role_id TEXT NOT NULL,
    avatarUrl TEXT,
    signature TEXT, -- Data URL for the signature image
    is_super_admin BOOLEAN NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'frozen'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES Roles(id)
);

-- =============================================
-- Student Management
-- =============================================

CREATE TABLE Classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE Students (
    student_no TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    other_name TEXT,
    dob TEXT NOT NULL,
    gender TEXT NOT NULL,
    avatarUrl TEXT,
    created_at TEXT NOT NULL,
    created_by TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES Users(id),
    FOREIGN KEY (updated_by) REFERENCES Users(id)
);

CREATE TABLE StudentContactDetails (
    student_no TEXT PRIMARY KEY,
    email TEXT,
    phone TEXT,
    country TEXT NOT NULL,
    city TEXT,
    hometown TEXT,
    residence TEXT,
    house_no TEXT,
    gps_no TEXT,
    FOREIGN KEY (student_no) REFERENCES Students(student_no) ON DELETE CASCADE
);

CREATE TABLE StudentGuardianInfo (
    student_no TEXT PRIMARY KEY,
    guardian_name TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    guardian_email TEXT,
    guardian_relationship TEXT,
    guardian_occupation TEXT,
    father_name TEXT,
    father_phone TEXT,
    father_email TEXT,
    father_occupation TEXT,
    mother_name TEXT,
    mother_phone TEXT,
    mother_email TEXT,
    mother_occupation TEXT,
    FOREIGN KEY (student_no) REFERENCES Students(student_no) ON DELETE CASCADE
);

CREATE TABLE StudentEmergencyContacts (
    student_no TEXT PRIMARY KEY,
    emergency_name TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    emergency_relationship TEXT,
    FOREIGN KEY (student_no) REFERENCES Students(student_no) ON DELETE CASCADE
);

CREATE TABLE StudentAdmissionDetails (
    student_no TEXT PRIMARY KEY,
    admission_no TEXT NOT NULL UNIQUE,
    enrollment_date TEXT NOT NULL,
    class_id TEXT NOT NULL,
    admission_status TEXT NOT NULL,
    FOREIGN KEY (student_no) REFERENCES Students(student_no) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(id)
);

CREATE TABLE StudentHealthRecords (
    student_no TEXT PRIMARY KEY,
    blood_group TEXT,
    allergies TEXT, -- Stored as a JSON array string '["Peanuts", "Dust"]'
    medical_notes TEXT,
    FOREIGN KEY (student_no) REFERENCES Students(student_no) ON DELETE CASCADE
);

CREATE TABLE StudentVaccinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_no TEXT NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (student_no) REFERENCES Students(student_no) ON DELETE CASCADE
);

-- =============================================
-- Staff Management
-- =============================================

CREATE TABLE Staff (
    staff_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    other_name TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    roles TEXT NOT NULL, -- Stored as a JSON array string '["Teacher", "Admin"]'
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'On-leave', 'Inactive'
    id_type TEXT,
    id_no TEXT,
    snnit_no TEXT,
    date_of_joining TEXT NOT NULL,
    salary REAL,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE StaffAddress (
    staff_id TEXT PRIMARY KEY,
    country TEXT,
    city TEXT,
    hometown TEXT,
    residence TEXT,
    house_no TEXT,
    gps_no TEXT,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE CASCADE
);

CREATE TABLE StaffAcademicHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    school TEXT,
    qualification TEXT,
    program_offered TEXT,
    year_completed INTEGER,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE CASCADE
);

CREATE TABLE StaffDocuments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    document_name TEXT,
    file TEXT, -- Could be a URL or path
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE CASCADE
);

CREATE TABLE StaffAppointmentHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    roles TEXT NOT NULL, -- JSON array
    class_assigned TEXT, -- JSON array of Class IDs
    subjects_assigned TEXT, -- JSON array of Subject IDs
    is_class_teacher_for_class_id TEXT,
    appointment_status TEXT,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE CASCADE
);

CREATE TABLE SalaryAdvances (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL,
    amount REAL NOT NULL,
    date_requested TEXT NOT NULL,
    repayment_months INTEGER NOT NULL,
    monthly_deduction REAL NOT NULL,
    repayments_made INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE CASCADE
);

-- =============================================
-- Academics
-- =============================================

CREATE TABLE Subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE ClassSubjects (
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    PRIMARY KEY (class_id, subject_id),
    FOREIGN KEY (class_id) REFERENCES Classes(id),
    FOREIGN KEY (subject_id) REFERENCES Subjects(id)
);

CREATE TABLE AssignmentScores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    assignment_name TEXT NOT NULL,
    score REAL NOT NULL,
    FOREIGN KEY (student_id) REFERENCES Students(student_no),
    FOREIGN KEY (class_id) REFERENCES Classes(id),
    FOREIGN KEY (subject_id) REFERENCES Subjects(id)
);

-- =============================================
-- Attendance
-- =============================================

CREATE TABLE StudentAttendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Present', 'Absent', 'Late', 'Excused'
    FOREIGN KEY (student_id) REFERENCES Students(student_no) ON DELETE CASCADE
);

CREATE TABLE StaffAttendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Present', 'Absent', 'On Leave', 'Excused'
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id) ON DELETE CASCADE
);

-- =============================================
-- Financials
-- =============================================

CREATE TABLE FeeStructure (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    isMiscellaneous BOOLEAN DEFAULT 0
);

CREATE TABLE FeeStructureAmounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fee_structure_id TEXT NOT NULL,
    level TEXT NOT NULL, -- 'Pre-School', 'Lower Primary', etc.
    amount REAL NOT NULL,
    FOREIGN KEY (fee_structure_id) REFERENCES FeeStructure(id) ON DELETE CASCADE
);

CREATE TABLE TermlyBills (
    bill_number TEXT PRIMARY KEY,
    term TEXT NOT NULL,
    created_at TEXT NOT NULL,
    created_by TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Pending', 'Approved', 'Rejected'
    approved_by TEXT,
    approved_at TEXT,
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

CREATE TABLE TermlyBillItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_number TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (bill_number) REFERENCES TermlyBills(bill_number) ON DELETE CASCADE
);

CREATE TABLE StudentFinancials (
    student_no TEXT PRIMARY KEY,
    account_balance REAL NOT NULL,
    FOREIGN KEY (student_no) REFERENCES Students(student_no) ON DELETE CASCADE
);

CREATE TABLE StudentPayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_no TEXT NOT NULL,
    term TEXT NOT NULL,
    bill_number TEXT NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT,
    recorded_by TEXT,
    receipt_number TEXT,
    paid_by TEXT,
    FOREIGN KEY (student_no) REFERENCES Students(student_no) ON DELETE CASCADE
);

CREATE TABLE Expenses (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    amount REAL NOT NULL,
    vendor TEXT,
    paymentMethod TEXT,
    recorded_by TEXT NOT NULL,
    FOREIGN KEY (recorded_by) REFERENCES Users(id)
);

CREATE TABLE Payrolls (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    generated_at TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Pending', 'Approved', 'Rejected'
    total_amount REAL NOT NULL,
    approved_by TEXT,
    approved_at TEXT,
    FOREIGN KEY (generated_by) REFERENCES Users(id)
);

CREATE TABLE PayrollItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payroll_id TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    base_salary REAL,
    allowances REAL,
    bonuses REAL,
    gross_salary REAL,
    deductions REAL,
    net_salary REAL,
    FOREIGN KEY (payroll_id) REFERENCES Payrolls(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
);

-- =============================================
-- Logs & Miscellaneous
-- =============================================

CREATE TABLE AuditLogs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_email TEXT,
    user_name TEXT,
    action TEXT,
    details TEXT,
    clientInfo TEXT
);

CREATE TABLE AuthLogs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    email TEXT,
    event TEXT,
    status TEXT,
    details TEXT,
    clientInfo TEXT
);

CREATE TABLE Announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    audience TEXT NOT NULL,
    created_at TEXT NOT NULL,
    author_id TEXT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES Users(id)
);

-- ... and so on for other features like inventory, library, etc.
