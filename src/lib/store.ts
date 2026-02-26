'use client';

import { v4 as uuidv4 } from 'uuid';

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
    AcademicYearStatus,
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
    ApiResponse,
    ClassApiResponse,
    SubjectApiResponse,
    TeacherSubjectApiResponse,
    StudentFeeApiResponse,
    ClassSubjectAssignment,
    StudentActivityScore,
    StudentSummaryScore,
    StudentSubjectReport
} from './types';
import { format } from 'date-fns';
import initialStaffProfiles from './initial-staff-profiles.json';
import { SchoolProfileData } from '@/components/settings/school-profile-settings';
import { FullSchedule } from '@/components/academics/timetable/timetable-scheduler';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URI || 'http://localhost:9002/api/v1';

const getApiHeaders = (additionalHeaders: HeadersInit = {}): HeadersInit => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = typeof window !== 'undefined' ? localStorage.getItem('csrf_token') || '' : '';

    return {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        'X-CSRF-TOKEN': csrfToken,
        ...additionalHeaders,
    };
};

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
    class_position?: number;
    class_size?: number;
};


const USERS_KEY = 'campusconnect_users';
const ROLES_KEY = 'campusconnect_roles';
const LOGS_KEY = 'campusconnect_logs';
const AUTH_LOGS_KEY = 'campusconnect_auth_logs';
const STUDENTS_KEY = 'campusconnect_students';
const CLASSES_KEY = 'campusconnect_classes';
const CLASS_SUBJECT_ASSIGNMENTS_KEY = 'campusconnect_class_subject_assignments';
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
const CLASS_SUBJECTS_KEY = CLASS_SUBJECT_ASSIGNMENTS_KEY;
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
        { id: 'kg1', name: 'Kindergarten 1' },
        { id: 'kg2', name: 'Kindergarten 2' },
        { id: 'b1', name: 'Basic 1' },
        { id: 'b2', name: 'Basic 2' },
        { id: 'b3', name: 'Basic 3' },
        { id: 'b4', name: 'Basic 4' },
        { id: 'b5', name: 'Basic 5' },
        { id: 'b6', name: 'Basic 6' },
        { id: 'jhs1', name: 'Junior High School 1' },
        { id: 'jhs2', name: 'Junior High School 2' },
        { id: 'jhs3', name: 'Junior High School 3' },
        { id: 'cre', name: 'Creche' },
    ];
};

const getInitialSubjects = (): Subject[] => {
    const subjectNames = [
        'English Language', 'Mathematics', 'Science', 'History', 'Our World Our People',
        'Religious & Moral Education', 'Physical Education', 'Computing', 'French',
        'Numeracy', 'Language & Literacy', 'Creative Art', 'Social Studies',
        'Basic Design and Technology', 'Ghanaian Language & Culture',
        'Information and Communications Technology', 'Fante', 'Asante Twi',
        'Akwapim Twi', 'Dagomba', 'Ewe', 'Arabic', 'Business Studies', 'Career Technology',
        'Environmental Studies', 'General Agriculture', 'General Knowledge in Art',
        'Home Economics', 'Integrated Science', 'Personal and Social Development',
        'Visual Arts', 'Creative Arts' // Added 'Creative Arts' as per API response
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
        if (item === 'undefined' || item === null) return defaultValue;
        return JSON.parse(item);
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
            //console.log("Initializing local storage with default data...");
            const roles = getInitialRoles();
            saveToStorage(ROLES_KEY, roles);
            saveToStorage(USERS_KEY, getInitialUsers(roles));
            saveToStorage(LOGS_KEY, []);
            saveToStorage(AUTH_LOGS_KEY, []);
            saveToStorage(STUDENTS_KEY, []); // Start with an empty student list
            saveToStorage(STUDENT_REPORTS_KEY, []);
            // Fetch classes and subjects from API on initialization
            fetchClassesFromApi();
            fetchSubjectsFromApi();
            fetchUsersFromApi();
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

    if (status === 'Not Served') {
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
    const student = allStudentsInClass.find(s => s.student.student_no === studentId);
    if (!student || !student.admissionDetails?.class_assigned) return null;

    const classId = String(student.admissionDetails.class_assigned);
    const allSubjects = getSubjects();
    const classSubjects = getClassesSubjects().filter(cs => String(cs.class_id) === classId).map(cs => allSubjects.find(s => s.id === cs.subject_id)).filter(Boolean) as Subject[];
    const activities = getAssignmentActivities();
    const gradingScheme = getGradingScheme();
    const schoolProfile = getSchoolProfile();
    const SBA_TOTAL_WEIGHT = 50;
    const EXAM_TOTAL_WEIGHT = 50;

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

        const allScoresForSubject = allStudentsInClass
            .filter(s => s && s.admissionDetails?.class_assigned) // Add defensive filter
            .map(s => {
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

    const normalizedTermName = termName.trim().toLowerCase();
    const academicYear = getAcademicYears().find(y => y.terms.some(t => {
        const tVal = `${t.name} ${y.year}`.trim().toLowerCase();
        return tVal === normalizedTermName;
    }));

    if (!academicYear) {
        console.log(`Debug: No academic year found matching term label ${termName}`);
    }

    const termInfo = academicYear?.terms.find(t => {
        const tVal = `${t.name} ${academicYear.year}`.trim().toLowerCase();
        return tVal === normalizedTermName;
    });

    const nextTermIndex = academicYear?.terms.findIndex(t => t.name === termInfo?.name) as number + 1;
    const nextTerm = (nextTermIndex > 0 && nextTermIndex < (academicYear?.terms.length || 0)) ? academicYear?.terms[nextTermIndex] : null;

    console.log(`Debug: Term info found: ${termInfo?.name}, Year: ${academicYear?.year}`);


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
    if (billToDelete.status === 'Approved') {
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
    if (billIndex !== -1) {
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


export const recordPayment = (studentId: string, paymentDetails: { amount: number, method: TermPayment['payments'][0]['method'], receipt_number?: string, paid_by?: string }, editorId: string): StudentProfile | null => {
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
export const getActiveAcademicSession = () => {
    if (typeof window === 'undefined') return null;
    const sessionData = sessionStorage.getItem('campusconnect_session');
    if (!sessionData) return null;
    try {
        const session = JSON.parse(sessionData);
        return {
            year: session.academic_year,
            term: session.academic_term
        };
    } catch (e) {
        console.error("Failed to parse session data from sessionStorage", e);
        return null;
    }
};

export const getAcademicYears = (): AcademicYear[] => getFromStorage<AcademicYear[]>(ACADEMIC_YEARS_KEY, []);

export interface AcademicYearApiResponse extends ApiResponse<AcademicYear[]> { }

export const fetchAcademicYearsFromApi = async (refetch: boolean = false): Promise<AcademicYear[]> => {

    if (typeof window === 'undefined') return [];

    const storedYears = getFromStorage<AcademicYear[]>(ACADEMIC_YEARS_KEY, []);

    const token = localStorage.getItem('campusconnect_token');
    const csrfToken = localStorage.getItem('csrf_token');

    try {
        const response = await fetch('/api/academic/years/list', {
            method: 'GET',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...getApiHeaders({
                    'X-CSRF-TOKEN': csrfToken || '',
                }),
            }),
        });


        if (!response.ok) {
            if (!refetch && storedYears.length > 0) {
                return storedYears;
            }
            throw new Error('Failed to fetch academic years');
        }

        const result = await response.json();

        if (result.success && result.data && Array.isArray(result.data)) {
            const mappedYears: AcademicYear[] = result.data.map((item: any) => ({
                year: item.academic_year.year,
                status: item.academic_year.status as AcademicYearStatus,
                number_of_terms: item.terms?.length || 0,
                terms: (item.terms || []).map((t: any) => ({
                    name: t.term,
                    startDate: t.start_date,
                    endDate: t.end_date,
                    status: t.status as 'Upcoming' | 'Active' | 'Completed',
                    id: t.id,
                    added_by: t.added_by,
                    added_on: t.added_on,
                })),
            }));

            saveToStorage(ACADEMIC_YEARS_KEY, mappedYears);
            return mappedYears;
        }
    } catch (e) {
        console.error("Error fetching academic years", e);
    }
    return getAcademicYears();
};
export const saveAcademicYears = (years: AcademicYear[]): void => saveToStorage(ACADEMIC_YEARS_KEY, years);

// Calendar Events API Integration
export const fetchCalendarEventsFromApi = async (refetch: boolean = false): Promise<CalendarEvent[]> => {
    if (typeof window === 'undefined') return [];

    const storedEvents = getFromStorage<CalendarEvent[]>(CALENDAR_EVENTS_KEY, []);
    const token = localStorage.getItem('campusconnect_token');
    const csrfToken = localStorage.getItem('csrf_token');

    try {
        const response = await fetch('/api/calendar/events/list', {
            method: 'GET',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-CSRF-TOKEN': csrfToken || '',
            }),
        });

        if (!response.ok) {
            if (!refetch && storedEvents.length > 0) return storedEvents;
            console.error('Failed to fetch calendar events', response.status, response.statusText);
            return storedEvents;
        }

        const result = await response.json();
        console.log('fetchCalendarEventsFromApi result:', result);

        if (result.success && Array.isArray(result.data)) {
            // Map API response
            const events: CalendarEvent[] = result.data.map((e: any) => {
                // Map category string to CalendarEventCategory
                let category: CalendarEventCategory = 'Other';
                const apiCategory = (e.category || e.event_type_name || '').toLowerCase();

                if (apiCategory.includes('school')) category = 'School Event';
                else if (apiCategory.includes('exam')) category = 'Exam';
                else if (apiCategory.includes('holiday')) category = 'Holiday';

                return {
                    id: String(e.event_id),
                    title: e.event_title,
                    date: e.event_date,
                    category: category,
                    description: e.description || ''
                };
            });
            saveToStorage(CALENDAR_EVENTS_KEY, events);
            return events;
        }
    } catch (error) {
        console.error('Error fetching calendar events:', error);
    }
    return storedEvents;
};

export const addCalendarEventToApi = async (event: Omit<CalendarEvent, 'id'>, editorId: string): Promise<CalendarEvent | null> => {
    const token = localStorage.getItem('campusconnect_token');
    const csrfToken = localStorage.getItem('csrf_token');

    console.log("Event: ", event);

    const payload = {
        event_title: event.title,
        event_date: event.date,
        event_category: event.category,
        event_description: event.description,
        created_by: editorId
    };

    try {
        const response = await fetch('/api/calendar/events/add', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-CSRF-TOKEN': csrfToken || '',
            }),
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        console.log('addCalendarEventToApi result:', result);

        if (result.success && result.data) {
            const newEvent = result.data;
            // Update local storage optimistically or re-fetch
            const events = getFromStorage<CalendarEvent[]>(CALENDAR_EVENTS_KEY, []);
            saveToStorage(CALENDAR_EVENTS_KEY, [...events, newEvent]);
            return newEvent;
        }
    } catch (error) {
        console.error('Error adding calendar event:', error);
    }
    return null;
};

export const updateCalendarEventInApi = async (eventId: string, updatedData: Partial<Omit<CalendarEvent, 'id'>>, editorId: string): Promise<CalendarEvent | null> => {
    const token = localStorage.getItem('campusconnect_token');
    const csrfToken = localStorage.getItem('csrf_token');

    const payload: any = {
        id: eventId,
        updated_by: editorId
    };

    if (updatedData.title) payload.event_title = updatedData.title;
    if (updatedData.date) payload.event_date = updatedData.date;
    if (updatedData.category) payload.event_category = updatedData.category;
    if (updatedData.description !== undefined) payload.event_description = updatedData.description;

    try {
        const response = await fetch('/api/calendar/events/update', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-CSRF-TOKEN': csrfToken || '',
            }),
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success && result.data) {
            const updatedEvent = result.data;
            // Update local storage
            const events = getFromStorage<CalendarEvent[]>(CALENDAR_EVENTS_KEY, []);
            const updatedEvents = events.map(e => e.id === eventId ? updatedEvent : e);

            saveToStorage(CALENDAR_EVENTS_KEY, updatedEvents);
            return updatedEvent;
        }
    } catch (error) {
        console.error('Error updating calendar event:', error);
    }
    return null;
};

export const deleteCalendarEventFromApi = async (eventId: string, editorId: string): Promise<boolean> => {
    const token = localStorage.getItem('campusconnect_token');
    const csrfToken = localStorage.getItem('csrf_token');

    try {
        const response = await fetch('/api/calendar/events/delete', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-CSRF-TOKEN': csrfToken || '',
            }),
            body: JSON.stringify({ id: eventId, deleted_by: editorId }),
        });

        const result = await response.json();

        if (result.success) {
            // Update local storage
            const events = getFromStorage<CalendarEvent[]>(CALENDAR_EVENTS_KEY, []);
            const updatedEvents = events.filter(e => e.id !== eventId);
            saveToStorage(CALENDAR_EVENTS_KEY, updatedEvents);
            return true;
        }
    } catch (error) {
        console.error('Error deleting calendar event:', error);
    }
    return false;
};

export const getCalendarEvents = (): CalendarEvent[] => getFromStorage<CalendarEvent[]>(CALENDAR_EVENTS_KEY, []);

// Deprecated or Local-Only Fallbacks (kept for now, but API functions should be preferred)
export const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>, editorId: string): CalendarEvent => {
    // ... existing logic ...
    const events = getCalendarEvents();
    const newEvent: CalendarEvent = {
        ...event,
        id: `event-${Date.now()}`
    };
    saveToStorage(CALENDAR_EVENTS_KEY, [...events, newEvent]);
    // Audit log logic skipped for brevity in fallback
    return newEvent;
};

export const updateCalendarEvent = (eventId: string, updatedData: Partial<Omit<CalendarEvent, 'id'>>, editorId: string): CalendarEvent | null => {
    const events = getCalendarEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;
    events[eventIndex] = { ...events[eventIndex], ...updatedData };
    saveToStorage(CALENDAR_EVENTS_KEY, events);
    return events[eventIndex];
};

export const deleteCalendarEvent = (eventId: string, editorId: string): void => {
    const events = getCalendarEvents();
    const updatedEvents = events.filter(e => e.id !== eventId);
    saveToStorage(CALENDAR_EVENTS_KEY, updatedEvents);
};

export const getGradingScheme = (): GradeSetting[] => getFromStorage<GradeSetting[]>(GRADING_SCHEME_KEY, []);
export const saveGradingScheme = (scheme: GradeSetting[]): void => saveToStorage(GRADING_SCHEME_KEY, scheme);

export const getRolePermissions = (): RolePermissions => getFromStorage<RolePermissions>(ROLE_PERMISSIONS_KEY, {});
export const saveRolePermissions = (permissions: RolePermissions): void => saveToStorage(ROLE_PERMISSIONS_KEY, permissions);

export const getAssignmentActivities = (): AssignmentActivity[] => getFromStorage<AssignmentActivity[]>(ASSIGNMENT_ACTIVITIES_KEY, []);

export const fetchAssignmentActivitiesFromApi = async (refetch: boolean = false): Promise<AssignmentActivity[]> => {
    if (typeof window === 'undefined') return [];

    const storedActivities = getAssignmentActivities();
    if (storedActivities.length > 0 && !refetch) {
        return storedActivities;
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

    try {
        const fetchList = async (endpoint: string, isActive: boolean) => {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'X-API-KEY': apiKey,
                },
            });

            if (!response.ok) return [];

            const responseText = await response.text();
            //console.log("Response Text", responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error(`Failed to parse response from ${endpoint} as JSON. Raw response:`, responseText);
                return [];
            }

            if (result.success && Array.isArray(result.data)) {
                return result.data.map(item => ({
                    id: item.id?.toString() || `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    activity_id: item.activity_id,
                    name: item.act_name || item.name || '',
                    act_name: item.act_name,
                    expected_per_term: item.expected_per_term || 1,
                    weight: item.weight || 0,
                    academic_year: item.academic_year,
                    term: item.term,
                    added_by: item.added_by,
                    is_active: isActive,
                    is_standalone: item.is_standalone,
                    assigned_classes: Array.isArray(item.assigned_classes)
                        ? item.assigned_classes.map((c: any) => typeof c === 'object' ? (c.class_id || c.id || '').toString() : c.toString())
                        : []
                })) as AssignmentActivity[];
            }
            return [];
        };

        const [activeActivities, inactiveActivities] = await Promise.all([
            fetchList('/api/academic/activities/list', true),
            fetchList('/api/academic/activities/list/inactive', false)
        ]);

        const combined = [...activeActivities, ...inactiveActivities];
        saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, combined);
        return combined;
    } catch (error) {
        console.error('Error fetching assignment activities:', error);
        return getAssignmentActivities();
    }
};

export const addAssignmentActivity = (activity: Omit<AssignmentActivity, 'id'>): void => {
    const activities = getAssignmentActivities();
    const newActivity = { ...activity, id: `act-${Date.now()}` };
    saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, [...activities, newActivity]);
};

export const addAssignmentActivityApi = async (activity: Omit<AssignmentActivity, 'id'>, userId?: string): Promise<AssignmentActivity | null> => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const payload = {
            act_name: activity.act_name || activity.name,
            expected_per_term: activity.expected_per_term,
            weight: activity.weight,
            academic_year: activity.academic_year,
            term: activity.term,
            added_by: userId || activity.added_by,
            is_standalone: activity.is_standalone ?? 0
        };

        const response = await fetch('/api/academic/activities/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-CSRF-TOKEN': csrfToken,
                'X-API-KEY': apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('Failed to create assignment activity via API');
            // Fallback: save locally
            addAssignmentActivity(activity);
            return null;
        }

        let result;
        const responseText = await response.text();
        //console.log("Response Text", responseText);


        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse API response as JSON. Raw response:', responseText);
            addAssignmentActivity(activity);
            return null;
        }

        if (result.success && result.data) {
            const newAct = {
                ...activity,
                id: result.data.id?.toString() || `act-${Date.now()}`,
                activity_id: result.data.activity_id
            } as AssignmentActivity;

            const activities = getAssignmentActivities();
            saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, [...activities, newAct]);
            return newAct;
        }
        return null;
    } catch (error) {
        console.error('Error adding assignment activity via API:', error);
        addAssignmentActivity(activity);
        return null;
    }
};

export const updateAssignmentActivity = (id: string, updatedActivity: Partial<Omit<AssignmentActivity, 'id'>>): void => {
    const activities = getAssignmentActivities();
    const index = activities.findIndex(a => a.id === id);
    if (index > -1) {
        activities[index] = { ...activities[index], ...updatedActivity };
        saveToStorage(ASSIGNMENT_ACTIVITIES_KEY, activities);
    }
};

export const updateAssignmentActivityApi = async (id: string, activityId: string, updatedData: Partial<AssignmentActivity>): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const payload = {
            activity_id: activityId,
            act_name: updatedData.act_name || updatedData.name,
            expected_per_term: updatedData.expected_per_term,
            weight: updatedData.weight,
            academic_year: updatedData.academic_year,
            term: updatedData.term,
            is_active: updatedData.is_active !== undefined ? updatedData.is_active : true,
            is_standalone: updatedData.is_standalone
        };

        const response = await fetch('/api/academic/activities/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('Failed to update assignment activity via API');
            updateAssignmentActivity(id, updatedData);
            return false;
        }

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse update response as JSON. Raw response:', responseText);
            updateAssignmentActivity(id, updatedData);
            return false;
        }

        if (result.success) {
            updateAssignmentActivity(id, updatedData);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating assignment activity via API:', error);
        updateAssignmentActivity(id, updatedData);
        return false;
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

export const deleteAssignmentActivityApi = async (id: string, activityId: string, academicYear?: string, term?: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const payload = {
            activity_id: activityId,
            academic_year: academicYear,
            term: term
        };

        const response = await fetch('/api/academic/activities/permanent-delete', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                'X-API-KEY': apiKey
            }),
            body: JSON.stringify(payload)
        });

        //console.log('Permanent Delete Response:', response);

        if (!response.ok) {
            console.error('Failed to delete assignment activity via API:', response.status);
            return false;
        }

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse permanent delete response as JSON. Raw response:', responseText);
            return false;
        }

        if (result.success) {
            deleteAssignmentActivity(id);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting assignment activity via API:', error);
        return false;
    }
};

export const softDeleteAssignmentActivityApi = async (id: string, activityId: string, academicYear?: string, term?: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const payload = {
            activity_id: activityId,
            academic_year: academicYear,
            term: term,
            is_active: false
        };

        const response = await fetch('/api/academic/activities/delete', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                'X-API-KEY': apiKey
            }),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('Failed to soft delete assignment activity via API:', response.status);
            return false;
        }

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse soft delete response as JSON. Raw response:', responseText);
            updateAssignmentActivity(id, { is_active: false });
            return false;
        }

        if (result.success) {
            updateAssignmentActivity(id, { is_active: false });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error soft deleting assignment activity via API:', error);
        return false;
    }
};

export const activateAssignmentActivityApi = async (id: string, activityId: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const response = await fetch('/api/academic/activities/activate', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                'X-API-KEY': apiKey
            }),
            body: JSON.stringify({ activity_id: activityId })
        });

        if (!response.ok) {
            console.error('Failed to activate assignment activity via API');
            updateAssignmentActivity(id, { is_active: true });
            return false;
        }

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse activate response as JSON. Raw response:', responseText);
            updateAssignmentActivity(id, { is_active: true });
            return false;
        }

        if (result.success) {
            updateAssignmentActivity(id, { is_active: true });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error activating assignment activity via API:', error);
        updateAssignmentActivity(id, { is_active: true });
        return false;
    }
};

export const getClassAssignmentActivities = (): ClassAssignmentActivity[] => getFromStorage<ClassAssignmentActivity[]>(CLASS_ASSIGNMENT_ACTIVITIES_KEY, []);
export const saveClassAssignmentActivities = (assignments: ClassAssignmentActivity[]): void => saveToStorage(CLASS_ASSIGNMENT_ACTIVITIES_KEY, assignments);

export const assignActivityToClassApi = async (payload: { act_id: string, class_id: string, academic_year?: string, term?: string }): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const response = await fetch('/api/academic/classes/activities/assign', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                'X-API-KEY': apiKey
            }),
            body: JSON.stringify({
                act_id: payload.act_id,
                class_id: payload.class_id,
                academic_year: payload.academic_year,
                term: payload.term
            })
        });

        /* if (!response.ok) {
            console.error('Failed to assign activity via API:', response.status);
            return false;
        } */


        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse assign activity response as JSON. Raw response:', responseText);
            return false;
        }

        return result.success;
    } catch (error) {
        console.error('Error in assignActivityToClassApi:', error);
        return false;
    }
};

export const fetchClassRankings = async (class_id: string, academic_year: string, term: string): Promise<any[]> => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const response = await fetch('/api/academic/rankings/class', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-CSRF-TOKEN': csrfToken,
                'X-API-KEY': apiKey
            },
            body: JSON.stringify({ class_id, academic_year, term })
        });

        if (!response.ok) {
            console.error('Failed to fetch class rankings');
            return [];
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching class rankings:', error);
        return [];
    }
};

export const fetchLevelRankings = async (level_id: string, academic_year: string, term: string): Promise<any[]> => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    const matches = level_id.match(/\b\w/g);
    if (matches) {
        level_id = matches.join('');
    }

    try {
        const response = await fetch('/api/academic/rankings/level', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-CSRF-TOKEN': csrfToken,
                'X-API-KEY': apiKey
            },
            body: JSON.stringify({ level_id, academic_year, term })
        });

        if (!response.ok) {
            console.error('Failed to fetch level rankings');
            return [];
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching level rankings:', error);
        return [];
    }
};

export const fetchSchoolRankings = async (academic_year: string, term: string): Promise<any[]> => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const response = await fetch('/api/academic/rankings/school', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-CSRF-TOKEN': csrfToken,
                'X-API-KEY': apiKey
            },
            body: JSON.stringify({ academic_year, term })
        });

        if (!response.ok) {
            console.error('Failed to fetch school rankings');
            return [];
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching school rankings:', error);
        return [];
    }
};

export const unassignActivityFromClassApi = async (payload: { activity_id: string, class_id: string, academic_year?: string, term?: string }): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const response = await fetch('/api/academic/classes/activities/unassign', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                'X-API-KEY': apiKey
            }),
            body: JSON.stringify(payload)
        });

        /* if (!response.ok) {
            console.error('Failed to unassign activity via API:', response.status);
            return false;
        } */

        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse unassign activity response as JSON. Raw response:', responseText);
            return false;
        }

        return result.success;
    } catch (error) {
        console.error('Error in unassignActivityFromClassApi:', error);
        return false;
    }
};

export const fetchClassActivitiesApi = async (classId: string, academicYear?: string, term?: string): Promise<AssignmentActivity[]> => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';


    try {
        const payload = {
            class_id: typeof classId === 'string' ? parseInt(classId) : classId
        };

        const response = await fetch('/api/academic/classes/activities/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('Failed to fetch class activities via API:', response.status);
            return [];
        }

        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse class activities response as JSON. Raw response:', responseText);
            return [];
        }

        if (result.success && Array.isArray(result.data)) {
            //console.log('Parsed Class Activities:', result.data);
            return result.data.map((item: any) => ({
                id: item.id?.toString() || `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                activity_id: item.activity_id,
                name: item.act_name || item.name || '',
                act_name: item.act_name,
                expected_per_term: item.expected_per_term || 1,
                weight: item.weight || 0,
                academic_year: item.academic_year,
                term: item.term,
                added_by: item.added_by,
                is_active: item.status === 'active' || item.is_active || false,
                is_standalone: item.is_standalone,
                sub_activities: item.sub_activities
            })) as AssignmentActivity[];
        }
        console.warn('Class activities fetch successful but data format invalid:', result);
        return [];
    } catch (error) {
        console.error('Error fetching class activities:', error);
        return [];
    }
};


// Grading Scheme APIs
export const fetchGradingSchemesApi = async (): Promise<GradeSetting[]> => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

    try {
        const response = await fetch('/api/academic/grading-scheme/list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch grading schemes:', response.status);
            return [];
        }

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            return result.data.map((item: any) => ({
                id: item.id?.toString(),
                grade: item.grade,
                range: item.grade_from + '-' + item.grade_to,
                remarks: item.remarks || ''
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching grading schemes:', error);
        return [];
    }
};

export const addGradingSchemeApi = async (data: Omit<GradeSetting, 'id'>): Promise<GradeSetting | null> => {
    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const [grade_from, grade_to] = data.range.split('-').map(s => s.trim());
        const payload = {
            grade: data.grade,
            grade_from: grade_from || "0",
            grade_to: grade_to || "0",
            remarks: data.remarks
        };

        const response = await fetch('/api/academic/grading-scheme/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success && result.data) {
            return {
                id: result.data.id?.toString(),
                grade: result.data.grade,
                range: (result.data.grade_from || '') + '-' + (result.data.grade_to || ''),
                remarks: result.data.remarks || ''
            };
        }
        return null;
    } catch (error) {
        console.error('Error adding grading scheme:', error);
        return null;
    }
};

export const updateGradingSchemeApi = async (id: string, data: Partial<GradeSetting>): Promise<boolean> => {
    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        // Handle range splitting if provided
        let grade_from, grade_to;
        if (data.range) {
            [grade_from, grade_to] = data.range.split('-').map(s => s.trim());
        }

        const payload = {
            id,
            ...(data.grade && { grade: data.grade }),
            ...(data.range && { grade_from: grade_from || "0", grade_to: grade_to || "0" }),
            ...(data.remarks && { remarks: data.remarks })
        };

        const response = await fetch('/api/academic/grading-scheme/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error updating grading scheme:', error);
        return false;
    }
};

export const deleteGradingSchemeApi = async (id: string): Promise<boolean> => {
    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        // User specified payload { "grade": 1 } for delete. 
        // Assuming '1' refers to the ID.
        const response = await fetch('/api/academic/grading-scheme/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ id: id })
        });

        const result = await response.json();

        return result.success;
    } catch (error) {
        console.error('Error deleting grading scheme:', error);
        return false;
    }
};

export const getPromotionCriteria = (): PromotionCriteria => getFromStorage<PromotionCriteria>(PROMOTION_CRITERIA_KEY, {});
export const savePromotionCriteria = (criteria: PromotionCriteria): void => saveToStorage(PROMOTION_CRITERIA_KEY, criteria);

export const fetchPromotionCriteriaFromApi = async (): Promise<PromotionCriteria> => {
    if (typeof window === 'undefined') return {};

    const token = localStorage.getItem('campusconnect_token');
    const apiUrl = '/api/promotion-criteria/list';

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
            }),
        });

        if (!response.ok) {
            console.error('Failed to fetch promotion criteria:', response.statusText);
            return getPromotionCriteria();
        }

        const result = await response.json();

        if (result.success && result.data) {
            // Map API response to PromotionCriteria type if necessary
            // Assuming the API returns it in a compatible format or needs mapping
            const criteria: PromotionCriteria = result.data;
            savePromotionCriteria(criteria);
            return criteria;
        }
        return getPromotionCriteria();
    } catch (error) {
        console.error('Error fetching promotion criteria from API:', error);
        return getPromotionCriteria();
    }
};

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
    const profile = getStudentProfilesFromStorage().find(p => p.student.student_no === studentId);
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
export const fetchStaffFromApi = async (): Promise<Staff[]> => {
    if (typeof window === 'undefined') return [];
    const token = localStorage.getItem('campusconnect_token');
    try {
        const response = await fetch('/api/academic/staff/list', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
            }),
            body: JSON.stringify({})
        });
        if (!response.ok) return getStaff();
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            saveToStorage(STAFF_KEY, result.data);
            return result.data;
        }
        return getStaff();
    } catch (error) {
        console.error('Error fetching staff:', error);
        return getStaff();
    }
};

export const getDeclinedStaff = (): Staff[] => getFromStorage<Staff[]>(DECLINED_STAFF_KEY, []);
export const getStaffByStaffId = (staffId: string): Staff | null => getStaff().find(s => s.staff_id === staffId) || null;
export const storeGetStaffAcademicHistory = (): StaffAcademicHistory[] => getFromStorage<StaffAcademicHistory[]>(STAFF_ACADEMIC_HISTORY_KEY, []);
export const getStaffDocuments = (): StaffDocument[] => getFromStorage<StaffDocument[]>(STAFF_DOCUMENTS_KEY, []);
export const getStaffDocumentsByStaffId = (staffId: string): StaffDocument[] => getStaffDocuments().filter(d => d.staff_id === staffId);
export const getStaffAppointmentHistory = (): StaffAppointmentHistory[] => getFromStorage<StaffAppointmentHistory[]>(STAFF_APPOINTMENT_HISTORY_KEY, []);

export const fetchStaffAppointmentHistoryFromApi = async (): Promise<StaffAppointmentHistory[]> => {
    if (typeof window === 'undefined') return [];
    const token = localStorage.getItem('campusconnect_token');
    try {
        const response = await fetch('/api/academic/staff/appointments/history', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
            }),
            body: JSON.stringify({})
        });
        if (!response.ok) return getStaffAppointmentHistory();
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            saveToStorage(STAFF_APPOINTMENT_HISTORY_KEY, result.data);
            return result.data;
        }
        return getStaffAppointmentHistory();
    } catch (error) {
        console.error('Error fetching staff appointments:', error);
        return getStaffAppointmentHistory();
    }
};

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
    if (staffIndex === -1) return null;

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
    if (staffIndex === -1) return null;

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
        if (deleteStaff(id, editorId)) {
            deletedCount++;
        }
    });
    return deletedCount;
};


// Subject Management Functions
export const getSubjects = (): Subject[] => getFromStorage<Subject[]>(SUBJECTS_KEY, []);

export const fetchSubjectsFromApi = async (refetch: boolean = false): Promise<Subject[]> => {
    if (typeof window === 'undefined') return [];

    const storedSubjects = getFromStorage<Subject[]>(SUBJECTS_KEY, []);

    if (storedSubjects.length > 0 && !refetch) {
        return storedSubjects;
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';

    try {
        const response = await fetch('/api/academic/subjects/list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to fetch subjects from API:', response.statusText, 'Error Data:', errorData);
            return getFromStorage<Subject[]>(SUBJECTS_KEY, []);
        }

        const result: any = await response.json();

        //console.log('Subjects API Response:', result);

        let subjectsData: any[] = [];
        if (result.success && Array.isArray(result.data)) {
            subjectsData = result.data;
        } else if (result.data && Array.isArray(result.data.subjects)) {
            subjectsData = result.data.subjects;
        }

        if (subjectsData.length > 0) {
            const subjects = subjectsData.map(item => ({
                id: (item.id || item.subject_id).toString(),
                name: item.name || item.subject_name || '',
                code: item.code || item.subject_code || '',
                level: item.level || 'Primary',
                category: item.category || 'Core',
                description: item.description || '',
                is_active: item.status === 'active' ? true : false, // Default to true if not specified
            }));
            saveToStorage(SUBJECTS_KEY, subjects);
            return subjects;
        }
        return getFromStorage<Subject[]>(SUBJECTS_KEY, []);
    } catch (error) {
        console.error('Error fetching subjects from API:', error);
        return getFromStorage<Subject[]>(SUBJECTS_KEY, []);
    }
};

export const fetchClassesFromApi = async (): Promise<Class[]> => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const apiUrl = '/api/academic/classes/list';
        //console.log('fetchClassesFromApi: Making request to:', apiUrl);
        //console.log('fetchClassesFromApi: Request Headers:', {
        //    'Content-Type': 'application/json',
        //    ...(token && { 'Authorization': `Bearer ${token}` }),
        //    'X-API-KEY': apiKey,
        //});

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken
            },
        });

        //console.log('fetchClassesFromApi: Raw Response Status:', response.status);
        const responseText = await response.text();
        //console.log('fetchClassesFromApi: Raw Response Body:', responseText);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                // Ignore parsing error for error response
            }
            console.error('fetchClassesFromApi: Failed to fetch classes from API:', response.statusText, 'Error Data:', errorData);
            return getFromStorage<Class[]>(CLASSES_KEY, []);
        }

        const result: ClassApiResponse = JSON.parse(responseText);
        //console.log('Class API Response Data:', result.data); // Add this line
        if (result.success && Array.isArray(result.data)) {
            const classes: Class[] = result.data.map((item: any) => ({
                id: item.id?.toString() || item.class_id?.toString(),
                name: item.class_name || item.name || '',
                class_name: item.class_name || item.name || '',
                class_id: item.class_id?.toString() || item.id?.toString(),
                is_active: item.status === 'active' || item.is_active || true
            }));
            saveToStorage(CLASSES_KEY, classes);
            return classes;
        }
        return getFromStorage<Class[]>(CLASSES_KEY, []);
    } catch (error) {
        console.error('Error fetching classes from API:', error);
        return getFromStorage<Class[]>(CLASSES_KEY, []);
    }
};

export const uploadFileViaApi = async (file: File, docId: string, docType: 'profile_picture' | 'signature'): Promise<{ success: boolean; message: string; url?: string }> => {
    if (typeof window === 'undefined') return { success: false, message: 'Window is undefined' };

    const token = localStorage.getItem('campusconnect_token');
    // Get headers and remove Content-Type to let the browser set it for FormData
    const apiHeaders = getApiHeaders();
    const headers: any = { ...apiHeaders };
    delete headers['Content-Type'];

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_id', docId);
        formData.append('doc_type', docType);

        const response = await fetch('/api/uploads', {
            method: 'POST',
            headers: {
                ...headers,
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: formData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }

        return result;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const getClasses = (): Class[] => getFromStorage<Class[]>(CLASSES_KEY, []);

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

    let classSubjects = getClassesSubjects();
    classSubjects = classSubjects.filter(cs => cs.subject_id !== subjectId);
    saveToStorage(CLASS_SUBJECTS_KEY, classSubjects);
};

export const getClassesSubjects = (): ClassSubject[] => getFromStorage<ClassSubject[]>(CLASS_SUBJECTS_KEY, []);
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

        if (scoreIndex !== -1) {
            profiles[studentIndex].assignmentScores![scoreIndex] = score;
        } else {
            profiles[studentIndex].assignmentScores!.push(score);
        }

        saveToStorage(STUDENTS_KEY, profiles);
    }
}

export const fetchScoresFromApi = async (classId: string): Promise<AssignmentScore[]> => {
    if (typeof window === 'undefined') return [];
    const token = localStorage.getItem('campusconnect_token');
    try {
        const response = await fetch('/api/academic/scores/class', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
            }),
            body: JSON.stringify({ class_id: classId })
        });
        if (!response.ok) return [];

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            // We don't necessarily want to merge these into student profiles here,
            // as students are managed separately.
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching scores:', error);
        return [];
    }
};

export const fetchStudentScoresFromApi = async (studentNo: string, academicYear: string, term: string): Promise<StudentActivityScore[]> => {
    if (typeof window === 'undefined') return [];
    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const response = await fetch('/api/academic/scores/student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                student_no: studentNo,
                academic_year: academicYear,
                term: term
            })
        });

        if (!response.ok) {
            console.error('Failed to fetch student scores via API:', response.status);
            return [];
        }

        const result = await response.json();


        // Handle nested data format as per user request
        if (result.success && result.data?.success && Array.isArray(result.data.data)) {
            return result.data.data;
        }

        if (result.success && Array.isArray(result.data)) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching student scores:', error);
        return [];
    }
};

export const fetchStudentReportListFromApi = async (studentNo?: string, academicYear?: string, term?: string, classId?: string): Promise<StudentSubjectReport[]> => {
    if (typeof window === 'undefined') return [];
    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const payload: any = {};
        if (studentNo) payload.student_no = studentNo;
        if (academicYear) payload.academic_year = academicYear;
        if (term) payload.term = term;
        if (classId) payload.class_id = classId;

        const body = JSON.stringify(payload);

        const response = await fetch('/api/academic/scores/report/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken
            },
            body: body
        });

        if (!response.ok) {
            console.error('Failed to fetch student report list via API:', response.status);
            return [];
        }

        const result = await response.json();


        if (result.success && Array.isArray(result.data)) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching student report list:', error);
        return [];
    }
};

export const fetchStudentSummaryScoresFromApi = async (studentNo: string, academicYear: string, term: string): Promise<StudentSummaryScore[]> => {
    if (typeof window === 'undefined') return [];
    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const response = await fetch('/api/academic/scores/summary/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                student_no: studentNo,
                academic_year: academicYear,
                term: term
            })
        });

        if (!response.ok) {
            console.error('Failed to fetch student summary scores via API:', response.status);
            return [];
        }

        const result = await response.json();

        if (result.success) {
            let data = [];
            if (result.data?.success && Array.isArray(result.data.data)) {
                data = result.data.data;
            } else if (Array.isArray(result.data)) {
                data = result.data;
            }

            return data.map((item: any) => ({
                ...item,
                percentage: item.percentage ?? item.percentage_score ?? item.score_percentage ?? 0
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching student summary scores:', error);
        return [];
    }
};

export const saveScoreToApi = async (score: AssignmentScore): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('campusconnect_token');
    try {
        const response = await fetch('/api/academic/scores/save', {
            method: 'POST',
            headers: getApiHeaders({
                ...(token && { 'Authorization': `Bearer ${token}` }),
            }),
            body: JSON.stringify(score)
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error saving score:', error);
        return false;
    }
};

export const updateAssignmentScore = (studentId: string, subjectId: string, assignmentName: string, newScore: number, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (studentIndex === -1) return null;

    const student = profiles[studentIndex];
    if (!student.assignmentScores) return student;

    const scoreIndex = student.assignmentScores.findIndex(s => s.subject_id === subjectId && s.assignment_name === assignmentName);
    if (scoreIndex !== -1) {
        student.assignmentScores[scoreIndex].score = newScore;
    }

    profiles[studentIndex] = student;
    saveToStorage(STUDENTS_KEY, profiles);
    return student;
};

export const deleteAssignmentScore = (studentId: string, subjectId: string, assignmentName: string, editorId: string): StudentProfile | null => {
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
    if (studentIndex === -1) return null;

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
    if (studentIndex === -1) return null;

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

export type StudentFilters = {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

// Helper to fetch all pages from a paginated API endpoint
async function fetchAllPages(url: URL, token: string, apiKey: string, userId?: string): Promise<StudentProfile[]> {
    let allStudents: StudentProfile[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
        url.searchParams.set('page', String(currentPage));
        url.searchParams.set('limit', '100'); // Use a reasonable page size
        const apiUrl = url.toString();

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-API-KEY': apiKey,
                'X-User-ID': userId || '',
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch page ${currentPage}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            let studentsData: any[] = [];
            if (Array.isArray(result.data.students)) {
                studentsData = result.data.students;
                totalPages = result.data.pagination?.pages || 1;
            } else if (Array.isArray(result.data)) {
                studentsData = result.data;
                totalPages = 1; // Assume single page if it's a direct array
            }

            allStudents.push(...studentsData);
            currentPage++;
        } else {
            console.error(`Debug: Malformed student API response on page ${currentPage}:`, result);
            break; // Stop loop if malformed
        }
    }
    return allStudents;
}


export async function getStudentProfiles(
    page = 1,
    limit = 10,
    search = '',
    status?: string,
    userId?: string,
    classId?: string
): Promise<StudentAPIResponse> {
    const url = new URL('/api/students', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002');


    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    if (search) {
        url.searchParams.append('search', search);
    }
    if (status) {
        url.searchParams.append('status', status);
    }
    if (classId) {
        url.searchParams.append('class_id', classId);
    }

    if (typeof window === 'undefined') {
        return { students: [], pagination: { total: 0, page: 1, limit, pages: 1 } };
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123'; // Fallback for development

    // Note: Students endpoint only requires API key, not authentication token
    // But we'll include token if available for consistency

    try {
        // If a large limit is requested, it means we need all students.
        if (limit > 100) {
            const allStudents = await fetchAllPages(url, token || '', apiKey, userId);
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
                        student_no: apiStudent.student_no, admission_no: apiStudent.admission_no, enrollment_date: apiStudent.enrollment_date, class_assigned: String(apiStudent.class_assigned), admission_status: apiStudent.admission_status === 'Active' ? 'Admitted' : apiStudent.admission_status,
                    },
                };
            });
            return {
                students: transformedProfiles,
                pagination: { total: allStudents.length, page: 1, limit: allStudents.length, pages: 1 },
            };
        }


        // Regular paginated request
        const apiUrl = url.toString();
        //console.log('Making request to:', apiUrl);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey,
            'X-User-ID': userId || '',
        };

        // Only add Authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error("Failed to fetch students:", response.status, response.statusText, errorText);
            const allStudents = getStudentProfilesFromStorage();
            const total = allStudents.length;
            const pages = Math.ceil(total / limit);
            const paginatedStudents = allStudents.slice((page - 1) * limit, page * limit);
            return { students: paginatedStudents, pagination: { total, page, limit, pages } };
        }

        const result = await response.json();

        if (result.success && result.data) {
            let apiStudents: any[] = [];
            let total = 0;
            let pages = 1;

            if (Array.isArray(result.data.students)) {
                apiStudents = result.data.students;
                total = result.data.pagination?.total || apiStudents.length;
                pages = result.data.pagination?.pages || 1;
            } else if (Array.isArray(result.data)) {
                apiStudents = result.data;
                total = apiStudents.length;
                pages = 1;
            }

            const transformedProfiles = apiStudents.map((apiStudent: any): StudentProfile => {
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorDetails = error instanceof TypeError && error.message.includes('fetch')
            ? `Network error: Unable to connect to ${apiBaseUrl}/students. Please ensure the backend server is running on port 8000.`
            : `Error fetching students from API: ${errorMessage}`;
        console.error(errorDetails, error);
        const allStudents = getStudentProfilesFromStorage();
        const total = allStudents.length;
        const pages = Math.ceil(total / limit);
        const paginatedStudents = allStudents.slice((page - 1) * limit, page * limit);
        return { students: paginatedStudents, pagination: { total, page, limit, pages } };
    }
}

// Fetch students for a specific class using the class-specific endpoint
export async function getStudentsByClass(
    classId: string | number,
    status: string = 'Admitted'
): Promise<StudentProfile[]> {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const payload = {
            class_id: typeof classId === 'string' ? parseInt(classId) : classId,
            status: status
        };

        const response = await fetch('/api/students/class', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('Failed to fetch students by class:', response.status, response.statusText, errorText);
            return [];
        }

        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse students by class response as JSON. Raw response:', responseText);
            return [];
        }

        if (result.success && Array.isArray(result.data)) {
            const transformedProfiles = result.data.map((apiStudent: any): StudentProfile => {
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
            return transformedProfiles;
        }

        console.warn('Students by class fetch successful but data format invalid:', result);
        return [];
    } catch (error) {
        console.error('Error fetching students by class:', error);
        return [];
    }
}

export async function getStudentProfileById(studentId: string, userId?: string): Promise<StudentProfile | null> {
    const apiUrl = '/api/students/show';

    if (typeof window === 'undefined') {
        return null;
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123'; // Fallback for development
    const csrfToken = localStorage.getItem('csrf_token') || ''

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
                'X-API-KEY': apiKey,
                'X-User-ID': userId || '',
                'X-CSRF-TOKEN': csrfToken,
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

export const updateStudentProfile = async (studentId: string, updatedData: Partial<StudentProfile>, editorId: string): Promise<StudentProfile | null> => {
    // First, try to get the current profile (from API or storage)
    let currentProfile: StudentProfile | null = null;

    // Check local storage first
    const profiles = getStudentProfilesFromStorage();
    const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);

    if (studentIndex !== -1) {
        currentProfile = profiles[studentIndex];
    } else {
        // If not in storage, try to fetch from API
        try {
            currentProfile = await getStudentProfileById(studentId);
            if (currentProfile) {
                // Cache it in local storage
                profiles.push(currentProfile);
                saveToStorage(STUDENTS_KEY, profiles);
            }
        } catch (error) {
            console.error("Failed to fetch student profile for update:", error);
            return null;
        }
    }

    if (!currentProfile) {
        console.error("Student profile not found for update:", studentId);
        return null;
    }

    // Merge the updated data
    const newProfile: StudentProfile = {
        ...currentProfile,
        ...updatedData,
        student: {
            ...currentProfile.student,
            ...updatedData.student,
            updated_at: new Date().toISOString(),
            updated_by: editorId
        },
        contactDetails: {
            ...currentProfile.contactDetails,
            ...updatedData.contactDetails,
            student_no: studentId
        },
        guardianInfo: {
            ...currentProfile.guardianInfo,
            ...updatedData.guardianInfo,
            student_no: studentId
        },
        emergencyContact: {
            ...currentProfile.emergencyContact,
            ...updatedData.emergencyContact,
            student_no: studentId
        },
        admissionDetails: {
            ...currentProfile.admissionDetails,
            ...updatedData.admissionDetails,
            student_no: studentId
        }
    };

    // Update in local storage
    const updatedProfiles = getStudentProfilesFromStorage();
    const updatedIndex = updatedProfiles.findIndex(p => p.student.student_no === studentId);
    if (updatedIndex !== -1) {
        updatedProfiles[updatedIndex] = newProfile;
    } else {
        updatedProfiles.push(newProfile);
    }
    saveToStorage(STUDENTS_KEY, updatedProfiles);

    // TODO: Call API update endpoint when it's available
    // For now, we only update local storage

    return newProfile;
};

export interface UpdateStatusResult {
    success: boolean;
    message?: string;
}

export const updateStudentStatus = async (studentId: string, status: AdmissionStatus, userId?: string): Promise<UpdateStatusResult> => {
    const apiUrl = '/api/students/state';

    if (typeof window === 'undefined') {
        return { success: false, message: 'Cannot run on server' };
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    if (!token) {
        console.error('Auth token is missing. Cannot update student status.');
        return { success: false, message: 'Authentication token is missing' };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken,
                'X-User-ID': userId || '',
            },
            body: JSON.stringify({ student_no: studentId, status }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            let errorMessage = `Server error: ${response.status} ${response.statusText}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch {
                if (errorText) {
                    errorMessage = errorText;
                }
            }
            console.error('Failed to update student status:', response.status, response.statusText, errorText);
            return { success: false, message: errorMessage };
        }

        const result = await response.json().catch(() => null);
        //console.log('Server response when updating student status:', result);

        if (result?.success) {
            const successMessage = result.message || `Status updated to ${status}`;
            // Update local storage for offline fallbacks
            const profiles = getStudentProfilesFromStorage();
            const studentIndex = profiles.findIndex(p => p.student.student_no === studentId);
            if (studentIndex !== -1) {
                profiles[studentIndex].admissionDetails.admission_status = status;
                saveToStorage(STUDENTS_KEY, profiles);
            }
            return { success: true, message: successMessage };
        }

        const errorMessage = result?.message || 'Failed to update student status';
        console.error('Failed to update student status:', errorMessage);
        return { success: false, message: errorMessage };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('Error updating student status:', error);
        return { success: false, message: errorMessage };
    }
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

export const deleteStudentProfile = async (studentId: string, status: string = 'Stopped', userId?: string): Promise<boolean> => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URI || 'http://127.0.0.1:8000/api/v1';
    const apiUrl = typeof window === 'undefined' ? `${apiBaseUrl}/students/delete` : '/api/students/delete';

    if (typeof window === 'undefined') {
        return false;
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    if (!token) {
        console.error('Auth token is missing. Cannot delete student.');
        return false;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken,
                'X-User-ID': userId || '',
            },
            body: JSON.stringify({ student_no: studentId, status }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('Failed to delete student:', response.status, response.statusText, errorText);
            return false;
        }

        const result = await response.json().catch(() => null);
        //console.log('Server response when deleting student:', result);

        if (result?.success) {
            // Keep local storage in sync for offline fallbacks
            const profiles = getStudentProfilesFromStorage();
            const updatedProfiles = profiles.filter(p => p.student.student_no !== studentId);
            saveToStorage(STUDENTS_KEY, updatedProfiles);
            return true;
        }

        console.error('Failed to delete student:', result?.message || 'Unknown error');
        return false;
    } catch (error) {
        console.error('Error deleting student:', error);
        return false;
    }
};

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
            role: role?.name || ('Guest' as Role),
        };
    });
};

export const fetchUsersFromApi = async (): Promise<User[]> => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const response = await fetch('/api/admin/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch users from API:', response.status, response.statusText);
            return getUsers();
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data) && Array.isArray(result.data[0])) {
            const apiUsers = result.data[0];
            const roles = getRoles();

            const mappedUsers: UserStorage[] = apiUsers.map((item: any) => {
                // Try to map role_name to local role_id for consistency with existing UI logic
                const localRole = roles.find(r => r.name.toLowerCase() === item.role_name?.toLowerCase());
                const roleId = localRole ? localRole.id : (item.role_id?.toString() || null);

                return {
                    id: (item.id || item.user_id).toString(),
                    user_id: item.user_id,
                    name: item.username, // API does not provide a full name field in the sample
                    username: item.username,
                    email: item.email,
                    role_id: roleId,
                    is_super_admin: item.is_super_admin === "1" || item.is_super_admin === 1,
                    avatarUrl: `https://picsum.photos/seed/${item.username}/40/40`,
                    status: item.status === 'active' ? 'active' : 'frozen',
                    created_at: item.created_at,
                    updated_at: item.updated_at || item.created_at,
                };
            });

            saveToStorage(USERS_KEY, mappedUsers);
            return getUsers();
        }
        return getUsers();
    } catch (error) {
        console.error('Error fetching users from API:', error);
        return getUsers();
    }
};

export const getUserById = (id: string): User | null => {
    // First check if this is the currently authenticated user
    if (typeof window !== 'undefined') {
        try {
            const sessionUser = localStorage.getItem('campusconnect_session');
            if (sessionUser) {
                const user = JSON.parse(sessionUser);
                if (user.id === id) {
                    return user;
                }
            }
        } catch (error) {
            console.error('Failed to parse session user:', error);
        }
    }

    // Fall back to searching the local storage users list
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

export interface PasswordChangeResult {
    success: boolean;
    message?: string;
}

export const updateUserProfileViaApi = async (
    username: string,
    email: string
): Promise<{ success: boolean; message: string; user?: User }> => {
    const apiUrl = '/api/profile/update';

    if (typeof window === 'undefined') {
        return { success: false, message: 'Cannot run on server' };
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    if (!token) {
        console.error('Auth token is missing. Cannot update profile.');
        return { success: false, message: 'Authentication token is missing' };
    }

    console.log(username + " " + email);
    

    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({
                username: username,
                email: email,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            let errorMessage = `Server error: ${response.status} ${response.statusText}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch {
                if (errorText) {
                    errorMessage = errorText;
                }
            }
            console.error('Failed to update profile:', response.status, response.statusText, errorText);
            return { success: false, message: errorMessage };
        }

        const result = await response.json().catch(() => null);

        if (result?.success) {
            const successMessage = result.message || 'Profile updated successfully';
            return { success: true, message: successMessage, user: result.user };
        }

        const errorMessage = result?.message || 'Failed to update profile';
        console.error('Failed to update profile:', errorMessage);
        return { success: false, message: errorMessage };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('Error updating profile:', error);
        return { success: false, message: errorMessage };
    }
};

export const fetchUserProfileViaApi = async (): Promise<{ success: boolean; message: string; data?: any }> => {
    const apiUrl = '/api/profile/details';

    if (typeof window === 'undefined') {
        return { success: false, message: 'Cannot run on server' };
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    if (!token) {
        console.error('Auth token is missing. Cannot fetch profile.');
        return { success: false, message: 'Authentication token is missing' };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken,
            },
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            let errorMessage = `Server error: ${response.status} ${response.statusText}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch {
                if (errorText) {
                    errorMessage = errorText;
                }
            }
            console.error('Failed to fetch profile:', response.status, response.statusText, errorText);
            return { success: false, message: errorMessage };
        }

        const result = await response.json().catch(() => null);

        if (result?.success) {
            return { success: true, message: result.message || 'Profile fetched successfully', data: result.data };
        }

        const errorMessage = result?.message || 'Failed to fetch profile';
        console.error('Failed to fetch profile:', errorMessage);
        return { success: false, message: errorMessage };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('Error fetching profile:', error);
        return { success: false, message: errorMessage };
    }
};

export const changePasswordViaApi = async (
    userId: string,
    newPassword: string,
    confirmPassword: string
): Promise<PasswordChangeResult> => {
    const apiUrl = '/api/auth/reset-password';

    if (typeof window === 'undefined') {
        return { success: false, message: 'Cannot run on server' };
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    if (!token) {
        console.error('Auth token is missing. Cannot change password.');
        return { success: false, message: 'Authentication token is missing' };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({
                user_id: userId,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            let errorMessage = `Server error: ${response.status} ${response.statusText}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch {
                if (errorText) {
                    errorMessage = errorText;
                }
            }
            console.error('Failed to change password:', response.status, response.statusText, errorText);
            return { success: false, message: errorMessage };
        }

        const result = await response.json().catch(() => null);

        if (result?.success) {
            const successMessage = result.message || 'Password changed successfully';
            return { success: true, message: successMessage };
        }

        const errorMessage = result?.message || 'Failed to change password';
        console.error('Failed to change password:', errorMessage);
        return { success: false, message: errorMessage };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('Error changing password:', error);
        return { success: false, message: errorMessage };
    }
};

export interface RequestPasswordResetResult {
    success: boolean;
    message?: string;
}

export const requestPasswordReset = async (email: string): Promise<RequestPasswordResetResult> => {
    const apiUrl = '/api/auth/forgot-password';

    if (typeof window === 'undefined') {
        return { success: false, message: 'Cannot run on server' };
    }

    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    // We might not have a token if the user is not logged in, but we still need CSRF if possible
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            let errorMessage = `Server error: ${response.status} ${response.statusText}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch {
                if (errorText) {
                    errorMessage = errorText;
                }
            }
            console.error('Failed to request password reset:', response.status, response.statusText, errorText);
            return { success: false, message: errorMessage };
        }

        const result = await response.json().catch(() => null);

        if (result?.success) {
            return { success: true, message: result.message || 'Password reset link sent to your email.' };
        }

        const errorMessage = result?.message || 'Failed to request password reset.';
        return { success: false, message: errorMessage };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('Error requesting password reset:', error);
        return { success: false, message: errorMessage };
    }
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
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

export interface ClassSubjectAssignmentApiResponse extends ApiResponse<any[]> { }

export const fetchClassSubjectAssignmentsFromApi = async (refetch: boolean = false, classId?: string): Promise<ClassSubjectAssignment[]> => {
    if (typeof window === 'undefined') return [];

    //console.log('fetchClassSubjectAssignmentsFromApi: Called with refetch:', refetch, 'classId:', classId);

    const storedAssignments = getFromStorage<ClassSubjectAssignment[]>(CLASS_SUBJECT_ASSIGNMENTS_KEY, []);
    if (!refetch && !classId && storedAssignments.length > 0) {
        //console.log('fetchClassSubjectAssignmentsFromApi: Returning stored assignments:', storedAssignments);
        return storedAssignments;
    }

    const token = localStorage.getItem('campusconnect_token');
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'devKey123';
    const csrfToken = localStorage.getItem('csrf_token') || '';

    try {
        const method = classId ? 'POST' : 'GET';
        const body = classId ? JSON.stringify({ class_id: classId }) : undefined;

        //console.log('fetchClassSubjectAssignmentsFromApi: Making API request with method:', method, 'body:', body);

        const options: RequestInit = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'X-API-KEY': apiKey,
                'X-CSRF-TOKEN': csrfToken,
            },
        };

        if (body) {
            options.body = body;
        }

        const response = await fetch('/api/academic/class-subjects/list', options);



        //console.log('fetchClassSubjectAssignmentsFromApi: API response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            //console.error('Failed to fetch class-subject assignments from API:', response.statusText, 'Error Data:', errorData);
            return getFromStorage<ClassSubjectAssignment[]>(CLASS_SUBJECT_ASSIGNMENTS_KEY, []);
        }

        const result: ClassSubjectAssignmentApiResponse = await response.json();

        // console.log('Class-Subject Assignments API Response:', result);

        if (result.success && Array.isArray(result.data)) {
            const assignments = result.data.map((item: any) => ({
                id: item.id,
                class_name: item.class_name,
                subject_name: item.subject_name,
                class_id: item.class_id,
                subject_id: item.subject_id,
                academic_year: item.academic_year,
                semester: item.term,
                assigned_date: item.assigned_date,
                is_active: item.status === 'active' ? true : false,
            }));
            if (!classId) {
                saveToStorage(CLASS_SUBJECT_ASSIGNMENTS_KEY, assignments);
            }
            //console.log('fetchClassSubjectAssignmentsFromApi: Returning fetched assignments:', assignments);
            return assignments;
        }
        //console.log('fetchClassSubjectAssignmentsFromApi: API call successful but no data or not an array.');
        return getFromStorage<ClassSubjectAssignment[]>(CLASS_SUBJECT_ASSIGNMENTS_KEY, []);
    } catch (error) {
        console.error('Error fetching class-subject assignments:', error);
        return getFromStorage<ClassSubjectAssignment[]>(CLASS_SUBJECT_ASSIGNMENTS_KEY, []);
    }
};
