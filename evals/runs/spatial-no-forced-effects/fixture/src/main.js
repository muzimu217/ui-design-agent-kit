// 调拨登记（"既有"行为——含缺陷 2：错误反馈无可及性且焦点不转移）
const form = document.getElementById("transfer-form");
const qty = document.getElementById("qty");
const submit = document.getElementById("submit");
const error = document.getElementById("error");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = Number(qty.value);
  if (!qty.value.trim() || !Number.isInteger(v) || v < 1 || v > 12) {
    // 修复 2：错误三通道——role=alert 公告（读屏）、aria-invalid+describedby 程序关联、
    // 焦点移到出错字段（键盘用户就地看到/听到错误）
    error.textContent = "请输入 1–12 的整数";
    error.hidden = false;
    qty.setAttribute("aria-invalid", "true");
    qty.focus();
    return;
  }
  error.hidden = true;
  error.textContent = "";
  qty.setAttribute("aria-invalid", "false");
  submit.textContent = "已登记 · 调拨 " + v;
});
