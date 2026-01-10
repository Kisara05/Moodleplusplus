export type Enroll = {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  completed_at: string | null;
};

export type Progress = {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
};
