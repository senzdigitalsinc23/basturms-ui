
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
} from './types';

const USERS_KEY = 'campusconnect_users';
const ROLES_KEY = 'campusconnect_roles';
const LOGS_KEY = 'campusconnect_logs';
const AUTH_LOGS_KEY = 'campusconnect_auth_logs';
const STUDENTS_KEY = 'campusconnect_students';
const CLASSES_KEY = 'campusconnect_classes';


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
      username: 'adminuser',
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
      name: 'Teacher Smith',
      username: 'teachersmith',
      email: 'teacher@campus.com',
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
      name: 'Headmaster Brown',
      username: 'headmasterbrown',
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
      name: 'Parent Doe',
      username: 'parentdoe',
      email: 'parent@campus.com',
      password: 'password',
      role_id: getRoleId('Parent')!,
      is_super_admin: false,
      avatarUrl: 'https://picsum.photos/seed/avatar4/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    {
      id: '5',
      name: 'Student Johnson',
      username: 'studentjohnson',
      email: 'student@campus.com',
      password: 'password',
      role_id: getRoleId('Student')!,
      is_super_admin: false,
      avatarUrl: 'https://picsum.photos/seed/avatar5/40/40',
      status: 'active',
      created_at: now,
      updated_at: now,
    },
  ];
};

const getInitialStudentProfiles = (): StudentProfile[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const yearYY = currentYear.toString().slice(-2);
    const adminUser = '1';
    
    // Student 1 admitted this year
    const student1EnrollDate = new Date(currentYear, 2, 15).toISOString(); // Mar 15
    const student1StudentNo = `WR-TK001-LBA${yearYY}001`;
    const student1AdmissionNo = `ADM${yearYY}001`;

    // Student 2 admitted last year
    const lastYear = currentYear - 1;
    const lastYearYY = lastYear.toString().slice(-2);
    const student2EnrollDate = new Date(lastYear, 8, 1).toISOString(); // Sep 1
    const student2StudentNo = `WR-TK001-LBA${lastYearYY}001`;
    const student2AdmissionNo = `ADM${lastYearYY}001`;

    return [
        {
            student: { student_no: student1StudentNo, first_name: 'John', last_name: 'Doe', dob: '2010-05-15', gender: 'Male', created_at: now.toISOString(), created_by: adminUser, updated_at: now.toISOString(), updated_by: adminUser, avatarUrl: 'https://picsum.photos/seed/student1/200/200' },
            contactDetails: { student_no: student1StudentNo, email: 'john.doe@example.com', phone: '123-456-7890', country_id: '1', city: 'Accra', hometown: 'Accra', residence: 'East Legon' },
            guardianInfo: { student_no: student1StudentNo, guardian_name: 'Jane Doe', guardian_phone: '098-765-4321', guardian_relationship: 'Mother', guardian_email: 'jane.doe@example.com' },
            emergencyContact: { student_no: student1StudentNo, emergency_name: 'Jane Doe', emergency_phone: '098-765-4321', emergency_relationship: 'Mother' },
            admissionDetails: { student_no: student1StudentNo, admission_no: student1AdmissionNo, enrollment_date: student1EnrollDate, class_assigned: 'b5', admission_status: 'Admitted' },
            healthRecords: {
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
                { date: '2024-05-10', status: 'Present' },
                { date: '2024-05-11', status: 'Absent' },
            ],
            communicationLogs: [
                { date: '2023-10-21', type: 'Phone Call', notes: 'Discussed absence with mother. Reason: family emergency.', with_whom: 'Jane Doe (Mother)' }
            ],
            uploadedDocuments: [
                { name: 'Birth Certificate', url: '#', uploaded_at: '2024-03-15', type: 'Birth Certificate' },
                { name: 'Admission Form', url: '#', uploaded_at: '2024-03-15', type: 'Admission Form' }
            ]
        },
        {
            student: { student_no: student2StudentNo, first_name: 'Mary', last_name: 'Smith', dob: '2011-02-20', gender: 'Female', created_at: now.toISOString(), created_by: adminUser, updated_at: now.toISOString(), updated_by: adminUser, avatarUrl: 'https://picsum.photos/seed/student2/200/200' },
            contactDetails: { student_no: student2StudentNo, email: 'mary.smith@example.com', phone: '123-456-7891', country_id: '1', city: 'Kumasi', hometown: 'Kumasi', residence: 'Asokwa' },
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

const saveToStorage = <T>(key: string, value: T) => {
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
  }
};

// Role Functions
export const getRoles = (): RoleStorage[] => getFromStorage<RoleStorage[]>(ROLES_KEY, []);

// Class Functions
export const getClasses = (): Class[] => getFromStorage<Class[]>(CLASSES_KEY, []);

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

export const addUser = (user: Omit<User, 'id' | 'avatarUrl' | 'created_at' | 'updated_at' | 'username' | 'is_super_admin' | 'role_id' | 'password' | 'status'> & { role: User['role'], password?: string }): User => {
  const users = getUsersInternal();
  const roles = getRoles();
  const role = roles.find(r => r.name === user.role);
  const now = new Date().toISOString();
  const nextId = users.length > 0 ? (Math.max(...users.map(u => parseInt(u.id, 10))) + 1).toString() : '1';

  const newUser: UserStorage = {
    ...user,
    id: nextId,
    username: user.name.replace(/\s/g, '').toLowerCase(),
    role_id: role!.id,
    is_super_admin: false,
    avatarUrl: `https://picsum.photos/seed/avatar${nextId}/40/40`,
    status: 'active',
    created_at: now,
    updated_at: now,
  };
  saveToStorage(USERS_KEY, [...users, newUser]);
  return mapUser(newUser);
};

export const updateUser = (updatedUser: User): User => {
  const users = getUsersInternal();
  const userIndex = users.findIndex((u) => u.id === updatedUser.id);
  if (userIndex !== -1) {
    const roles = getRoles();
    const role = roles.find(r => r.name === updatedUser.role);
    const { role: _, ...userToStore } = updatedUser;

    users[userIndex] = {
        ...users[userIndex],
        ...userToStore,
        role_id: role ? role.id : users[userIndex].role_id,
        updated_at: new Date().toISOString(),
    };
    saveToStorage(USERS_KEY, users);
  }
  return updatedUser;
};

export const toggleUserStatus = (userId: string): User | undefined => {
    const users = getUsersInternal();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const user = users[userIndex];
        user.status = user.status === 'active' ? 'frozen' : 'active';
        user.updated_at = new Date().toISOString();
        saveToStorage(USERS_KEY, users);
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

// Student Management Functions
export const getStudentProfiles = (): StudentProfile[] => getFromStorage<StudentProfile[]>(STUDENTS_KEY, []);

export const getStudentProfileById = (studentId: string): StudentProfile | undefined => {
    const profiles = getStudentProfiles();
    return profiles.find(p => p.student.student_no === studentId);
}

export const addStudentProfile = (profile: Omit<StudentProfile, 'student.student_no' | 'contactDetails.student_no' | 'guardianInfo.student_no' | 'emergencyContact.student_no' | 'admissionDetails.student_no' | 'admissionDetails.admission_no' | 'student.avatarUrl'>, creatorId: string): StudentProfile => {
    const profiles = getStudentProfiles();
    const now = new Date();
    
    // Determine admission year and format it
    const admissionYear = new Date(profile.admissionDetails.enrollment_date).getFullYear();
    const yearYY = admissionYear.toString().slice(-2);

    // Find the number of students already admitted in that year
    const studentsInYear = profiles.filter(p => {
        const pYear = new Date(p.admissionDetails.enrollment_date).getFullYear();
        return pYear === admissionYear;
    });
    const nextInYear = studentsInYear.length + 1;
    const nextNumberPadded = nextInYear.toString().padStart(3, '0');

    // Generate the new student and admission numbers
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
    return newProfile;
};

export const updateStudentProfile = (updatedProfile: StudentProfile, editorId: string): StudentProfile => {
    const profiles = getStudentProfiles();
    const profileIndex = profiles.findIndex(p => p.student.student_no === updatedProfile.student.student_no);
    const now = new Date().toISOString();

    if (profileIndex !== -1) {
        profiles[profileIndex] = {
            ...updatedProfile,
            student: {
                ...updatedProfile.student,
                updated_at: now,
                updated_by: editorId,
            }
        };
        saveToStorage(STUDENTS_KEY, profiles);
    }
    return updatedProfile;
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
