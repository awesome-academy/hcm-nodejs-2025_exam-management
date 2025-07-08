const SubjectList = () => {
  const subjects = ["Toán", "Lý", "Hóa"];

  return (
    <div>
      <h2>Danh sách môn học</h2>
      <ul>
        {subjects.map((sub, i) => (
          <li key={i}>{sub}</li>
        ))}
      </ul>
    </div>
  );
};
export default SubjectList;
