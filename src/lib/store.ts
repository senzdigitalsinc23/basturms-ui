

'use client';

import {
  User,
  AuditLog,
  Role,
  ALL_ROLES,
  RoleStorage,
  UserStorage,
  AuthLog,
  StudentProfile,
  Class,
  AdmissionStatus,
  AcademicRecord,
  DisciplinaryRecord,
  CommunicationLog,
  UploadedDocument,
  AttendanceRecord,
  HealthRecords,
  StaffProfile,
  Staff,
  StaffAcademicHistory,
  StaffDocument,
  StaffAppointmentHistory,
  Subject,
  ClassSubject,
  TeacherSubject,
  EmploymentStatus,
  StudentAttendanceRecord,
  StaffAttendanceRecord,
  AcademicYear,
  CalendarEvent,
  GradeSetting,
  Term,
  RolePermissions,
  ALL_PERMISSIONS,
  Permission,
  LeaveRequest,
  LeaveStatus,
  AssignmentScore,
  AssignmentActivity,
  ClassAssignmentActivity,
  FeeStructureItem,
  TermPayment,
  TermlyBill,
  SchoolLevel,
} from './types';
import { format } from 'date-fns';
import initialStaffProfiles from './initial-staff-profiles.json';
import { SchoolProfileData } from '@/components/settings/school-profile-settings';


const USERS_KEY = 'campusconnect_users';
const ROLES_KEY = 'campusconnect_roles';
const LOGS_KEY = 'campusconnect_logs';
const AUTH_LOGS_KEY = 'campusconnect_auth_logs';
const STUDENTS_KEY = 'campusconnect_students';
const CLASSES_KEY = 'campusconnect_classes';
const STAFF_PROFILES_KEY = 'campusconnect_staff_profiles';
const SCHOOL_KEY = 'campusconnect_school';
const FEE_STRUCTURES_KEY = 'campusconnect_fee_structures';
const TERMLY_BILLS_KEY = 'campusconnect_termly_bills';

// Settings Keys
const ACADEMIC_YEARS_KEY = 'campusconnect_academic_years';
const CALENDAR_EVENTS_KEY = 'campusconnect_calendar_events';
const GRADING_SCHEME_KEY = 'campusconnect_grading_scheme';
const ROLE_PERMISSIONS_KEY = 'campusconnect_role_permissions';
const BACKUP_SETTINGS_KEY = 'campusconnect_backup_settings';
const ASSIGNMENT_ACTIVITIES_KEY = 'campusconnect_assignment_activities';
const CLASS_ASSIGNMENT_ACTIVITIES_KEY = 'campusconnect_class_assignment_activities';


// New keys for staff management
const STAFF_KEY = 'campusconnect_staff';
export const DECLINED_STAFF_KEY = 'campusconnect_declined_staff';
export const STAFF_ACADEMIC_HISTORY_KEY = 'campusconnect_staff_academic_history';
export const STAFF_DOCUMENTS_KEY = 'campusconnect_staff_documents';
export const STAFF_APPOINTMENT_HISTORY_KEY = 'campusconnect_staff_appointment_history';
export const STAFF_ATTENDANCE_RECORDS_KEY = 'campusconnect_staff_attendance_records';
export const LEAVE_REQUESTS_KEY = 'campusconnect_leave_requests';


// New keys for subjects
const SUBJECTS_KEY = 'campusconnect_subjects';
const CLASS_SUBJECTS_KEY = 'campusconnect_class_subjects';
const TEACHER_SUBJECTS_KEY = 'campusconnect_teacher_subjects';


const getInitialRoles = (): RoleStorage[] => {
  return ALL_ROLES.map((role, index) => ({
    id: (index + 1).toString(),
    name: role,
  }));
};

const getInitialUsers = (roles: RoleStorage[]): UserStorage[] => {
  const now = new Date().toISOString();
  const getRoleId = (name: Role) => roles.find((r) => r.name === name)?.id;

  return [
    {
      id: '1',
      name: 'Admin User',
      username: 'douglassenzu',
      email: 'admin@campus.com',
      password: 'password',
      role_id: getRoleId('Admin')!,
      is_super_admin: true,
      avatarUrl: 'https://picsum.photos/seed/avatar1/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
  ];
};

const getInitialStaff = (): Staff[] => {
    return [
        {
            "staff_id": "STF001", "user_id": "1", "first_name": "Douglas", "last_name": "Senzu", "email": "admin@campus.com", "phone": "123-456-7890", "roles": ["Admin"], "id_type": "Ghana Card", "id_no": "GHA-123456789-0", "date_of_joining": "2023-01-15T00:00:00.000Z", "address": { "country": "Ghana", "residence": "Accra", "hometown": "Accra", "house_no": "H1", "gps_no": "GA-123-456" }
        },
        {
            "staff_id": "STF002", "user_id": "", "first_name": "Jane", "last_name": "Smith", "email": "jane.smith@staff.com", "phone": "098-765-4321", "roles": ["Headmaster"], "id_type": "Passport", "id_no": "P0123456", "date_of_joining": "2022-09-01T00:00:00.000Z", "address": { "country": "Ghana", "residence": "Kumasi", "hometown": "Kumasi", "house_no": "H2", "gps_no": "AK-456-789" }
        },
        {
            "staff_id": "STF003", "user_id": "", "first_name": "John", "last_name": "Doe", "email": "john.doe@staff.com", "phone": "123-456-7890", "roles": ["Teacher"], "id_type": "Ghana Card", "id_no": "GHA-123456789-0", "date_of_joining": "2023-01-15T00:00:00.000Z", "address": { "country": "Ghana", "residence": "Accra", "hometown": "Accra", "house_no": "H1", "gps_no": "GA-123-456" }
        }
    ];
};

const getInitialStudentProfiles = (): StudentProfile[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const yearYY = currentYear.toString().slice(-2);
    const adminUser = '1';
    
    // Student 1 admitted this year
    const student1EnrollDate = new Date(currentYear, 2, 15).toISOString(); // Mar 15
    const student1StudentNo = `WR-TK001-LBA${'${yearYY}'}001`;
    const student1AdmissionNo = `ADM${'${yearYY}'}001`;

    // Student 2 admitted last year
    const lastYear = currentYear - 1;
    const lastYearYY = lastYear.toString().slice(-2);
    const student2EnrollDate = new Date(lastYear, 8, 1).toISOString(); // Sep 1
    const student2StudentNo = `WR-TK001-LBA${'${lastYearYY}'}001`;
    const student2AdmissionNo = `ADM${'${lastYearYY}'}001`;

    return [
        {
            student: { student_no: student1StudentNo, first_name: 'John', last_name: 'Doe', dob: '2010-05-15', gender: 'Male', created_at: now.toISOString(), created_by: adminUser, updated_at: now.toISOString(), updated_by: adminUser, avatarUrl: 'https://picsum.photos/seed/student1/200/200' },
            contactDetails: { student_no: student1StudentNo, email: 'john.doe@example.com', phone: '123-456-7890', country: 'Ghana', city: 'Accra', hometown: 'Accra', residence: 'East Legon', house_no: 'H23', gps_no: 'GA-123-456' },
            guardianInfo: { student_no: student1StudentNo, guardian_name: 'Jane Doe', guardian_phone: '098-765-4321', guardian_relationship: 'Mother', guardian_email: 'jane.doe@example.com', father_name: 'John Doe Sr.', father_phone: '111-222-3333', father_occupation: 'Engineer', mother_name: 'Jane Doe', mother_phone: '098-765-4321', mother_occupation: 'Doctor' },
            emergencyContact: { student_no: student1StudentNo, emergency_name: 'Jane Doe', emergency_phone: '098-765-4321', emergency_relationship: 'Mother' },
            admissionDetails: { student_no: student1StudentNo, admission_no: student1AdmissionNo, enrollment_date: student1EnrollDate, class_assigned: 'b5', admission_status: 'Admitted' },
            healthRecords: {
                blood_group: 'O+',
                allergies: ['Peanuts'],
                vaccinations: [{ name: 'MMR', date: '2012-06-01' }, { name: 'Polio', date: '2013-08-15' }],
                medical_notes: 'Requires an inhaler for exercise-induced asthma.'
            },
            academicRecords: [
                { term: '1st Term 2023', subject: 'Mathematics', grade: 'A', teacher_remarks: 'Excellent work' },
                { term: '1st Term 2023', subject: 'English', grade: 'B+', teacher_remarks: 'Good, but needs to participate more in class discussions.' }
            ],
            disciplinaryRecords: [
                { date: '2023-10-20', incident: 'Skipped class', action_taken: 'Detention', reported_by: '2' }
            ],
            attendanceRecords: [
                { student_id: student1StudentNo, date: '2024-05-10', status: 'Present' },
                { student_id: student1StudentNo, date: '2024-05-11', status: 'Absent' },
            ],
            communicationLogs: [
                { date: '2023-10-21', type: 'Phone Call', notes: 'Discussed absence with mother. Reason: family emergency.', with_whom: 'Jane Doe (Mother)' }
            ],
            uploadedDocuments: [
                { name: 'Birth Certificate', url: '#', uploaded_at: '2024-03-15T10:00:00.000Z', type: 'Birth Certificate' },
                { name: 'Admission Form', url: '#', uploaded_at: '2024-03-15T10:05:00.000Z', type: 'Admission Form' }
            ],
             financialDetails: {
                account_balance: -500, // owes 500
                payment_history: [
                    {
                        bill_number: `BILL-${Date.now()}-1`,
                        term: '1st Term 2023/2024',
                        total_fees: 2000,
                        amount_paid: 2000,
                        outstanding: 0,
                        status: 'Paid',
                        payment_date: '2023-09-05',
                        bill_items: [
                            { description: 'Tuition', amount: 1500 },
                            { description: 'Books', amount: 300 },
                            { description: 'Uniform', amount: 200 },
                        ],
                        payments: []
                    },
                    {
                        bill_number: `BILL-${Date.now()}-2`,
                        term: '2nd Term 2023/2024',
                        total_fees: 1800,
                        amount_paid: 1300,
                        outstanding: 500,
                        status: 'Partially Paid',
                        payment_date: '2024-01-10',
                        bill_items: [
                            { description: 'Tuition', amount: 1500 },
                            { description: 'Extra Curricular', amount: 300 },
                        ],
                        payments: []
                    }
                ]
            }
        },
        {
            student: { student_no: student2StudentNo, first_name: 'Mary', last_name: 'Smith', dob: '2011-02-20', gender: 'Female', created_at: now.toISOString(), created_by: adminUser, updated_at: now.toISOString(), updated_by: adminUser, avatarUrl: 'https://picsum.photos/seed/student2/200/200' },
            contactDetails: { student_no: student2StudentNo, email: 'mary.smith@example.com', phone: '123-456-7891', country: 'Ghana', city: 'Kumasi', hometown: 'Kumasi', residence: 'Asokwa', house_no: 'Plot 5', gps_no: 'AK-456-789' },
            guardianInfo: { student_no: student2StudentNo, guardian_name: 'Peter Smith', guardian_phone: '098-765-4322', guardian_relationship: 'Father', guardian_email: 'peter.smith@example.com' },
            emergencyContact: { student_no: student2StudentNo, emergency_name: 'Peter Smith', emergency_phone: '098-765-4322', emergency_relationship: 'Father' },
            admissionDetails: { student_no: student2StudentNo, admission_no: student2AdmissionNo, enrollment_date: student2EnrollDate, class_assigned: 'b4', admission_status: 'Admitted' }
        }
    ];
}


const getInitialClasses = (): Class[] => {
    return [
        { id: 'nur1', name: 'Nursery 1' },
        { id: 'nur2', name: 'Nursery 2' },
        { id: 'kg1', name: 'Kingdergarten 1' },
        { id: 'kg2', name: 'Kingdergarten 2' },
        { id: 'b1', name: 'Basic 1' },
        { id: 'b2', name: 'Basic 2' },
        { id: 'b3', name: 'Basic 3' },
        { id: 'b4', name: 'Basic 4' },
        { id: 'b5', name: 'Basic 5' },
        { id: 'b6', name: 'Basic 6' },
        { id: 'jhs1', name: 'Junior High School 1' },
        { id: 'jhs2', name: 'Junior High School 2' },
        { id: 'jhs3', name: 'Junior High School 3' },
    ];
};

const getInitialSubjects = (): Subject[] => {
    const subjectNames = [
        'English Language', 'Mathematics', 'Science', 'History', 'Our World Our People', 
        'Religious & Moral Education', 'Physical Education', 'Computing', 'French', 
        'Numeracy', 'Language & Literacy', 'Creative Art', 'Social Studies', 
        'Basic Design and Technology', 'Ghanaian Language & Culture', 
        'Information and Communications Technology', 'Fante', 'Asante Twi', 
        'Akwapim Twi', 'Dagomba', 'Ewe'
    ];
    return subjectNames.map((name, index) => ({
        id: `SUB${(index + 1).toString().padStart(3, '0')}`,
        name: name,
    }));
};

const getInitialAssignmentActivities = (): AssignmentActivity[] => {
    return [
        { id: 'act1', name: 'Classwork', expected_per_term: 2, weight: 20 },
        { id: 'act2', name: 'Homework', expected_per_term: 3, weight: 20 },
        { id: 'act3', name: 'Mid-term Exam', expected_per_term: 1, weight: 60 },
        { id: 'act4', name: 'End of Term Exam', expected_per_term: 1, weight: 100 },
    ];
};

const getInitialAcademicYears = (): AcademicYear[] => {
    const defaultTerms: Term[] = [
        { name: 'First Term', startDate: new Date(2023, 8, 1).toISOString(), endDate: new Date(2023, 11, 15).toISOString(), status: 'Completed' },
        { name: 'Second Term', startDate: new Date(2024, 0, 10).toISOString(), endDate: new Date(2024, 3, 5).toISOString(), status: 'Active' },
        { name: 'Third Term', startDate: new Date(2024, 4, 1).toISOString(), endDate: new Date(2024, 6, 19).toISOString(), status: 'Upcoming' },
    ];
    return [
        { year: "2023/2024", terms: defaultTerms, status: "Active" },
    ];
};

const getInitialCalendarEvents = (): CalendarEvent[] => {
    return [
        { id: '1', date: new Date(2024, 4, 1).toISOString(), title: "May Day", category: 'Holiday' },
        { id: '2', date: new Date(2024, 2, 6).toISOString(), title: "Independence Day", category: 'Holiday' },
        { id: '3', date: new Date(2024, 6, 10).toISOString(), title: "End of Term Exams Start", category: 'Exam' },
    ];
};

const getInitialGradingScheme = (): GradeSetting[] => {
    return [
        { grade: "A+", range: "90-100", remarks: "Excellent" },
        { grade: "A", range: "80-89", remarks: "Very Good" },
        { grade: "B+", range: "75-79", remarks: "Good" },
        { grade: "B", range: "70-74", remarks: "Credit" },
        { grade: "C+", range: "65-69", remarks: "Credit" },
        { grade: "C", range: "60-64", remarks: "Pass" },
        { grade: "D+", range: "55-59", remarks: "Pass" },
        { grade: "D", range: "50-54", remarks: "Pass" },
        { grade: "F", range: "0-49", remarks: "Fail" },
    ];
};

const getInitialRolePermissions = (): RolePermissions => {
    return {
        'Admin': ALL_PERMISSIONS,
        'Teacher': ['student:view', 'attendance:student'],
        'Headmaster': ['staff:view', 'staff:create', 'staff:update', 'student:view', 'student:promote', 'leave:view', 'leave:approve'],
        'Librarian': [],
        'Security': ['attendance:view_history'],
        'Procurement Manager': [],
        'Stores Manager': [],
        'Proprietor': ['logs:view_audit'],
        'I.T Manager': ['user:view', 'user:create', 'user:update', 'logs:view_auth', 'settings:edit', 'backup:create', 'backup:restore'],
        'I.T Support': [],
        'Accountant': [],
        'Parent': [],
        'Student': [],
    };
};

const getInitialLeaveRequests = (): LeaveRequest[] => {
    return [
        {
            id: '1',
            staff_id: 'STF003',
            staff_name: 'John Doe',
            leave_type: 'Sick',
            leave_year: 2024,
            start_date: new Date(2024, 5, 10).toISOString(),
            end_date: new Date(2024, 5, 12).toISOString(),
            reason: 'Flu symptoms.',
            status: 'Approved',
            request_date: new Date(2024, 5, 9).toISOString(),
            approver_id: '1',
            approver_name: 'Admin User',
            comments: 'Approved. Get well soon.',
            days_approved: 3,
        },
        {
            id: '2',
            staff_id: 'STF002',
            staff_name: 'Jane Smith',
            leave_type: 'Annual',
            leave_year: 2024,
            start_date: new Date(2024, 6, 1).toISOString(),
            end_date: new Date(2024, 6, 15).toISOString(),
            reason: 'Family vacation.',
            status: 'Pending',
            request_date: new Date(2024, 5, 1).toISOString(),
        }
    ];
};


const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

export const initializeStore = () => {
  if (typeof window !== 'undefined') {
    if (!window.localStorage.getItem(ROLES_KEY)) {
      saveToStorage(ROLES_KEY, getInitialRoles());
    }
    const roles = getRoles();
    if (!window.localStorage.getItem(USERS_KEY)) {
      saveToStorage(USERS_KEY, getInitialUsers(roles));
    }
    if (!window.localStorage.getItem(LOGS_KEY)) {
      saveToStorage(LOGS_KEY, []);
    }
     if (!window.localStorage.getItem(AUTH_LOGS_KEY)) {
      saveToStorage(AUTH_LOGS_KEY, []);
    }
    if (!window.localStorage.getItem(STUDENTS_KEY)) {
        saveToStorage(STUDENTS_KEY, getInitialStudentProfiles());
    }
    if (!window.localStorage.getItem(CLASSES_KEY)) {
        saveToStorage(CLASSES_KEY, getInitialClasses());
    }
    if (!window.localStorage.getItem(STAFF_PROFILES_KEY)) {
        saveToStorage(STAFF_PROFILES_KEY, initialStaffProfiles);
    }
    if (!window.localStorage.getItem(FEE_STRUCTURES_KEY)) {
        saveToStorage(FEE_STRUCTURES_KEY, []);
    }
    if (!window.localStorage.getItem(TERMLY_BILLS_KEY)) {
        saveToStorage(TERMLY_BILLS_KEY, []);
    }
    // Initialize settings
    if (!window.localStorage.getItem(ACADEMIC_YEARS_KEY)) {
        saveToStorage(ACADEMIC_YEARS_KEY, getInitialAcademicYears());
    }
    if (!window.localStorage.getItem(CALENDAR_EVENTS_KEY)) {
        saveToStorage(CALENDAR_EVENTS_KEY, getInitialCalendarEvents());
    }
    if (!window.localStorage.getItem(GRADING_SCHEME_KEY)) {
        saveToStorage(GRADING_SCHEME_KEY, getInitialGradingScheme());
    }
    if (!window.localStorage.getItem(ROLE_PERMISSIONS_KEY)) {
        saveToStorage(ROLE_PERMISSIONS_KEY, getInitialRolePermissions());
    }
     if (!window.localStorage.getItem(ASSIGNMENT_ACTIVITIES_KEY)) {
        saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, getInitialAssignmentActivities());
    }
    if (!window.localStorage.getItem(CLASS_ASSIGNMENT_ACTIVITIES_KEY)) {
        saveToStorage(CLASS_ASSIGNMENT_ACTIVITIES_KEY, []);
    }
    if (!window.localStorage.getItem(LEAVE_REQUESTS_KEY)) {
        saveToStorage(LEAVE_REQUESTS_KEY, getInitialLeaveRequests());
    }
    if (!window.localStorage.getItem(BACKUP_SETTINGS_KEY)) {
        saveToStorage(BACKUP_SETTINGS_KEY, { autoBackupEnabled: true, frequency: 'daily', backupTime: '00:00', lastBackup: null });
    }
    // Initialize new staff storages
    if (!window.localStorage.getItem(STAFF_KEY)) {
        saveToStorage(STAFF_KEY, getInitialStaff());
    }
     if (!window.localStorage.getItem(DECLINED_STAFF_KEY)) {
        saveToStorage(DECLINED_STAFF_KEY, []);
    }
    if (!window.localStorage.getItem(STAFF_ACADEMIC_HISTORY_KEY)) {
        saveToStorage(STAFF_ACADEMIC_HISTORY_KEY, []);
    }
    if (!window.localStorage.getItem(STAFF_DOCUMENTS_KEY)) {
        saveToStorage(STAFF_DOCUMENTS_KEY, []);
    }
    if (!window.localStorage.getItem(STAFF_APPOINTMENT_HISTORY_KEY)) {
        saveToStorage(STAFF_APPOINTMENT_HISTORY_KEY, []);
    }
     if (!window.localStorage.getItem(STAFF_ATTENDANCE_RECORDS_KEY)) {
        saveToStorage(STAFF_ATTENDANCE_RECORDS_KEY, []);
    }
    // Initialize new subject storages
    if (!window.localStorage.getItem(SUBJECTS_KEY)) {
        saveToStorage(SUBJECTS_KEY, getInitialSubjects());
    }
    if (!window.localStorage.getItem(CLASS_SUBJECTS_KEY)) {
        saveToStorage(CLASS_SUBJECTS_KEY, []);
    }
    if (!window.localStorage.getItem(TEACHER_SUBJECTS_KEY)) {
        saveToStorage(TEACHER_SUBJECTS_KEY, []);
    }
  }
};

// School Profile Functions
export const getSchoolProfile = (): SchoolProfileData | null => {
    return getFromStorage<SchoolProfileData | null>(SCHOOL_KEY, null);
};

export const saveSchoolProfile = (profile: SchoolProfileData): void => {
    saveToStorage(SCHOOL_KEY, profile);
};

// Fee Structure Functions
export const getFeeStructures = (): FeeStructureItem[] => getFromStorage<FeeStructureItem[]>(FEE_STRUCTURES_KEY, []);
export const saveFeeStructures = (items: FeeStructureItem[]): void => {
    saveToStorage(FEE_STRUCTURES_KEY, items);
};


export const getClassSchoolLevel = (classId: string): SchoolLevel | null => {
    if (classId.startsWith('nur') || classId.startsWith('kg')) {
        return 'Pre-School';
    }
    if (['b1', 'b2', 'b3'].includes(classId)) {
        return 'Lower Primary';
    }
    if (['b4', 'b5', 'b6'].includes(classId)) {
        return 'Upper Primary';
    }
    if (['jhs1', 'jhs2'].includes(classId)) {
        return 'JHS';
    }
    if (classId === 'jhs3') {
        return 'Final Year';
    }
    return null;
}


// Financial Management Functions
export const getTermlyBills = (): TermlyBill[] => getFromStorage<TermlyBill[]>(TERMLY_BILLS_KEY, []);
export const saveTermlyBills = (bills: TermlyBill[]): void => saveToStorage(TERMLY_BILLS_KEY, bills);

export const deleteTermlyBill = (billNumber: string, editorId: string): void => {
    const bills = getTermlyBills();
    const billToDelete = bills.find(b => b.bill_number === billNumber);
    if (!billToDelete) return;
    
    // Find all students affected and reverse the financial impact
    const profiles = getStudentProfiles();
    const updatedProfiles = profiles.map(profile => {
        if (profile.financialDetails?.payment_history) {
            const billIndex = profile.financialDetails.payment_history.findIndex(p => p.bill_number === billNumber);
            if (billIndex > -1) {
                const billRecord = profile.financialDetails.payment_history[billIndex];
                // Add back the outstanding amount to the account balance
                profile.financialDetails.account_balance += billRecord.outstanding;
                // Remove the term payment from history
                profile.financialDetails.payment_history.splice(billIndex, 1);
            }
        }
        return profile;
    });

    saveToStorage(STUDENTS_KEY, updatedProfiles);

    const updatedBills = bills.filter(b => b.bill_number !== billNumber);
    saveTermlyBills(updatedBills);

    addAuditLog({
        user: getUserById(editorId)?.email || 'Unknown',
        name: getUserById(editorId)?.name || 'Unknown',
        action: 'Delete Termly Bill',
        details: `Deleted bill ${billNumber} for term "${billToDelete.term}" and reversed charges for ${billToDelete.billed_student_ids.length} students.`
    });
};

export const prepareBills = (
    assigned_classes: string[], 
    assigned_students: string[], 
    billItems: (FeeStructureItem & { amount: number })[], 
    term: string, 
    editorId: string, 
    billNumber: string
): void => {
    const profiles = getStudentProfiles();
    
    const allStudentsToBill = new Set<string>([
        ...assigned_students,
        ...getStudentProfiles()
            .filter(p => assigned_classes.includes(p.admissionDetails.class_assigned))
            .map(p => p.student.student_no)
    ]);
    
    const billedStudentIds: string[] = [];

    const updatedProfiles = profiles.map(profile => {
        if (allStudentsToBill.has(profile.student.student_no)) {
            billedStudentIds.push(profile.student.student_no);
            const schoolLevel = getClassSchoolLevel(profile.admissionDetails.class_assigned);
            
            const studentBillItems = billItems.map(item => ({
                description: item.name,
                amount: item.amount,
            }));
            
            const totalBillAmount = studentBillItems.reduce((acc, item) => acc + item.amount, 0);

            const newTermPayment: TermPayment = {
                bill_number: billNumber,
                term: term,
                total_fees: totalBillAmount,
                amount_paid: 0,
                outstanding: totalBillAmount,
                status: 'Unpaid',
                bill_items: studentBillItems,
                payments: [],
            };

            if (!profile.financialDetails) {
                profile.financialDetails = { account_balance: 0, payment_history: [] };
            }

            const existingBillIndex = profile.financialDetails.payment_history.findIndex(p => p.term === term);
            if (existingBillIndex > -1) {
                // If a bill for the same term already exists, reverse its impact before adding the new one
                const oldBill = profile.financialDetails.payment_history[existingBillIndex];
                profile.financialDetails.account_balance += oldBill.outstanding; // Add back old debt
                profile.financialDetails.payment_history.splice(existingBillIndex, 1);
            }

            profile.financialDetails.payment_history.push(newTermPayment);
            profile.financialDetails.account_balance -= totalBillAmount;
        }
        return profile;
    });
    
    const bills = getTermlyBills();
    const billIndex = bills.findIndex(b => b.bill_number === billNumber);
    if(billIndex !== -1) {
        bills[billIndex].billed_student_ids = billedStudentIds;
    }
    saveTermlyBills(bills);

    saveToStorage(STUDENTS_KEY, updatedProfiles);
};

export const recordPayment = (studentId: string, paymentDetails: {amount: number, method: TermPayment['payments'][0]['method'], receipt_number?: string, paid_by?: string}, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === studentId);

    if (profileIndex === -1) {
        return null;
    }

    const profile = profiles[profileIndex];
     if (!profile.financialDetails) {
        profile.financialDetails = { account_balance: 0, payment_history: [] };
    }

    const financialDetails = profile.financialDetails!;
    
    let amountToApply = paymentDetails.amount;
    financialDetails.account_balance += amountToApply;
    
    const termsToPay = financialDetails.payment_history.filter(t => t.outstanding > 0).sort((a, b) => new Date(a.bill_number.split('-')[1]).getTime() - new Date(b.bill_number.split('-')[1]).getTime());

    for (const term of termsToPay) {
        if (amountToApply <= 0) break;

        const paymentForThisTerm = Math.min(amountToApply, term.outstanding);
        term.amount_paid += paymentForThisTerm;
        term.outstanding -= paymentForThisTerm;
        amountToApply -= paymentForThisTerm;

        if (term.outstanding <= 0.01) { // Use a small threshold for floating point inaccuracies
            term.outstanding = 0;
            term.status = 'Paid';
        } else {
            term.status = 'Partially Paid';
        }
        
        term.payment_date = new Date().toISOString();

        if (!term.payments) term.payments = [];
        term.payments.push({
            date: new Date().toISOString(),
            amount: paymentForThisTerm,
            method: paymentDetails.method,
            recorded_by: editorId,
            receipt_number: paymentDetails.receipt_number,
            paid_by: paymentDetails.paid_by,
        });
    }

    profiles[profileIndex] = profile;
    saveToStorage(STUDENTS_KEY, profiles);
    return profile;
};

export const deleteAllFinancialRecords = (editorId: string) => {
    const profiles = getStudentProfiles();
    profiles.forEach(p => {
        p.financialDetails = undefined;
    });
    saveToStorage(STUDENTS_KEY, profiles);

    const editor = getUserById(editorId);
    addAuditLog({
        user: editor?.email || 'Unknown',
        name: editor?.name || 'Unknown',
        action: 'Delete All Financial Records',
        details: 'Permanently deleted all financial records for all students.'
    });
};



// Settings Functions
export const getAcademicYears = (): AcademicYear[] => getFromStorage<AcademicYear[]>(ACADEMIC_YEARS_KEY, []);
export const saveAcademicYears = (years: AcademicYear[]): void => saveToStorage(ACADEMIC_YEARS_KEY, years);

export const getCalendarEvents = (): CalendarEvent[] => getFromStorage<CalendarEvent[]>(CALENDAR_EVENTS_KEY, []);

export const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>, editorId: string): CalendarEvent => {
    const events = getCalendarEvents();
    const newEvent: CalendarEvent = {
        ...event,
        id: `event-${Date.now()}`
    };
    saveToStorage(CALENDAR_EVENTS_KEY, [...events, newEvent]);
    const editor = getUserById(editorId);
    addAuditLog({
        user: editor?.email || 'Unknown',
        name: editor?.name || 'Unknown',
        action: 'Create Calendar Event',
        details: `Created event: "${newEvent.title}" on ${format(new Date(newEvent.date), 'PPP')}`
    });
    return newEvent;
};

export const updateCalendarEvent = (eventId: string, updatedData: Partial<Omit<CalendarEvent, 'id'>>, editorId: string): CalendarEvent | null => {
    const events = getCalendarEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
        const updatedEvent = { ...events[eventIndex], ...updatedData };
        events[eventIndex] = updatedEvent;
        saveToStorage(CALENDAR_EVENTS_KEY, events);
        const editor = getUserById(editorId);
        addAuditLog({
            user: editor?.email || 'Unknown',
            name: editor?.name || 'Unknown',
            action: 'Update Calendar Event',
            details: `Updated event: "${updatedEvent.title}"`
        });
        return updatedEvent;
    }
    return null;
}

export const deleteCalendarEvent = (eventId: string, editorId: string): boolean => {
    const events = getCalendarEvents();
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return false;

    const newEvents = events.filter(e => e.id !== eventId);
    saveToStorage(CALENDAR_EVENTS_KEY, newEvents);
    const editor = getUserById(editorId);
    addAuditLog({
        user: editor?.email || 'Unknown',
        name: editor?.name || 'Unknown',
        action: 'Delete Calendar Event',
        details: `Deleted event: "${eventToDelete.title}"`
    });
    return true;
}


export const getGradingScheme = (): GradeSetting[] => getFromStorage<GradeSetting[]>(GRADING_SCHEME_KEY, []);
export const saveGradingScheme = (scheme: GradeSetting[]): void => saveToStorage(GRADING_SCHEME_KEY, scheme);
export const getRolePermissions = (): RolePermissions => getFromStorage<RolePermissions>(ROLE_PERMISSIONS_KEY, {});
export const saveRolePermissions = (permissions: RolePermissions): void => saveToStorage(ROLE_PERMISSIONS_KEY, permissions);

// Assignment Activity Functions
export const getAssignmentActivities = (): AssignmentActivity[] => getFromStorage<AssignmentActivity[]>(ASSIGNMENT_ACTIVITIES_KEY, []);
export const saveAssignmentActivities = (activities: AssignmentActivity[]): void => saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, activities);

export const addAssignmentActivity = (activity: Omit<AssignmentActivity, 'id'>): AssignmentActivity => {
    const activities = getAssignmentActivities();
    const maxId = activities.reduce((max, act) => {
        const idNum = parseInt(act.id.replace('act', ''), 10);
        return isNaN(idNum) ? max : Math.max(max, idNum);
    }, 0);
    const newId = `act${maxId + 1}`;
    const newActivity = { ...activity, id: newId };
    saveAssignmentActivities([...activities, newActivity]);
    return newActivity;
};

export const updateAssignmentActivity = (activityId: string, updatedData: Partial<Omit<AssignmentActivity, 'id'>>): AssignmentActivity | null => {
    const activities = getAssignmentActivities();
    const activityIndex = activities.findIndex(act => act.id === activityId);

    if (activityIndex !== -1) {
        const updatedActivity = { ...activities[activityIndex], ...updatedData };
        activities[activityIndex] = updatedActivity;
        saveAssignmentActivities(activities);
        addAuditLog({
            user: 'System', 
            name: 'System',
            action: 'Update Assignment Activity',
            details: `Updated activity: ${updatedActivity.name}`
        });
        return updatedActivity;
    }
    return null;
}

export const deleteAssignmentActivity = (activityId: string): void => {
    let activities = getAssignmentActivities();
    activities = activities.filter(act => act.id !== activityId);
    saveAssignmentActivities(activities);

    let classActivities = getClassAssignmentActivities();
    classActivities = classActivities.filter(ca => ca.activity_id !== activityId);
    saveClassAssignmentActivities(classActivities);
};

export const getClassAssignmentActivities = (): ClassAssignmentActivity[] => getFromStorage<ClassAssignmentActivity[]>(CLASS_ASSIGNMENT_ACTIVITIES_KEY, []);
export const saveClassAssignmentActivities = (classActivities: ClassAssignmentActivity[]): void => saveToStorage(CLASS_ASSIGNMENT_ACTIVITIES_KEY, classActivities);



// Role Functions
export const getRoles = (): RoleStorage[] => getFromStorage<RoleStorage[]>(ROLES_KEY, []);

// Class Functions
export const getClasses = (): Class[] => getFromStorage<Class[]>(CLASSES_KEY, []);

// Subject Functions
export const getSubjects = (): Subject[] => getFromStorage<Subject[]>(SUBJECTS_KEY, []);

export const addSubject = (subjectName: string): Subject => {
    const subjects = getSubjects();
    const newId = `SUB${(subjects.length + 1).toString().padStart(3, '0')}`;
    const newSubject = { id: newId, name: subjectName };
    saveToStorage(SUBJECTS_KEY, [...subjects, newSubject]);
    return newSubject;
};

export const deleteSubject = (subjectId: string): void => {
    const subjects = getSubjects().filter(s => s.id !== subjectId);
    saveToStorage(SUBJECTS_KEY, subjects);
    const classSubjects = addClassSubject().filter(cs => cs.subject_id !== subjectId);
    saveToStorage(CLASS_SUBJECTS_KEY, classSubjects);
};

export const addClassSubject = (): ClassSubject[] => getFromStorage<ClassSubject[]>(CLASS_SUBJECTS_KEY, []);

export const saveClassSubjects = (classSubjects: ClassSubject[]): void => {
    saveToStorage(CLASS_SUBJECTS_KEY, classSubjects);
};

export const getTeacherSubjects = (): TeacherSubject[] => getFromStorage<TeacherSubject[]>(TEACHER_SUBJECTS_KEY, []);

// User Functions
const getUsersInternal = (): UserStorage[] => getFromStorage<UserStorage[]>(USERS_KEY, []);

const mapUser = (user: UserStorage): User => {
    const roles = getRoles();
    const role = roles.find(r => r.id === user.role_id);
    return {
        ...user,
        role: role?.name || 'Admin', // Safely default to Admin role
    };
}

export const getUsers = (): User[] => {
    return getUsersInternal().map(mapUser);
};

export const getUserById = (userId: string): User | undefined => {
  const user = getUsersInternal().find((user) => user.id === userId);
  return user ? mapUser(user) : undefined;
};

export const getUserByEmail = (email: string): User | undefined => {
  const user = getUsersInternal().find((user) => user.email === email);
  return user ? mapUser(user) : undefined;
}

export const addUser = (user: Omit<User, 'id' | 'avatarUrl' | 'created_at' | 'updated_at' | 'is_super_admin' | 'role_id'> & { entityId?: string }): User => {
  const users = getUsersInternal();
  const roles = getRoles();
  const role = roles.find(r => r.name === user.role);
  const now = new Date().toISOString();
  
  const existingUser = users.find(u => u.email === user.email);
  if (existingUser) {
    console.warn(`User with email ${user.email} already exists.`);
    return mapUser(existingUser);
  }

  const nextId = (users.length > 0 ? (Math.max(...users.map(u => parseInt(u.id, 10))) + 1) : 1).toString();

  const newUser: UserStorage = {
    ...user,
    id: nextId,
    username: user.username,
    password: user.password || 'password',
    role_id: role!.id,
    is_super_admin: false,
    avatarUrl: `https://picsum.photos/seed/avatar${nextId}/40/40`,
    status: user.status || 'active',
    created_at: now,
    updated_at: now,
  };
  
  addAuditLog({
    user: 'System',
    name: 'System',
    action: 'Create User',
    details: `Created user: ${newUser.name}, Email: ${newUser.email}, Role: ${user.role}`,
  });

  saveToStorage(USERS_KEY, [...users, newUser]);

  // Link the new user ID back to the staff or student record
  if (user.entityId) {
      const isStaffRole = user.role !== 'Student' && user.role !== 'Parent';
      if (isStaffRole) {
          const staffList = getStaff();
          const staffIndex = staffList.findIndex(s => s.staff_id === user.entityId);
          if (staffIndex !== -1) {
              staffList[staffIndex].user_id = newUser.id;
              saveToStorage(STAFF_KEY, staffList);
          }
      }
  }

  return mapUser(newUser);
};


export const updateUser = (updatedUser: User): User => {
  const users = getUsersInternal();
  const userIndex = users.findIndex((u) => u.id === updatedUser.id);
  if (userIndex !== -1) {
    const roles = getRoles();
    const role = roles.find(r => r.name === updatedUser.role);
    const { role: _, ...userToStore } = updatedUser;

    const originalUser = users[userIndex];
    users[userIndex] = {
        ...originalUser,
        ...userToStore,
        role_id: role ? role.id : originalUser.role_id,
        updated_at: new Date().toISOString(),
    };
    saveToStorage(USERS_KEY, users);
     addAuditLog({
        user: 'System',
        name: 'System',
        action: 'Update User',
        details: `Updated user: ${users[userIndex].name}, Email: ${users[userIndex].email}`,
    });
  }
  return updatedUser;
};

export const toggleUserStatus = (userId: string): User | undefined => {
    const users = getUsersInternal();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const user = { ...users[userIndex] };
        user.status = user.status === 'active' ? 'frozen' : 'active';
        user.updated_at = new Date().toISOString();
        
        const newUsers = [...users];
        newUsers[userIndex] = user;

        saveToStorage(USERS_KEY, newUsers);
        return mapUser(user);
    }
    return undefined;
};

export const resetPassword = (userId: string, newPassword: string): boolean => {
    const users = getUsersInternal();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        users[userIndex].updated_at = new Date().toISOString();
        saveToStorage(USERS_KEY, users);
        return true;
    }
    return false;
}

export const changePassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
    const users = getUsersInternal();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1 && users[userIndex].password === currentPassword) {
        users[userIndex].password = newPassword;
        users[userIndex].updated_at = new Date().toISOString();
        saveToStorage(USERS_KEY, users);
        return true;
    }
    return false;
}


export const deleteUser = (userId: string): boolean => {
    const users = getUsersInternal();
    const newUsers = users.filter(u => u.id !== userId);
    if (newUsers.length < users.length) {
        saveToStorage(USERS_KEY, newUsers);
        return true;
    }
    return false;
};

export const bulkDeleteUsers = (userIds: string[]): number => {
    const users = getUsersInternal();
    const newUsers = users.filter(u => !userIds.includes(u.id));
    const deletedCount = users.length - newUsers.length;
    if (deletedCount > 0) {
        saveToStorage(USERS_KEY, newUsers);
    }
    return deletedCount;
}

// Audit Log Functions
export const getAuditLogs = (): AuditLog[] => getFromStorage<AuditLog[]>(LOGS_KEY, []);
export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp' | 'clientInfo'>): void => {
  const logs = getAuditLogs();
  const nextId = logs.length > 0 ? (Math.max(...logs.map(l => parseInt(l.id, 10))) + 1).toString() : '1';
    
  const newLog: AuditLog = {
    ...log,
    id: nextId,
    timestamp: new Date().toISOString(),
    clientInfo: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
  };
  saveToStorage(LOGS_KEY, [newLog, ...logs]);
};


export const deleteAuditLog = (logId: string): boolean => {
    const logs = getAuditLogs();
    const newLogs = logs.filter(l => l.id !== logId);
    if (newLogs.length < logs.length) {
        saveToStorage(LOGS_KEY, newLogs);
        return true;
    }
    return false;
}

export const bulkDeleteAuditLogs = (logIds: string[]): number => {
    const logs = getAuditLogs();
    const newLogs = logs.filter(l => !logIds.includes(l.id));
    const deletedCount = logs.length - newLogs.length;
    if (deletedCount > 0) {
        saveToStorage(LOGS_KEY, newLogs);
    }
    return deletedCount;
}

export const deleteAllAuditLogs = (): void => {
    saveToStorage(LOGS_KEY, []);
}

// Auth Log Functions
export const getAuthLogs = (): AuthLog[] => getFromStorage<AuthLog[]>(AUTH_LOGS_KEY, []);
export const addAuthLog = (log: Omit<AuthLog, 'id' | 'timestamp' | 'clientInfo'>): void => {
    const logs = getAuthLogs();
    const nextId = logs.length > 0 ? (Math.max(...logs.map(l => parseInt(l.id, 10))) + 1).toString() : '1';
    const newLog: AuthLog = {
        ...log,
        id: nextId,
        timestamp: new Date().toISOString(),
        clientInfo: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
    };
    saveToStorage(AUTH_LOGS_KEY, [newLog, ...logs]);
}

export const deleteAuthLog = (logId: string): boolean => {
    const logs = getAuthLogs();
    const newLogs = logs.filter(l => l.id !== logId);
    if (newLogs.length < logs.length) {
        saveToStorage(AUTH_LOGS_KEY, newLogs);
        return true;
    }
    return false;
}

export const bulkDeleteAuthLogs = (logIds: string[]): number => {
    const logs = getAuthLogs();
    const newLogs = logs.filter(l => !logIds.includes(l.id));
    const deletedCount = logs.length - newLogs.length;
    if (deletedCount > 0) {
        saveToStorage(AUTH_LOGS_KEY, newLogs);
    }
    return deletedCount;
}

export const deleteAllAuthLogs = (): void => {
    saveToStorage(AUTH_LOGS_KEY, []);
}

// Student Management Functions
export const getStudentProfiles = (): StudentProfile[] => getFromStorage<StudentProfile[]>(STUDENTS_KEY, []);

export const getStudentProfileById = (studentId: string): StudentProfile | undefined => {
    const profiles = getStudentProfiles();
    return profiles.find(p => p.student.student_no === studentId);
}

export const addStudentProfile = (
    profile: Omit<StudentProfile, 'student.student_no' | 'contactDetails.student_no' | 'guardianInfo.student_no' | 'emergencyContact.student_no' | 'admissionDetails.student_no' | 'admissionDetails.admission_no' | 'student.avatarUrl'>, 
    creatorId: string,
    classes: Class[]
): StudentProfile => {
    const profiles = getStudentProfiles();
    const now = new Date();
    
    const admissionYear = new Date(profile.admissionDetails.enrollment_date).getFullYear();
    const yearYY = admissionYear.toString().slice(-2);

    const studentsInYear = profiles.filter(p => {
        const pYear = new Date(p.admissionDetails.enrollment_date).getFullYear();
        return pYear === admissionYear;
    });
    const nextInYear = studentsInYear.length + 1;
    const nextNumberPadded = nextInYear.toString().padStart(3, '0');

    const newStudentNo = `WR-TK001-LBA${yearYY}${nextNumberPadded}`;
    const newAdmissionNo = `ADM${yearYY}${nextNumberPadded}`;
    
    const newProfile: StudentProfile = {
        student: {
            ...profile.student,
            student_no: newStudentNo,
            avatarUrl: `https://picsum.photos/seed/${newStudentNo}/200/200`,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            created_by: creatorId,
            updated_by: creatorId,
        },
        contactDetails: { ...profile.contactDetails, student_no: newStudentNo },
        guardianInfo: { ...profile.guardianInfo, student_no: newStudentNo },
        emergencyContact: { ...profile.emergencyContact, student_no: newStudentNo },
        admissionDetails: { 
            ...profile.admissionDetails, 
            student_no: newStudentNo,
            admission_no: newAdmissionNo 
        },
    };

    saveToStorage(STUDENTS_KEY, [...profiles, newProfile]);
    
    const hasEmail = !!newProfile.contactDetails.email;
    const lastName = newProfile.student.last_name.toLowerCase();
    const studentNoSuffix = newProfile.student.student_no.slice(-3);
    const usernameFromStudentNo = newProfile.student.student_no.split('-').pop()!.toLowerCase();

    const userToCreate = {
        name: `${newProfile.student.first_name} ${newProfile.student.last_name}`,
        email: hasEmail ? newProfile.contactDetails.email! : `${usernameFromStudentNo}@student.com`,
        username: hasEmail ? newProfile.contactDetails.email! : usernameFromStudentNo,
        password: `${lastName}${studentNoSuffix}`,
        role: 'Student' as Role,
        status: 'frozen' as 'frozen',
        entityId: newProfile.student.student_no,
    };
    addUser(userToCreate);

    const className = classes.find(c => c.id === newProfile.admissionDetails.class_assigned)?.name || 'Unknown Class';
    const enrollmentDateTime = format(new Date(newProfile.admissionDetails.enrollment_date), 'PPP p');

    addAuditLog({
        user: getUserById(creatorId)?.email || 'Unknown',
        name: getUserById(creatorId)?.name || 'Unknown',
        action: 'Create Student',
        details: `Enrolled: ${newProfile.student.first_name} ${newProfile.student.last_name} (ID: ${newProfile.student.student_no}) into ${className} on ${enrollmentDateTime}`
    });

    return newProfile;
};

export const updateStudentProfile = (studentId: string, updatedData: Partial<StudentProfile>, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === studentId);
    
    if (profileIndex !== -1) {
        const now = new Date().toISOString();
        const existingProfile = profiles[profileIndex];

        const newProfile: StudentProfile = {
            ...existingProfile,
            ...updatedData,
            student: {
                ...existingProfile.student,
                ...updatedData.student,
                updated_at: now,
                updated_by: editorId,
            },
            contactDetails: {
                ...existingProfile.contactDetails,
                ...updatedData.contactDetails,
            },
            guardianInfo: {
                ...existingProfile.guardianInfo,
                ...updatedData.guardianInfo,
            },
             admissionDetails: {
                ...existingProfile.admissionDetails,
                ...updatedData.admissionDetails,
            },
        };
        
        profiles[profileIndex] = newProfile;
        saveToStorage(STUDENTS_KEY, profiles);

        const changes: string[] = [];
        // Deep compare to find changes for audit log
        Object.keys(updatedData).forEach(sectionKey => {
            const section = sectionKey as keyof StudentProfile;
            const originalSection = existingProfile[section];
            const updatedSection = updatedData[section];

            if (typeof updatedSection === 'object' && updatedSection !== null && originalSection) {
                 Object.keys(updatedSection).forEach(fieldKey => {
                    const originalValue = (originalSection as any)[fieldKey];
                    const updatedValue = (updatedSection as any)[fieldKey];
                    if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
                        changes.push(`${section}.${fieldKey}`);
                    }
                });
            }
        });
        const logDetails = `Updated fields for ${newProfile.student.first_name} ${newProfile.student.last_name}: ${changes.join(', ')}`;
        
        addAuditLog({
            user: getUserById(editorId)?.email || 'Unknown',
            name: getUserById(editorId)?.name || 'Unknown',
            action: 'Update Student Profile',
            details: logDetails,
        });

        return newProfile;
    }
    return null;
};


export const updateStudentStatus = (studentId: string, status: AdmissionStatus, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === studentId);
    
    if (profileIndex !== -1) {
        const now = new Date().toISOString();
        const profile = profiles[profileIndex];
        
        profile.admissionDetails.admission_status = status;
        profile.student.updated_at = now;
        profile.student.updated_by = editorId;

        profiles[profileIndex] = profile;
        saveToStorage(STUDENTS_KEY, profiles);
        return profile;
    }
    return null;
}

export const deleteStudentProfile = (studentId: string): boolean => {
    const profiles = getStudentProfiles();
    const newProfiles = profiles.filter(p => p.student.student_no !== studentId);
    if (newProfiles.length < profiles.length) {
        saveToStorage(STUDENTS_KEY, newProfiles);
        return true;
    }
    return false;
}


const updateProfileSubArray = <T>(studentId: string, editorId: string, arrayName: keyof StudentProfile, newItem: T): StudentProfile | null => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === studentId);

    if (profileIndex !== -1) {
        const now = new Date().toISOString();
        const profile = profiles[profileIndex];

        if (Array.isArray(profile[arrayName])) {
            (profile[arrayName] as T[]).push(newItem);
        } else {
            (profile[arrayName] as T[]) = [newItem];
        }

        profile.student.updated_at = now;
        profile.student.updated_by = editorId;

        profiles[profileIndex] = profile;
        saveToStorage(STUDENTS_KEY, profiles);
        return profile;
    }
    return null;
}

export const addAcademicRecord = (studentId: string, record: AcademicRecord, editorId: string) => 
    updateProfileSubArray(studentId, editorId, 'academicRecords', record);

export const addDisciplinaryRecord = (studentId: string, record: DisciplinaryRecord, editorId: string) =>
    updateProfileSubArray(studentId, editorId, 'disciplinaryRecords', record);

export const addAttendanceRecord = (entityId: string, record: AttendanceRecord, editorId: string, type: 'student' | 'staff') => {
    if (type === 'student') {
        const studentRecord: StudentAttendanceRecord = { ...record, student_id: entityId };
        return updateProfileSubArray(entityId, editorId, 'attendanceRecords', studentRecord);
    } else { // staff
        const staffRecord: StaffAttendanceRecord = { ...record, staff_id: entityId };
        const allRecords = getFromStorage<StaffAttendanceRecord[]>(STAFF_ATTENDANCE_RECORDS_KEY, []);
        saveToStorage(STAFF_ATTENDANCE_RECORDS_KEY, [...allRecords, staffRecord]);
    }
};

export const getScoresForClass = (classId: string): AssignmentScore[] => {
    const profiles = getStudentProfiles();
    return profiles.flatMap(p => p.assignmentScores || []).filter(s => s.class_id === classId);
}

export const addScore = (score: AssignmentScore, editorId: string): void => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === score.student_id);

    if (profileIndex !== -1) {
        const profile = profiles[profileIndex];
        if (!profile.assignmentScores) {
            profile.assignmentScores = [];
        }

        // Remove existing score for the same assignment to avoid duplicates, then add the new one.
        profile.assignmentScores = profile.assignmentScores.filter(s => 
            !(s.student_id === score.student_id && s.subject_id === score.subject_id && s.assignment_name === score.assignment_name)
        );
        profile.assignmentScores.push(score);

        profile.student.updated_at = new Date().toISOString();
        profile.student.updated_by = editorId;
        
        profiles[profileIndex] = profile;
        saveToStorage(STUDENTS_KEY, profiles);
    }
};

export const updateAssignmentScore = (studentId: string, subjectId: string, assignmentName: string, newScore: number, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (profileIndex === -1) return null;

    const profile = profiles[profileIndex];
    if (!profile.assignmentScores) return null;

    const scoreIndex = profile.assignmentScores.findIndex(s => s.subject_id === subjectId && s.assignment_name === assignmentName);
    if (scoreIndex === -1) return null;

    profile.assignmentScores[scoreIndex].score = newScore;
    profile.student.updated_at = new Date().toISOString();
    profile.student.updated_by = editorId;

    profiles[profileIndex] = profile;
    saveToStorage(STUDENTS_KEY, profiles);
    return profile;
}

export const deleteAssignmentScore = (studentId: string, subjectId: string, assignmentName: string, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (profileIndex === -1) return null;

    const profile = profiles[profileIndex];
    if (!profile.assignmentScores) return null;
    
    const initialLength = profile.assignmentScores.length;
    profile.assignmentScores = profile.assignmentScores.filter(s => !(s.subject_id === subjectId && s.assignment_name === assignmentName));

    if (profile.assignmentScores.length < initialLength) {
        profile.student.updated_at = new Date().toISOString();
        profile.student.updated_by = editorId;
        profiles[profileIndex] = profile;
        saveToStorage(STUDENTS_KEY, profiles);
        return profile;
    }

    return null;
}


export const getStaffAttendanceRecords = (): StaffAttendanceRecord[] => getFromStorage<StaffAttendanceRecord[]>(STAFF_ATTENDANCE_RECORDS_KEY, []);

export const addCommunicationLog = (studentId: string, record: CommunicationLog, editorId: string) =>
    updateProfileSubArray(studentId, editorId, 'communicationLogs', record);

export const addUploadedDocument = (studentId: string, record: UploadedDocument, editorId: string) =>
    updateProfileSubArray(studentId, editorId, 'uploadedDocuments', record);
    
export const deleteUploadedDocument = (studentId: string, documentId: string, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === studentId);

    if (profileIndex !== -1) {
        const now = new Date().toISOString();
        const profile = profiles[profileIndex];
        
        if (profile.uploadedDocuments) {
            profile.uploadedDocuments = profile.uploadedDocuments.filter(doc => doc.uploaded_at !== documentId);
        }

        profile.student.updated_at = now;
        profile.student.updated_by = editorId;

        profiles[profileIndex] = profile;
        saveToStorage(STUDENTS_KEY, profiles);
        return profile;
    }

    return null;
}

export const updateHealthRecords = (studentId: string, healthRecords: HealthRecords, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === studentId);
    
    if (profileIndex !== -1) {
        const now = new Date().toISOString();
        const profile = profiles[profileIndex];
        
        profile.healthRecords = healthRecords;
        profile.student.updated_at = now;
        profile.student.updated_by = editorId;

        profiles[profileIndex] = profile;
        saveToStorage(STUDENTS_KEY, profiles);
        return profile;
    }
    return null;
}

export const promoteStudents = (studentIds: string[], newClassId: string, editorId: string): number => {
    const profiles = getStudentProfiles();
    let updatedCount = 0;
    const now = new Date().toISOString();

    profiles.forEach(profile => {
        if (studentIds.includes(profile.student.student_no)) {
            profile.admissionDetails.class_assigned = newClassId;
            profile.student.updated_at = now;
            profile.student.updated_by = editorId;
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        saveToStorage(STUDENTS_KEY, profiles);
    }
    return updatedCount;
}

export const graduateStudents = (studentIds: string[], editorId: string): number => {
    const profiles = getStudentProfiles();
    let updatedCount = 0;
    const now = new Date().toISOString();

    profiles.forEach(profile => {
        if (studentIds.includes(profile.student.student_no)) {
            profile.admissionDetails.admission_status = 'Graduated';
            profile.student.updated_at = now;
            profile.student.updated_by = editorId;
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        saveToStorage(STUDENTS_KEY, profiles);
    }
    return updatedCount;
}


// Staff Management Functions
export const getStaffProfiles = (): StaffProfile[] => getFromStorage<StaffProfile[]>(STAFF_PROFILES_KEY, []);
export const getStaff = (): Staff[] => getFromStorage<Staff[]>(STAFF_KEY, []);
export const storeGetStaffAcademicHistory = (): StaffAcademicHistory[] => getFromStorage<StaffAcademicHistory[]>(STAFF_ACADEMIC_HISTORY_KEY, []);
export const getStaffDocuments = (): StaffDocument[] => getFromStorage<StaffDocument[]>(STAFF_DOCUMENTS_KEY, []);
export const getStaffAppointmentHistory = (): StaffAppointmentHistory[] => getFromStorage<StaffAppointmentHistory[]>(STAFF_APPOINTMENT_HISTORY_KEY, []);

export const addStaff = (staffData: Omit<Staff, 'user_id'>, appointmentHistory: Omit<StaffAppointmentHistory, 'staff_id'>, creatorId: string): Staff | null => {
    const staffList = getStaff();
    const declinedStaffList = getFromStorage<Staff[]>(DECLINED_STAFF_KEY, []);

    const existingStaff = staffList.find(s => s.email === staffData.email || s.staff_id === staffData.staff_id);
    if (existingStaff) {
        console.error("Staff with this email or ID already exists in the active list.");
        return null;
    }
    const existingDeclinedStaff = declinedStaffList.find(s => s.email === staffData.email || s.staff_id === staffData.staff_id);
    if (existingDeclinedStaff) {
        console.error("Staff with this email or ID already exists in the declined list.");
        return null;
    }

    if (appointmentHistory.appointment_status === 'Declined') {
        const declinedStaff = { ...staffData, user_id: '' };
        saveToStorage(DECLINED_STAFF_KEY, [...declinedStaffList, declinedStaff]);
        addAuditLog({
            user: getUserById(creatorId)?.email || 'Unknown',
            name: getUserById(creatorId)?.name || 'Unknown',
            action: 'Decline Staff Appointment',
            details: `Appointment for ${declinedStaff.first_name} ${declinedStaff.last_name} was declined.`
        });
        return null; // Return null as they are not an active staff member
    }

    const userToCreate = {
        name: `${staffData.first_name} ${staffData.last_name}`,
        email: staffData.email,
        username: staffData.email,
        password: `${staffData.last_name.toLowerCase()}${staffData.staff_id.slice(-3)}`,
        role: staffData.roles[0], // Use the first role for user creation
        status: 'active' as 'active' | 'frozen',
    };
    const newUser = addUser(userToCreate);

    const newStaff = { ...staffData, user_id: newUser.id }; 
    saveToStorage(STAFF_KEY, [...staffList, newStaff]);

    addAuditLog({
        user: getUserById(creatorId)?.email || 'Unknown',
        name: getUserById(creatorId)?.name || 'Unknown',
        action: 'Create Staff',
        details: `Created staff member ${newStaff.first_name} ${newStaff.last_name} and linked user account.`
    });

    return newStaff;
};


export const updateStaff = (staffId: string, updatedData: Partial<Staff>, editorId: string): Staff | null => {
    const staffList = getStaff();
    const staffIndex = staffList.findIndex(s => s.staff_id === staffId);

    if (staffIndex !== -1) {
        const existingStaff = staffList[staffIndex];
        const newStaffData = { ...existingStaff, ...updatedData };
        staffList[staffIndex] = newStaffData;
        saveToStorage(STAFF_KEY, staffList);

        addAuditLog({
            user: getUserById(editorId)?.email || 'Unknown',
            name: getUserById(editorId)?.name || 'Unknown',
            action: 'Update Staff',
            details: `Updated details for staff ID ${staffId}`
        });
        
        return newStaffData;
    }
    return null;
}

export const deleteStaff = (staffId: string, editorId: string): boolean => {
    const staffList = getStaff();
    const staffToDelete = staffList.find(s => s.staff_id === staffId);
    if (!staffToDelete) return false;

    // Delete user
    if (staffToDelete.user_id) {
        deleteUser(staffToDelete.user_id);
    }
    
    // Delete staff record
    const newStaffList = staffList.filter(s => s.staff_id !== staffId);
    saveToStorage(STAFF_KEY, newStaffList);
    
    // Delete associated records
    const academicHistory = storeGetStaffAcademicHistory().filter(h => h.staff_id !== staffId);
    saveToStorage(STAFF_ACADEMIC_HISTORY_KEY, academicHistory);
    
    const documents = getStaffDocuments().filter(d => d.staff_id !== staffId);
    saveToStorage(STAFF_DOCUMENTS_KEY, documents);
    
    const appointments = getStaffAppointmentHistory().filter(a => a.staff_id !== staffId);
    saveToStorage(STAFF_APPOINTMENT_HISTORY_KEY, appointments);

     addAuditLog({
        user: getUserById(editorId)?.email || 'Unknown',
        name: getUserById(editorId)?.name || 'Unknown',
        action: 'Delete Staff',
        details: `Deleted staff member ${staffToDelete.first_name} ${staffToDelete.last_name} (Staff ID: ${staffId})`
    });

    return true;
}

export const bulkDeleteStaff = (staffIds: string[], editorId: string): number => {
    let deletedCount = 0;
    staffIds.forEach(id => {
        const success = deleteStaff(id, editorId);
        if (success) {
            deletedCount++;
        }
    });
    return deletedCount;
}

export const toggleStaffStatus = (staffId: string, editorId: string): Staff | null => {
    const staffList = getStaff();
    const staff = staffList.find(s => s.staff_id === staffId);
    if (staff && staff.user_id) {
        const updatedUser = toggleUserStatus(staff.user_id);
        if(updatedUser){
            addAuditLog({
                user: getUserById(editorId)?.email || 'Unknown',
                name: getUserById(editorId)?.name || 'Unknown',
                action: 'Toggle Staff Status',
                details: `Toggled account status for staff member ${staff.first_name} ${staff.last_name} to ${updatedUser.status}`
            });
            return staff;
        }
    }
    return null;
}

export const addStaffAcademicHistory = (history: StaffAcademicHistory): StaffAcademicHistory => {
    const histories = storeGetStaffAcademicHistory();
    saveToStorage(STAFF_ACADEMIC_HISTORY_KEY, [...histories, history]);
    return history;
};

export const addStaffDocument = (document: StaffDocument): StaffDocument => {
    const documents = getStaffDocuments();
    saveToStorage(STAFF_DOCUMENTS_KEY, [...documents, document]);
    return document;
};

export const addStaffAppointmentHistory = (appointment: StaffAppointmentHistory): StaffAppointmentHistory => {
    const appointments = getStaffAppointmentHistory();
    saveToStorage(STAFF_APPOINTMENT_HISTORY_KEY, [...appointments, appointment]);
    return appointment;
};

export const getStaffByStaffId = (staffId: string): Staff | undefined => {
    const staffList = getStaff();
    return staffList.find(s => s.staff_id === staffId);
};

export const getStaffDocumentsByStaffId = (staffId: string): StaffDocument[] => {
    const documents = getStaffDocuments();
    return documents.filter(d => d.staff_id === staffId);
};

export const deleteStaffDocument = (staffId: string, documentName: string): boolean => {
    const documents = getStaffDocuments();
    const newDocuments = documents.filter(d => !(d.staff_id === staffId && d.document_name === documentName));
    if (newDocuments.length < documents.length) {
        saveToStorage(STAFF_DOCUMENTS_KEY, newDocuments);
        return true;
    }
    return false;
};

export const getStaffProfileByUserId = (userId: string): StaffProfile | undefined => {
    const profiles = getStaffProfiles();
    return profiles.find(p => p.user_id === userId);
}


// Leave Management Functions
export const getLeaveRequests = (): LeaveRequest[] => getFromStorage<LeaveRequest[]>(LEAVE_REQUESTS_KEY, []);

export const addLeaveRequest = (
  request: Omit<LeaveRequest, 'id' | 'request_date' | 'status' | 'staff_name'>,
  requesterId: string
): LeaveRequest | null => {
  const requests = getLeaveRequests();
  const staff = getStaffByStaffId(request.staff_id);
  if (!staff) return null;

  const newRequest: LeaveRequest = {
    ...request,
    id: (requests.length > 0 ? Math.max(...requests.map(r => parseInt(r.id))) + 1 : 1).toString(),
    staff_name: `${staff.first_name} ${staff.last_name}`,
    request_date: new Date().toISOString(),
    status: 'Pending',
  };
  saveToStorage(LEAVE_REQUESTS_KEY, [...requests, newRequest]);
  return newRequest;
};

export const updateLeaveRequestStatus = (
  leaveId: string,
  status: LeaveStatus,
  approverId: string,
  comments: string,
  days_approved?: number
): LeaveRequest | null => {
  const requests = getLeaveRequests();
  const requestIndex = requests.findIndex((r) => r.id === leaveId);
  if (requestIndex !== -1) {
    const approver = getUserById(approverId);
    requests[requestIndex].status = status;
    requests[requestIndex].approver_id = approverId;
    requests[requestIndex].approver_name = approver?.name;
    requests[requestIndex].comments = comments;
    if (days_approved !== undefined) {
      requests[requestIndex].days_approved = days_approved;
    }
    saveToStorage(LEAVE_REQUESTS_KEY, requests);
    return requests[requestIndex];
  }
  return null;
};

export const deleteLeaveRequest = (leaveId: string): boolean => {
    const requests = getLeaveRequests();
    const newRequests = requests.filter(r => r.id !== leaveId);
    if (newRequests.length < requests.length) {
        saveToStorage(LEAVE_REQUESTS_KEY, newRequests);
        return true;
    }
    return false;
}

export const bulkDeleteLeaveRequests = (leaveIds: string[]): number => {
    const requests = getLeaveRequests();
    const newRequests = requests.filter(r => !leaveIds.includes(r.id));
    const deletedCount = requests.length - newRequests.length;
    if (deletedCount > 0) {
        saveToStorage(LEAVE_REQUESTS_KEY, newRequests);
    }
    return deletedCount;
}

    

    





