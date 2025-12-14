

export type Role =
  | 'Admin'
  | 'Teacher'
  | 'Student'
  | 'Parent'
  | 'Headmaster'
  | 'Librarian'
  | 'Security'
  | 'Procurement Manager'
  | 'Stores Manager'
  | 'Proprietor'
  | 'I.T Manager'
  | 'I.T Support'
  | 'Accountant'
  | 'Guest';

export const ALL_ROLES: Role[] = [
  'Admin',
  'Teacher',
  'Student',
  'Parent',
  'Headmaster',
  'Librarian',
  'Security',
  'Procurement Manager',
  'Stores Manager',
  'Proprietor',
  'I.T Manager',
  'I.T Support',
  'Accountant',
  'Guest',
];

export const PERMISSIONS = {
  'student:create': 'Create Student',
  'student:view': 'View Student',
  'student:update': 'Update Student',
  'student:delete': 'Delete Student',
  'student:promote': 'Promote/Graduate Student',
  'staff:create': 'Create Staff',
  'staff:view': 'View Staff',
  'staff:update': 'Update Staff',
  'staff:delete': 'Delete Staff',
  'user:create': 'Create User',
  'user:view': 'View User',
  'user:update': 'Update User',
  'user:delete': 'Delete User',
  'attendance:student': 'Take Student Attendance',
  'attendance:staff': 'Take Staff Attendance',
  'attendance:view_history': 'View Attendance History',
  'settings:edit': 'Manage System Settings',
  'logs:view_audit': 'View Audit Logs',
  'logs:view_auth': 'View Authentication Logs',
  'notifications:view': 'View Notifications',
  'leave:view': 'View Leave Requests',
  'leave:create': 'Create Leave Request',
  'leave:approve': 'Approve/Reject Leave Request',
  'backup:create': 'Create Data Backup',
  'backup:restore': 'Restore Data from Backup',
  'financials:setup': 'Manage Fee Structures',
  'financials:billing': 'Prepare and Send Bills',
  'financials:collect': 'Record Fee Payments',
  'financials:reports': 'View Financial Reports',
  'inventory:view': 'View Inventory',
  'inventory:create': 'Create Inventory Item',
  'inventory:update': 'Update Inventory Item',
  'inventory:delete': 'Delete Inventory Item',
  'inventory:allocate': 'Allocate Inventory',
} as const;

export type Permission = keyof typeof PERMISSIONS;
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];
export type RolePermissions = Partial<Record<Role, Permission[]>>;


// Inventory Management Types
export type AssetStatus = 'In Stock' | 'Allocated' | 'In Repair' | 'Disposed';
export type AssetCondition = 'New' | 'Good' | 'Fair' | 'Poor';
export type AssetCategory = 'IT Equipment' | 'Furniture' | 'Lab Equipment' | 'Office Supplies' | 'Vehicle' | 'Other';
export type StoreLocation = 'Main Store' | 'Book Store' | 'Food Store';
export const ALL_STORE_LOCATIONS: StoreLocation[] = ['Main Store', 'Book Store', 'Food Store'];


export const ALL_ASSET_STATUSES: AssetStatus[] = ['In Stock', 'Allocated', 'In Repair', 'Disposed'];
export const ALL_ASSET_CONDITIONS: AssetCondition[] = ['New', 'Good', 'Fair', 'Poor'];
export const ALL_ASSET_CATEGORIES: AssetCategory[] = ['IT Equipment', 'Furniture', 'Lab Equipment', 'Office Supplies', 'Vehicle', 'Other'];

export type AssetLog = {
    date: string; // ISO string
    type: 'Maintenance' | 'Depreciation' | 'Status Change' | 'Stock Update';
    details: string;
    cost?: number;
    recorded_by: string; // user id
};

export type AssetAllocation = {
    id: string;
    assetId: string;
    assetName: string;
    quantity: number;
    allocatedToId: string; // Can be a Staff ID or Class ID
    allocatedToName: string;
    allocationType: 'Staff' | 'Class' | 'Department';
    date: string; // ISO string
    condition: AssetCondition;
    notes?: string;
};

export interface Asset {
    id: string;
    name: string;
    category: AssetCategory;
    purchaseDate: string; // ISO string
    purchaseCost: number;
    quantity: number;
    status: AssetStatus;
    currentLocation: StoreLocation | string;
    condition: AssetCondition;
    logs: AssetLog[];
}

export type DepartmentRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Served' | 'Not Served';
export interface DepartmentRequest {
    id: string;
    requested_by_id: string;
    requested_by_name: string;
    department: string;
    asset_id: string;
    asset_name: string;
    quantity_requested: number;
    reason: string;
    status: DepartmentRequestStatus;
    request_date: string; // ISO string
    quantity_approved?: number;
    approved_by_id?: string;
    approved_by_name?: string;
    approval_date?: string;
    quantity_served?: number;
    served_by_id?: string;
    served_by_name?: string;
    served_date?: string;
    comments?: string;
}


export type Club = {
  id: string;
  name: string;
  description?: string;
  teacher_id: string; // Staff ID
  student_ids: string[]; // Student IDs
};

export type Sport = {
  id: string;
  name: string;
  description?: string;
  coach_id: string; // Staff ID
  student_ids: string[]; // Student IDs
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
};

export type Audience = 'All School' | 'Teachers' | 'Parents' | 'Students';
export type Announcement = {
  id: string;
  title: string;
  content: string;
  audience: Audience;
  created_at: string; // ISO string
  author_id: string; // user id
  author_name: string; // user name for display
};

export type PayrollStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PayrollItem {
    staff_id: string;
    staff_name: string;
    base_salary: number;
    allowances: number;
    bonuses: number;
    gross_salary: number;
    deductions: number;
    net_salary: number;
}
export interface Payroll {
    id: string;
    month: string; // e.g., "June 2024"
    generated_at: string;
    generated_by: string; // user id
    status: PayrollStatus;
    items: PayrollItem[];
    total_amount: number;
    approved_by?: string; // user id
    approved_at?: string;
}

export type ExpenseCategory = 'Salaries' | 'Utilities' | 'Maintenance' | 'Supplies' | 'Procurement' | 'Miscellaneous';

export interface Expense {
  id: string;
  date: string; // ISO string
  description: string;
  category: ExpenseCategory;
  amount: number;
  vendor?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque';
  recorded_by: string; // user id
}

export type StudentReport = {
    student: StudentProfile;
    term: string;
    year: string;
    nextTermBegins: string | null;
    subjects: {
        subjectName: string;
        rawSbaScore: number;
        sbaScore: number;
        rawExamScore: number;
        examScore: number;
        totalScore: number;
        grade: string;
        position: number;
        remarks: string;
    }[];
    attendance: {
        daysAttended: number;
        totalDays: number;
    };
    conduct: string;
    talentAndInterest: string;
    classTeacherRemarks: string;
    headTeacherRemarks: string;
    schoolProfile: any; // Using 'any' for now, can be SchoolProfileData
    className: string;
    status: 'Provisional' | 'Final';
    classTeacherId?: string;
    headTeacherId?: string;
    classTeacherSignature?: string | null;
    headTeacherSignature?: string | null;
};


export interface Class {
    id: string;
    name: string;
    class_name: string; // Added this line
    is_active: boolean;
    class_id: string;
}

export interface ClassSubjectAssignment {
    id: string;
    class_name: string;
    subject_name: string;
    class_id: string;
    subject_id: string;
    academic_year: string;
    semester: string;
    assigned_date: string;
    is_active: boolean;
}

export type SchoolLevel = 'Pre-School' | 'Lower Primary' | 'Upper Primary' | 'JHS' | 'Final Year';
export const ALL_SCHOOL_LEVELS: SchoolLevel[] = ['Pre-School', 'Lower Primary', 'Upper Primary', 'JHS', 'Final Year'];


export interface User {
  id: string; 
  user_id?: string; // from API
  name: string;
  username: string;
  email: string;
  role: Role; // For easy access in the app
  role_id: string | null;
  avatarUrl: string;
  signature?: string; // Data URL of the user's signature image
  is_super_admin: boolean;
  status: 'active' | 'frozen';
  created_at: string;
  updated_at: string;
  password?: string;
}

export interface UserStorage extends Omit<User, 'role'> {}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string; // user email
  name: string; // user's full name
  action: string;
  details: string;
  clientInfo?: string;
}

export interface AuthLog {
  id: string;
  timestamp: string;
  email: string;
  event: 'Login Success' | 'Login Failure' | 'Logout';
  status: 'Success' | 'Failure';
  details: string;
  clientInfo?: string;
}

// Settings Types
export type AcademicYearStatus = 'Active' | 'Completed' | 'Upcoming';
export const ALL_ACADEMIC_YEAR_STATUSES: AcademicYearStatus[] = ['Active', 'Completed', 'Upcoming'];
export interface Term {
    name: string;
    startDate: string;
    endDate: string;
    status: 'Upcoming' | 'Active' | 'Completed';
    id?: number; // From API
    added_by?: string; // From API
    added_on?: string; // From API
}

export interface AcademicYear {
    year: string; // e.g., "2023/2024"
    terms: Term[];
    status: AcademicYearStatus;
    number_of_terms?: number; // Number of terms from API
}

export type CalendarEventCategory = 'Holiday' | 'Exam' | 'School Event' | 'Other';

export interface CalendarEvent {
    id: string;
    date: string; // ISO string
    title: string;
    category: CalendarEventCategory;
    description?: string;
}


export interface GradeSetting {
    grade: string;
    range: string;
    remarks: string;
}

export interface AssignmentActivity {
    id: string;
    name: string;
    expected_per_term: number;
    weight: number;
}

export interface ClassAssignmentActivity {
    class_id: string;
    activity_id: string;
}

export type PromotionRule = {
    minAverageScore: number;
    minPassMark: number;
    compulsorySubjects: string[]; // Subjects that MUST be passed
    electiveSubjects: string[]; // A pool of other subjects
    minElectivesToPass: number; // How many from the elective pool must be passed
};

export type PromotionCriteria = Partial<Record<SchoolLevel, PromotionRule>>;

// Student Management Types
export type AdmissionStatus = 'Admitted' | 'Pending' | 'Graduated' | 'Stopped' | 'Transferred' | 'Suspended' | 'Withdrawn';

export const ALL_ADMISSION_STATUSES: AdmissionStatus[] = [
    'Admitted',
    'Pending',
    'Graduated',
    'Stopped',
    'Transferred',
    'Suspended',
    'Withdrawn',
];
export interface Student {
    student_no: string;
    first_name: string;
    last_name: string;
    other_name?: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    avatarUrl?: string;
    created_at: string;
    created_by: string; // user id
    updated_at: string;
    updated_by: string; // user id
}

export interface ContactDetails {
    student_no: string;
    email?: string;
    phone?: string;
    country: string;
    city?: string;
    hometown: string;
    residence: string;
    house_no: string;
    gps_no: string;
}

export interface GuardianInfo {
    student_no: string;
    guardian_name: string;
    guardian_phone: string;
    guardian_email?: string;
    guardian_relationship: string;
    guardian_occupation?: string;
    father_name?: string;
    father_phone?: string;
    father_email?: string;
    father_occupation?: string;
    mother_name?: string;
    mother_phone?: string;
    mother_email?: string;
    mother_occupation?: string;
}

export interface EmergencyContact {
    student_no: string;
    emergency_name: string;
    emergency_phone: string;
    emergency_email?: string;
    emergency_relationship: string;
}

export interface AdmissionDetails {
    student_no: string;
    admission_no: string;
    enrollment_date: string;
    class_assigned: string; // This will be a Class ID
    admission_status: AdmissionStatus;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export const ALL_BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export interface HealthRecords {
    blood_group: BloodGroup;
    allergies?: string[];
    vaccinations?: { name: string; date: string }[];
    medical_notes?: string;
}

export interface DisciplinaryRecord {
    date: string;
    incident: string;
    action_taken: string;
    reported_by: string; // user id
}

export interface AcademicRecord {
    term: string;
    subject: string;
    grade: string;
    teacher_remarks: string;
}

export interface AssignmentScore {
    student_id: string;
    class_id: string;
    subject_id: string;
    assignment_name: string;
    score: number;
}


export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused' | 'On Leave';

export interface AttendanceRecord {
    date: string;
    status: AttendanceStatus;
}

export interface StudentAttendanceRecord extends AttendanceRecord {
    student_id: string;
}

export interface StaffAttendanceRecord extends AttendanceRecord {
    staff_id: string;
}


export interface CommunicationLog {
    date: string;
    type: 'Email' | 'Phone Call' | 'Meeting';
    notes: string;
    with_whom: string; // e.g. "Jane Doe (Mother)"
}

export interface UploadedDocument {
    name: string;
    url: string;
    uploaded_at: string;
    type: 'Birth Certificate' | 'Transcript' | 'Report Card' | 'Admission Form' | 'Admission Letter';
}

export interface FeeStructureItem {
    id: string;
    name: string;
    description?: string;
    levelAmounts: Partial<Record<SchoolLevel, number>>;
    amount?: number; // For miscellaneous items
    isMiscellaneous?: boolean;
}

export type FeeItem = {
    description: string;
    amount: number;
};

export type TermlyBill = {
    bill_number: string;
    term: string;
    items: FeeItem[];
    assigned_classes: string[];
    assigned_students: string[];
    billed_student_ids: string[];
    created_at: string;
    created_by: string; // user id
    status: 'Pending' | 'Approved' | 'Rejected';
    approved_by?: string; // user id
    approved_at?: string;
    approver_comments?: string;
}

export type TermPayment = {
    term: string; // e.g., "1st Term 2023/2024"
    bill_number: string;
    total_fees: number;
    amount_paid: number;
    outstanding: number;
    status: 'Paid' | 'Partially Paid' | 'Unpaid';
    payment_date?: string;
    bill_items: FeeItem[];
    payments: {
        date: string;
        amount: number;
        method: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Card';
        recorded_by: string; // user id
        receipt_number?: string;
        paid_by?: string;
    }[];
};

export interface FinancialDetails {
    account_balance: number; // Positive for credit, negative for debit/outstanding
    payment_history: TermPayment[];
}

export interface StudentProfile {
    student: Student;
    contactDetails: ContactDetails;
    guardianInfo: GuardianInfo;
    emergencyContact: EmergencyContact;
    admissionDetails: AdmissionDetails;
    healthRecords?: HealthRecords;
    disciplinaryRecords?: DisciplinaryRecord[];
    academicRecords?: AcademicRecord[];
    assignmentScores?: AssignmentScore[];
    attendanceRecords?: StudentAttendanceRecord[];
    communicationLogs?: CommunicationLog[];
    uploadedDocuments?: UploadedDocument[];
    financialDetails?: FinancialDetails;
    achievements?: Achievement[];
}

// Staff Management Types
export type EmploymentStatus = 'Active' | 'On-leave' | 'Inactive';
export const ALL_EMPLOYMENT_STATUSES: EmploymentStatus[] = ['Active', 'On-leave', 'Inactive'];
export type ContractType = 'Full-time' | 'Part-time' | 'Contract';

export interface SalaryAdvance {
    id: string;
    amount: number;
    date_requested: string;
    repayment_months: number;
    monthly_deduction: number;
    repayments_made: number;
}

export interface Staff {
    staff_id: string;
    user_id: string; // links to User.id
    first_name: string;
    last_name: string;
    other_name?: string;
    email: string;
    phone: string;
    roles: Role[];
    status: EmploymentStatus;
    id_type: 'Ghana Card' | 'Passport' | 'Voter ID' | 'Drivers License';
    id_no: string;
    snnit_no?: string;
    date_of_joining: string;
    address: {
        country: string;
        city?: string;
        hometown: string;
        residence: string;
        house_no: string;
        gps_no: string;
    };
    salary?: number;
    salary_advances?: SalaryAdvance[];
}

export interface StaffAcademicHistory {
    staff_id: string;
    school: string;
    qualification: string;
    program_offered: string;
    year_completed: number;
}

export interface StaffDocument {
    staff_id: string;
    document_name: string;
    file: string; // URL or data URI
}

export type AppointmentStatus = 'Appointed' | 'Declined';
export const ALL_APPOINTMENT_STATUSES: AppointmentStatus[] = ['Appointed', 'Declined'];

export interface StaffAppointmentHistory {
    staff_id: string;
    appointment_date: string;
    roles: Role[];
    class_assigned?: string[]; // Class ID
    subjects_assigned?: string[];
    is_class_teacher_for_class_id?: string;
    appointment_status: AppointmentStatus;
}

export type LeaveType = 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Unpaid';
export const ALL_LEAVE_TYPES: LeaveType[] = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid'];
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export const ALL_LEAVE_STATUSES: LeaveStatus[] = ['Pending', 'Approved', 'Rejected'];
export interface LeaveRequest {
    id: string;
    staff_id: string;
    staff_name: string;
    leave_type: LeaveType;
    leave_year: number;
    start_date: string;
    end_date: string;
    reason: string;
    status: LeaveStatus;
    request_date: string;
    approver_id?: string;
    approver_name?: string;
    comments?: string;
    days_approved?: number;
}


export interface StaffEmploymentDetails {
    user_id: string;
    staff_id: string;
    hire_date: string;
    contract_type: ContractType;
    status: EmploymentStatus;
}

export interface StaffQualification {
    degree: string;
    institution: string;
    year: number;
}

export interface StaffProfile {
    user_id: string; // links to User.id
    employmentDetails: StaffEmploymentDetails;
    qualifications?: StaffQualification[];
    // Re-using emergency contact type from student, could be different if needed
    emergencyContact?: Omit<EmergencyContact, 'student_no'> & { user_id: string };
}

// Subject Management Types
export interface Subject {
    id: string;
    code: string;
    name: string;
    level: 'Creche' | 'KG' | 'Primary' | 'JHS';
    category: 'Core' | 'Elective';
    description?: string;
}

export interface ClassSubject {
    class_id: string;
    subject_id: string;
}

export interface TeacherSubject {
    staff_id: string;
    subject_id: string;
}


export const ALL_ACCOUNTANT_ROLES: Role[] = ['Accountant'];

export interface RoleStorage {
  id: string;
  name: Role;
}
// Library Management Types
export type Book = {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  quantity: number;
};

export type BorrowingRecord = {
  id: string;
  borrower_id: string; // Student or Staff ID
  borrower_name: string;
  book_id: string;
  book_title: string;
  borrow_date: string; // ISO string
  due_date: string; // ISO string
  return_date?: string; // ISO string
  status: 'Borrowed' | 'Returned';
};
