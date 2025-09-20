


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
  | 'I.T Support';

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
];

export interface RoleStorage {
  id: string;
  name: Role;
}

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
    country_id: string; // Assuming country will be a separate entity later
    city?: string;
    hometown?: string;
    residence?: string;
}

export interface GuardianInfo {
    student_no: string;
    guardian_name: string;
    guardian_phone: string;
    guardian_email?: string;
    guardian_relationship: string;
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
    class_assigned: string; // This will be the ID from the Class type
    admission_status: AdmissionStatus;
}

export interface HealthRecords {
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

export interface AttendanceRecord {
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
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


export interface StudentProfile {
    student: Student;
    contactDetails: ContactDetails;
    guardianInfo: GuardianInfo;
    emergencyContact: EmergencyContact;
    admissionDetails: AdmissionDetails;
    healthRecords?: HealthRecords;
    disciplinaryRecords?: DisciplinaryRecord[];
    academicRecords?: AcademicRecord[];
    attendanceRecords?: AttendanceRecord[];
    communicationLogs?: CommunicationLog[];
    uploadedDocuments?: UploadedDocument[];
}
