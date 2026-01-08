import { supabase } from "../supabase.server";

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

