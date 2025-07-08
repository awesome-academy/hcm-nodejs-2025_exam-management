const TestList = () => {
  const tests = ["Đề Toán 1", "Đề Lý 2"];
  return (
    <div>
      <h2>Danh sách bài thi</h2>
      <ul>
        {tests.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
};
export default TestList;
