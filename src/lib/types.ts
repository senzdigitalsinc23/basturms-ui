
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
  | 'Accountant';

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
];

export const ALL_ACCOUNTANT_ROLES: Role[] = ['Accountant'];

export interface RoleStorage {
  id: string;
  name: Role;
}

// Permissions
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
} as const;

export type Permission = keyof typeof PERMISSIONS;
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];
export type RolePermissions = Partial<Record<Role, Permission[]>>;


export interface Class {
  id: string;
  name: string;
}

export interface User {
  id: string; // Will be used as user_id as well
  name: string;
  username: string;
  email: string;
  role: Role; // For easy access in the app
  role_id: string;
  avatarUrl: string;
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
}

export interface AcademicYear {
    year: string; // e.g., "2023/2024"
    terms: Term[];
    status: AcademicYearStatus;
}


export interface GradeSetting {
    grade: string;
    range: string;
    remarks: string;
}

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

export type FeeItem = {
    description: string;
    amount: number;
};

export type TermPayment = {
    term: string; // e.g., "1st Term 2023/2024"
    total_fees: number;
    amount_paid: number;
    outstanding: number;
    status: 'Paid' | 'Partially Paid' | 'Unpaid';
    payment_date?: string;
    bill_items: FeeItem[];
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
    attendanceRecords?: StudentAttendanceRecord[];
    communicationLogs?: CommunicationLog[];
    uploadedDocuments?: UploadedDocument[];
    financialDetails?: FinancialDetails;
}

// Staff Management Types

export interface Staff {
    staff_id: string;
    user_id: string; // links to User.id
    first_name: string;
    last_name: string;
    other_name?: string;
    email: string;
    phone: string;
    roles: Role[];
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
    appointment_status: AppointmentStatus;
}


export type EmploymentStatus = 'Active' | 'On-leave' | 'Inactive';
export const ALL_EMPLOYMENT_STATUSES: EmploymentStatus[] = ['Active', 'On-leave', 'Inactive'];
export type ContractType = 'Full-time' | 'Part-time' | 'Contract';

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
    name: string;
}

export interface ClassSubject {
    class_id: string;
    subject_id: string;
}

export interface TeacherSubject {
    staff_id: string;
    subject_id: string;
}
