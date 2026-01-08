import { supabase } from "../supabase.server";
import { getRoleandID } from "../user/user.server";

export async function getAllEnrollables() {
    const { data, error: course_error } = await supabase
        .from('section')              // 1. Start from Course
        .select(`
            section_id,
            course (
                course_name,
                course_id
            )
        `)
        .eq('open_for_reg', true);
    if (course_error) throw course_error;
    console.log(data);
    return data;
}

export async function getAllEnrollablesforStudent(studentId: string) {
    // 1. Get the list of section_IDs this student has already interacted with.
    //    (Whether they are currently studying or failed it, we want to know).
    const { data: takenData, error: takenError } = await supabase
        .from('gradereport')
        .select('section_id')
        .eq('student_id', studentId);

    if (takenError) throw takenError;

    // Create a simple array of IDs to exclude: e.g. [1, 5, 8]
    const takenSectionIds = takenData.map((row) => row.section_id);


    // 2. Get ALL open sections
    const { data: sections, error: courseError } = await supabase
        .from('section')
        .select(`
            section_id,
            open_for_reg,
            course (
                course_name,
                course_id
            )
        `)
        .eq('open_for_reg', true);

    if (courseError) throw courseError;

    // 3. The "Anti-Join": Filter out sections that are in the 'taken' list
    const availableSections = sections.filter((section) => {
        return !takenSectionIds.includes(section.section_id);
    });

    return availableSections;
}

export async function enroll(id: string, section_id: string) {
    console.log(`Enrolling student ${id} into section ${section_id}`);
    const { error } = await supabase
        .from('gradereport')
        .insert({
            student_id: id,
            section_id: section_id,
            grade_100: null,
            grade_abc: null
        });
    if (error) throw error;
    return 0;
}

// 1. Get courses the student is currently enrolled in (No grades yet + Section is Open)
export async function getEnrolledOpenSections(studentId: string) {
    const { data, error } = await supabase
        .from('gradereport')
        .select(`
            section_id,
            section!inner (
                open_for_reg,
                course (
                    course_id,
                    course_name
                )
            )
        `)
        .eq('student_id', studentId)
        .is('grade_100', null)  // Only active courses (no grade yet)
        .is('grade_abc', null)
        .eq('section.open_for_reg', true); // Only show if registration is still open

    if (error) throw error;

    // Flatten the structure for the UI
    return data.map((item: any) => ({
        section_id: item.section_id,
        course_id: Array.isArray(item.section.course) ? item.section.course[0].course_id : item.section.course.course_id,
        course_name: Array.isArray(item.section.course) ? item.section.course[0].course_name : item.section.course.course_name,
    }));
}

// 2. Unregister (Delete the row)
export async function unregister(studentId: string, sectionId: string) {
    console.log(`Unregistering student ${studentId} from section ${sectionId}`);
    
    const { error } = await supabase
        .from('gradereport')
        .delete()
        .eq('student_id', studentId)
        .eq('section_id', sectionId)
        .is('grade_100', null); // Safety check: Don't delete if they already got a grade!

    if (error) throw error;
    return true;
}