import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type ExportRow = {
  [key: string]: string | number;
};

interface ExportableAnswer {
  answer_text: string;
  is_correct: boolean;
  is_active: boolean;
  explanation?: string;
}

interface ExportableQuestion {
  id: number;
  subject?: { name: string };
  question_type: string;
  question_text: string;
  points: number;
  difficulty_level: string;
  is_active: boolean;
  answers?: ExportableAnswer[];
}

export const handleExportQuestions = (questions: ExportableQuestion[]) => {
  const exportData: ExportRow[] = questions
    .filter((q) => q.is_active)
    .map((q) => {
      const activeAnswers = (q.answers || []).filter((a) => a.is_active);

      const row: ExportRow = {
        ID: q.id,
        Môn: q.subject?.name || "",
        Dạng: q.question_type,
        Câu_hỏi: q.question_text,
        Điểm: q.points,
        Độ_khó: q.difficulty_level,
        Trạng_thái: q.is_active ? "Active" : "Inactive",
      };

      activeAnswers.forEach((ans, idx) => {
        row[`Đáp_án_${idx + 1}`] = `${ans.answer_text} ${
          ans.is_correct ? "(✔)" : ""
        }`;
        row[`Giải_thích_${idx + 1}`] = ans.explanation || "";
      });

      return row;
    });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const wscols = Object.keys(exportData[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...exportData.map(
        (row) => (row as ExportRow)[key]?.toString().length || 0
      )
    );
    return { wch: maxLength + 2 };
  });
  worksheet["!cols"] = wscols;

  Object.keys(worksheet).forEach((cellKey) => {
    if (!cellKey.startsWith("!")) {
      worksheet[cellKey].s = {
        alignment: { wrapText: true },
      };
    }
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });
  saveAs(dataBlob, "questions_export.xlsx");
};
