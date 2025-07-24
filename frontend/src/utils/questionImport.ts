import * as XLSX from "xlsx";
import type {
  CreateQuestionFormValues,
  AnswerFormValue,
} from "../types/question.type";

type ImportedRow = {
  [key: string]: string | number | undefined;
};

export const importQuestionsFromExcel = async (
  file: File,
  getSubjectIdByName: (name: string) => number | undefined,
  onCreate: (q: CreateQuestionFormValues) => Promise<boolean>,
  onSuccess: () => void
) => {
  const reader = new FileReader();

  reader.onload = async (evt) => {
    const data = new Uint8Array(evt.target!.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: ImportedRow[] = XLSX.utils.sheet_to_json(worksheet);

    const formattedData: CreateQuestionFormValues[] = jsonData.map(
      (row: ImportedRow) => {
        const subjectId = getSubjectIdByName(String(row["Môn"])) ?? 0;
        return {
          subject_id: subjectId,
          question_text: String(row["Câu_hỏi"]),
          question_type: String(row["Dạng"]),
          points: Number(row["Điểm"]),
          difficulty_level: String(row["Độ_khó"]),
          is_active: row["Trạng_thái"] === "Active",
          answers: extractAnswers(row),
        };
      }
    );

    for (const item of formattedData) {
      try {
        await onCreate(item);
      } catch (error) {
        console.error("Import error:", error);
      }
    }

    onSuccess();
  };

  reader.readAsArrayBuffer(file);
};

const extractAnswers = (row: ImportedRow): AnswerFormValue[] => {
  const answers: AnswerFormValue[] = [];
  const answerKeys = Object.keys(row)
    .filter((key) => key.startsWith("Đáp_án_"))
    .sort(
      (a, b) =>
        parseInt(a.replace("Đáp_án_", "")) - parseInt(b.replace("Đáp_án_", ""))
    );

  answerKeys.forEach((key) => {
    const index = key.replace("Đáp_án_", "");
    const rawText = String(row[key] ?? "");
    const is_correct = rawText.includes("(✔)");
    const cleanText = rawText.replace("(✔)", "").trim();

    const explanationKey = `Giải_thích_${index}`;
    const explanation = row[explanationKey]
      ? String(row[explanationKey])
      : is_correct
      ? "Đáp án đúng"
      : "";

    answers.push({
      answer_text: cleanText,
      is_correct,
      is_active: true,
      explanation,
    });
  });

  return answers;
};
