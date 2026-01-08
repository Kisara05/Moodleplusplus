// app/routes/_auth/teaching/quiz/$quizID/edit.tsx

import { 
  json, 
  redirect, 
  unstable_composeUploadHandlers, 
  unstable_createMemoryUploadHandler, 
  unstable_parseMultipartFormData,
  type LoaderFunctionArgs, 
  type ActionFunctionArgs 
} from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit, useNavigation, Link, Form } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import { useState, useRef } from "react";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

// --- LOADER ---
export async function loader({ params }: LoaderFunctionArgs) {
  const quizId = Number(params.quizID);
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  const { data: quiz, error } = await supabase
    .from("quiz")
    .select(`
      *,
      question (
        question_id,
        html_content,
        image_url,
        grade,
        is_multiple_choice,
        choice_multiple_question (
          choice_id,
          html_content,
          is_correct
        )
      )
    `)
    .eq("quiz_id", quizId)
    .single();

  if (error || !quiz) {
    throw new Response("Quiz Not Found", { status: 404 });
  }

  const { count } = await supabase
    .from("student_quiz_record")
    .select("*", { count: 'exact', head: true })
    .eq("quiz_id", quizId);
  
  const hasAttempts = count !== null && count > 0;
  const now = new Date();
  const openTime = quiz.open_time ? new Date(quiz.open_time) : null;
  const closeTime = quiz.deadline ? new Date(quiz.deadline) : null;
  const isActive = openTime && closeTime && now >= openTime && now <= closeTime;
  const isLocked = hasAttempts || !!isActive;

  quiz.question.sort((a: any, b: any) => a.question_id - b.question_id);
  quiz.question.forEach((q: any) => {
    q.choice_multiple_question.sort((a: any, b: any) => a.choice_id - b.choice_id);
  });

  return json({ quiz, hasAttempts, isActive, isLocked });
}

// --- ACTION ---
export async function action({ request, params }: ActionFunctionArgs) {
  const quizId = Number(params.quizID);
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const contentType = request.headers.get("Content-Type") || "";

  if (!contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete_quiz") {
      const { data: attempts } = await supabase.from("student_quiz_record").select("attempt_id").eq("quiz_id", quizId);
      const attemptIds = attempts?.map(a => a.attempt_id) || [];

      if (attemptIds.length > 0) {
        await supabase.from("student_essay_question_record").delete().in("attempt_id", attemptIds);
        await supabase.from("student_choice_multiple_record").delete().in("attempt_id", attemptIds);
        await supabase.from("student_question_record").delete().in("attempt_id", attemptIds);
        await supabase.from("student_quiz_record").delete().eq("quiz_id", quizId);
      }

      const { data: quizData } = await supabase.from("quiz").select("post_id").eq("quiz_id", quizId).single();
      await supabase.from("question").delete().eq("quiz_id", quizId);
      await supabase.from("quiz").delete().eq("quiz_id", quizId);
      if (quizData?.post_id) await supabase.from("posts").delete().eq("post_id", quizData.post_id);

      return redirect(`/courses/${params.sectionId || "1"}`);
    }
    return null;
  }

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createMemoryUploadHandler({ maxPartSize: 5_000_000 }), 
  );
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);

  const title = String(formData.get("title"));
  const description = String(formData.get("description"));
  const displayDescription = formData.get("displayDescription") === "true";
  const timeLimitSeconds = formData.get("timeLimitSeconds") ? Number(formData.get("timeLimitSeconds")) : null;

  const pad = (n: any) => String(n).padStart(2, '0');
  const pDate = formData.get("publishDate");
  const openTime = pDate ? `${pDate}T${pad(formData.get("publishHour"))}:${pad(formData.get("publishMinute"))}:${pad(formData.get("publishSecond"))}+07:00` : null;
  const dDate = formData.get("durationDate");
  const deadline = dDate ? `${dDate}T${pad(formData.get("durationHour"))}:${pad(formData.get("durationMinute"))}:${pad(formData.get("durationSecond"))}+07:00` : null;

  const questionsJson = String(formData.get("questions"));
  const questions = JSON.parse(questionsJson);

  const { data: updatedQuiz, error: quizError } = await supabase
    .from("quiz")
    .update({
      title, description, display_description: displayDescription,
      time_limit: timeLimitSeconds, open_time: openTime, deadline: deadline,
      grade: questions.length
    })
    .eq("quiz_id", quizId).select("post_id").single();

  if (quizError) return json({ error: quizError.message });

  if (updatedQuiz?.post_id) {
     await supabase.from("posts").update({ title: title }).eq("post_id", updatedQuiz.post_id);
  }

  const { data: currentDbQuestions } = await supabase.from("question").select("question_id").eq("quiz_id", quizId);
  if (currentDbQuestions) {
    const incomingIds = questions.map((q: any) => q.question_id).filter((id: any) => id !== null);
    const idsToDelete = currentDbQuestions.map((q: any) => q.question_id).filter((id: any) => !incomingIds.includes(id));
    if (idsToDelete.length > 0) await supabase.from("question").delete().in("question_id", idsToDelete);
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.is_multiple_choice && q.question_id) {
       await supabase.from("choice_multiple_question").delete().eq("question_id", q.question_id);
    }

    let imageUrl = q.imagePreview; 
    if (q.hasImage) {
      const imageFile = formData.get(`q_${i}_image`) as File;
      if (imageFile && imageFile.size > 0) {
         const fileExt = imageFile.name.split('.').pop();
         const filePath = `quiz_${quizId}/q_${i}_${Date.now()}.${fileExt}`;
         await supabase.storage.from('quiz-assets').upload(filePath, imageFile, { upsert: true });
         const { data: urlData } = supabase.storage.from('quiz-assets').getPublicUrl(filePath);
         imageUrl = urlData.publicUrl;
      }
    }

    const { data: upsertedQ } = await supabase.from("question").upsert({
      question_id: q.question_id || undefined,
      quiz_id: quizId,
      html_content: q.textDescription,
      is_multiple_choice: q.is_multiple_choice,
      grade: 1.0,
      image_url: imageUrl
    }).select("question_id").single();

    if (upsertedQ && q.is_multiple_choice) {
       const choicesToUpsert = q.choices.map((choiceText: string, idx: number) => ({
         choice_id: q.choice_ids?.[idx] || undefined,
         question_id: upsertedQ.question_id,
         html_content: choiceText,
         is_correct: idx === q.correctAnswer,
         grade: idx === q.correctAnswer ? 1.0 : 0.0
       }));
       await supabase.from("choice_multiple_question").upsert(choicesToUpsert);
    }
  }
  return redirect(`/courses/${params.sectionId || "1"}`);
}

export default function EditQuizPage() {
  const { quiz, hasAttempts, isLocked } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [questions, setQuestions] = useState<QuestionState[]>(() => {
    return quiz.question.map((q: any) => ({
      question_id: q.question_id,
      textDescription: q.html_content,
      is_multiple_choice: q.is_multiple_choice,
      imageFile: null,
      imagePreview: q.image_url,
      choices: q.choice_multiple_question?.length > 0 ? q.choice_multiple_question.map((c: any) => c.html_content) : ["", "", "", ""],
      choice_ids: q.choice_multiple_question?.map((c: any) => c.choice_id) || [],
      correctAnswer: q.choice_multiple_question.findIndex((c: any) => c.is_correct) !== -1 ? q.choice_multiple_question.findIndex((c: any) => c.is_correct) : null
    }));
  });

  const [quizName, setQuizName] = useState(quiz.title);
  const getLocalParts = (isoString: string | null) => {
    if (!isoString) return { date: "", h: 0, m: 0, s: 0 };
    const d = new Date(isoString);
    return { date: d.toLocaleDateString('en-CA'), h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
  };

  const startParts = getLocalParts(quiz.open_time);
  const endParts = getLocalParts(quiz.deadline);

  const [publishDate, setPublishDate] = useState(startParts.date);
  const [publishHour, setPublishHour] = useState(startParts.h);
  const [publishMinute, setPublishMinute] = useState(startParts.m);
  const [publishSecond, setPublishSecond] = useState(startParts.s);
  const [durationDate, setDurationDate] = useState(endParts.date);
  const [durationHour, setDurationHour] = useState(endParts.h);
  const [durationMinute, setDurationMinute] = useState(endParts.m);
  const [durationSecond, setDurationSecond] = useState(endParts.s);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswerMode, setIsAnswerMode] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteQuizDialog, setShowDeleteQuizDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState(quiz.description || "");
  const [displayDesc, setDisplayDesc] = useState(quiz.display_description);

  const enforceLimit = (setter: (n: number) => void, value: string, max: number) => {
    let num = parseInt(value);
    if (isNaN(num)) num = 0;
    setter(Math.min(Math.max(num, 0), max));
  };

    const handleSave = () => {
    // 1. Existing Date Validations
    if (!publishDate || !durationDate) return alert("Dates cannot be empty.");
    
    const pad = (n: number) => String(n).padStart(2, '0');
    const startDate = new Date(`${publishDate}T${pad(publishHour)}:${pad(publishMinute)}:${pad(publishSecond)}`);
    const endDate = new Date(`${durationDate}T${pad(durationHour)}:${pad(durationMinute)}:${pad(durationSecond)}`);
    
    if (startDate >= endDate) return alert("Closes At must be after Opens At.");

    // --- NEW: Description Validation ---
    if (displayDesc && (!description || description.trim() === "")) {
       alert("Error: You cannot display the description on the Course Page if the description is empty.");
       return;
    }
    // ------------------------------------

    // 2. Existing Question Validations
    if (!isLocked && questions.some(q => !q.textDescription.trim() || (q.is_multiple_choice && q.correctAnswer === null))) {
       return setShowErrorDialog(true);
    }
    
    setShowConfirmDialog(true);
  };

    const handleConfirmSave = () => {
        const formData = new FormData();
        formData.append("title", quizName);
        
        // Use the actual state values for description and display toggle
        formData.append("description", description);
        formData.append("displayDescription", String(displayDesc));

        formData.append("publishDate", publishDate);
        formData.append("publishHour", String(publishHour));
        formData.append("publishMinute", String(publishMinute));
        formData.append("publishSecond", String(publishSecond));

        formData.append("durationDate", durationDate);
        formData.append("durationHour", String(durationHour));
        formData.append("durationMinute", String(durationMinute));
        formData.append("durationSecond", String(durationSecond));

        const metaForm = document.getElementById("quiz-meta-form") as HTMLFormElement;
        if (metaForm) {
        const meta = new FormData(metaForm);
        // timeLimitSeconds is still pulled from the form input
        formData.append("timeLimitSeconds", meta.get("timeLimitSeconds") as string || "");
        }

        const payload = questions.map((q, idx) => {
        if (q.imageFile) formData.append(`q_${idx}_image`, q.imageFile);
        return { ...q, imageFile: null, hasImage: !!q.imageFile };
        });
        formData.append("questions", JSON.stringify(payload));
        submit(formData, { method: "post", encType: "multipart/form-data" });
        setShowConfirmDialog(false);
    };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col">
       <Header />
       <main className="flex-1 max-w-[1400px] w-full mx-auto p-8 flex gap-8">
          <div className="flex-1 flex flex-col">
             {isLocked && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                    <p className="text-sm text-orange-800 font-bold uppercase">🔒 Questions Locked</p>
                    <p className="text-sm text-orange-700">Modification disabled to preserve integrity (Active or Attempts exist).</p>
                </div>
             )}
             <div className="flex justify-between items-center mb-6 border-b pb-4">
                 <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-teal-700">Editing: {quiz.title}</h1>
                    <button onClick={() => setShowDeleteQuizDialog(true)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-bold">Delete Quiz</button>
                 </div>
                 <div className="flex gap-2">
                    <Link to=".." className="text-gray-500 hover:underline px-3 py-1">Cancel</Link>
                    <button onClick={handleSave} className="bg-teal-700 text-white px-4 py-1 rounded font-bold text-sm">{isSubmitting ? "Saving..." : "Save Changes"}</button>
                 </div>
             </div>

             <form id="quiz-meta-form" className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-6 mb-4">
                   <div><label className="text-xs font-bold uppercase text-gray-500">Title</label><input value={quizName} onChange={e => setQuizName(e.target.value)} className="w-full p-2 border rounded" /></div>
                   <div><label className="text-xs font-bold uppercase text-gray-500">Time Limit (Sec)</label><input type="number" name="timeLimitSeconds" defaultValue={quiz.time_limit} className="w-full p-2 border rounded" /></div>
                </div>
                {/* --- NEW: DESCRIPTION & TOGGLE --- */}
                <div className="mb-4">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                    <textarea 
                        name="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        className={`w-full p-2 border rounded h-20 text-sm ${
                            displayDesc && (!description || description.trim() === "") 
                            ? "border-red-500 bg-red-50" 
                            : "border-gray-300"
                        }`} 
                        placeholder="Instructions for students..."
                    />
                    
                    {/* Inline Error Message */}
                    {displayDesc && (!description || description.trim() === "") && (
                        <p className="text-red-600 text-[10px] mt-1 font-bold italic">
                            * Description is required when "Display on Course Page" is enabled.
                        </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                        <input 
                            type="checkbox" 
                            id="displayDesc" 
                            checked={displayDesc} 
                            onChange={(e) => setDisplayDesc(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <label htmlFor="displayDesc" className="text-sm text-gray-700 select-none cursor-pointer">
                            Display description on Course Page
                        </label>
                    </div>
                </div>
                {/* --------------------------- */}
                <div className="grid grid-cols-2 gap-6 border-t pt-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Opens At *</label>
                        <div className="flex gap-2">
                            <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} className="flex-1 p-2 border rounded" required />
                            <div className="flex items-center bg-white border rounded px-1">
                                <input type="number" value={publishHour} onChange={e => enforceLimit(setPublishHour, e.target.value, 23)} className="w-10 text-center outline-none" />:<input type="number" value={publishMinute} onChange={e => enforceLimit(setPublishMinute, e.target.value, 59)} className="w-10 text-center outline-none" />:<input type="number" value={publishSecond} onChange={e => enforceLimit(setPublishSecond, e.target.value, 59)} className="w-10 text-center outline-none" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Closes At</label>
                        <div className="flex gap-2">
                            <input type="date" value={durationDate} onChange={e => setDurationDate(e.target.value)} className="flex-1 p-2 border rounded" />
                            <div className="flex items-center bg-white border rounded px-1">
                                <input type="number" value={durationHour} onChange={e => enforceLimit(setDurationHour, e.target.value, 23)} className="w-10 text-center outline-none" />:<input type="number" value={durationMinute} onChange={e => enforceLimit(setDurationMinute, e.target.value, 59)} className="w-10 text-center outline-none" />:<input type="number" value={durationSecond} onChange={e => enforceLimit(setDurationSecond, e.target.value, 59)} className="w-10 text-center outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
             </form>

             <div className={`bg-white rounded-xl border-2 p-6 ${isLocked ? "opacity-60 pointer-events-none grayscale-[0.5]" : ""}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold">Question {currentQuestionIndex + 1}</h3>
                        <div className="flex bg-gray-100 p-1 rounded">
                            <button onClick={() => { const n = [...questions]; n[currentQuestionIndex].is_multiple_choice = true; setQuestions(n); }} className={`px-2 py-1 text-xs ${currentQuestion.is_multiple_choice ? "bg-white shadow" : ""}`}>MC</button>
                            <button onClick={() => { const n = [...questions]; n[currentQuestionIndex].is_multiple_choice = false; setQuestions(n); }} className={`px-2 py-1 text-xs ${!currentQuestion.is_multiple_choice ? "bg-white shadow" : ""}`}>Essay</button>
                        </div>
                    </div>
                    {!isLocked && <button onClick={() => { if(questions.length > 1) { setQuestions(questions.filter((_, i) => i !== currentQuestionIndex)); setCurrentQuestionIndex(0); }}} className="text-red-500 text-sm font-bold">🗑 Delete Question</button>}
                </div>
                <textarea value={currentQuestion.textDescription} onChange={e => { const n = [...questions]; n[currentQuestionIndex].textDescription = e.target.value; setQuestions(n); }} className="w-full p-2 border rounded min-h-[100px]" />
                <div className="mt-4">
                    <label className="text-xs font-bold uppercase text-gray-500">Image</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-48 h-32 border-dashed border-2 flex items-center justify-center cursor-pointer relative">
                        {currentQuestion.imagePreview ? <><img src={currentQuestion.imagePreview} className="h-full object-contain" /><button onClick={(e) => { e.stopPropagation(); const n = [...questions]; n[currentQuestionIndex].imagePreview = null; setQuestions(n); }} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs">✕</button></> : <span>+ Upload</span>}
                        <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => { const n = [...questions]; n[currentQuestionIndex].imageFile = f; n[currentQuestionIndex].imagePreview = ev.target?.result as string; setQuestions(n); }; r.readAsDataURL(f); }}} />
                    </div>
                </div>
                {currentQuestion.is_multiple_choice ? (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {currentQuestion.choices.map((c, i) => (
                            <div key={i} className="flex gap-2">
                                <button onClick={() => { if(isAnswerMode) { const n = [...questions]; n[currentQuestionIndex].correctAnswer = i; setQuestions(n); }}} className={`w-8 border rounded ${currentQuestion.correctAnswer === i ? "bg-green-500 text-white" : ""}`}>{String.fromCharCode(65+i)}</button>
                                <input value={c} onChange={(e) => { const n = [...questions]; n[currentQuestionIndex].choices[i] = e.target.value; setQuestions(n); }} className="flex-1 p-2 border rounded" />
                            </div>
                        ))}
                        <button onClick={() => setIsAnswerMode(!isAnswerMode)} className={`col-span-2 text-xs p-1 rounded border ${isAnswerMode ? "bg-green-100" : ""}`}>{isAnswerMode ? "Save Correct Answer" : "Set Correct Answer"}</button>
                    </div>
                ) : <div className="mt-4 p-4 bg-gray-50 border-dashed border text-center text-gray-400 italic">Essay answer mode</div>}
             </div>
          </div>
          <div className="w-64">
             <div className="grid grid-cols-5 gap-2 bg-gray-50 p-2 rounded">
                {questions.map((_, i) => <button key={i} onClick={() => setCurrentQuestionIndex(i)} className={`w-8 h-8 rounded-full border ${i === currentQuestionIndex ? "bg-teal-700 text-white" : "bg-white"}`}>{i+1}</button>)}
                {!isLocked && <button onClick={() => { setQuestions([...questions, { question_id: null, textDescription: "", is_multiple_choice: true, imageFile: null, imagePreview: null, choices: ["","","",""], choice_ids: [], correctAnswer: null }]); setCurrentQuestionIndex(questions.length); }} className="w-8 h-8 rounded-full border border-dashed text-teal-700 font-bold">+</button>}
             </div>
          </div>
       </main>

       {showConfirmDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded shadow-lg text-center"><h3 className="font-bold mb-4">Save changes?</h3><div className="flex gap-2"><button onClick={handleConfirmSave} className="flex-1 bg-teal-700 text-white p-2 rounded">Yes</button><button onClick={() => setShowConfirmDialog(false)} className="flex-1 bg-gray-200 p-2 rounded">No</button></div></div></div>}
       {showDeleteQuizDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded shadow-lg text-center border-t-4 border-red-500"><h3 className="font-bold text-red-600 mb-2">Delete Quiz?</h3><p className="text-sm text-gray-500 mb-4">This deletes all attempts and results permanently.</p><Form method="post"><input type="hidden" name="intent" value="delete_quiz" /><div className="flex gap-2"><button type="submit" className="flex-1 bg-red-600 text-white p-2 rounded">Delete</button><button type="button" onClick={() => setShowDeleteQuizDialog(false)} className="flex-1 bg-gray-200 p-2 rounded">Cancel</button></div></Form></div></div>}
       <Footer />
    </div>
  );
}

// Interfaces needed for state
interface QuestionState {
  question_id: number | null;
  textDescription: string;
  is_multiple_choice: boolean;
  imageFile: File | null;
  imagePreview: string | null;
  choices: string[];
  choice_ids: number[];
  correctAnswer: number | null;
}