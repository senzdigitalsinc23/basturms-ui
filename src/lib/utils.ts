import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { StudentProfile } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

export function flattenStudentProfile(profile: StudentProfile): Record<string, any> {
  const flat: Record<string, any> = {};

  // Helper to process object keys
  const processObject = (obj: any, prefix = '') => {
    if (!obj) return;
    Object.keys(obj).forEach(key => {
      const extraKeys = ['student_no', 'created_at', 'updated_at', 'created_by', 'updated_by', 'avatarUrl', 'signature']; // Common technical fields to skip in nested objects if redundant
      if (prefix && extraKeys.includes(key)) return; // Skip redundant IDs in nested objects if we already have them

      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        processObject(value, newKey); // Recurse for nested objects (like healthRecords)
      } else if (Array.isArray(value)) {
        // For arrays, we join simple strings or just JSON stringify for complex ones to keep it in one cell
        if (value.length > 0 && typeof value[0] === 'string') {
          flat[newKey] = value.join(', ');
        } else {
          // Arrays of objects - maybe count? or skip? 
          // For now, let's leave them out or stringify if strictly needed. 
          // User said "all fields", but infinite columns is bad.
          // I'll skip complex arrays for the flat CSV/Excel view to avoid clutter, 
          // or maybe just put a count. 
          // Actually, for "Excel export" usually people want the main attributes.
          // I will stick to primitives and simple objects.
        }
      } else {
        flat[newKey] = value;
      }
    });
  };

  // 1. Core Student Data (Top level)
  processObject(profile.student); // Direct fields: first_name, last_name, etc.

  // 2. Admission Details (Prefix: admission)
  // Actually the profile object structure is: { student: {}, admissionDetails: {}, ... }
  // I should map them explicitly to have nice column names without deep nesting prefixes getting too long.

  // Let's do explicit mapping for key sections to ensure clean headers

  // Student Information
  flat['Student ID'] = profile.student?.student_no;
  flat['First Name'] = profile.student?.first_name;
  flat['Last Name'] = profile.student?.last_name;
  flat['Other Name'] = profile.student?.other_name;
  flat['Date of Birth'] = profile.student?.dob;
  flat['Gender'] = profile.student?.gender;

  // Admission
  flat['Admission Number'] = profile.admissionDetails?.admission_no;
  flat['Enrollment Date'] = profile.admissionDetails?.enrollment_date;
  flat['Class Assigned'] = profile.admissionDetails?.class_assigned; // Ideally this would be Class Name, but we might only have ID here. The caller might need to enrich this.
  flat['Admission Status'] = profile.admissionDetails?.admission_status;

  // Contact
  flat['Email'] = profile.contactDetails?.email;
  flat['Phone'] = profile.contactDetails?.phone;
  flat['Address'] = profile.contactDetails?.residence; // Mapping residence to Address generic
  flat['City'] = profile.contactDetails?.city;
  flat['Country'] = profile.contactDetails?.country;
  flat['Hometown'] = profile.contactDetails?.hometown;
  flat['House Number'] = profile.contactDetails?.house_no;
  flat['GPS Address'] = profile.contactDetails?.gps_no;

  // Guardian
  flat['Guardian Name'] = profile.guardianInfo?.guardian_name;
  flat['Guardian Phone'] = profile.guardianInfo?.guardian_phone;
  flat['Guardian Email'] = profile.guardianInfo?.guardian_email;
  flat['Guardian Relationship'] = profile.guardianInfo?.guardian_relationship;
  flat['Guardian Occupation'] = profile.guardianInfo?.guardian_occupation;

  flat['Father Name'] = profile.guardianInfo?.father_name;
  flat['Father Phone'] = profile.guardianInfo?.father_phone;
  flat['Father Email'] = profile.guardianInfo?.father_email;
  flat['Father Occupation'] = profile.guardianInfo?.father_occupation;

  flat['Mother Name'] = profile.guardianInfo?.mother_name;
  flat['Mother Phone'] = profile.guardianInfo?.mother_phone;
  flat['Mother Email'] = profile.guardianInfo?.mother_email;
  flat['Mother Occupation'] = profile.guardianInfo?.mother_occupation;

  // Emergency Contact
  flat['Emergency Contact Name'] = profile.emergencyContact?.emergency_name;
  flat['Emergency Contact Phone'] = profile.emergencyContact?.emergency_phone;
  flat['Emergency Contact Email'] = profile.emergencyContact?.emergency_email;
  flat['Emergency Relationship'] = profile.emergencyContact?.emergency_relationship;

  // Health
  flat['Blood Group'] = profile.healthRecords?.blood_group;
  flat['Allergies'] = profile.healthRecords?.allergies?.join(', ');
  flat['Medical Notes'] = profile.healthRecords?.medical_notes;

  // Financial
  flat['Account Balance'] = profile.financialDetails?.account_balance;

  return flat;
}
