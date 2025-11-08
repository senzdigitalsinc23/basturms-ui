

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
  ALL_ADMISSION_STATUSES,
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
  PromotionCriteria,
  Expense,
  Payroll,
  Announcement,
  Club,
  Sport,
  Asset,
  AssetAllocation,
  DepartmentRequest,
  DepartmentRequestStatus,
  Book,
  BorrowingRecord,
} from './types';
import { format } from 'date-fns';
import initialStaffProfiles from './initial-staff-profiles.json';
import { SchoolProfileData } from '@/components/settings/school-profile-settings';
import { FullSchedule } from '@/components/academics/timetable/timetable-scheduler';

export type StudentReport = {
    student: StudentProfile;
    term: string;
    year: string;
    nextTermBegins: string | null;
    subjects: {
        subjectName: string;
        sbaScore: number;
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
    schoolProfile: SchoolProfileData | null;
    className: string;
    status: 'Provisional' | 'Final';
    classTeacherId?: string;
    headTeacherId?: string;
    classTeacherSignature?: string | null;
    headTeacherSignature?: string | null;
};


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
const TIMETABLE_KEY = 'campusconnect_timetable';
const STUDENT_REPORTS_KEY = 'campusconnect_student_reports';
const EXPENSES_KEY = 'campusconnect_expenses';
const PAYROLLS_KEY = 'campusconnect_payrolls';
const ANNOUNCEMENTS_KEY = 'campusconnect_announcements';
const CLUBS_KEY = 'campusconnect_clubs';
const SPORTS_KEY = 'campusconnect_sports';
const ASSETS_KEY = 'campusconnect_assets';
const ASSET_ALLOCATIONS_KEY = 'campusconnect_asset_allocations';
const DEPARTMENT_REQUESTS_KEY = 'campusconnect_department_requests';
const BOOKS_KEY = 'campusconnect_books';
const BORROWING_KEY = 'campusconnect_borrowing';


// Settings Keys
const ACADEMIC_YEARS_KEY = 'campusconnect_academic_years';
const CALENDAR_EVENTS_KEY = 'campusconnect_calendar_events';
const GRADING_SCHEME_KEY = 'campusconnect_grading_scheme';
const ROLE_PERMISSIONS_KEY = 'campusconnect_role_permissions';
const BACKUP_SETTINGS_KEY = 'campusconnect_backup_settings';
const ASSIGNMENT_ACTIVITIES_KEY = 'campusconnect_assignment_activities';
const CLASS_ASSIGNMENT_ACTIVITIES_KEY = 'campusconnect_class_assignment_activities';
const PROMOTION_CRITERIA_KEY = 'campusconnect_promotion_criteria';


// New keys for staff management
export const STAFF_KEY = 'campusconnect_staff';
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
     {
      id: '2',
      name: 'J. Konnie',
      username: 'jkonnie',
      email: 'jkonnie@teacher.com',
      password: 'password',
      role_id: getRoleId('Teacher')!,
      is_super_admin: false,
      avatarUrl: 'https://picsum.photos/seed/avatar2/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
      id: '3',
      name: 'Headmaster User',
      username: 'headmaster',
      email: 'headmaster@campus.com',
      password: 'password',
      role_id: getRoleId('Headmaster')!,
      is_super_admin: false,
      avatarUrl: 'https://picsum.photos/seed/avatar3/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
        id: '4',
        name: 'Guest User',
        username: 'guest',
        email: 'guest@campus.com',
        password: 'password',
        role_id: getRoleId('Guest')!,
        is_super_admin: false,
        avatarUrl: 'https://picsum.photos/seed/guest/40/40',
        status: 'active',
        created_at: now,
        updated_at: now,
    }
  ];
};

const getInitialStaff = (): Staff[] => {
    return [
        {
            "staff_id": "STF001", "user_id": "1", "first_name": "Douglas", "last_name": "Senzu", "email": "admin@campus.com", "phone": "123-456-7890", "roles": ["Admin"], "status": "Active", "id_type": "Ghana Card", "id_no": "GHA-123456789-0", "date_of_joining": "2023-01-15T00:00:00.000Z", "address": { "country": "Ghana", "residence": "Accra", "hometown": "Accra", "house_no": "H1", "gps_no": "GA-123-456" }
        },
        {
            "staff_id": "STF002", "user_id": "3", "first_name": "Jane", "last_name": "Smith", "email": "headmaster@campus.com", "phone": "098-765-4321", "roles": ["Headmaster"], "status": "Active", "id_type": "Passport", "id_no": "P0123456", "date_of_joining": "2022-09-01T00:00:00.000Z", "address": { "country": "Ghana", "residence": "Kumasi", "hometown": "Kumasi", "house_no": "H2", "gps_no": "AK-456-789" }
        },
        {
            "staff_id": "STF003", "user_id": "2", "first_name": "J.", "last_name": "Konnie", "email": "jkonnie@teacher.com", "phone": "123-456-7891", "roles": ["Teacher"], "status": "Active", "id_type": "Ghana Card", "id_no": "GHA-123456789-1", "date_of_joining": "2023-01-15T00:00:00.000Z", "address": { "country": "Ghana", "residence": "Accra", "hometown": "Accra", "house_no": "H1", "gps_no": "GA-123-457" }
        }
    ];
};

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
        'Accountant': ['financials:billing', 'financials:collect', 'financials:reports'],
        'Parent': [],
        'Student': [],
        'Guest': ['backup:create', 'backup:restore'],
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
    const isInitialized = window.localStorage.getItem(USERS_KEY);
    
    if (!isInitialized) {
        console.log("Initializing local storage with default data...");
        const roles = getInitialRoles();
        saveToStorage(ROLES_KEY, roles);
        saveToStorage(USERS_KEY, getInitialUsers(roles));
        saveToStorage(LOGS_KEY, []);
        saveToStorage(AUTH_LOGS_KEY, []);
        saveToStorage(STUDENTS_KEY, []); // Start with an empty student list
        saveToStorage(STUDENT_REPORTS_KEY, []);
        saveToStorage(CLASSES_KEY, getInitialClasses());
        saveToStorage(STAFF_PROFILES_KEY, initialStaffProfiles);
        saveToStorage(FEE_STRUCTURES_KEY, []);
        saveToStorage(TERMLY_BILLS_KEY, []);
        saveToStorage(TIMETABLE_KEY, {});
        saveToStorage(EXPENSES_KEY, []);
        saveToStorage(PAYROLLS_KEY, []);
        saveToStorage(ANNOUNCEMENTS_KEY, []);
        saveToStorage(CLUBS_KEY, []);
        saveToStorage(SPORTS_KEY, []);
        saveToStorage(ASSETS_KEY, []);
        saveToStorage(ASSET_ALLOCATIONS_KEY, []);
        saveToStorage(DEPARTMENT_REQUESTS_KEY, []);
        saveToStorage(BOOKS_KEY, []);
        saveToStorage(BORROWING_KEY, []);
        saveToStorage(ACADEMIC_YEARS_KEY, getInitialAcademicYears());
        saveToStorage(CALENDAR_EVENTS_KEY, getInitialCalendarEvents());
        saveToStorage(GRADING_SCHEME_KEY, getInitialGradingScheme());
        saveToStorage(ROLE_PERMISSIONS_KEY, getInitialRolePermissions());
        saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, getInitialAssignmentActivities());
        saveToStorage(CLASS_ASSIGNMENT_ACTIVITIES_KEY, []);
        saveToStorage(LEAVE_REQUESTS_KEY, getInitialLeaveRequests());
        saveToStorage(BACKUP_SETTINGS_KEY, { autoBackupEnabled: true, frequency: 'daily', backupTime: '00:00', lastBackup: null });
        saveToStorage(PROMOTION_CRITERIA_KEY, { minAverageScore: 50, coreSubjects: [], minCoreSubjectsToPass: 0 });
        saveToStorage(STAFF_KEY, getInitialStaff());
        saveToStorage(DECLINED_STAFF_KEY, []);
        saveToStorage(STAFF_ACADEMIC_HISTORY_KEY, []);
        saveToStorage(STAFF_DOCUMENTS_KEY, []);
        saveToStorage(STAFF_APPOINTMENT_HISTORY_KEY, []);
        saveToStorage(STAFF_ATTENDANCE_RECORDS_KEY, []);
        saveToStorage(SUBJECTS_KEY, getInitialSubjects());
        saveToStorage(CLASS_SUBJECTS_KEY, []);
        saveToStorage(TEACHER_SUBJECTS_KEY, []);
    }
  }
};

export const getDepartmentRequests = (): DepartmentRequest[] => getFromStorage<DepartmentRequest[]>(DEPARTMENT_REQUESTS_KEY, []);
export const saveDepartmentRequests = (requests: DepartmentRequest[]): void => saveToStorage(DEPARTMENT_REQUESTS_KEY, requests);

export const addDepartmentRequest = (requestData: Omit<DepartmentRequest, 'id' | 'status' | 'request_date'>): DepartmentRequest => {
    const requests = getDepartmentRequests();
    const newRequest: DepartmentRequest = {
        ...requestData,
        id: `REQ-${Date.now()}`,
        status: 'Pending',
        request_date: new Date().toISOString(),
    };
    saveDepartmentRequests([...requests, newRequest]);
    return newRequest;
};

export const updateDepartmentRequestStatus = (requestId: string, status: DepartmentRequestStatus, editorId: string, editorName: string, data?: { quantity?: number, comments?: string }): DepartmentRequest | null => {
    const requests = getDepartmentRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) return null;

    const request = requests[requestIndex];
    request.status = status;
    const now = new Date().toISOString();

    if (status === 'Approved') {
        request.approved_by_id = editorId;
        request.approved_by_name = editorName;
        request.approval_date = now;
        request.quantity_approved = data?.quantity;
        request.comments = data?.comments;
    }
     if (status === 'Rejected') {
        request.approved_by_id = editorId;
        request.approved_by_name = editorName;
        request.approval_date = now;
        request.comments = data?.comments;
    }
    
    if (status === 'Served') {
        request.served_by_id = editorId;
        request.served_by_name = editorName;
        request.served_date = now;
        request.quantity_served = data?.quantity;
        request.comments = data?.comments;

        const quantityToServe = data?.quantity || request.quantity_approved || request.quantity_requested;

        // Deduct from stock
        const assets = getAssets();
        const assetIndex = assets.findIndex(a => a.id === request.asset_id);
        if (assetIndex !== -1) {
            const asset = assets[assetIndex];
            asset.quantity -= quantityToServe;
            if (asset.quantity < 0) asset.quantity = 0;
            
            asset.logs.push({
                date: now,
                type: 'Stock Update',
                details: `${quantityToServe} unit(s) served for request ${request.id}.`,
                recorded_by: editorId,
            });
            saveAssets(assets);
        }
        
        // Add to allocations
        addAssetAllocation({
            assetId: request.asset_id,
            assetName: request.asset_name,
            quantity: quantityToServe,
            allocatedToId: request.department,
            allocatedToName: request.department,
            allocationType: 'Department',
            condition: 'Good',
            notes: `Served for request ${request.id}. Comments: ${data?.comments || 'N/A'}`
        });

    }
    
    if(status === 'Not Served') {
        request.served_by_id = editorId;
        request.served_by_name = editorName;
        request.served_date = now;
        request.comments = data?.comments;
    }

    saveDepartmentRequests(requests);
    return request;
};

export const bulkUpdateDepartmentRequestStatus = (requestIds: string[], status: DepartmentRequestStatus, editorId: string, editorName: string, data?: { comments?: string }): void => {
    const requests = getDepartmentRequests();
    
    requestIds.forEach(id => {
        const requestIndex = requests.findIndex(r => r.id === id);
        if (requestIndex !== -1) {
            const request = requests[requestIndex];

            // Only update if the status transition is valid
            const canApprove = request.status === 'Pending' && (status === 'Approved' || status === 'Rejected');
            const canServe = request.status === 'Approved' && (status === 'Served' || status === 'Not Served');

            if (canApprove || canServe) {
                 updateDepartmentRequestStatus(id, status, editorId, editorName, { 
                    // For bulk actions, we assume full quantity approval/serving
                    quantity: status === 'Approved' ? request.quantity_requested : request.quantity_approved,
                    comments: data?.comments 
                });
            }
        }
    });
};


export const getAssets = (): Asset[] => getFromStorage<Asset[]>(ASSETS_KEY, []);
export const saveAssets = (assets: Asset[]): void => saveToStorage(ASSETS_KEY, assets);

export const getAssetAllocations = (): AssetAllocation[] => getFromStorage<AssetAllocation[]>(ASSET_ALLOCATIONS_KEY, []);
export const saveAssetAllocations = (allocations: AssetAllocation[]): void => saveToStorage(ASSET_ALLOCATIONS_KEY, allocations);

export const addAssetAllocation = (allocation: Omit<AssetAllocation, 'id' | 'date'>): AssetAllocation => {
    const allocations = getAssetAllocations();
    const newAllocation: AssetAllocation = {
        ...allocation,
        id: `ALLOC-${Date.now()}`,
        date: new Date().toISOString(),
    };
    saveToStorage(ASSET_ALLOCATIONS_KEY, [...allocations, newAllocation]);
    return newAllocation;
};


export const getPayrolls = (): Payroll[] => getFromStorage<Payroll[]>(PAYROLLS_KEY, []);
export const savePayroll = (payrolls: Payroll[]): void => saveToStorage(PAYROLLS_KEY, payrolls);

export const getExpenses = (): Expense[] => getFromStorage<Expense[]>(EXPENSES_KEY, []);
export const saveExpenses = (expenses: Expense[]): void => saveToStorage(EXPENSES_KEY, expenses);
export const addExpense = (expense: Expense): void => {
    const expenses = getExpenses();
    saveExpenses([...expenses, expense]);
};

export const getClubs = (): Club[] => getFromStorage<Club[]>(CLUBS_KEY, []);
export const saveClubs = (clubs: Club[]): void => saveToStorage(CLUBS_KEY, clubs);

export const getSports = (): Sport[] => getFromStorage<Sport[]>(SPORTS_KEY, []);
export const saveSports = (sports: Sport[]): void => saveToStorage(SPORTS_KEY, sports);

export const getAnnouncements = (): Announcement[] => getFromStorage<Announcement[]>(ANNOUNCEMENTS_KEY, []);

export const addAnnouncement = (announcementData: Omit<Announcement, 'id' | 'created_at' | 'author_name'>, idToUpdate?: string): void => {
    const announcements = getAnnouncements();
    const author = getUserById(announcementData.author_id);
    if (!author) return;

    if (idToUpdate) {
        const index = announcements.findIndex(a => a.id === idToUpdate);
        if (index !== -1) {
            announcements[index] = { ...announcements[index], ...announcementData, author_name: author.name };
        }
    } else {
        const newAnnouncement: Announcement = {
            id: `ann-${Date.now()}`,
            ...announcementData,
            created_at: new Date().toISOString(),
            author_name: author.name,
        };
        announcements.unshift(newAnnouncement);
    }
    saveToStorage(ANNOUNCEMENTS_KEY, announcements);
};

export const deleteAnnouncement = (id: string): void => {
    const announcements = getAnnouncements();
    const updatedAnnouncements = announcements.filter(a => a.id !== id);
    saveToStorage(ANNOUNCEMENTS_KEY, updatedAnnouncements);
};


export const saveStudentReport = (report: StudentReport): void => {
    const reports = getFromStorage<StudentReport[]>(STUDENT_REPORTS_KEY, []);
    const reportIndex = reports.findIndex(r => r.student.student.student_no === report.student.student.student_no && r.term === report.term && r.year === report.year);

    if (reportIndex !== -1) {
        reports[reportIndex] = report;
    } else {
        reports.push(report);
    }
    saveToStorage(STUDENT_REPORTS_KEY, reports);
};

export const getStudentReport = (studentId: string, termName: string): StudentReport | null => {
    const reports = getFromStorage<StudentReport[]>(STUDENT_REPORTS_KEY, []);
    const year = termName.split(' ').pop();
    const term = termName.split(' ').slice(0, -1).join(' ');
    return reports.find(r => r.student.student.student_no === studentId && r.term === term && r.year === year) || null;
};


export const calculateStudentReport = (studentId: string, termName: string, allStudentsInClass: StudentProfile[]): StudentReport | null => {
    const student = getStudentProfileById(studentId);
    if (!student) return null;

    const allSubjects = getSubjects();
    const classSubjects = addClassSubject().filter(cs => cs.class_id === student.admissionDetails.class_assigned).map(cs => allSubjects.find(s => s.id === cs.subject_id)).filter(Boolean) as Subject[];
    const activities = getAssignmentActivities();
    const gradingScheme = getGradingScheme();
    const schoolProfile = getSchoolProfile();
    const SBA_TOTAL_WEIGHT = 40;
    const EXAM_TOTAL_WEIGHT = 60;

    const reportSubjects = classSubjects.map(subject => {
        const studentScores = student.assignmentScores?.filter(s => s.subject_id === subject.id) || [];
        
        const examActivity = activities.find(a => a.name === 'End of Term Exam');
        const examScoreRecord = studentScores.find(s => s.assignment_name === examActivity?.name);
        
        const sbaActivities = activities.filter(a => a.name !== 'End of Term Exam');
        
        let totalSbaWeightedScore = 0;
        sbaActivities.forEach(activity => {
            const activityScores = studentScores.filter(s => s.assignment_name.startsWith(activity.name));
            if (activityScores.length > 0) {
                const totalRawScore = activityScores.reduce((acc, s) => acc + s.score, 0);
                const totalPossibleRawScore = activityScores.length * 100; // Assuming each is out of 100
                const weightedScore = (totalRawScore / totalPossibleRawScore) * activity.weight;
                totalSbaWeightedScore += weightedScore;
            }
        });
        
        // Ensure SBA does not exceed its total weight
        const finalSbaScore = Math.min(totalSbaWeightedScore, SBA_TOTAL_WEIGHT);

        const rawExamScore = examScoreRecord?.score || 0;
        const examScore = (rawExamScore / 100) * EXAM_TOTAL_WEIGHT;

        const totalScore = Math.round(finalSbaScore + examScore);
        
        let grade = "N/A";
        let remarks = "N/A";
        for (const gradeInfo of gradingScheme) {
            const [min, max] = gradeInfo.range.split('-').map(Number);
            if (totalScore >= min && totalScore <= max) {
                grade = gradeInfo.grade;
                remarks = gradeInfo.remarks;
                break;
            }
        }
        
        const allScoresForSubject = allStudentsInClass.map(s => {
            const scores = s.assignmentScores?.filter(sc => sc.subject_id === subject.id) || [];
            
            let studentSbaScore = 0;
            sbaActivities.forEach(activity => {
                 const activityScores = scores.filter(sc => sc.assignment_name.startsWith(activity.name));
                if (activityScores.length > 0) {
                    const totalRaw = activityScores.reduce((acc, score) => acc + (score.score || 0), 0);
                    const totalPossible = activityScores.length * 100;
                    studentSbaScore += (totalRaw / totalPossible) * activity.weight;
                }
            });
            studentSbaScore = Math.min(studentSbaScore, SBA_TOTAL_WEIGHT);

            const examRec = scores.find(sc => sc.assignment_name === examActivity?.name);
            const studentExamScore = ((examRec?.score || 0) / 100) * EXAM_TOTAL_WEIGHT;

            return studentSbaScore + studentExamScore;
        }).sort((a, b) => b - a);

        const position = allScoresForSubject.indexOf(totalScore) + 1;


        return {
            subjectName: subject.name,
            sbaScore: parseFloat(finalSbaScore.toFixed(1)),
            examScore: parseFloat(examScore.toFixed(1)),
            totalScore,
            grade,
            remarks,
            position
        };
    });
    
    const academicYear = getAcademicYears().find(y => y.terms.some(t => `${t.name} ${y.year}` === termName));
    const termInfo = academicYear?.terms.find(t => `${t.name} ${academicYear.year}` === termName);
    const nextTermIndex = academicYear?.terms.findIndex(t => t.name === termInfo?.name) as number + 1;
    const nextTerm = academicYear?.terms[nextTermIndex];


    return {
        student,
        term: termInfo?.name || '',
        year: academicYear?.year || '',
        nextTermBegins: nextTerm?.startDate || null,
        subjects: reportSubjects,
        attendance: { daysAttended: 1, totalDays: 1 }, // Placeholder
        conduct: 'Good', // Placeholder
        talentAndInterest: 'Singing', // Placeholder
        classTeacherRemarks: 'A very brilliant and respectful student', // Placeholder
        headTeacherRemarks: 'An exceptionally brilliant student with a promising future.', // Placeholder
        schoolProfile,
        className: getClasses().find(c => c.id === student.admissionDetails.class_assigned)?.name || 'N/A',
        status: 'Provisional',
    };
};


// Timetable functions
export const getTimetable = (): FullSchedule => getFromStorage<FullSchedule>(TIMETABLE_KEY, {});
export const saveTimetable = (schedule: FullSchedule): void => saveToStorage(TIMETABLE_KEY, schedule);

// School Profile Functions
export const getSchoolProfile = (): SchoolProfileData | null => {
    return getFromStorage<SchoolProfileData | null>(SCHOOL_KEY, null);
};

export const saveSchoolProfile = (profile: SchoolProfileData): void => {
    saveToStorage(SCHOOL_KEY, profile);
};

// Fee Structure Functions
export const getFeeStructures = (): FeeStructureItem[] => getFromStorage<FeeStructureItem[]>(FEE_STRUCTURES_KEY, []);
export const saveFeeStructures = (items: FeeStructureItem[]): void => saveToStorage(FEE_STRUCTURES_KEY, items);


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
    const profiles = getStudentProfilesFromStorage();
    if(billToDelete.status === 'Approved') {
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
    }

    const updatedBills = bills.filter(b => b.bill_number !== billNumber);
    saveTermlyBills(updatedBills);

    addAuditLog({
        user: getUserById(editorId)?.email || 'Unknown',
        name: getUserById(editorId)?.name || 'Unknown',
        action: 'Delete Termly Bill',
        details: `Deleted bill ${billNumber} for term "${billToDelete.term}".`
    });
};

export const prepareBills = (bill: TermlyBill, editorId: string): void => {
    const profiles = getStudentProfilesFromStorage();
    
    const allStudentsToBill = new Set<string>([
        ...bill.assigned_students,
        ...getStudentProfilesFromStorage()
            .filter(p => bill.assigned_classes.includes(p.admissionDetails.class_assigned))
            .map(p => p.student.student_no)
    ]);
    
    const billedStudentIds: string[] = [];

    const updatedProfiles = profiles.map(profile => {
        if (allStudentsToBill.has(profile.student.student_no)) {
            billedStudentIds.push(profile.student.student_no);
            
            const totalBillAmount = bill.items.reduce((acc, item) => acc + item.amount, 0);

            const newTermPayment: TermPayment = {
                bill_number: bill.bill_number,
                term: bill.term,
                total_fees: totalBillAmount,
                amount_paid: 0,
                outstanding: totalBillAmount,
                status: 'Unpaid',
                bill_items: bill.items,
                payments: [],
            };

            if (!profile.financialDetails) {
                profile.financialDetails = { account_balance: 0, payment_history: [] };
            }

            const existingBillIndex = profile.financialDetails.payment_history.findIndex(p => p.term === bill.term);
            if (existingBillIndex > -1) {
                // This logic might need refinement if multiple bills per term are allowed.
                // For now, it replaces the existing bill.
                const oldBill = profile.financialDetails.payment_history[existingBillIndex];
                profile.financialDetails.account_balance += oldBill.outstanding; // Reverse old debt
                profile.financialDetails.payment_history.splice(existingBillIndex, 1);
            }

            profile.financialDetails.payment_history.push(newTermPayment);
            profile.financialDetails.account_balance -= totalBillAmount;
        }
        return profile;
    });
    
    const bills = getTermlyBills();
    const billIndex = bills.findIndex(b => b.bill_number === bill.bill_number);
    if(billIndex !== -1) {
        bills[billIndex].billed_student_ids = billedStudentIds;
        bills[billIndex].status = 'Approved';
        bills[billIndex].approved_by = editorId;
        bills[billIndex].approved_at = new Date().toISOString();
    }
    saveTermlyBills(bills);

    saveToStorage(STUDENTS_KEY, updatedProfiles);
};

export const updateTermlyBillStatus = (billNumber: string, status: TermlyBill['status'], editorId: string): TermlyBill | null => {
    const bills = getTermlyBills();
    const billIndex = bills.findIndex(b => b.bill_number === billNumber);

    if (billIndex === -1) return null;

    bills[billIndex].status = status;
    bills[billIndex].approved_by = editorId;
    bills[billIndex].approved_at = new Date().toISOString();
    
    saveTermlyBills(bills);
    return bills[billIndex];
};


export const recordPayment = (studentId: string, paymentDetails: {amount: number, method: TermPayment['payments'][0]['method'], receipt_number?: string, paid_by?: string}, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
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
    const profiles = getStudentProfilesFromStorage();
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
    if (eventIndex === -1) return null;

    events[eventIndex] = { ...events[eventIndex], ...updatedData };
    saveToStorage(CALENDAR_EVENTS_KEY, events);

    const editor = getUserById(editorId);
    addAuditLog({
        user: editor?.email || 'Unknown',
        name: editor?.name || 'Unknown',
        action: 'Update Calendar Event',
        details: `Updated event: "${events[eventIndex].title}"`
    });

    return events[eventIndex];
};

export const deleteCalendarEvent = (eventId: string, editorId: string): void => {
    const events = getCalendarEvents();
    const eventToDelete = events.find(e => e.id === eventId);
    const updatedEvents = events.filter(e => e.id !== eventId);
    saveToStorage(CALENDAR_EVENTS_KEY, updatedEvents);

    if (eventToDelete) {
        const editor = getUserById(editorId);
        addAuditLog({
            user: editor?.email || 'Unknown',
            name: editor?.name || 'Unknown',
            action: 'Delete Calendar Event',
            details: `Deleted event: "${eventToDelete.title}"`
        });
    }
};

export const getGradingScheme = (): GradeSetting[] => getFromStorage<GradeSetting[]>(GRADING_SCHEME_KEY, []);
export const saveGradingScheme = (scheme: GradeSetting[]): void => saveToStorage(GRADING_SCHEME_KEY, scheme);

export const getRolePermissions = (): RolePermissions => getFromStorage<RolePermissions>(ROLE_PERMISSIONS_KEY, {});
export const saveRolePermissions = (permissions: RolePermissions): void => saveToStorage(ROLE_PERMISSIONS_KEY, permissions);

export const getAssignmentActivities = (): AssignmentActivity[] => getFromStorage<AssignmentActivity[]>(ASSIGNMENT_ACTIVITIES_KEY, []);
export const addAssignmentActivity = (activity: Omit<AssignmentActivity, 'id'>): void => {
    const activities = getAssignmentActivities();
    const newActivity = { ...activity, id: `act-${Date.now()}` };
    saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, [...activities, newActivity]);
};
export const updateAssignmentActivity = (id: string, updatedActivity: Partial<Omit<AssignmentActivity, 'id'>>): void => {
    const activities = getAssignmentActivities();
    const index = activities.findIndex(a => a.id === id);
    if(index > -1) {
        activities[index] = {...activities[index], ...updatedActivity};
        saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, activities);
    }
};
export const deleteAssignmentActivity = (id: string): void => {
    let activities = getAssignmentActivities();
    activities = activities.filter(a => a.id !== id);
    saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, activities);

    let classActivities = getClassAssignmentActivities();
    classActivities = classActivities.filter(ca => ca.activity_id !== id);
    saveToStorage(CLASS_ASSIGNMENT_ACTIVITIES_KEY, classActivities);
};

export const getClassAssignmentActivities = (): ClassAssignmentActivity[] => getFromStorage<ClassAssignmentActivity[]>(CLASS_ASSIGNMENT_ACTIVITIES_KEY, []);
export const saveClassAssignmentActivities = (assignments: ClassAssignmentActivity[]): void => saveToStorage(CLASS_ASSIGNMENT_ACTIVITIES_KEY, assignments);

export const getPromotionCriteria = (): PromotionCriteria => getFromStorage<PromotionCriteria>(PROMOTION_CRITERIA_KEY, {});
export const savePromotionCriteria = (criteria: PromotionCriteria): void => saveToStorage(PROMOTION_CRITERIA_KEY, criteria);

export const getLeaveRequests = (): LeaveRequest[] => getFromStorage<LeaveRequest[]>(LEAVE_REQUESTS_KEY, []);

export const addLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'request_date' | 'status' | 'staff_name'>, requesterId: string): LeaveRequest | null => {
    const staff = getStaff().find(s => s.staff_id === data.staff_id);
    if (!staff) return null;

    const newRequest: LeaveRequest = {
        ...data,
        id: `leave-${Date.now()}`,
        request_date: new Date().toISOString(),
        status: 'Pending',
        staff_name: `${staff.first_name} ${staff.last_name}`,
    };
    
    const requests = getLeaveRequests();
    saveToStorage(LEAVE_REQUESTS_KEY, [...requests, newRequest]);
    return newRequest;
};

export const updateLeaveRequestStatus = (leaveId: string, status: LeaveStatus, approverId: string, comments: string, days_approved?: number): LeaveRequest | null => {
    const requests = getLeaveRequests();
    const index = requests.findIndex(r => r.id === leaveId);
    if (index === -1) return null;

    const approver = getUserById(approverId);
    requests[index].status = status;
    requests[index].approver_id = approverId;
    requests[index].approver_name = approver?.name || 'N/A';
    requests[index].comments = comments;
    if (status === 'Approved') {
        requests[index].days_approved = days_approved;
    }
    
    saveToStorage(LEAVE_REQUESTS_KEY, requests);
    return requests[index];
};

export const deleteLeaveRequest = (leaveId: string): boolean => {
    let requests = getLeaveRequests();
    const initialLength = requests.length;
    requests = requests.filter(r => r.id !== leaveId);
    saveToStorage(LEAVE_REQUESTS_KEY, requests);
    return requests.length < initialLength;
};

export const bulkDeleteLeaveRequests = (leaveIds: string[]): number => {
    let requests = getLeaveRequests();
    const initialLength = requests.length;
    requests = requests.filter(r => !leaveIds.includes(r.id));
    saveToStorage(LEAVE_REQUESTS_KEY, requests);
    return initialLength - requests.length;
}

// Student & Staff Attendance
export const getStudentAttendanceRecordsForStudent = (studentId: string): StudentAttendanceRecord[] => {
    const profile = getStudentProfileById(studentId);
    return profile?.attendanceRecords || [];
};

export const getStaffAttendanceRecords = (): StaffAttendanceRecord[] => {
    return getFromStorage(STAFF_ATTENDANCE_RECORDS_KEY, []);
};

// Generic function to add attendance
export function addAttendanceRecord(entityId: string, record: { date: string, status: AttendanceStatus }, editorId: string, type: 'student' | 'staff') {
    if (type === 'student') {
        const profiles = getStudentProfilesFromStorage();
        const profileIndex = profiles.findIndex(p => p.student.student_no === entityId);
        if (profileIndex !== -1) {
            if (!profiles[profileIndex].attendanceRecords) {
                profiles[profileIndex].attendanceRecords = [];
            }
            const recordIndex = profiles[profileIndex].attendanceRecords!.findIndex(r => r.date.split('T')[0] === new Date(record.date).toISOString().split('T')[0]);
            if (recordIndex !== -1) {
                profiles[profileIndex].attendanceRecords![recordIndex].status = record.status;
            } else {
                profiles[profileIndex].attendanceRecords!.push({ student_id: entityId, ...record });
            }
            saveToStorage(STUDENTS_KEY, profiles);
        }
    } else { // staff
        const records = getStaffAttendanceRecords();
        const recordIndex = records.findIndex(r => r.staff_id === entityId && r.date.split('T')[0] === new Date(record.date).toISOString().split('T')[0]);
        if (recordIndex !== -1) {
            records[recordIndex].status = record.status;
        } else {
            records.push({ staff_id: entityId, ...record });
        }
        saveToStorage(STAFF_ATTENDANCE_RECORDS_KEY, records);
    }
}


// Staff Management Functions
export const getStaff = (): Staff[] => getFromStorage<Staff[]>(STAFF_KEY, []);
export const getDeclinedStaff = (): Staff[] => getFromStorage<Staff[]>(DECLINED_STAFF_KEY, []);
export const getStaffByStaffId = (staffId: string): Staff | null => getStaff().find(s => s.staff_id === staffId) || null;
export const storeGetStaffAcademicHistory = (): StaffAcademicHistory[] => getFromStorage<StaffAcademicHistory[]>(STAFF_ACADEMIC_HISTORY_KEY, []);
export const getStaffDocuments = (): StaffDocument[] => getFromStorage<StaffDocument[]>(STAFF_DOCUMENTS_KEY, []);
export const getStaffDocumentsByStaffId = (staffId: string): StaffDocument[] => getStaffDocuments().filter(d => d.staff_id === staffId);
export const getStaffAppointmentHistory = (): StaffAppointmentHistory[] => getFromStorage<StaffAppointmentHistory[]>(STAFF_APPOINTMENT_HISTORY_KEY, []);

export const addStaff = (staffData: Omit<Staff, 'user_id'> & { signature?: string }, creatorId: string): Staff => {
    const staffList = getStaff();
    const allUsers = getUsers();
    
    // Check if user account needs to be created
    let user = allUsers.find(u => u.email.toLowerCase() === staffData.email.toLowerCase());
    if (!user) {
        user = addUser({
            name: `${staffData.first_name} ${staffData.last_name}`,
            email: staffData.email,
            password: 'password', // Default password
            role: staffData.roles[0],
            signature: staffData.signature,
        });
    } else {
        // Link existing user
        if (getStaff().some(s => s.user_id === user!.id)) {
            throw new Error("This user is already linked to another staff member.");
        }
    }
    
    const newStaff: Staff = { ...staffData, user_id: user.id };
    
    staffList.push(newStaff);
    saveToStorage(STAFF_KEY, staffList);
    
    addAuditLog({
        user: getUserById(creatorId)?.email || 'Unknown',
        name: getUserById(creatorId)?.name || 'Unknown',
        action: 'Create Staff',
        details: `Created staff member ${newStaff.first_name} ${newStaff.last_name} with ID ${newStaff.staff_id}`
    });

    return newStaff;
}

export const saveDeclinedStaff = (staffData: Staff) => {
    const declined = getDeclinedStaff();
    saveToStorage(DECLINED_STAFF_KEY, [...declined, staffData]);
};

export const updateStaff = (staffId: string, updatedData: Partial<Staff>, editorId: string): Staff | null => {
    const staffList = getStaff();
    const staffIndex = staffList.findIndex(s => s.staff_id === staffId);
    if(staffIndex === -1) return null;

    staffList[staffIndex] = { ...staffList[staffIndex], ...updatedData };
    saveToStorage(STAFF_KEY, staffList);
    
    // Also update the associated user if name or email changed
    const user = getUserById(staffList[staffIndex].user_id);
    if (user && (user.name !== `${updatedData.first_name} ${updatedData.last_name}` || user.email !== updatedData.email)) {
        updateUser({
            ...user,
            name: `${updatedData.first_name} ${updatedData.last_name}`,
            email: updatedData.email || user.email, // Keep old email if new one is empty
        });
    }
    
    return staffList[staffIndex];
}

export const toggleEmploymentStatus = (staffId: string, editorId: string): Staff | null => {
    const staffList = getStaff();
    const staffIndex = staffList.findIndex(s => s.staff_id === staffId);
    if(staffIndex === -1) return null;

    const currentStatus = staffList[staffIndex].status;
    const newStatus: EmploymentStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    staffList[staffIndex].status = newStatus;
    
    saveToStorage(STAFF_KEY, staffList);

    // Also toggle the user account status
    const user = getUserById(staffList[staffIndex].user_id);
    if (user) {
        toggleUserStatus(user.id);
    }

    addAuditLog({
        user: getUserById(editorId)?.email || 'Unknown',
        name: getUserById(editorId)?.name || 'Unknown',
        action: 'Toggle Staff Status',
        details: `Changed status for ${staffList[staffIndex].first_name} to ${newStatus}`
    });
    
    return staffList[staffIndex];
}

export const addStaffAcademicHistory = (history: StaffAcademicHistory): void => {
    const historyList = storeGetStaffAcademicHistory();
    saveToStorage(STAFF_ACADEMIC_HISTORY_KEY, [...historyList, history]);
};

export const addStaffDocument = (doc: StaffDocument): void => {
    const docs = getStaffDocuments();
    saveToStorage(STAFF_DOCUMENTS_KEY, [...docs, doc]);
};

export const deleteStaffDocument = (staffId: string, docName: string): boolean => {
    let docs = getStaffDocuments();
    const initialLength = docs.length;
    docs = docs.filter(d => !(d.staff_id === staffId && d.document_name === docName));
    if (docs.length < initialLength) {
        saveToStorage(STAFF_DOCUMENTS_KEY, docs);
        return true;
    }
    return false;
};

export const addStaffAppointmentHistory = (history: StaffAppointmentHistory): void => {
    const historyList = getStaffAppointmentHistory();
    // In a real DB, you'd likely just add. Here, we might replace if one already exists for the same date for simplicity.
    const existingIndex = historyList.findIndex(h => h.staff_id === history.staff_id && h.appointment_date === history.appointment_date);
    if (existingIndex > -1) {
        historyList[existingIndex] = history;
    } else {
        historyList.push(history);
    }
    saveToStorage(STAFF_APPOINTMENT_HISTORY_KEY, historyList);
};

export const deleteStaff = (staffId: string, editorId: string): boolean => {
    const staffList = getStaff();
    const staffToDelete = staffList.find(s => s.staff_id === staffId);
    if (!staffToDelete) return false;

    // Delete user account
    deleteUser(staffToDelete.user_id);
    
    // Delete staff record
    const updatedStaffList = staffList.filter(s => s.staff_id !== staffId);
    saveToStorage(STAFF_KEY, updatedStaffList);
    
    // Delete related data
    const appointments = getStaffAppointmentHistory().filter(a => a.staff_id !== staffId);
    saveToStorage(STAFF_APPOINTMENT_HISTORY_KEY, appointments);

    const academicHistory = storeGetStaffAcademicHistory().filter(h => h.staff_id !== staffId);
    saveToStorage(STAFF_ACADEMIC_HISTORY_KEY, academicHistory);
    
    // ... and so on for other related data (documents, attendance, etc.)
     addAuditLog({
        user: getUserById(editorId)?.email || 'Unknown',
        name: getUserById(editorId)?.name || 'Unknown',
        action: 'Delete Staff',
        details: `Deleted staff member ${staffToDelete.first_name} ${staffToDelete.last_name}`
    });

    return true;
};

export const bulkDeleteStaff = (staffIds: string[], editorId: string): number => {
    let deletedCount = 0;
    staffIds.forEach(id => {
        if(deleteStaff(id, editorId)) {
            deletedCount++;
        }
    });
    return deletedCount;
};


// Subject Management Functions
export const getSubjects = (): Subject[] => getFromStorage<Subject[]>(SUBJECTS_KEY, []);

export const addSubject = (subjectName: string): void => {
    const subjects = getSubjects();
    const newSubject: Subject = {
        id: `SUB${subjects.length + 1}`,
        name: subjectName
    };
    saveToStorage(SUBJECTS_KEY, [...subjects, newSubject]);
};

export const deleteSubject = (subjectId: string): void => {
    let subjects = getSubjects();
    subjects = subjects.filter(s => s.id !== subjectId);
    saveToStorage(SUBJECTS_KEY, subjects);

    let classSubjects = addClassSubject();
    classSubjects = classSubjects.filter(cs => cs.subject_id !== subjectId);
    saveToStorage(CLASS_SUBJECTS_KEY, classSubjects);
};

export const addClassSubject = (): ClassSubject[] => getFromStorage<ClassSubject[]>(CLASS_SUBJECTS_KEY, []);
export const saveClassSubjects = (assignments: ClassSubject[]): void => saveToStorage(CLASS_SUBJECTS_KEY, assignments);

export const addTeacherSubject = (teacherId: string, subjectId: string): void => {
    const assignments = getFromStorage<TeacherSubject[]>(TEACHER_SUBJECTS_KEY, []);
    assignments.push({ staff_id: teacherId, subject_id: subjectId });
    saveToStorage(TEACHER_SUBJECTS_KEY, assignments);
};

export const addScore = (score: AssignmentScore, editorId: string): void => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === score.student_id);

    if (studentIndex !== -1) {
        if (!profiles[studentIndex].assignmentScores) {
            profiles[studentIndex].assignmentScores = [];
        }

        const scoreIndex = profiles[studentIndex].assignmentScores!.findIndex(s => 
            s.subject_id === score.subject_id && s.assignment_name === score.assignment_name
        );
        
        if(scoreIndex !== -1) {
            profiles[studentIndex].assignmentScores![scoreIndex] = score;
        } else {
            profiles[studentIndex].assignmentScores!.push(score);
        }

        saveToStorage(STUDENTS_KEY, profiles);
    }
}

export const updateAssignmentScore = (studentId: string, subjectId: string, assignmentName: string, newScore: number, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if(studentIndex === -1) return null;

    const student = profiles[studentIndex];
    if (!student.assignmentScores) return student;

    const scoreIndex = student.assignmentScores.findIndex(s => s.subject_id === subjectId && s.assignment_name === assignmentName);
    if(scoreIndex !== -1) {
        student.assignmentScores[scoreIndex].score = newScore;
    }

    profiles[studentIndex] = student;
    saveToStorage(STUDENTS_KEY, profiles);
    return student;
};

export const deleteAssignmentScore = (studentId: string, subjectId: string, assignmentName: string, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if(studentIndex === -1) return null;

    const student = profiles[studentIndex];
    if (student.assignmentScores) {
        student.assignmentScores = student.assignmentScores.filter(s => !(s.subject_id === subjectId && s.assignment_name === assignmentName));
    }

    profiles[studentIndex] = student;
    saveToStorage(STUDENTS_KEY, profiles);
    return student;
};

export const deleteAllAssignmentScores = (studentId: string, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if(studentIndex === -1) return null;

    profiles[studentIndex].assignmentScores = [];
    saveToStorage(STUDENTS_KEY, profiles);
    return profiles[studentIndex];
}

export const getScoresForClass = (classId: string): AssignmentScore[] => {
    const profiles = getStudentProfilesFromStorage().filter(p => p.admissionDetails.class_assigned === classId);
    return profiles.flatMap(p => p.assignmentScores || []);
}


// --- Student Management ---
// This is the internal function that reads from localStorage
const getStudentProfilesFromStorage = (): StudentProfile[] => getFromStorage<StudentProfile[]>(STUDENTS_KEY, []);

export type StudentAPIResponse = {
    students: StudentProfile[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

// Helper to fetch all pages from a paginated API endpoint
async function fetchAllPages(url: URL, token: string): Promise<StudentProfile[]> {
    let allStudents: StudentProfile[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
        url.searchParams.set('page', String(currentPage));
        url.searchParams.set('limit', '100'); // Use a reasonable page size
        const apiUrl = url.pathname + url.search;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch page ${currentPage}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && Array.isArray(result.data.students)) {
            allStudents.push(...result.data.students);
            totalPages = result.data.pagination.pages;
            currentPage++;
        } else {
            throw new Error(`API response for page ${currentPage} was not successful or malformed.`);
        }
    }
    return allStudents;
}


export async function getStudentProfiles(page = 1, limit = 10, search = ''): Promise<StudentAPIResponse> {
    const url = new URL(window.location.origin + "/api/students");
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    if (search) {
        url.searchParams.append('search', search);
    }
    
    if (typeof window === 'undefined') {
        return { students: [], pagination: { total: 0, page: 1, limit, pages: 1 } };
    }

    const token = localStorage.getItem('campusconnect_token');

    if (!token) {
        console.error("Auth token is missing. Cannot fetch students.");
        // Fallback to local storage if API call is not possible
        const allStudents = getStudentProfilesFromStorage();
        const total = allStudents.length;
        const pages = Math.ceil(total / limit);
        const paginatedStudents = allStudents.slice((page - 1) * limit, page * limit);
        return { students: paginatedStudents, pagination: { total, page, limit, pages } };
    }

    try {
        // If a large limit is requested, it means we need all students.
        if (limit > 100) {
            const allStudents = await fetchAllPages(url, token);
            const transformedProfiles = allStudents.map((apiStudent: any): StudentProfile => {
                const guardian = apiStudent.guardians?.find((g: any) => g.guardian_relationship === 'father' || g.guardian_relationship === 'mother' || g.guardian_relationship) || apiStudent.guardians?.[0] || {};
                const father = apiStudent.guardians?.find((g: any) => g.guardian_relationship === 'father') || {};
                const mother = apiStudent.guardians?.find((g: any) => g.guardian_relationship === 'mother') || {};
                return {
                    student: {
                        student_no: apiStudent.student_no, first_name: apiStudent.first_name, last_name: apiStudent.last_name, other_name: apiStudent.other_name, dob: apiStudent.dob, gender: apiStudent.gender, created_at: new Date().toISOString(), created_by: apiStudent.created_by, updated_at: new Date().toISOString(), updated_by: apiStudent.created_by, avatarUrl: `https://picsum.photos/seed/${apiStudent.student_no}/200/200`,
                    },
                    contactDetails: {
                        student_no: apiStudent.student_no, email: apiStudent.email, phone: apiStudent.phone, country: apiStudent.country_id, city: apiStudent.city, hometown: apiStudent.hometown, residence: apiStudent.residence, house_no: apiStudent.house_no, gps_no: apiStudent.gps_no,
                    },
                    guardianInfo: {
                        student_no: apiStudent.student_no, guardian_name: guardian.guardian_name, guardian_phone: guardian.guardian_phone, guardian_email: guardian.guardian_email, guardian_relationship: guardian.guardian_relationship, father_name: father.guardian_name, father_phone: father.guardian_phone, mother_name: mother.guardian_name, mother_phone: mother.guardian_phone,
                    },
                    emergencyContact: {
                        student_no: apiStudent.student_no, emergency_name: apiStudent.emergency_contact?.emergency_name, emergency_phone: apiStudent.emergency_contact?.emergency_phone, emergency_relationship: apiStudent.emergency_contact?.emergency_relationship,
                    },
                    admissionDetails: {
                        student_no: apiStudent.student_no, admission_no: apiStudent.admission_no, enrollment_date: apiStudent.enrollment_date, class_assigned: apiStudent.class_assigned, admission_status: apiStudent.admission_status === 'Active' ? 'Admitted' : apiStudent.admission_status,
                    },
                };
            });
            return {
                students: transformedProfiles,
                pagination: { total: allStudents.length, page: 1, limit: allStudents.length, pages: 1 },
            };
        }


        // Regular paginated request
        const apiUrl = url.pathname + url.search;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`,
                 'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch students:", response.statusText, "Using fallback.");
            const allStudents = getStudentProfilesFromStorage();
            const total = allStudents.length;
            const pages = Math.ceil(total / limit);
            const paginatedStudents = allStudents.slice((page - 1) * limit, page * limit);
            return { students: paginatedStudents, pagination: { total, page, limit, pages } };
        }
        
        const result = await response.json();
        
        if (result.success && result.data && Array.isArray(result.data.students)) {
            const transformedProfiles = result.data.students.map((apiStudent: any): StudentProfile => {
                 const guardian = apiStudent.guardians?.find((g: any) => g.guardian_relationship === 'father' || g.guardian_relationship === 'mother' || g.guardian_relationship) || apiStudent.guardians?.[0] || {};
                 const father = apiStudent.guardians?.find((g: any) => g.guardian_relationship === 'father') || {};
                 const mother = apiStudent.guardians?.find((g: any) => g.guardian_relationship === 'mother') || {};
                
                return {
                    student: {
                        student_no: apiStudent.student_no,
                        first_name: apiStudent.first_name,
                        last_name: apiStudent.last_name,
                        other_name: apiStudent.other_name,
                        dob: apiStudent.dob,
                        gender: apiStudent.gender,
                        created_at: new Date().toISOString(),
                        created_by: apiStudent.created_by,
                        updated_at: new Date().toISOString(),
                        updated_by: apiStudent.created_by,
                        avatarUrl: `https://picsum.photos/seed/${apiStudent.student_no}/200/200`,
                    },
                    contactDetails: {
                        student_no: apiStudent.student_no,
                        email: apiStudent.email,
                        phone: apiStudent.phone,
                        country: apiStudent.country_id,
                        city: apiStudent.city,
                        hometown: apiStudent.hometown,
                        residence: apiStudent.residence,
                        house_no: apiStudent.house_no,
                        gps_no: apiStudent.gps_no,
                    },
                    guardianInfo: {
                        student_no: apiStudent.student_no,
                        guardian_name: guardian.guardian_name,
                        guardian_phone: guardian.guardian_phone,
                        guardian_email: guardian.guardian_email,
                        guardian_relationship: guardian.guardian_relationship,
                        father_name: father.guardian_name,
                        father_phone: father.guardian_phone,
                        mother_name: mother.guardian_name,
                        mother_phone: mother.guardian_phone,
                    },
                    emergencyContact: {
                        student_no: apiStudent.student_no,
                        emergency_name: apiStudent.emergency_contact?.emergency_name,
                        emergency_phone: apiStudent.emergency_contact?.emergency_phone,
                        emergency_relationship: apiStudent.emergency_contact?.emergency_relationship,
                    },
                    admissionDetails: {
                        student_no: apiStudent.student_no,
                        admission_no: apiStudent.admission_no,
                        enrollment_date: apiStudent.enrollment_date,
                        class_assigned: apiStudent.class_assigned,
                        admission_status: apiStudent.admission_status === 'Active' ? 'Admitted' : apiStudent.admission_status,
                    },
                };
            });
            // Don't save to localStorage, as it's now just a paginated view
            return {
                students: transformedProfiles,
                pagination: result.data.pagination,
            };
        } else {
            console.error("API response for students was not successful or malformed.");
            const allStudents = getStudentProfilesFromStorage();
            const total = allStudents.length;
            const pages = Math.ceil(total / limit);
            const paginatedStudents = allStudents.slice((page - 1) * limit, page * limit);
            return { students: paginatedStudents, pagination: { total, page, limit, pages } };
        }

    } catch (error) {
        console.error("Error fetching students from API:", error);
        const allStudents = getStudentProfilesFromStorage();
        const total = allStudents.length;
        const pages = Math.ceil(total / limit);
        const paginatedStudents = allStudents.slice((page - 1) * limit, page * limit);
        return { students: paginatedStudents, pagination: { total, page, limit, pages } };
    }
}

export async function getStudentProfileById(studentId: string): Promise<StudentProfile | null> {
    const apiUrl = `/api/students/show`;

    if (typeof window === 'undefined') {
        return null;
    }

    const token = localStorage.getItem('campusconnect_token');

    if (!token) {
        console.error("Auth token is missing. Cannot fetch student profile.");
        // Fallback to local storage
        return getStudentProfilesFromStorage().find(p => p.student.student_no === studentId) || null;
    }
     try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
            },
            body: JSON.stringify({ student_no: studentId })
        });

        if (!response.ok) {
            console.error("Failed to fetch student profile:", response.statusText, "Using fallback.");
            return getStudentProfilesFromStorage().find(p => p.student.student_no === studentId) || null;
        }

        const result = await response.json();

        if (result.success && result.data) {
            const apiStudent = result.data;
            const guardian = apiStudent.guardians?.find((g: any) => g.guardian_relationship) || apiStudent.guardians?.[0] || {};
            const father = apiStudent.guardians?.find((g: any) => g.guardian_relationship === 'father') || {};
            const mother = apiStudent.guardians?.find((g: any) => g.guardian_relationship === 'mother') || {};
            
            const profile: StudentProfile = {
                student: {
                    student_no: apiStudent.student_info.student_no,
                    first_name: apiStudent.student_info.first_name,
                    last_name: apiStudent.student_info.last_name,
                    other_name: apiStudent.student_info.other_name,
                    dob: apiStudent.student_info.dob,
                    gender: apiStudent.student_info.gender,
                    created_at: apiStudent.student_info.created_at,
                    created_by: apiStudent.student_info.created_by,
                    updated_at: apiStudent.student_info.updated_at,
                    updated_by: apiStudent.student_info.created_by,
                    avatarUrl: `https://picsum.photos/seed/${apiStudent.student_info.student_no}/200/200`,
                },
                contactDetails: {
                    student_no: apiStudent.student_info.student_no,
                    email: apiStudent.contact_address.email,
                    phone: apiStudent.contact_address.phone,
                    country: apiStudent.contact_address.country_id,
                    city: apiStudent.contact_address.city,
                    hometown: apiStudent.contact_address.hometown,
                    residence: apiStudent.contact_address.residence,
                    house_no: apiStudent.contact_address.house_no,
                    gps_no: apiStudent.contact_address.gps_no,
                },
                guardianInfo: {
                    student_no: apiStudent.student_info.student_no,
                    guardian_name: guardian.guardian_name,
                    guardian_phone: guardian.guardian_phone,
                    guardian_email: guardian.guardian_email,
                    guardian_relationship: guardian.guardian_relationship,
                    father_name: father.guardian_name,
                    father_phone: father.guardian_phone,
                    mother_name: mother.guardian_name,
                    mother_phone: mother.guardian_phone,
                },
                emergencyContact: {
                    student_no: apiStudent.student_info.student_no,
                    emergency_name: apiStudent.emergency_contact?.emergency_name,
                    emergency_phone: apiStudent.emergency_contact?.emergency_phone,
                    emergency_relationship: apiStudent.emergency_contact?.emergency_relationship,
                },
                admissionDetails: {
                    student_no: apiStudent.student_info.student_no,
                    admission_no: apiStudent.admission_info.admission_no,
                    enrollment_date: apiStudent.admission_info.enrollment_date,
                    class_assigned: apiStudent.admission_info.class_assigned,
                    admission_status: apiStudent.admission_info.admission_status === 'Active' ? 'Admitted' : apiStudent.admission_info.admission_status,
                },
                financialDetails: {
                    account_balance: apiStudent.payment_history?.reduce((acc: number, p: any) => acc + p.amount_paid - p.total_fees, 0) || 0,
                    payment_history: apiStudent.payment_history || [],
                },
                attendanceRecords: apiStudent.attendance_history || [],
                uploadedDocuments: apiStudent.uploaded_documents || [],
            };
            return profile;
        } else {
            console.error("API response for student profile was not successful or malformed.");
            return getStudentProfilesFromStorage().find(p => p.student.student_no === studentId) || null;
        }
    } catch (error) {
        console.error("Error fetching student profile from API:", error);
        return getStudentProfilesFromStorage().find(p => p.student.student_no === studentId) || null;
    }
}

export const getClasses = (): Class[] => getFromStorage<Class[]>(CLASSES_KEY, []);

export const addStudentProfile = (profileData: Omit<StudentProfile, 'student.student_no' | 'contactDetails.student_no' | 'guardianInfo.student_no' | 'emergencyContact.student_no' | 'admissionDetails.student_no' | 'admissionDetails.admission_no' | 'student.avatarUrl'>, creatorId: string, classes?: Class[]): StudentProfile => {
    const profiles = getStudentProfilesFromStorage();
    
    // Generate student_no and admission_no
    const admissionYear = new Date(profileData.admissionDetails.enrollment_date).getFullYear();
    const studentsInYear = profiles.filter(p => new Date(p.admissionDetails.enrollment_date).getFullYear() === admissionYear);
    const nextInYear = studentsInYear.length + 1;
    const yearYY = admissionYear.toString().slice(-2);
    const nextNumberPadded = nextInYear.toString().padStart(3, '0');
    
    const studentNo = `WR-TK001-LBA${yearYY}${nextNumberPadded}`;
    const admissionNo = `ADM${yearYY}${nextNumberPadded}`;
    
    const className = classes?.find(c => c.id === profileData.admissionDetails.class_assigned)?.name || '';
    const avatarSeed = `${profileData.student.first_name}${className}`.replace(/\s/g, '');

    const newProfile: StudentProfile = {
        student: {
            ...profileData.student,
            student_no: studentNo,
            avatarUrl: `https://picsum.photos/seed/${avatarSeed}/200/200`,
            created_at: new Date().toISOString(),
            created_by: creatorId,
            updated_at: new Date().toISOString(),
            updated_by: creatorId,
        },
        contactDetails: { ...profileData.contactDetails, student_no: studentNo },
        guardianInfo: { ...profileData.guardianInfo, student_no: studentNo },
        emergencyContact: { ...profileData.emergencyContact, student_no: studentNo },
        admissionDetails: {
            ...profileData.admissionDetails,
            student_no: studentNo,
            admission_no: admissionNo,
        }
    };

    saveToStorage(STUDENTS_KEY, [...profiles, newProfile]);
    return newProfile;
};

export const updateStudentProfile = (studentId: string, updatedData: Partial<StudentProfile>, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);

    if (studentIndex === -1) {
        return null;
    }

    const currentProfile = profiles[studentIndex];

    const newProfile: StudentProfile = {
        ...currentProfile,
        ...updatedData,
        student: { ...currentProfile.student, ...updatedData.student, updated_at: new Date().toISOString(), updated_by: editorId },
        contactDetails: { ...currentProfile.contactDetails, ...updatedData.contactDetails, student_no: studentId },
        guardianInfo: { ...currentProfile.guardianInfo, ...updatedData.guardianInfo, student_no: studentId },
        emergencyContact: { ...currentProfile.emergencyContact, ...updatedData.emergencyContact, student_no: studentId },
        admissionDetails: { ...currentProfile.admissionDetails, ...updatedData.admissionDetails, student_no: studentId }
    };
    
    profiles[studentIndex] = newProfile;
    saveToStorage(STUDENTS_KEY, profiles);
    return newProfile;
};

export const updateStudentStatus = (studentId: string, status: AdmissionStatus, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (studentIndex === -1) return null;
    
    profiles[studentIndex].admissionDetails.admission_status = status;
    saveToStorage(STUDENTS_KEY, profiles);
    return profiles[studentIndex];
};

export const promoteStudents = (studentIds: string[], toClassId: string, editorId: string): number => {
    const profiles = getStudentProfilesFromStorage();
    let updatedCount = 0;
    studentIds.forEach(id => {
        const index = profiles.findIndex(p => p.student.student_no === id);
        if (index > -1) {
            profiles[index].admissionDetails.class_assigned = toClassId;
            updatedCount++;
        }
    });
    saveToStorage(STUDENTS_KEY, profiles);
    return updatedCount;
};

export const graduateStudents = (studentIds: string[], editorId: string): number => {
     const profiles = getStudentProfilesFromStorage();
    let updatedCount = 0;
    studentIds.forEach(id => {
        const index = profiles.findIndex(p => p.student.student_no === id);
        if (index > -1) {
            profiles[index].admissionDetails.admission_status = 'Graduated';
            updatedCount++;
        }
    });
    saveToStorage(STUDENTS_KEY, profiles);
    return updatedCount;
}

export const deleteStudentProfile = (studentId: string): boolean => {
    const profiles = getStudentProfilesFromStorage();
    const updatedProfiles = profiles.filter(p => p.student.student_no !== studentId);
    if (profiles.length === updatedProfiles.length) return false;
    saveToStorage(STUDENTS_KEY, updatedProfiles);
    return true;
}

// Student Profile sub-record functions
export const addAcademicRecord = (studentId: string, record: AcademicRecord, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (studentIndex === -1) return null;

    if (!profiles[studentIndex].academicRecords) {
        profiles[studentIndex].academicRecords = [];
    }
    profiles[studentIndex].academicRecords!.push(record);
    saveToStorage(STUDENTS_KEY, profiles);
    return profiles[studentIndex];
}

export const addDisciplinaryRecord = (studentId: string, record: DisciplinaryRecord, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (studentIndex === -1) return null;

    if (!profiles[studentIndex].disciplinaryRecords) {
        profiles[studentIndex].disciplinaryRecords = [];
    }
    profiles[studentIndex].disciplinaryRecords!.push(record);
    saveToStorage(STUDENTS_KEY, profiles);
    return profiles[studentIndex];
}

export const addCommunicationLog = (studentId: string, log: CommunicationLog, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (studentIndex === -1) return null;

    if (!profiles[studentIndex].communicationLogs) {
        profiles[studentIndex].communicationLogs = [];
    }
    profiles[studentIndex].communicationLogs!.push(log);
    saveToStorage(STUDENTS_KEY, profiles);
    return profiles[studentIndex];
}

export const addUploadedDocument = (studentId: string, doc: UploadedDocument, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (studentIndex === -1) return null;

    if (!profiles[studentIndex].uploadedDocuments) {
        profiles[studentIndex].uploadedDocuments = [];
    }
    profiles[studentIndex].uploadedDocuments!.push(doc);
    saveToStorage(STUDENTS_KEY, profiles);
    return profiles[studentIndex];
}

export const deleteUploadedDocument = (studentId: string, documentId: string, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (studentIndex === -1) return null;

    if (profiles[studentIndex].uploadedDocuments) {
        profiles[studentIndex].uploadedDocuments = profiles[studentIndex].uploadedDocuments!.filter(d => d.uploaded_at !== documentId);
    }
    
    saveToStorage(STUDENTS_KEY, profiles);
    return profiles[studentIndex];
}


export const updateHealthRecords = (studentId: string, records: HealthRecords, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (studentIndex === -1) return null;

    profiles[studentIndex].healthRecords = records;
    saveToStorage(STUDENTS_KEY, profiles);
    return profiles[studentIndex];
}



// --- User & Role Management ---

export const getUsers = (): User[] => {
  const users = getFromStorage<UserStorage[]>(USERS_KEY, []);
  const roles = getRoles();
  return users.map((user) => {
    const role = roles.find((r) => r.id === user.role_id);
    return {
      ...user,
      role: role?.name || 'Guest',
    };
  });
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find((user) => user.id === id) || null;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const addUser = (userData: Omit<User, 'id' | 'avatarUrl' | 'created_at' | 'updated_at' | 'username' | 'is_super_admin' | 'role_id' | 'password' | 'status'> & { role: User['role'], password?: string, entityId?: string }): User => {
    const users = getFromStorage<UserStorage[]>(USERS_KEY, []);
    const roles = getRoles();
    const now = new Date().toISOString();

    const roleId = roles.find(r => r.name === userData.role)?.id;
    if (!roleId) {
        throw new Error(`Role "${userData.role}" not found.`);
    }
    
    const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
        throw new Error("A user with this email already exists.");
    }
    
    const username = userData.email.split('@')[0];
    const avatarSeed = username.replace(/[^a-zA-Z0-9]/g, '');

    const newUser: UserStorage = {
        id: (users.length + 1).toString(),
        name: userData.name,
        username,
        email: userData.email,
        password: userData.password || 'password', // Default password
        role_id: roleId,
        is_super_admin: userData.role === 'Admin',
        avatarUrl: `https://picsum.photos/seed/${avatarSeed}/40/40`,
        status: 'active',
        created_at: now,
        updated_at: now,
        signature: userData.signature,
    };
    saveToStorage(USERS_KEY, [...users, newUser]);

    if (userData.entityId && userData.role !== 'Student' && userData.role !== 'Parent') {
        const staff = getStaff();
        const staffIndex = staff.findIndex(s => s.staff_id === userData.entityId);
        if (staffIndex !== -1) {
            staff[staffIndex].user_id = newUser.id;
            saveToStorage(STAFF_KEY, staff);
        }
    }
    
    return { ...newUser, role: userData.role };
};

export const updateUser = (updatedUser: User): User => {
  const users = getFromStorage<UserStorage[]>(USERS_KEY, []);
  const roles = getRoles();

  const userIndex = users.findIndex((u) => u.id === updatedUser.id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const roleId = roles.find(r => r.name === updatedUser.role)?.id;

  const userToSave: UserStorage = {
    ...users[userIndex],
    name: updatedUser.name,
    email: updatedUser.email,
    role_id: roleId || users[userIndex].role_id,
    updated_at: new Date().toISOString(),
    signature: updatedUser.signature,
  };

  users[userIndex] = userToSave;
  saveToStorage(USERS_KEY, users);
  
  return { ...userToSave, role: updatedUser.role };
};

export const deleteUser = (userId: string): boolean => {
    const users = getFromStorage<UserStorage[]>(USERS_KEY, []);
    const updatedUsers = users.filter(u => u.id !== userId);
    if (users.length === updatedUsers.length) return false;
    saveToStorage(USERS_KEY, updatedUsers);
    return true;
}

export const bulkDeleteUsers = (userIds: string[]): number => {
    let users = getFromStorage<UserStorage[]>(USERS_KEY, []);
    const initialLength = users.length;
    users = users.filter(u => !userIds.includes(u.id));
    saveToStorage(USERS_KEY, users);
    return initialLength - users.length;
}


export const toggleUserStatus = (userId: string): User | null => {
    const users = getFromStorage<UserStorage[]>(USERS_KEY, []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    users[userIndex].status = users[userIndex].status === 'active' ? 'frozen' : 'active';
    users[userIndex].updated_at = new Date().toISOString();
    
    saveToStorage(USERS_KEY, users);
    return getUserById(userId);
}

export const changePassword = (userId: string, currentPass: string, newPass: string): boolean => {
    const users = getFromStorage<UserStorage[]>(USERS_KEY, []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    
    if (users[userIndex].password !== currentPass) return false;

    users[userIndex].password = newPass;
    saveToStorage(USERS_KEY, users);
    return true;
}

export const resetPassword = (userId: string, newPassword: string): boolean => {
    const users = getFromStorage<UserStorage[]>(USERS_KEY, []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    
    users[userIndex].password = newPassword;
    saveToStorage(USERS_KEY, users);
    return true;
}


export const getRoles = (): RoleStorage[] => getFromStorage(ROLES_KEY, []);

// --- Logging ---

export const getAuditLogs = (): AuditLog[] => {
    const logs = getFromStorage<AuditLog[]>(LOGS_KEY, []);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    clientInfo: navigator.userAgent,
    ...log,
  };
  saveToStorage(LOGS_KEY, [newLog, ...logs]);
};

export const deleteAuditLog = (logId: string): boolean => {
    let logs = getAuditLogs();
    const initialLength = logs.length;
    logs = logs.filter(l => l.id !== logId);
    saveToStorage(LOGS_KEY, logs);
    return logs.length < initialLength;
};

export const bulkDeleteAuditLogs = (logIds: string[]): number => {
    let logs = getAuditLogs();
    const initialLength = logs.length;
    logs = logs.filter(l => !logIds.includes(l.id));
    saveToStorage(LOGS_KEY, logs);
    return initialLength - logs.length;
}

export const deleteAllAuditLogs = () => {
    saveToStorage(LOGS_KEY, []);
}


export const getAuthLogs = (): AuthLog[] => {
    const logs = getFromStorage<AuthLog[]>(AUTH_LOGS_KEY, []);
    return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addAuthLog = (log: Omit<AuthLog, 'id' | 'timestamp'>) => {
  const logs = getAuthLogs();
  const newLog: AuthLog = {
    id: `authlog_${Date.now()}`,
    timestamp: new Date().toISOString(),
    clientInfo: navigator.userAgent,
    ...log,
  };
  saveToStorage(AUTH_LOGS_KEY, [newLog, ...logs]);
};

export const deleteAuthLog = (logId: string): boolean => {
    let logs = getAuthLogs();
    const initialLength = logs.length;
    logs = logs.filter(l => l.id !== logId);
    saveToStorage(AUTH_LOGS_KEY, logs);
    return logs.length < initialLength;
};

export const bulkDeleteAuthLogs = (logIds: string[]): number => {
    let logs = getAuthLogs();
    const initialLength = logs.length;
    logs = logs.filter(l => !logIds.includes(l.id));
    saveToStorage(AUTH_LOGS_KEY, logs);
    return initialLength - logs.length;
}

export const deleteAllAuthLogs = () => {
    saveToStorage(AUTH_LOGS_KEY, []);
}

// Library Management
export const getBooks = (): Book[] => getFromStorage<Book[]>(BOOKS_KEY, []);
export const saveBooks = (books: Book[]): void => saveToStorage(BOOKS_KEY, books);
export const getBorrowingRecords = (): BorrowingRecord[] => getFromStorage<BorrowingRecord[]>(BORROWING_KEY, []);
export const saveBorrowingRecords = (records: BorrowingRecord[]): void => saveToStorage(BORROWING_KEY, records);
