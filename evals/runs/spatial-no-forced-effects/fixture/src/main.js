// 调拨登记（"既有"行为——含缺陷 2：错误反馈无可及性且焦点不转移）
const form = document.getElementById("transfer-form");
const qty = document.getElementById("qty");
const submit = document.getElementById("submit");
const error = document.getElementById("error");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = Number(qty.value);
  if (!qty.value.trim() || !Number.isInteger(v) || v < 1 || v > 12) {
    // 缺陷：错误文本只改 DOM（无 role/aria-live 屏幕阅读器无感知），
    // 且焦点仍留在提交按钮上——键盘/读屏用户不知道出错了、错在哪
    error.textContent = "请输入 1–12 的整数";
    error.hidden = false;
    return;
  }
  error.hidden = true;
  error.textContent = "";
  submit.textContent = "已登记 · 调拨 " + v;
});
